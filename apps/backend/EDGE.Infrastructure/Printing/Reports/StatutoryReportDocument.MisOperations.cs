using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Application.Applications.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

public partial class StatutoryReportDocument
{
    private readonly record struct MisRowMetrics(
        int PendingPrev,
        int RecNew,
        int RecRen,
        int ProcNew,
        int ProcRen,
        int OnTimeNew,
        int OnTimeRen,
        int PendEndNew,
        int PendEndRen);

    // =========================================================================
    // 1. NTC-MIS-OPS: Monthly Management Information Service (MIS) Report
    //    Aligned with official NTC MIS-EDGE-REPORT.pdf (Sections I, II, II-B, III, VIII, IX)
    // =========================================================================
    private void ComposeMisOperationsReport(IContainer container)
    {
        var apps = _model.Applications;
        var paidTx = _model.PaidTransactions;

        const string MisSectionBannerBg = "#FCE4D6"; // Official NTC MIS peach/salmon section header tint
        const string MisGroupHeaderBg = "#E2EFDA";   // Official NTC MIS light-sage category row tint

        bool IsIssued(ApplicationSummaryDto a) =>
            string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(a.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(a.Status, "ForIssuance", StringComparison.OrdinalIgnoreCase);

        bool IsReturnedOrDisapproved(ApplicationSummaryDto a) =>
            string.Equals(a.Status, "Returned", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(a.Status, "Rejected", StringComparison.OrdinalIgnoreCase);

        bool IsNewApp(ApplicationSummaryDto a)
        {
            var variant = $"{a.ServiceVariantType ?? ""} {a.ServiceVariantName ?? ""} {a.Intent ?? ""}".ToLowerInvariant();
            return !variant.Contains("renew") && !variant.Contains("mod") && !variant.Contains("dup");
        }

        string Corpus(ApplicationSummaryDto a)
        {
            var applicantServices = a.Applicants != null && a.Applicants.Count > 0
                ? string.Join(" ", a.Applicants.Select(ap => $"{ap.ServiceName ?? ""} {ap.ServiceVariantName ?? ""} {ap.Element ?? ""}"))
                : string.Empty;
            var issuedTypes = a.IssuedDocumentDetails != null && a.IssuedDocumentDetails.Count > 0
                ? string.Join(" ", a.IssuedDocumentDetails.Select(d => $"{d.DocumentType} {d.StationClass ?? ""}"))
                : string.Empty;
            return $"{a.ServiceCategory ?? ""} {a.ServiceName ?? ""} {a.ServiceVariantName ?? ""} {a.Element ?? ""} {applicantServices} {issuedTypes}".ToLowerInvariant();
        }

        MisRowMetrics ComputeMisRow(Func<string, bool> matcher)
        {
            int recNew = 0, recRen = 0, procNew = 0, procRen = 0, onTimeNew = 0, onTimeRen = 0, pendNew = 0, pendRen = 0;
            foreach (var a in apps)
            {
                if (!matcher(Corpus(a))) continue;
                int units = a.Applicants != null && a.Applicants.Count > 1 ? a.Applicants.Count : 1;
                bool isNew = IsNewApp(a);
                bool issued = IsIssued(a);
                bool returned = IsReturnedOrDisapproved(a);

                if (isNew) recNew += units; else recRen += units;

                if (issued)
                {
                    if (isNew) { procNew += units; onTimeNew += units; }
                    else { procRen += units; onTimeRen += units; }
                }
                else if (returned)
                {
                    if (isNew) pendNew += units; else pendRen += units;
                }
                else
                {
                    if (isNew) pendNew += units; else pendRen += units;
                }
            }
            return new MisRowMetrics(0, recNew, recRen, procNew, procRen, onTimeNew, onTimeRen, pendNew, pendRen);
        }

        static MisRowMetrics AddMetrics(MisRowMetrics a, MisRowMetrics b) => new(
            a.PendingPrev + b.PendingPrev,
            a.RecNew + b.RecNew,
            a.RecRen + b.RecRen,
            a.ProcNew + b.ProcNew,
            a.ProcRen + b.ProcRen,
            a.OnTimeNew + b.OnTimeNew,
            a.OnTimeRen + b.OnTimeRen,
            a.PendEndNew + b.PendEndNew,
            a.PendEndRen + b.PendEndRen);

        static string FormatCount(int value) => value > 0 ? value.ToString("N0") : "0";

        // Section I: Radio Station License — exact official NTC MIS groups & rows
        var rslGroups = new (string GroupName, (string Label, MisRowMetrics M)[] Rows)[]
        {
            ("Amateur Service", new[]
            {
                ("Amateur Repeater (ATR) / AT-RSL", ComputeMisRow(c => c.Contains("amateur") && (c.Contains("repeater") || c.Contains("atr") || c.Contains("at-rsl") || c.Contains("station")))),
                ("AT Repeater Club", ComputeMisRow(c => c.Contains("amateur") && c.Contains("club"))),
                ("AT Radio Lic. Temp. / Special Permit", ComputeMisRow(c => c.Contains("amateur") && (c.Contains("temp") || c.Contains("special") || c.Contains("vanity"))))
            }),
            ("Fixed/Land Mobile Service/Private", new[]
            {
                ("Private Portable (P-CV) / Land Mobile (ML-CV)", ComputeMisRow(c => (c.Contains("private") || c.Contains("p-cv") || c.Contains("ml-cv")) && (c.Contains("portable") || c.Contains("mobile")) && !c.Contains("gov"))),
                ("Private Land Base (FB) / Fixed (FX-CV / FX-FB-CV)", ComputeMisRow(c => (c.Contains("private") || c.Contains("fx-cv") || c.Contains("fb")) && (c.Contains("fixed") || c.Contains("base")) && !c.Contains("gov") && !c.Contains("cellular"))),
                ("Private Repeater (RPT-CV) / Trunk Repeater", ComputeMisRow(c => (c.Contains("repeater") || c.Contains("rpt-cv") || c.Contains("trunk")) && !c.Contains("amateur") && !c.Contains("gov") && !c.Contains("cp"))),
                ("PRS (Land Base / ML / Portable) & Civic Action", ComputeMisRow(c => c.Contains("prs") || c.Contains("civic") || c.Contains("citizens") || c.Contains("sra"))),
                ("VSAT / Private Earth Station / Telemetry", ComputeMisRow(c => (c.Contains("vsat") || c.Contains("earth station") || c.Contains("telemetry") || c.Contains("satellite")) && !c.Contains("tc-cp"))),
                ("WDN - Base / Portable / Mobile (Wireless Data Network)", ComputeMisRow(c => c.Contains("wdn") || c.Contains("wireless data") || c.Contains("bwa")))
            }),
            ("Maritime Service", new[]
            {
                ("Int'l (MS) Ship Stn. License & GMDSS / Inmarsat Certs", ComputeMisRow(c => (c.Contains("ship") || c.Contains("inmarsat") || c.Contains("sesc") || c.Contains("ssas") || c.Contains("lrit") || c.Contains("gmdss")) && !c.Contains("domestic"))),
                ("Coastal / FC (Private & Public Coastal Station)", ComputeMisRow(c => c.Contains("coastal"))),
                ("Fishing Boat / Ship MS (Domestic)", ComputeMisRow(c => c.Contains("fishing") || (c.Contains("ship") && c.Contains("domestic")) || c.Contains("vessel")))
            }),
            ("Aeronautical Service", new[]
            {
                ("Aircraft / MA & Aeronautical FA Station License", ComputeMisRow(c => (c.Contains("aircraft") || c.Contains("aeronautical") || c.Contains("asl") || c.Contains("fasl")) && !c.Contains("rroc") && !c.Contains("operator")))
            }),
            ("Fixed/Land Mobile - Government", new[]
            {
                ("Gov't Radio Stations (P-CO / ML-CO / FX-CO / FB-CO / RPT-CO / Gov't PRS)", ComputeMisRow(c => c.Contains("gov") && (c.Contains("station") || c.Contains("rsl") || c.Contains("co") || c.Contains("prs"))))
            }),
            ("Public Correspondence (NFD)", new[]
            {
                ("RPT-CP / Fixed Microwave (FX-CP) / BTS Cellsites (FB/CP)", ComputeMisRow(c => c.Contains("bts") || c.Contains("cellsite") || c.Contains("cellular") || c.Contains("microwave") || c.Contains("fx-cp") || c.Contains("rpt-cp"))),
                ("TC/CP (TELCO) / VSAT (TC-CP) / Broadband WDN-FB / Public Earth Stn.", ComputeMisRow(c => c.Contains("telco") || c.Contains("tc-cp") || c.Contains("public correspondence") || c.Contains("network radio")))
            }),
            ("Broadcast", new[]
            {
                ("TVRO Reg. & License / CATV License / STL License", ComputeMisRow(c => c.Contains("tvro") || c.Contains("catv") || c.Contains("stl") || c.Contains("broadcast") || c.Contains("am/fm")))
            })
        };

        // Section II: Other Certificates / Permits — exact official NTC MIS rows (Page 3)
        var otherPermitsRows = new (string Label, MisRowMetrics M)[]
        {
            ("Permit to Transport", ComputeMisRow(c => c.Contains("transport"))),
            ("Permit to Purchase", ComputeMisRow(c => c.Contains("purchase") && !c.Contains("possess"))),
            ("Permit to Possess / Purchase & Possess", ComputeMisRow(c => c.Contains("possess"))),
            ("Permit to Sell / Transfer", ComputeMisRow(c => c.Contains("sell") || c.Contains("transfer"))),
            ("Construction Permit (CP)", ComputeMisRow(c => c.Contains("construction") || c.Contains("1-11"))),
            ("Dealer / MFTR (Radio Communication Equipment Dealer / Manufacturer)", ComputeMisRow(c => (c.Contains("dealer") || c.Contains("manufacturer") || c.Contains("mftr")) && !c.Contains("mobile phone") && !c.Contains("cpe") && !c.Contains("wdn"))),
            ("MPDP / MPRR / MPSCP (Mobile Phone Dealer / Retailer / Service Center)", ComputeMisRow(c => c.Contains("mobile phone") || c.Contains("mpdp") || c.Contains("mprr") || c.Contains("mpscp"))),
            ("Service Center (RCE / WDN) & CPE Supplier Accreditation", ComputeMisRow(c => c.Contains("service center") || c.Contains("cpe") || c.Contains("supplier") || c.Contains("accredit"))),
            ("SRD / WDN / TVRO / RFID / Radio Registration (COR)", ComputeMisRow(c => (c.Contains("srd") || c.Contains("rfid") || c.Contains("registration") || c.Contains("1-19") || c.Contains("cor")) && !c.Contains("tvro station"))),
            ("Permit to Import / Certificate of Exemption / Release Clearance", ComputeMisRow(c => c.Contains("import") || c.Contains("exemption") || c.Contains("release clearance"))),
            ("Demo Permit (TP) / Storage / Duplicate / Modification / VAS", ComputeMisRow(c => c.Contains("demo") || c.Contains("storage") || c.Contains("duplicate") || c.Contains("modification") || c.Contains("vas") || c.Contains("1-14")))
        };

        // Section II-B: Operator's Certificates / Permits — exact official NTC MIS rows (Page 4)
        var commercialRocRows = new (string Label, MisRowMetrics M)[]
        {
            ("1st RTG / 1st PHN (Commercial Radio Operator)", ComputeMisRow(c => c.Contains("1rtg") || c.Contains("1st rtg") || c.Contains("1phn") || c.Contains("1st phn"))),
            ("2nd RTG / 2nd PHN (Commercial Radio Operator)", ComputeMisRow(c => c.Contains("2rtg") || c.Contains("2nd rtg") || c.Contains("2phn") || c.Contains("2nd phn"))),
            ("3rd RTG / 3rd PHN / Other Commercial ROC", ComputeMisRow(c => c.Contains("3rtg") || c.Contains("3rd rtg") || c.Contains("3phn") || c.Contains("3rd phn") || (c.Contains("roc") && !c.Contains("aircraft") && !c.Contains("srop") && !c.Contains("groc") && !c.Contains("amateur"))))
        };

        var specialRocRows = new (string Label, MisRowMetrics M)[]
        {
            ("Amateur Certificate (Class A / B / C / D / Lifetime)", ComputeMisRow(c => c.Contains("amateur") && !c.Contains("station") && !c.Contains("rsl") && !c.Contains("repeater") && !c.Contains("exam"))),
            ("RLMOP (Restricted Land Mobile Operator Permit)", ComputeMisRow(c => c.Contains("rlm") || c.Contains("rlmop"))),
            ("RROC - Aircraft (RMAP) / RROC - Ship", ComputeMisRow(c => (c.Contains("rroc") || c.Contains("rmap")) && (c.Contains("aircraft") || c.Contains("ship") || c.Contains("restricted")))),
            ("RSTP / SLOP / RTTY / SROP-FB / SROP-GOV (GROC)", ComputeMisRow(c => c.Contains("srop") || c.Contains("groc") || c.Contains("rstp") || c.Contains("slop") || c.Contains("rtty")))
        };

        // Section III: Number of Existing
        int existingDealers = apps.Count(a => Corpus(a).Contains("dealer") && !Corpus(a).Contains("mobile phone"));
        int existingManufacturers = apps.Count(a => Corpus(a).Contains("manufacturer") || Corpus(a).Contains("supplier"));
        int existingWdnSrd = apps.Count(a => Corpus(a).Contains("wdn") || Corpus(a).Contains("srd") || Corpus(a).Contains("rfid"));
        int existingMobileEquip = apps.Count(a => Corpus(a).Contains("mobile phone") || Corpus(a).Contains("cpe"));
        int totalExisting = existingDealers + existingManufacturers + existingWdnSrd + existingMobileEquip;

        // Section VIII & IX metrics
        var uacsTotals = ComputeUacsTotals(paidTx);
        var depositMetrics = ComputeDepositMetrics(paidTx, uacsTotals.Dst);
        decimal netNgp = Math.Max(0m, depositMetrics.TotalCollected - uacsTotals.Dst);

        int totalApps = apps.Count;
        int totalUnits = apps.Sum(a => a.Applicants != null && a.Applicants.Count > 1 ? a.Applicants.Count : 1);
        int issuedCount = apps.Count(IsIssued);
        int returnedCount = apps.Count(IsReturnedOrDisapproved);
        int examApps = apps.Count(a => Corpus(a).Contains("exam") || Corpus(a).Contains("roce") || Corpus(a).Contains("1-01") || Corpus(a).Contains("admission"));
        int examExaminees = apps
            .Where(a => Corpus(a).Contains("exam") || Corpus(a).Contains("roce") || Corpus(a).Contains("1-01") || Corpus(a).Contains("admission"))
            .Sum(a => a.Applicants != null && a.Applicants.Count > 1 ? a.Applicants.Count : 1);
        int complianceRate = totalApps > 0 ? (int)Math.Round(issuedCount * 100.0 / totalApps) : 100;

        static void RenderMisBanner(TableCellDescriptor h, uint colSpan, string title, string bgHex)
        {
            h.Cell().ColumnSpan(colSpan).Background(bgHex).Border(0.6f).BorderColor(Colors.Black)
                .PaddingVertical(2.5f).PaddingHorizontal(4).AlignCenter()
                .Text(title).Bold().FontSize(7.2f).FontColor(Colors.Black);
        }

        static void RenderMisHeaderCell(TableCellDescriptor h, string text, uint colSpan = 1, uint rowSpan = 1, bool alignLeft = false)
        {
            var cell = h.Cell().ColumnSpan(colSpan).RowSpan(rowSpan)
                .Background("#E2EFDA").Border(0.5f).BorderColor(Colors.Black)
                .PaddingVertical(2f).PaddingHorizontal(2.5f).AlignMiddle();
            if (alignLeft)
                cell.AlignLeft().Text(text).Bold().FontSize(6.2f).FontColor(Colors.Black);
            else
                cell.AlignCenter().Text(text).Bold().FontSize(6.2f).FontColor(Colors.Black);
        }

        container.Column(col =>
        {
            // =================================================================
            // SECTION I: RADIO STATION LICENSE (Exact MIS-EDGE-REPORT.pdf Page 1)
            // =================================================================
            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(2.6f); // SERVICES
                    cd.ConstantColumn(44);   // PENDING PREV
                    cd.ConstantColumn(36);   // REC NEW
                    cd.ConstantColumn(42);   // REC REN/MOD
                    cd.ConstantColumn(36);   // PROC NEW
                    cd.ConstantColumn(42);   // PROC REN/MOD
                    cd.ConstantColumn(36);   // ONTIME NEW
                    cd.ConstantColumn(42);   // ONTIME REN/MOD
                    cd.ConstantColumn(36);   // PEND END NEW
                    cd.ConstantColumn(42);   // PEND END REN/MOD
                });

                t.Header(h =>
                {
                    RenderMisBanner(h, 10, "I. RADIO STATION LICENSE", MisSectionBannerBg);

                    // Top multi-row header
                    RenderMisHeaderCell(h, "SERVICES", colSpan: 1, rowSpan: 2, alignLeft: true);
                    RenderMisHeaderCell(h, "PENDING\nPREV. MO.", colSpan: 1, rowSpan: 2);
                    RenderMisHeaderCell(h, "APPLICATION RECEIVED", colSpan: 2, rowSpan: 1);
                    RenderMisHeaderCell(h, "PROCESSED", colSpan: 2, rowSpan: 1);
                    RenderMisHeaderCell(h, "ON TIME", colSpan: 2, rowSpan: 1);
                    RenderMisHeaderCell(h, "PENDING END OF MO.", colSpan: 2, rowSpan: 1);

                    // Sub-header NEW / REN/MOD
                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN/MOD");
                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN/MOD");
                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN/MOD");
                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN/MOD");
                });

                var rslGrandTotal = new MisRowMetrics();
                foreach (var group in rslGroups)
                {
                    t.Cell().ColumnSpan(10).Background(MisGroupHeaderBg).Border(0.5f).BorderColor(Colors.Black)
                        .PaddingVertical(1.8f).PaddingHorizontal(4)
                        .Text(group.GroupName).Bold().FontSize(6.5f);

                    foreach (var r in group.Rows)
                    {
                        rslGrandTotal = AddMetrics(rslGrandTotal, r.M);
                        RenderBodyCell(t, r.Label, alignLeft: true);
                        RenderBodyCell(t, FormatCount(r.M.PendingPrev));
                        RenderBodyCell(t, FormatCount(r.M.RecNew));
                        RenderBodyCell(t, FormatCount(r.M.RecRen));
                        RenderBodyCell(t, FormatCount(r.M.ProcNew), bold: r.M.ProcNew > 0);
                        RenderBodyCell(t, FormatCount(r.M.ProcRen), bold: r.M.ProcRen > 0);
                        RenderBodyCell(t, FormatCount(r.M.OnTimeNew));
                        RenderBodyCell(t, FormatCount(r.M.OnTimeRen));
                        RenderBodyCell(t, FormatCount(r.M.PendEndNew));
                        RenderBodyCell(t, FormatCount(r.M.PendEndRen));
                    }
                }

                RenderTotalCell(t, "TOTAL — RADIO STATION LICENSE", alignLeft: true);
                RenderTotalCell(t, FormatCount(rslGrandTotal.PendingPrev));
                RenderTotalCell(t, FormatCount(rslGrandTotal.RecNew));
                RenderTotalCell(t, FormatCount(rslGrandTotal.RecRen));
                RenderTotalCell(t, FormatCount(rslGrandTotal.ProcNew));
                RenderTotalCell(t, FormatCount(rslGrandTotal.ProcRen));
                RenderTotalCell(t, FormatCount(rslGrandTotal.OnTimeNew));
                RenderTotalCell(t, FormatCount(rslGrandTotal.OnTimeRen));
                RenderTotalCell(t, FormatCount(rslGrandTotal.PendEndNew));
                RenderTotalCell(t, FormatCount(rslGrandTotal.PendEndRen));
            });

            // =================================================================
            // SECTION II: OTHER CERTIFICATES / PERMITS (Exact MIS-EDGE-REPORT.pdf Page 3)
            // =================================================================
            col.Item().PaddingTop(6).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(2.6f);
                    cd.ConstantColumn(40);
                    cd.ConstantColumn(40);
                    cd.ConstantColumn(40);
                    cd.ConstantColumn(40);
                    cd.ConstantColumn(40);
                    cd.ConstantColumn(40);
                    cd.ConstantColumn(40);
                    cd.ConstantColumn(40);
                });

                t.Header(h =>
                {
                    RenderMisBanner(h, 9, "II. OTHER CERTIFICATES / PERMITS", MisSectionBannerBg);
                    RenderMisHeaderCell(h, "SERVICES", colSpan: 1, rowSpan: 2, alignLeft: true);
                    RenderMisHeaderCell(h, "APPLICATION RECEIVED", colSpan: 2, rowSpan: 1);
                    RenderMisHeaderCell(h, "RELEASED", colSpan: 2, rowSpan: 1);
                    RenderMisHeaderCell(h, "ON TIME", colSpan: 2, rowSpan: 1);
                    RenderMisHeaderCell(h, "PENDING END OF MO.", colSpan: 2, rowSpan: 1);

                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN");
                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN");
                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN");
                    RenderMisHeaderCell(h, "NEW");
                    RenderMisHeaderCell(h, "REN");
                });

                var otherTotal = new MisRowMetrics();
                foreach (var r in otherPermitsRows)
                {
                    otherTotal = AddMetrics(otherTotal, r.M);
                    RenderBodyCell(t, r.Label, alignLeft: true);
                    RenderBodyCell(t, FormatCount(r.M.RecNew));
                    RenderBodyCell(t, FormatCount(r.M.RecRen));
                    RenderBodyCell(t, FormatCount(r.M.ProcNew), bold: r.M.ProcNew > 0);
                    RenderBodyCell(t, FormatCount(r.M.ProcRen), bold: r.M.ProcRen > 0);
                    RenderBodyCell(t, FormatCount(r.M.OnTimeNew));
                    RenderBodyCell(t, FormatCount(r.M.OnTimeRen));
                    RenderBodyCell(t, FormatCount(r.M.PendEndNew));
                    RenderBodyCell(t, FormatCount(r.M.PendEndRen));
                }

                RenderTotalCell(t, "TOTAL — OTHER CERTIFICATES / PERMITS", alignLeft: true);
                RenderTotalCell(t, FormatCount(otherTotal.RecNew));
                RenderTotalCell(t, FormatCount(otherTotal.RecRen));
                RenderTotalCell(t, FormatCount(otherTotal.ProcNew));
                RenderTotalCell(t, FormatCount(otherTotal.ProcRen));
                RenderTotalCell(t, FormatCount(otherTotal.OnTimeNew));
                RenderTotalCell(t, FormatCount(otherTotal.OnTimeRen));
                RenderTotalCell(t, FormatCount(otherTotal.PendEndNew));
                RenderTotalCell(t, FormatCount(otherTotal.PendEndRen));
            });

            // =================================================================
            // SECTION II-B: OPERATOR'S CERTIFICATES / PERMITS & SECTION III: NUMBER OF EXISTING
            // =================================================================
            col.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem(1.35f).PaddingRight(5).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn(2.2f);
                        cd.ConstantColumn(30);
                        cd.ConstantColumn(30);
                        cd.ConstantColumn(30);
                        cd.ConstantColumn(30);
                        cd.ConstantColumn(30);
                        cd.ConstantColumn(30);
                    });

                    t.Header(h =>
                    {
                        RenderMisBanner(h, 7, "II-B. OPERATOR'S CERTIFICATES / PERMITS", MisSectionBannerBg);
                        RenderMisHeaderCell(h, "SERVICES", colSpan: 1, rowSpan: 2, alignLeft: true);
                        RenderMisHeaderCell(h, "RECEIVED", colSpan: 2, rowSpan: 1);
                        RenderMisHeaderCell(h, "ISSUED", colSpan: 2, rowSpan: 1);
                        RenderMisHeaderCell(h, "PENDING", colSpan: 2, rowSpan: 1);
                        RenderMisHeaderCell(h, "NEW");
                        RenderMisHeaderCell(h, "REN");
                        RenderMisHeaderCell(h, "NEW");
                        RenderMisHeaderCell(h, "REN");
                        RenderMisHeaderCell(h, "NEW");
                        RenderMisHeaderCell(h, "REN");
                    });

                    t.Cell().ColumnSpan(7).Background(MisGroupHeaderBg).Border(0.5f).BorderColor(Colors.Black)
                        .PaddingVertical(1.5f).PaddingHorizontal(4).Text("COMMERCIAL OPERATOR").Bold().FontSize(6.3f);
                    var commTot = new MisRowMetrics();
                    foreach (var r in commercialRocRows)
                    {
                        commTot = AddMetrics(commTot, r.M);
                        RenderBodyCell(t, r.Label, alignLeft: true);
                        RenderBodyCell(t, FormatCount(r.M.RecNew));
                        RenderBodyCell(t, FormatCount(r.M.RecRen));
                        RenderBodyCell(t, FormatCount(r.M.ProcNew), bold: r.M.ProcNew > 0);
                        RenderBodyCell(t, FormatCount(r.M.ProcRen), bold: r.M.ProcRen > 0);
                        RenderBodyCell(t, FormatCount(r.M.PendEndNew));
                        RenderBodyCell(t, FormatCount(r.M.PendEndRen));
                    }

                    t.Cell().ColumnSpan(7).Background(MisGroupHeaderBg).Border(0.5f).BorderColor(Colors.Black)
                        .PaddingVertical(1.5f).PaddingHorizontal(4).Text("SPECIAL OPERATORS").Bold().FontSize(6.3f);
                    var specTot = new MisRowMetrics();
                    foreach (var r in specialRocRows)
                    {
                        specTot = AddMetrics(specTot, r.M);
                        RenderBodyCell(t, r.Label, alignLeft: true);
                        RenderBodyCell(t, FormatCount(r.M.RecNew));
                        RenderBodyCell(t, FormatCount(r.M.RecRen));
                        RenderBodyCell(t, FormatCount(r.M.ProcNew), bold: r.M.ProcNew > 0);
                        RenderBodyCell(t, FormatCount(r.M.ProcRen), bold: r.M.ProcRen > 0);
                        RenderBodyCell(t, FormatCount(r.M.PendEndNew));
                        RenderBodyCell(t, FormatCount(r.M.PendEndRen));
                    }

                    var rocGrand = AddMetrics(commTot, specTot);
                    RenderTotalCell(t, "GRAND TOTAL — OPERATOR'S CERTIFICATES", alignLeft: true);
                    RenderTotalCell(t, FormatCount(rocGrand.RecNew));
                    RenderTotalCell(t, FormatCount(rocGrand.RecRen));
                    RenderTotalCell(t, FormatCount(rocGrand.ProcNew));
                    RenderTotalCell(t, FormatCount(rocGrand.ProcRen));
                    RenderTotalCell(t, FormatCount(rocGrand.PendEndNew));
                    RenderTotalCell(t, FormatCount(rocGrand.PendEndRen));
                });

                row.RelativeItem(0.65f).PaddingLeft(5).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn();
                        cd.ConstantColumn(62);
                    });

                    t.Header(h =>
                    {
                        RenderMisBanner(h, 2, "III. NUMBER OF EXISTING", MisSectionBannerBg);
                        RenderMisHeaderCell(h, "CATEGORY", alignLeft: true);
                        RenderMisHeaderCell(h, "AS OF END\nOF PERIOD");
                    });

                    RenderBodyCell(t, "No. of Radio Dealer", alignLeft: true);
                    RenderBodyCell(t, FormatCount(existingDealers), bold: existingDealers > 0);

                    RenderBodyCell(t, "No. of Radio Manufacturer / Supplier", alignLeft: true);
                    RenderBodyCell(t, FormatCount(existingManufacturers), bold: existingManufacturers > 0);

                    RenderBodyCell(t, "No. of Registered WDN / Short Range Device", alignLeft: true);
                    RenderBodyCell(t, FormatCount(existingWdnSrd), bold: existingWdnSrd > 0);

                    RenderBodyCell(t, "No. of Registered Mobile Phone Equipment / CPE", alignLeft: true);
                    RenderBodyCell(t, FormatCount(existingMobileEquip), bold: existingMobileEquip > 0);

                    RenderTotalCell(t, "TOTAL EXISTING ENTITIES", alignLeft: true);
                    RenderTotalCell(t, FormatCount(totalExisting));
                });
            });

            // =================================================================
            // SECTION VIII (CONTROL & ENFORCEMENT) & SECTION IX (REGIONAL FINANCIAL STATUS)
            // Exact MIS-EDGE-REPORT.pdf Page 8 structure
            // =================================================================
            col.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem(0.95f).PaddingRight(5).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn();
                        cd.ConstantColumn(82);
                    });

                    t.Header(h =>
                    {
                        RenderMisBanner(h, 2, "VIII. CONTROL, ENFORCEMENT & EXAMINATIONS", MisSectionBannerBg);
                        RenderMisHeaderCell(h, "SERVICES / INDICATOR", alignLeft: true);
                        RenderMisHeaderCell(h, "ACTUAL THIS\nPERIOD");
                    });

                    RenderBodyCell(t, "Total Applications Logged (Total Units / Applicants)", alignLeft: true);
                    RenderBodyCell(t, $"{totalApps:N0} ({totalUnits:N0} units)", bold: true);

                    RenderBodyCell(t, "Licenses / Permits / Certificates Issued (Encoded)", alignLeft: true);
                    RenderBodyCell(t, issuedCount.ToString("N0"), bold: true);

                    RenderBodyCell(t, "% Licenses / Permits / Certificates Processed On Time", alignLeft: true);
                    RenderBodyCell(t, $"{complianceRate}%", bold: true);

                    RenderBodyCell(t, "Applications Returned / Deficient for Compliance", alignLeft: true);
                    RenderBodyCell(t, returnedCount.ToString("N0"));

                    RenderBodyCell(t, "No. of Examinations Conducted (ROCE / Amateur)", alignLeft: true);
                    RenderBodyCell(t, examApps.ToString("N0"), bold: examApps > 0);

                    RenderBodyCell(t, "No. of Examinees Processed", alignLeft: true);
                    RenderBodyCell(t, examExaminees.ToString("N0"), bold: examExaminees > 0);

                    RenderBodyCell(t, "Official Receipts (AF-51) Issued & Verified", alignLeft: true);
                    RenderBodyCell(t, paidTx.Count.ToString("N0"), bold: true);

                    RenderBodyCell(t, "Validated AGDB / BTr Bank Deposit Batches", alignLeft: true);
                    RenderBodyCell(t, _model.BankDeposits.Count.ToString("N0"));

                    RenderBodyCell(t, "Client Satisfaction Rating (CSAT Survey Average)", alignLeft: true);
                    RenderBodyCell(t, $"{_model.AverageCsat:F2} / 5.00 ({_model.FeedbackCount} resp.)", bold: true);
                });

                row.RelativeItem(1.05f).PaddingLeft(5).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn();
                        cd.ConstantColumn(92);
                    });

                    t.Header(h =>
                    {
                        RenderMisBanner(h, 2, "IX. REGIONAL FINANCIAL STATUS", MisSectionBannerBg);
                        RenderMisHeaderCell(h, "COLLECTION / REMITTANCE PARTICULAR", alignLeft: true);
                        RenderMisHeaderCell(h, "AMOUNT (PHP)");
                    });

                    RenderBodyCell(t, "A) Permit Fees", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.PermitFees), alignRight: true);

                    RenderBodyCell(t, "B) Registration Fees", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.RegistrationFees), alignRight: true);

                    RenderBodyCell(t, "C) Clearance and Certification Fees", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.ClearanceFees), alignRight: true);

                    RenderBodyCell(t, "D) Licensing Fees (RSL / ROC)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.LicenseFees), alignRight: true);

                    RenderBodyCell(t, "E) Supervision and Regulation Fees (SRF)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.SupervisionFees), alignRight: true);

                    RenderBodyCell(t, "F) Spectrum Usage Fees (SUF)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.SpectrumSuf), alignRight: true);

                    RenderBodyCell(t, "J) Fines and Penalties (Service Income)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.FinesPenalties), alignRight: true);

                    RenderBodyCell(t, "L) Examination Fees", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.ExamFees), alignRight: true);

                    RenderBodyCell(t, "K / N) Other Service & Miscellaneous Income", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.OtherIncome), alignRight: true);

                    RenderBodyCell(t, "Amount of Regulatory Collection this Period (Net of DST)", alignLeft: true, bold: true);
                    RenderBodyCell(t, FormatCurrency(netNgp), alignRight: true, bold: true);

                    RenderBodyCell(t, "Documentary Stamp Tax (DST) Collected / Deposited", alignLeft: true);
                    RenderBodyCell(t, $"{FormatCurrency(uacsTotals.Dst)} / {FormatCurrency(depositMetrics.DstDeposited)}", alignRight: true);

                    RenderBodyCell(t, "Amount Deposited this Period (Undeposited on Hand)", alignLeft: true, bold: true);
                    RenderBodyCell(t, $"{FormatCurrency(depositMetrics.TotalDeposited)} ({FormatCurrency(depositMetrics.UndepositedBalance)})", alignRight: true, bold: true);

                    RenderTotalCell(t, "GRAND TOTAL AMOUNT COLLECTED", alignLeft: true);
                    RenderTotalCell(t, $"PHP {FormatCurrency(depositMetrics.TotalCollected)}", alignRight: true);
                });
            });

            var misPrepared = ResolveMisOfficer("MIS / Planning Officer");
            var chiefEod = ResolveChiefEod("Chief, EOD / OIC-EOD");
            var director = ResolveRegionalDirector("Regional Director");

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("Prepared by:", misPrepared.Name, misPrepared.Role),
                ("Noted by:", chiefEod.Name, chiefEod.Role),
                ("Approved by:", director.Name, director.Role)));
        });
    }
}

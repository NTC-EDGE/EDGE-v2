using System;
using System.Linq;
using EDGE.Application.Applications.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

public partial class StatutoryReportDocument
{
    // =========================================================================
    // 1. NTC-MIS-OPS: Monthly Regional Operational & MIS Accomplishment Report
    // =========================================================================
    private void ComposeMisOperationsReport(IContainer container)
    {
        var apps = _model.Applications;
        var paidTx = _model.PaidTransactions;

        bool IsIssued(ApplicationSummaryDto a) =>
            string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(a.Status, "Completed", StringComparison.OrdinalIgnoreCase);

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

        (int NewCount, int RenModCount, int TotalCount) CountMisRow(Func<string, bool> matcher)
        {
            int n = 0, r = 0;
            foreach (var a in apps)
            {
                if (!matcher(Corpus(a))) continue;
                int units = a.Applicants != null && a.Applicants.Count > 1 ? a.Applicants.Count : 1;
                if (IsNewApp(a)) n += units;
                else r += units;
            }
            return (n, r, n + r);
        }

        var rslRows = new (string Label, (int NewCount, int RenModCount, int TotalCount) Counts)[]
        {
            ("A. CV / CO (Commercial / Coastal / Maritime / Aircraft)", CountMisRow(c => c.Contains("coastal") || c.Contains("ship") || c.Contains("maritime") || c.Contains("vessel") || c.Contains("aircraft") || c.Contains("aeronautical"))),
            ("B. FB / FX / ML / P (Fixed / Base / Land Mobile / Portable)", CountMisRow(c => c.Contains("fixed") || c.Contains("land mobile") || c.Contains("base") || c.Contains("portable") || (c.Contains("rsl") && !c.Contains("amateur")) || (c.Contains("station license") && !c.Contains("amateur")))),
            ("C. PAGING", CountMisRow(c => c.Contains("paging"))),
            ("D. REPEATER (RT)", CountMisRow(c => c.Contains("repeater"))),
            ("E. PRS (Citizens Band / Civic / Family Radio / SRA)", CountMisRow(c => c.Contains("prs") || c.Contains("civic") || c.Contains("citizens") || c.Contains("family radio") || c.Contains("sra"))),
            ("F. AMATEUR (AT-RSL / Amateur Radio Station)", CountMisRow(c => c.Contains("amateur") && (c.Contains("station") || c.Contains("rsl") || c.Contains("at-rsl")))),
            ("G. BROADCAST (TV / AM / FM / CATV / STL)", CountMisRow(c => c.Contains("broadcast") || c.Contains("catv") || c.Contains("fm") || c.Contains("television") || c.Contains("stl"))),
            ("H. CELLULAR BASE STATION / WDN / BWA", CountMisRow(c => c.Contains("cellular") || c.Contains("wdn") || c.Contains("bwa") || c.Contains("tower"))),
            ("I. SATELLITE EARTH STATION (VSAT)", CountMisRow(c => c.Contains("vsat") || c.Contains("satellite") || c.Contains("earth station"))),
            ("J. OTHERS (GMDSS / SROP / RLMP / Telemetry / Point-to-Point)", CountMisRow(c => c.Contains("gmdss") || c.Contains("telemetry") || c.Contains("microwave") || c.Contains("point-to-point")))
        };

        var certRows = new (string Label, (int NewCount, int RenModCount, int TotalCount) Counts)[]
        {
            ("A. PERMIT TO PURCHASE / POSSESS / IMPORT / SELL / TRANSFER", CountMisRow(c => c.Contains("purchase") || c.Contains("possess") || c.Contains("import") || c.Contains("sell") || c.Contains("transfer") || c.Contains("1-09"))),
            ("B. CONSTRUCTION PERMIT (CP)", CountMisRow(c => c.Contains("construction") || c.Contains("1-11"))),
            ("C. TEMPORARY PERMIT TO OPERATE / SPECIAL PERMIT / DEMO / STORAGE", CountMisRow(c => c.Contains("temporary") || c.Contains("special") || c.Contains("demo") || c.Contains("storage") || c.Contains("event"))),
            ("D. DEALER / SUPPLIER / SERVICE CENTER ACCREDITATION (RCE / CPE / MPSC)", CountMisRow(c => c.Contains("dealer") || c.Contains("supplier") || c.Contains("manufacturer") || c.Contains("accredit") || c.Contains("service center") || c.Contains("cpe") || c.Contains("mpsc"))),
            ("E. TELECOM REGISTRATION & CONSUMER SERVICES (VAS / COR / BLOCKING)", CountMisRow(c => c.Contains("vas") || c.Contains("voip") || c.Contains("registration") || c.Contains("1-19") || c.Contains("cor") || c.Contains("block") || c.Contains("complaint")))
        };

        var rocRows = new (string Label, (int NewCount, int RenModCount, int TotalCount) Counts)[]
        {
            ("A. COMMERCIAL ROC (1RTG / 2RTG / 3RTG / 1PHN / 2PHN / 3PHN)", CountMisRow(c => c.Contains("rtg") || c.Contains("phn") || c.Contains("commercial operator") || (c.Contains("roc") && !c.Contains("aircraft") && !c.Contains("amateur")))),
            ("B. RROC - AIRCRAFT / SROP / GROC / RRLM", CountMisRow(c => c.Contains("aircraft") || c.Contains("srop") || c.Contains("groc") || c.Contains("rrlm") || c.Contains("restricted"))),
            ("C. AMATEUR OPERATOR (Class A / B / C / D / Lifetime / Club)", CountMisRow(c => c.Contains("amateur") && !c.Contains("station") && !c.Contains("rsl"))),
            ("D. RADIO OPERATOR EXAMINATION (ROCE / Amateur Exam)", CountMisRow(c => c.Contains("exam") || c.Contains("roce") || c.Contains("1-01") || c.Contains("admission")))
        };

        var uacsTotals = ComputeUacsTotals(paidTx);
        var depositMetrics = ComputeDepositMetrics(paidTx, uacsTotals.Dst);
        decimal netNgp = Math.Max(0m, depositMetrics.TotalCollected - uacsTotals.Dst);

        int totalApps = apps.Count;
        int totalUnits = apps.Sum(a => a.Applicants != null && a.Applicants.Count > 1 ? a.Applicants.Count : 1);
        int issuedCount = apps.Count(IsIssued);
        int returnedCount = apps.Count(a => string.Equals(a.Status, "Returned", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Rejected", StringComparison.OrdinalIgnoreCase));
        int inProgressCount = Math.Max(0, totalApps - issuedCount - returnedCount);
        int complianceRate = totalApps > 0 ? (int)Math.Round(issuedCount * 100.0 / totalApps) : 100;

        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                // Section I: Radio Station License
                row.RelativeItem(1.05f).PaddingRight(4).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn();
                        cd.ConstantColumn(34);
                        cd.ConstantColumn(42);
                        cd.ConstantColumn(38);
                    });

                    RenderSectionTitleRow(t, 4, "I. RADIO STATION LICENSE (RSL)");
                    RenderTableHeaderCell(t, "SERVICES", alignLeft: true);
                    RenderTableHeaderCell(t, "NEW");
                    RenderTableHeaderCell(t, "REN/MOD");
                    RenderTableHeaderCell(t, "TOTAL");

                    int sumNew = 0, sumRen = 0, sumTot = 0;
                    foreach (var r in rslRows)
                    {
                        sumNew += r.Counts.NewCount;
                        sumRen += r.Counts.RenModCount;
                        sumTot += r.Counts.TotalCount;
                        RenderBodyCell(t, r.Label, alignLeft: true);
                        RenderBodyCell(t, r.Counts.NewCount.ToString());
                        RenderBodyCell(t, r.Counts.RenModCount.ToString());
                        RenderBodyCell(t, r.Counts.TotalCount.ToString(), bold: true);
                    }

                    RenderTotalCell(t, "TOTAL RADIO STATION LICENSES", alignLeft: true);
                    RenderTotalCell(t, sumNew.ToString());
                    RenderTotalCell(t, sumRen.ToString());
                    RenderTotalCell(t, sumTot.ToString());
                });

                // Right Column: Section II + Section II-B
                row.RelativeItem(0.95f).PaddingLeft(4).Column(rCol =>
                {
                    rCol.Item().Table(t =>
                    {
                        t.ColumnsDefinition(cd =>
                        {
                            cd.RelativeColumn();
                            cd.ConstantColumn(32);
                            cd.ConstantColumn(36);
                            cd.ConstantColumn(36);
                        });

                        RenderSectionTitleRow(t, 4, "II. OTHER CERTIFICATES / PERMITS");
                        RenderTableHeaderCell(t, "SERVICES", alignLeft: true);
                        RenderTableHeaderCell(t, "NEW");
                        RenderTableHeaderCell(t, "REN");
                        RenderTableHeaderCell(t, "TOTAL");

                        int sumNew = 0, sumRen = 0, sumTot = 0;
                        foreach (var r in certRows)
                        {
                            sumNew += r.Counts.NewCount;
                            sumRen += r.Counts.RenModCount;
                            sumTot += r.Counts.TotalCount;
                            RenderBodyCell(t, r.Label, alignLeft: true);
                            RenderBodyCell(t, r.Counts.NewCount.ToString());
                            RenderBodyCell(t, r.Counts.RenModCount.ToString());
                            RenderBodyCell(t, r.Counts.TotalCount.ToString(), bold: true);
                        }

                        RenderTotalCell(t, "SUB-TOTAL PERMITS & CERTIFICATES", alignLeft: true);
                        RenderTotalCell(t, sumNew.ToString());
                        RenderTotalCell(t, sumRen.ToString());
                        RenderTotalCell(t, sumTot.ToString());
                    });

                    rCol.Item().PaddingTop(5).Table(t =>
                    {
                        t.ColumnsDefinition(cd =>
                        {
                            cd.RelativeColumn();
                            cd.ConstantColumn(32);
                            cd.ConstantColumn(36);
                            cd.ConstantColumn(36);
                        });

                        RenderSectionTitleRow(t, 4, "II-B. OPERATOR'S CERTIFICATES & EXAMS");
                        RenderTableHeaderCell(t, "CATEGORY", alignLeft: true);
                        RenderTableHeaderCell(t, "NEW");
                        RenderTableHeaderCell(t, "REN");
                        RenderTableHeaderCell(t, "TOTAL");

                        int sumNew = 0, sumRen = 0, sumTot = 0;
                        foreach (var r in rocRows)
                        {
                            sumNew += r.Counts.NewCount;
                            sumRen += r.Counts.RenModCount;
                            sumTot += r.Counts.TotalCount;
                            RenderBodyCell(t, r.Label, alignLeft: true);
                            RenderBodyCell(t, r.Counts.NewCount.ToString());
                            RenderBodyCell(t, r.Counts.RenModCount.ToString());
                            RenderBodyCell(t, r.Counts.TotalCount.ToString(), bold: true);
                        }

                        RenderTotalCell(t, "SUB-TOTAL ROC & EXAMS", alignLeft: true);
                        RenderTotalCell(t, sumNew.ToString());
                        RenderTotalCell(t, sumRen.ToString());
                        RenderTotalCell(t, sumTot.ToString());
                    });
                });
            });

            // Second Row: Section VIII (Control & Enforcement / ARTA Metrics) & Section IX (Regional Financial Status)
            col.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem(0.95f).PaddingRight(4).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn();
                        cd.ConstantColumn(80);
                    });

                    RenderSectionTitleRow(t, 2, "VIII. CONTROL, ENFORCEMENT & ARTA COMPLIANCE");
                    RenderTableHeaderCell(t, "OPERATIONAL INDICATOR", alignLeft: true);
                    RenderTableHeaderCell(t, "ACCOMPLISHMENT");

                    RenderBodyCell(t, "1. Total Applications Logged (Total Applicants / Units)", alignLeft: true);
                    RenderBodyCell(t, $"{totalApps:N0} ({totalUnits:N0} units)", bold: true);

                    RenderBodyCell(t, "2. Total Licenses / Permits / Certificates Issued", alignLeft: true);
                    RenderBodyCell(t, issuedCount.ToString("N0"), bold: true);

                    RenderBodyCell(t, "3. Applications In-Process (Eval / SOA / OP / Cashier / Issuance)", alignLeft: true);
                    RenderBodyCell(t, inProgressCount.ToString("N0"));

                    RenderBodyCell(t, "4. Deficient / Returned Applications for Compliance", alignLeft: true);
                    RenderBodyCell(t, returnedCount.ToString("N0"));

                    RenderBodyCell(t, "5. Official Receipts (AF-51) Issued & Verified", alignLeft: true);
                    RenderBodyCell(t, paidTx.Count.ToString("N0"), bold: true);

                    RenderBodyCell(t, "6. Validated AGDB / BTr Bank Deposit Batches", alignLeft: true);
                    RenderBodyCell(t, _model.BankDeposits.Count.ToString("N0"), bold: true);

                    RenderBodyCell(t, "7. Citizen's Charter Turnaround Compliance Rate (RA 11032)", alignLeft: true);
                    RenderBodyCell(t, $"{complianceRate}%", bold: true);

                    RenderBodyCell(t, "8. Client Satisfaction Rating (CSAT Survey Average)", alignLeft: true);
                    RenderBodyCell(t, $"{_model.AverageCsat:F2} / 5.00 ({_model.FeedbackCount} resp.)", bold: true);
                });

                row.RelativeItem(1.05f).PaddingLeft(4).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn();
                        cd.ConstantColumn(84);
                    });

                    RenderSectionTitleRow(t, 2, "IX. REGIONAL FINANCIAL STATUS (COLLECTIONS & DEPOSITS)");
                    RenderTableHeaderCell(t, "REVENUE SOURCE / PARTICULAR", alignLeft: true);
                    RenderTableHeaderCell(t, "AMOUNT (PHP)");

                    RenderBodyCell(t, "A. Permit Fees (Purchase / Possess / Construction / Temp)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.PermitFees), alignRight: true);

                    RenderBodyCell(t, "B. Radio Station & Operator License Fees", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.LicenseFees), alignRight: true);

                    RenderBodyCell(t, "C. Registration Fees (Radio / Telecom / CPE / VAS)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.RegistrationFees), alignRight: true);

                    RenderBodyCell(t, "D. Spectrum User's Fee (SUF)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.SpectrumSuf), alignRight: true);

                    RenderBodyCell(t, "E. Supervision and Regulation Enforcement Fee (SRF)", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.SupervisionFees), alignRight: true);

                    RenderBodyCell(t, "F. Clearance / Certification / Examination / Filing Fees", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.ClearanceFees + uacsTotals.ExamFees + uacsTotals.OtherIncome), alignRight: true);

                    RenderBodyCell(t, "G. Fines, Penalties & Surcharges", alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(uacsTotals.FinesPenalties), alignRight: true);

                    RenderBodyCell(t, "TOTAL NGP REGULATORY COLLECTIONS (A to G)", alignLeft: true, bold: true);
                    RenderBodyCell(t, FormatCurrency(netNgp), alignRight: true, bold: true);

                    RenderBodyCell(t, "DOCUMENTARY STAMP TAX (DST) COLLECTED / DEPOSITED", alignLeft: true);
                    RenderBodyCell(t, $"{FormatCurrency(uacsTotals.Dst)} / {FormatCurrency(depositMetrics.DstDeposited)}", alignRight: true);

                    RenderBodyCell(t, "AMOUNT DEPOSITED TO AGDB / BTr (UNDEPOSITED ON HAND)", alignLeft: true, bold: true);
                    RenderBodyCell(t, $"{FormatCurrency(depositMetrics.TotalDeposited)} ({FormatCurrency(depositMetrics.UndepositedBalance)})", alignRight: true, bold: true);

                    RenderTotalCell(t, "GRAND TOTAL AMOUNT COLLECTED", alignLeft: true);
                    RenderTotalCell(t, $"PHP {FormatCurrency(depositMetrics.TotalCollected)}", alignRight: true);
                });
            });

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", _model.GeneratedBy, "MIS / Planning Officer"),
                ("REVIEWED / NOTED BY:", "CHIEF, ENFORCEMENT & OPERATIONS DIV.", "Chief, EOD / Chief, FAD"),
                ("APPROVED BY:", $"REGIONAL DIRECTOR — {_model.TenantName.ToUpperInvariant()}", "Regional Director")));
        });
    }
}

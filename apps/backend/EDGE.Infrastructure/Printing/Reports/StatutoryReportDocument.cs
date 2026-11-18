using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

public class StatutoryReportDocument : IDocument
{
    private readonly StatutoryReportModel _model;
    private readonly Dictionary<string, OfficialReceipt> _receiptByOrNo;
    private readonly Dictionary<Guid, OfficialReceipt> _receiptById;
    private readonly Dictionary<Guid, List<OfficialReceipt>> _receiptsByAppId;

    public StatutoryReportDocument(StatutoryReportModel model)
    {
        _model = model ?? new StatutoryReportModel();

        _receiptByOrNo = new Dictionary<string, OfficialReceipt>(StringComparer.OrdinalIgnoreCase);
        _receiptById = new Dictionary<Guid, OfficialReceipt>();
        _receiptsByAppId = new Dictionary<Guid, List<OfficialReceipt>>();

        foreach (var r in _model.OfficialReceipts)
        {
            _receiptById[r.Id] = r;
            if (!string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
            {
                _receiptByOrNo[r.OfficialReceiptNumber.Trim()] = r;
            }
            var appId = r.ApplicationId ?? r.OrderOfPayment?.ApplicationId;
            if (appId.HasValue && appId.Value != Guid.Empty)
            {
                if (!_receiptsByAppId.TryGetValue(appId.Value, out var list))
                {
                    list = new List<OfficialReceipt>();
                    _receiptsByAppId[appId.Value] = list;
                }
                list.Add(r);
            }
        }
    }

    public DocumentMetadata GetMetadata() => new DocumentMetadata
    {
        Title = $"{_model.Code} - {_model.Title}",
        Author = "National Telecommunications Commission (EDGE v2)",
        Subject = _model.LegalBasis,
        Creator = "NTC EDGE QuestPDF Engine"
    };

    private bool IsLandscape =>
        _model.Code is "NTC-COA-APP26-M"
            or "NTC-COA-APP26-D"
            or "NTC-BTR-INC-01"
            or "NTC-APP-SUM-EVAL"
            or "NTC-APP-SUM-SVC"
            or "NTC-APP-SUM-ENT"
            or "NTC-APP-VOL-01";

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(IsLandscape ? PageSizes.A4.Landscape() : PageSizes.A4.Portrait());
            page.MarginHorizontal(22);
            page.MarginVertical(18);
            page.DefaultTextStyle(x => x.FontSize(7.5f).FontFamily(Fonts.Arial).FontColor(Colors.Black));

            page.Header().Element(ComposeOfficialHeader);
            page.Content().PaddingTop(6).Element(ComposeReportBody);
            page.Footer().Element(ComposeOfficialFooter);
        });
    }

    private void ComposeOfficialHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().BorderBottom(1.2f).BorderColor(Colors.Black).PaddingBottom(5).Row(row =>
            {
                row.ConstantItem(46).Height(46).Element(e => RenderLogo(e, "ph-seal.png", "PH SEAL"));

                row.RelativeItem().PaddingHorizontal(8).Column(c =>
                {
                    c.Item().AlignCenter().Text("REPUBLIC OF THE PHILIPPINES")
                        .FontSize(7.5f).FontFamily(Fonts.TimesNewRoman).Bold();
                    c.Item().AlignCenter().Text("DEPARTMENT OF INFORMATION AND COMMUNICATIONS TECHNOLOGY")
                        .FontSize(7f).FontFamily(Fonts.TimesNewRoman);
                    c.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS COMMISSION")
                        .FontSize(10f).FontFamily(Fonts.TimesNewRoman).Bold();
                    c.Item().AlignCenter().Text(_model.TenantName.ToUpperInvariant())
                        .FontSize(8.5f).FontFamily(Fonts.Arial).Bold().FontColor("#0F172A");
                    c.Item().PaddingTop(2).AlignCenter().Text(_model.Title.ToUpperInvariant())
                        .FontSize(9.5f).FontFamily(Fonts.Arial).Bold().FontColor("#1E3A8A");
                    c.Item().AlignCenter().Text($"PERIOD COVERED: {_model.Period.ToUpperInvariant()}   •   FORM CODE: {_model.Code}")
                        .FontSize(7f).FontFamily(Fonts.Arial).Bold().FontColor("#334155");
                });

                row.ConstantItem(46).Height(46).Element(e => RenderLogo(e, "ntc-Logo.png", "NTC SEAL"));
            });

            col.Item().PaddingTop(3).Background("#F8FAFC").Border(0.6f).BorderColor("#CBD5E1").PaddingHorizontal(6).PaddingVertical(3).Row(meta =>
            {
                meta.RelativeItem().Text(t =>
                {
                    t.Span("Receiving Agency: ").Bold().FontSize(6.8f);
                    t.Span(_model.Agency).FontSize(6.8f);
                });
                meta.RelativeItem().AlignCenter().Text(t =>
                {
                    t.Span("Statutory Basis: ").Bold().FontSize(6.8f);
                    t.Span(_model.LegalBasis).FontSize(6.8f);
                });
                meta.RelativeItem().AlignRight().Text(t =>
                {
                    t.Span("Frequency: ").Bold().FontSize(6.8f);
                    t.Span(_model.Frequency).FontSize(6.8f);
                    if (!string.IsNullOrWhiteSpace(_model.SecondaryFilter) && !string.Equals(_model.SecondaryFilter, "all", StringComparison.OrdinalIgnoreCase))
                    {
                        t.Span($"  |  Filter: {_model.SecondaryFilter}").Bold().FontSize(6.8f);
                    }
                });
            });
        });
    }

    private void ComposeOfficialFooter(IContainer container)
    {
        container.PaddingTop(4).BorderTop(0.5f).BorderColor("#CBD5E1").Row(row =>
        {
            row.RelativeItem().Text($"NTC EDGE Official Statutory Document • {_model.Code} • Generated {_model.GeneratedAt:yyyy-MM-dd HH:mm} UTC by {_model.GeneratedBy}")
                .FontSize(6.5f).FontColor(Colors.Grey.Darken2);

            row.AutoItem().Text(t =>
            {
                t.DefaultTextStyle(s => s.FontSize(6.5f).FontColor(Colors.Grey.Darken2).Bold());
                t.Span("Page ");
                t.CurrentPageNumber();
                t.Span(" of ");
                t.TotalPages();
            });
        });
    }

    private void ComposeReportBody(IContainer container)
    {
        switch (_model.Code)
        {
            case "NTC-MIS-OPS":
                ComposeMisOperationsReport(container);
                break;
            case "NTC-COA-APP26-M":
            case "NTC-COA-APP26-D":
                ComposeCoaAppendix26Report(container);
                break;
            case "NTC-BIR-DST-01":
                ComposeBirDstReport(container);
                break;
            case "NTC-BTR-INC-01":
                ComposeBtrIncomeReport(container);
                break;
            case "NTC-APP-SUM-EVAL":
            case "NTC-APP-SUM-SVC":
            case "NTC-APP-SUM-ENT":
                ComposeApplicationSummaryReport(container);
                break;
            case "NTC-APP-VOL-01":
                ComposeApplicationVolumeReport(container);
                break;
            case "NTC-EXAM-MST-01":
                ComposeExamMasterlistReport(container);
                break;
            default:
                ComposeMisOperationsReport(container);
                break;
        }
    }

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

    // =========================================================================
    // 2. NTC-COA-APP26-M & NTC-COA-APP26-D: COA GAM Appendix 26 (RCD)
    // =========================================================================
    private void ComposeCoaAppendix26Report(IContainer container)
    {
        var paidTx = _model.PaidTransactions;
        var uacsRows = paidTx.Select(tx =>
        {
            var matchedOr = FindMatchingReceipt(tx);
            var breakdown = ClassifyTransactionUacs(tx, matchedOr);
            string depositStatus = matchedOr != null
                ? (matchedOr.Status == ReceiptStatus.Deposited || matchedOr.Deposit != null
                    ? $"DEPOSITED ({matchedOr.Deposit?.DepositSlipNumber ?? "AGDB"})"
                    : "UNDEPOSITED")
                : "REMITTED";
            return (Tx: tx, Breakdown: breakdown, DepositStatus: depositStatus);
        }).ToList();

        var totals = ComputeUacsTotals(paidTx);
        var depositMetrics = ComputeDepositMetrics(paidTx, totals.Dst);

        container.Column(col =>
        {
            // COA Appendix 26 Metadata Banner
            col.Item().Border(0.8f).BorderColor(Colors.Black).Padding(4).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text($"Entity Name: NATIONAL TELECOMMUNICATIONS COMMISSION — {_model.TenantName.ToUpperInvariant()}").Bold().FontSize(7.5f);
                    c.Item().Text("Fund Cluster: 01101101 — Regular Agency Fund (General Fund - New General Appropriations)").FontSize(7f);
                });
                r.ConstantItem(220).Column(c =>
                {
                    c.Item().AlignRight().Text("COA GAM Volume II — Appendix 26").Bold().FontSize(7.5f);
                    c.Item().AlignRight().Text($"Report No.: RCD-{_model.GeneratedAt:yyyyMMdd}   •   Period: {_model.Period}").FontSize(7f);
                });
            });

            // A. COLLECTIONS TABLE
            col.Item().PaddingTop(4).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(44); // OR Date
                    cd.ConstantColumn(54); // OR No.
                    cd.RelativeColumn(1.2f); // Payor
                    cd.RelativeColumn(1.1f); // Particulars
                    cd.ConstantColumn(48); // Total per OR
                    cd.ConstantColumn(40); // Permit (40201010)
                    cd.ConstantColumn(40); // License (40201010)
                    cd.ConstantColumn(40); // Reg (40201020)
                    cd.ConstantColumn(38); // Clear/Exam
                    cd.ConstantColumn(40); // SRF (40201070)
                    cd.ConstantColumn(40); // SUF (40201140)
                    cd.ConstantColumn(38); // Fines (40201140)
                    cd.ConstantColumn(34); // DST (20201050)
                    cd.ConstantColumn(38); // Other (40201990)
                    cd.ConstantColumn(56); // Deposit Status
                });

                RenderSectionTitleRow(t, 15, "I. SCHEDULE OF OFFICIAL RECEIPT COLLECTIONS BY UACS OBJECT CODE & DEPOSIT STATUS");
                RenderTableHeaderCell(t, "OR DATE");
                RenderTableHeaderCell(t, "OR NO.");
                RenderTableHeaderCell(t, "PAYOR / ENTITY", alignLeft: true);
                RenderTableHeaderCell(t, "SERVICE / PARTICULAR", alignLeft: true);
                RenderTableHeaderCell(t, "TOTAL OR");
                RenderTableHeaderCell(t, "PERMIT\n40201010");
                RenderTableHeaderCell(t, "LICENSE\n40201010");
                RenderTableHeaderCell(t, "REGIST.\n40201020");
                RenderTableHeaderCell(t, "CLR/EXM\n40201030");
                RenderTableHeaderCell(t, "SUPERV.\n40201070");
                RenderTableHeaderCell(t, "SPECTRUM\n40201140");
                RenderTableHeaderCell(t, "FINES\n40201140");
                RenderTableHeaderCell(t, "DST\n20201050");
                RenderTableHeaderCell(t, "OTHER\n40201990");
                RenderTableHeaderCell(t, "DEPOSIT\nSTATUS");

                if (uacsRows.Count == 0)
                {
                    t.Cell().ColumnSpan(15).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No Official Receipt collections recorded for the selected date range.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var item in uacsRows.Take(28))
                    {
                        var tx = item.Tx;
                        var b = item.Breakdown;
                        RenderBodyCell(t, tx.Date.ToString("yyyy-MM-dd"));
                        RenderBodyCell(t, tx.RefNo, bold: true);
                        RenderBodyCell(t, Truncate(tx.ApplicantName, 24), alignLeft: true);
                        RenderBodyCell(t, Truncate(tx.ServiceType, 22), alignLeft: true);
                        RenderBodyCell(t, FormatCurrency(tx.Amount), alignRight: true, bold: true);
                        RenderBodyCell(t, FormatZeroDash(b.PermitFees), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.LicenseFees), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.RegistrationFees), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.ClearanceFees + b.ExamFees), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.SupervisionFees), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.SpectrumSuf), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.FinesPenalties), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.Dst), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(b.OtherIncome), alignRight: true);
                        RenderBodyCell(t, Truncate(item.DepositStatus, 14), bold: item.DepositStatus.StartsWith("DEPOSITED"));
                    }
                }

                RenderTotalCell(t, "TOTAL", colspan: 4, alignLeft: true);
                RenderTotalCell(t, FormatCurrency(depositMetrics.TotalCollected), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.PermitFees), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.LicenseFees), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.RegistrationFees), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.ClearanceFees + totals.ExamFees), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.SupervisionFees), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.SpectrumSuf), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.FinesPenalties), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.Dst), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totals.OtherIncome), alignRight: true);
                RenderTotalCell(t, $"{uacsRows.Count} ORs");
            });

            // B. SCHEDULE OF BANK DEPOSITS / REMITTANCES & RECONCILIATION
            if (_model.BankDeposits.Count > 0)
            {
                col.Item().PaddingTop(4).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.ConstantColumn(60); // Deposit Date
                        cd.ConstantColumn(90); // Deposit Slip No.
                        cd.RelativeColumn(1.4f); // Depository Bank & Account
                        cd.ConstantColumn(95); // Fund Cluster
                        cd.ConstantColumn(65); // Cash
                        cd.ConstantColumn(65); // Check
                        cd.ConstantColumn(70); // Total Deposited
                        cd.ConstantColumn(45); // ORs
                        cd.ConstantColumn(65); // Status
                    });

                    RenderSectionTitleRow(t, 9, "II. SCHEDULE OF VALIDATED BANK DEPOSITS / AGDB REMITTANCE BATCHES");
                    RenderTableHeaderCell(t, "DEPOSIT DATE");
                    RenderTableHeaderCell(t, "DEPOSIT SLIP NO.");
                    RenderTableHeaderCell(t, "AUTHORIZED GOVT DEPOSITORY BANK (AGDB)", alignLeft: true);
                    RenderTableHeaderCell(t, "FUND CLUSTER");
                    RenderTableHeaderCell(t, "CASH AMOUNT");
                    RenderTableHeaderCell(t, "CHECK AMOUNT");
                    RenderTableHeaderCell(t, "TOTAL DEPOSITED");
                    RenderTableHeaderCell(t, "OR COUNT");
                    RenderTableHeaderCell(t, "STATUS");

                    foreach (var d in _model.BankDeposits.Take(10))
                    {
                        string bankInfo = d.BankAccount != null
                            ? $"{d.BankAccount.BankName} — Acct #{d.BankAccount.AccountNumber}"
                            : "LandBank / DBP — BTr Treasury Account";
                        string fundCluster = d.BankAccount != null && !string.IsNullOrWhiteSpace(d.BankAccount.FundCluster)
                            ? d.BankAccount.FundCluster
                            : "01101101 (NGP)";

                        RenderBodyCell(t, d.DepositDate.ToString("yyyy-MM-dd"));
                        RenderBodyCell(t, d.DepositSlipNumber, bold: true);
                        RenderBodyCell(t, Truncate(bankInfo, 42), alignLeft: true);
                        RenderBodyCell(t, fundCluster);
                        RenderBodyCell(t, FormatCurrency(d.CashAmount), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(d.CheckAmount), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(d.TotalAmount), alignRight: true, bold: true);
                        RenderBodyCell(t, d.Receipts.Count.ToString("N0"));
                        RenderBodyCell(t, d.Status.ToString().ToUpperInvariant(), bold: true);
                    }
                });
            }

            // Summary of Remittances & Official Oath Certification
            col.Item().PaddingTop(4).Border(0.8f).BorderColor(Colors.Black).Padding(5).Row(r =>
            {
                r.RelativeItem(0.48f).Column(c =>
                {
                    c.Item().Text("III. SUMMARY OF COLLECTIONS, REMITTANCES & UNDEPOSITED BALANCE").Bold().FontSize(7.2f);
                    c.Item().PaddingTop(2).Text($"• Total Collections per Accountable Form 51 ({paidTx.Count} ORs): PHP {FormatCurrency(depositMetrics.TotalCollected)} (Cash: {FormatCurrency(depositMetrics.CashCollected)} | Check: {FormatCurrency(depositMetrics.CheckCollected)} | Online: {FormatCurrency(depositMetrics.OnlineCollected)})").FontSize(6.6f);
                    c.Item().Text($"• Total Remitted / Deposited with AGDB / BTr ({_model.BankDeposits.Count} Deposit Batches): PHP {FormatCurrency(depositMetrics.TotalDeposited)}").Bold().FontSize(6.6f);
                    c.Item().Text($"• Ending Undeposited Collections on Hand ({depositMetrics.UndepositedOrCount} Issued ORs Awaiting Deposit): PHP {FormatCurrency(depositMetrics.UndepositedBalance)}").Bold().FontSize(6.6f);
                });

                r.RelativeItem(0.52f).PaddingLeft(8).Column(c =>
                {
                    c.Item().Text("OFFICIAL CERTIFICATION:").Bold().FontSize(7.2f);
                    c.Item().PaddingTop(2).Text(
                        "I HEREBY CERTIFY on my official oath that the above is a true and correct statement of all collections received by me during the period stated above for which Official Receipts were actually issued by me in the amounts shown thereon, and that the deposited amounts were duly remitted with the Authorized Government Depository Bank (AGDB) to the credit of the Bureau of the Treasury.")
                        .FontSize(6.4f).Italic();
                });
            });

            col.Item().PaddingTop(5).Element(c => ComposeSignatories(
                c,
                ("PREPARED & CERTIFIED CORRECT BY:", _model.GeneratedBy, "Collecting Officer / Regional Cashier III"),
                ("VERIFIED & RECONCILED BY:", "REGIONAL ACCOUNTANT III", "Head, Accounting Unit (FAD)"),
                ("APPROVED BY:", $"REGIONAL DIRECTOR — {_model.TenantName.ToUpperInvariant()}", "Regional Director")));
        });
    }

    // =========================================================================
    // 3. NTC-BIR-DST-01: BIR Form 2000-OT Monthly DST Collection & Remittance
    // =========================================================================
    private void ComposeBirDstReport(IContainer container)
    {
        var paidTx = _model.PaidTransactions;
        var rows = paidTx.Select(tx =>
        {
            var matchedOr = FindMatchingReceipt(tx);
            var b = ClassifyTransactionUacs(tx, matchedOr);
            decimal dst = b.Dst > 0m ? b.Dst : (tx.Amount >= 30m ? 30m : 0m);
            decimal net = Math.Max(0m, tx.Amount - dst);
            bool isDeposited = matchedOr == null || matchedOr.Status == ReceiptStatus.Deposited || matchedOr.Deposit != null;
            string remittanceStatus = isDeposited
                ? (matchedOr?.Deposit != null ? $"REMITTED ({matchedOr.Deposit.DepositSlipNumber})" : "REMITTED TO BTr")
                : "FOR REMITTANCE";
            return (Tx: tx, Dst: dst, NetReg: net, IsDeposited: isDeposited, RemittanceStatus: remittanceStatus);
        }).ToList();

        decimal totalGross = rows.Sum(r => r.Tx.Amount);
        decimal totalDst = rows.Sum(r => r.Dst);
        decimal totalDstDeposited = rows.Where(r => r.IsDeposited).Sum(r => r.Dst);
        decimal totalDstUndeposited = Math.Max(0m, totalDst - totalDstDeposited);
        decimal totalNet = rows.Sum(r => r.NetReg);

        container.Column(col =>
        {
            col.Item().Border(0.8f).BorderColor(Colors.Black).Padding(5).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("STATUTORY TAX RETURN REFERENCE: BIR Form No. 2000-OT / NIRC Sec. 188").Bold().FontSize(7.5f);
                    c.Item().Text("Tax Type: Documentary Stamp Tax (DST) on Certificates, Permits & Licenses (Constructive Affixture)").FontSize(7f);
                });
                r.ConstantItem(220).Column(c =>
                {
                    c.Item().AlignRight().Text($"DST Collected: PHP {FormatCurrency(totalDst)}   |   Remitted: PHP {FormatCurrency(totalDstDeposited)}").Bold().FontSize(7.2f);
                    c.Item().AlignRight().Text($"UACS Code: 2-02-01-050   |   Undeposited DST: PHP {FormatCurrency(totalDstUndeposited)}").FontSize(6.8f);
                });
            });

            col.Item().PaddingTop(5).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(50); // Date
                    cd.ConstantColumn(60); // OR No.
                    cd.RelativeColumn(1.3f); // Payor
                    cd.RelativeColumn(1.3f); // Document / Certificate
                    cd.ConstantColumn(58); // Gross OR
                    cd.ConstantColumn(58); // Net Regulatory
                    cd.ConstantColumn(52); // DST (20201050)
                    cd.ConstantColumn(75); // Remittance Status
                });

                RenderSectionTitleRow(t, 8, "SCHEDULE OF CONSTRUCTIVE DOCUMENTARY STAMP TAX (DST) COLLECTIONS & REMITTANCE STATUS");
                RenderTableHeaderCell(t, "OR DATE");
                RenderTableHeaderCell(t, "OR NUMBER");
                RenderTableHeaderCell(t, "TAXPAYER / PAYOR NAME", alignLeft: true);
                RenderTableHeaderCell(t, "TAXABLE CERTIFICATE / LICENSE / PERMIT", alignLeft: true);
                RenderTableHeaderCell(t, "GROSS OR");
                RenderTableHeaderCell(t, "NET REG. FEE");
                RenderTableHeaderCell(t, "DST (SEC. 188)");
                RenderTableHeaderCell(t, "REMITTANCE");

                if (rows.Count == 0)
                {
                    t.Cell().ColumnSpan(8).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No Documentary Stamp Tax collections recorded for the selected period.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var r in rows.Take(38))
                    {
                        RenderBodyCell(t, r.Tx.Date.ToString("yyyy-MM-dd"));
                        RenderBodyCell(t, r.Tx.RefNo, bold: true);
                        RenderBodyCell(t, Truncate(r.Tx.ApplicantName, 30), alignLeft: true);
                        RenderBodyCell(t, Truncate(r.Tx.ServiceType, 30), alignLeft: true);
                        RenderBodyCell(t, FormatCurrency(r.Tx.Amount), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(r.NetReg), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(r.Dst), alignRight: true, bold: true);
                        RenderBodyCell(t, Truncate(r.RemittanceStatus, 18), bold: r.IsDeposited);
                    }
                }

                RenderTotalCell(t, $"TOTAL ({rows.Count} OFFICIAL RECEIPTS)", colspan: 4, alignLeft: true);
                RenderTotalCell(t, FormatCurrency(totalGross), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totalNet), alignRight: true);
                RenderTotalCell(t, $"PHP {FormatCurrency(totalDst)}", alignRight: true);
                RenderTotalCell(t, $"Remitted: {FormatCurrency(totalDstDeposited)}");
            });

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", _model.GeneratedBy, "Collecting Officer / Cashier III"),
                ("CERTIFIED CORRECT BY:", "REGIONAL ACCOUNTANT III", "Head, Accounting Unit"),
                ("APPROVED FOR REMITTANCE BY:", $"REGIONAL DIRECTOR — {_model.TenantName.ToUpperInvariant()}", "Regional Director")));
        });
    }

    // =========================================================================
    // 4. NTC-BTR-INC-01: BTr Monthly Report of Income Collected & Deposited
    // =========================================================================
    private void ComposeBtrIncomeReport(IContainer container)
    {
        var paidTx = _model.PaidTransactions;
        var totals = ComputeUacsTotals(paidTx);
        var depositedTotals = ComputeDepositedUacsTotals(paidTx);
        var depositMetrics = ComputeDepositMetrics(paidTx, totals.Dst);

        var schedule = new (string Code, string Title, string LegalBasis, decimal Collected, decimal Deposited, string Fund)[]
        {
            ("4-02-01-010-A", "Permit Fees — Purchase / Possess / Construction / Temporary Permits", "Act 3846 / EO 546", totals.PermitFees, depositedTotals.PermitFees, "01101101 (General Fund - NGP)"),
            ("4-02-01-010-B", "License Fees — Radio Station License (RSL) & Operator Certificates (ROC)", "Act 3846 / RA 7925", totals.LicenseFees, depositedTotals.LicenseFees, "01101101 (General Fund - NGP)"),
            ("4-02-01-020", "Registration Fees — Radio Transceivers, Telecom & CPE Registration", "EO 546 / NTC MC", totals.RegistrationFees, depositedTotals.RegistrationFees, "01101101 (General Fund - NGP)"),
            ("4-02-01-030", "Examination Fees — Radio Operator & Amateur Examinations", "Act 3846 / RA 11032", totals.ExamFees, depositedTotals.ExamFees, "01101101 (General Fund - NGP)"),
            ("4-02-01-040", "Clearance and Certification Fees — Certified True Copies & Verifications", "EO 546 / NTC Charter", totals.ClearanceFees, depositedTotals.ClearanceFees, "01101101 (General Fund - NGP)"),
            ("4-02-01-070", "Supervision and Regulation Enforcement Fees (SRF)", "CA 146 / RA 7925", totals.SupervisionFees, depositedTotals.SupervisionFees, "01101101 (General Fund - NGP)"),
            ("4-02-01-140-A", "Spectrum User's Fee (SUF)", "RA 7925 Sec. 15", totals.SpectrumSuf, depositedTotals.SpectrumSuf, "01101101 (General Fund - NGP)"),
            ("4-02-01-140-B", "Fines and Penalties — Service Income & Late Renewal Surcharges", "Act 3846 / NTC Schedule", totals.FinesPenalties, depositedTotals.FinesPenalties, "01101101 (General Fund - NGP)"),
            ("4-02-01-990", "Other Service Income — Modifications, Call Sign & Miscellaneous Fees", "GAM Vol. I / EO 546", totals.OtherIncome, depositedTotals.OtherIncome, "01101101 (General Fund - NGP)"),
            ("2-02-01-050", "Due to BIR — Documentary Stamp Tax (Constructive Affixture)", "NIRC Sec. 188 / RA 10963", totals.Dst, depositedTotals.Dst, "Trust / Inter-Agency Remittance")
        };

        container.Column(col =>
        {
            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(72);
                    cd.RelativeColumn(1.8f);
                    cd.RelativeColumn(0.95f);
                    cd.RelativeColumn(1.05f);
                    cd.ConstantColumn(78);
                    cd.ConstantColumn(78);
                    cd.ConstantColumn(72);
                });

                RenderSectionTitleRow(t, 7, "I. STATEMENT OF INCOME COLLECTED AND DEPOSITED WITH THE BUREAU OF THE TREASURY (BTr)");
                RenderTableHeaderCell(t, "UACS CODE");
                RenderTableHeaderCell(t, "REVENUE ACCOUNT TITLE / DESCRIPTION", alignLeft: true);
                RenderTableHeaderCell(t, "STATUTORY BASIS", alignLeft: true);
                RenderTableHeaderCell(t, "FUND CLUSTER", alignLeft: true);
                RenderTableHeaderCell(t, "COLLECTED (PHP)");
                RenderTableHeaderCell(t, "DEPOSITED (BTr)");
                RenderTableHeaderCell(t, "UNDEPOSITED");

                foreach (var row in schedule)
                {
                    decimal undep = Math.Max(0m, row.Collected - row.Deposited);
                    RenderBodyCell(t, row.Code, bold: true);
                    RenderBodyCell(t, row.Title, alignLeft: true);
                    RenderBodyCell(t, row.LegalBasis, alignLeft: true);
                    RenderBodyCell(t, row.Fund, alignLeft: true);
                    RenderBodyCell(t, FormatCurrency(row.Collected), alignRight: true, bold: row.Collected > 0);
                    RenderBodyCell(t, FormatCurrency(row.Deposited), alignRight: true, bold: row.Deposited > 0);
                    RenderBodyCell(t, FormatCurrency(undep), alignRight: true, bold: undep > 0);
                }

                RenderTotalCell(t, "GRAND TOTAL NATIONAL TREASURY COLLECTIONS & DEPOSITS", colspan: 4, alignLeft: true);
                RenderTotalCell(t, $"PHP {FormatCurrency(depositMetrics.TotalCollected)}", alignRight: true);
                RenderTotalCell(t, $"PHP {FormatCurrency(depositMetrics.TotalDeposited)}", alignRight: true);
                RenderTotalCell(t, $"PHP {FormatCurrency(depositMetrics.UndepositedBalance)}", alignRight: true);
            });

            if (_model.BankDeposits.Count > 0)
            {
                col.Item().PaddingTop(5).Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.ConstantColumn(65);
                        cd.ConstantColumn(95);
                        cd.RelativeColumn(1.5f);
                        cd.ConstantColumn(95);
                        cd.ConstantColumn(75);
                        cd.ConstantColumn(75);
                        cd.ConstantColumn(80);
                    });

                    RenderSectionTitleRow(t, 7, "II. VALIDATED BANK DEPOSIT SLIPS / AGDB TREASURY REMITTANCES");
                    RenderTableHeaderCell(t, "DEPOSIT DATE");
                    RenderTableHeaderCell(t, "DEPOSIT SLIP NO.");
                    RenderTableHeaderCell(t, "DEPOSITORY BANK & ACCOUNT", alignLeft: true);
                    RenderTableHeaderCell(t, "FUND CLUSTER");
                    RenderTableHeaderCell(t, "CASH REMITTED");
                    RenderTableHeaderCell(t, "CHECK REMITTED");
                    RenderTableHeaderCell(t, "TOTAL DEPOSITED");

                    foreach (var d in _model.BankDeposits.Take(8))
                    {
                        string bankInfo = d.BankAccount != null
                            ? $"{d.BankAccount.BankName} ({d.BankAccount.AccountNumber})"
                            : "Authorized Govt Depository Bank (BTr)";
                        RenderBodyCell(t, d.DepositDate.ToString("yyyy-MM-dd"));
                        RenderBodyCell(t, d.DepositSlipNumber, bold: true);
                        RenderBodyCell(t, bankInfo, alignLeft: true);
                        RenderBodyCell(t, d.BankAccount?.FundCluster ?? "01101101");
                        RenderBodyCell(t, FormatCurrency(d.CashAmount), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(d.CheckAmount), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(d.TotalAmount), alignRight: true, bold: true);
                    }
                });
            }

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", _model.GeneratedBy, "Regional Cashier III"),
                ("CERTIFIED CORRECT BY:", "REGIONAL ACCOUNTANT III", "Chief Accountant / FAD"),
                ("APPROVED BY:", $"REGIONAL DIRECTOR — {_model.TenantName.ToUpperInvariant()}", "Regional Director")));
        });
    }

    // =========================================================================
    // 5. NTC-APP-SUM-EVAL / SVC / ENT: Application Summary Report
    // =========================================================================
    private void ComposeApplicationSummaryReport(IContainer container)
    {
        var apps = _model.Applications;

        var rows = apps.Select((app, idx) =>
        {
            var matchedTx = FindMatchingTransactionForApp(app);
            var matchedOrs = _receiptsByAppId.TryGetValue(app.Id, out var appOrList) ? appOrList : null;
            var issuedDoc = app.IssuedDocumentDetails?.FirstOrDefault();

            string evaluator = !string.IsNullOrWhiteSpace(app.EvaluatingOfficer)
                ? app.EvaluatingOfficer!
                : (!string.IsNullOrWhiteSpace(issuedDoc?.OriginalEvaluatorName)
                    ? issuedDoc!.OriginalEvaluatorName!
                    : (!string.IsNullOrWhiteSpace(app.AssignedOfficerName) ? app.AssignedOfficerName! : _model.GeneratedBy));

            string serviceName = !string.IsNullOrWhiteSpace(app.ServiceName)
                ? app.ServiceName!
                : (app.Applicants?.FirstOrDefault(a => !string.IsNullOrWhiteSpace(a.ServiceName))?.ServiceName
                    ?? app.Services?.FirstOrDefault()?.ServiceName
                    ?? "Regulatory Licensing Service");

            string appType = !string.IsNullOrWhiteSpace(app.ServiceVariantType)
                ? app.ServiceVariantType!
                : (!string.IsNullOrWhiteSpace(app.ServiceVariantName) ? app.ServiceVariantName! : app.Intent);

            string category = !string.IsNullOrWhiteSpace(app.ServiceCategory) ? app.ServiceCategory! : "Licensing";

            string clientName = !string.IsNullOrWhiteSpace(app.PayorName)
                ? app.PayorName!
                : (app.FilingUser?.Company?.Name
                    ?? app.FilingUser?.Name
                    ?? app.Applicants?.FirstOrDefault()?.Company?.Name
                    ?? app.Applicants?.FirstOrDefault()?.Name
                    ?? "Walk-In Applicant");

            string appDate = app.CreatedAt.ToString("yyyy-MM-dd");
            string issueDate = issuedDoc != null
                ? issuedDoc.IssueDate.ToString("yyyy-MM-dd")
                : (string.Equals(app.Status, "Approved", StringComparison.OrdinalIgnoreCase) || string.Equals(app.Status, "Completed", StringComparison.OrdinalIgnoreCase)
                    ? (app.UpdatedAt ?? app.CreatedAt).ToString("yyyy-MM-dd")
                    : "Pending");

            string orNo = matchedOrs != null && matchedOrs.Count > 0
                ? string.Join(", ", matchedOrs.Select(r => r.OfficialReceiptNumber).Where(s => !string.IsNullOrWhiteSpace(s)).Distinct())
                : (!string.IsNullOrWhiteSpace(app.OfficialReceiptNumber)
                    ? app.OfficialReceiptNumber!
                    : (!string.IsNullOrWhiteSpace(issuedDoc?.OfficialReceiptNumber)
                        ? issuedDoc!.OfficialReceiptNumber!
                        : (matchedTx?.RefNo ?? "—")));

            decimal amount = matchedOrs != null && matchedOrs.Count > 0
                ? matchedOrs.Sum(r => r.Amount)
                : (app.AmountPaid ?? matchedTx?.Amount ?? app.TotalAmountDue ?? 0m);

            string licNo = !string.IsNullOrWhiteSpace(issuedDoc?.LicenseNumber)
                ? issuedDoc!.LicenseNumber!
                : (!string.IsNullOrWhiteSpace(issuedDoc?.FormNumber)
                    ? issuedDoc!.FormNumber!
                    : (app.ApplicationNumber ?? app.ReferenceNumber ?? "—"));

            string validity = issuedDoc?.ExpiryDate.HasValue == true
                ? issuedDoc.ExpiryDate.Value.ToString("yyyy-MM-dd")
                : "—";

            return (
                Index: idx + 1,
                Evaluator: evaluator,
                Service: serviceName,
                AppType: appType,
                Category: category,
                Client: clientName,
                AppDate: appDate,
                IssueDate: issueDate,
                OrNo: orNo,
                Amount: amount,
                LicenseNo: licNo,
                Validity: validity,
                IsIssued: issueDate != "Pending"
            );
        }).ToList();

        decimal totalAmount = rows.Sum(r => r.Amount);
        int issuedTotal = rows.Count(r => r.IsIssued);

        container.Column(col =>
        {
            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(20); // #
                    cd.RelativeColumn(1.0f); // Evaluator
                    cd.RelativeColumn(1.3f); // Service
                    cd.ConstantColumn(45); // Type
                    cd.ConstantColumn(55); // Category
                    cd.RelativeColumn(1.3f); // Client/Entity
                    cd.ConstantColumn(48); // App Date
                    cd.ConstantColumn(48); // Issue Date
                    cd.ConstantColumn(54); // OR No.
                    cd.ConstantColumn(54); // Amount
                    cd.ConstantColumn(68); // License/Permit No.
                    cd.ConstantColumn(48); // Validity
                });

                RenderSectionTitleRow(t, 12, $"{_model.Title.ToUpperInvariant()} — DETAILED REGISTER ({rows.Count} RECORDS)");
                RenderTableHeaderCell(t, "#");
                RenderTableHeaderCell(t, "EVALUATOR", alignLeft: true);
                RenderTableHeaderCell(t, "SERVICE APPLIED", alignLeft: true);
                RenderTableHeaderCell(t, "TYPE");
                RenderTableHeaderCell(t, "CATEGORY");
                RenderTableHeaderCell(t, "CLIENT / ENTITY NAME", alignLeft: true);
                RenderTableHeaderCell(t, "APP DATE");
                RenderTableHeaderCell(t, "ISSUED");
                RenderTableHeaderCell(t, "OR NO.");
                RenderTableHeaderCell(t, "AMOUNT");
                RenderTableHeaderCell(t, "LICENSE / REF NO.");
                RenderTableHeaderCell(t, "VALIDITY");

                if (rows.Count == 0)
                {
                    t.Cell().ColumnSpan(12).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No applications matched the selected period and filter criteria.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var r in rows.Take(38))
                    {
                        RenderBodyCell(t, r.Index.ToString());
                        RenderBodyCell(t, Truncate(r.Evaluator, 22), alignLeft: true);
                        RenderBodyCell(t, Truncate(r.Service, 28), alignLeft: true);
                        RenderBodyCell(t, Truncate(r.AppType, 10));
                        RenderBodyCell(t, Truncate(r.Category, 12));
                        RenderBodyCell(t, Truncate(r.Client, 28), alignLeft: true, bold: true);
                        RenderBodyCell(t, r.AppDate);
                        RenderBodyCell(t, r.IssueDate);
                        RenderBodyCell(t, r.OrNo, bold: r.OrNo != "—");
                        RenderBodyCell(t, FormatCurrency(r.Amount), alignRight: true, bold: r.Amount > 0);
                        RenderBodyCell(t, Truncate(r.LicenseNo, 16));
                        RenderBodyCell(t, r.Validity);
                    }
                }

                RenderTotalCell(t, $"TOTAL ({rows.Count} APPLICATIONS • {issuedTotal} ISSUED)", colspan: 9, alignLeft: true);
                RenderTotalCell(t, $"PHP {FormatCurrency(totalAmount)}", alignRight: true);
                RenderTotalCell(t, string.Empty, colspan: 2);
            });

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", _model.GeneratedBy, "Licensing Evaluator / Records Officer"),
                ("REVIEWED BY:", "CHIEF, ENFORCEMENT & OPERATIONS DIV.", "Chief, EOD"),
                ("APPROVED BY:", $"REGIONAL DIRECTOR — {_model.TenantName.ToUpperInvariant()}", "Regional Director")));
        });
    }

    // =========================================================================
    // 6. NTC-APP-VOL-01: EDGE Application Volume & Deposit Accountability Report
    // =========================================================================
    private void ComposeApplicationVolumeReport(IContainer container)
    {
        var apps = _model.Applications;
        var paidTx = _model.PaidTransactions;

        var monthBuckets = BuildVolumeMonthBuckets();

        var streams = new (string Name, Func<string, bool> Matcher)[]
        {
            ("1. Radio Station Licenses (Fixed / Land Mobile / Maritime / Aviation)", c => c.Contains("station") || c.Contains("rsl") || c.Contains("fixed") || c.Contains("mobile") || c.Contains("coastal") || c.Contains("ship") || c.Contains("aircraft")),
            ("2. Permits to Purchase / Possess / Construction / Temporary Permits", c => c.Contains("purchase") || c.Contains("possess") || c.Contains("construction") || c.Contains("temporary") || c.Contains("permit") || c.Contains("1-09") || c.Contains("1-11")),
            ("3. Radio Operator Certificates (ROC) & Amateur Licenses", c => c.Contains("operator") || c.Contains("roc") || c.Contains("amateur") || c.Contains("srop") || c.Contains("groc") || c.Contains("rtg") || c.Contains("phn")),
            ("4. Dealer / Supplier / Service Center Accreditation & CPE", c => c.Contains("dealer") || c.Contains("supplier") || c.Contains("service center") || c.Contains("accredit") || c.Contains("cpe") || c.Contains("1-19") || c.Contains("vas")),
            ("5. Radio Operator Examinations (ROCE / Amateur Exam)", c => c.Contains("exam") || c.Contains("roce") || c.Contains("admission") || c.Contains("1-01")),
            ("6. Consumer Welfare, Blocking & Administrative Services", _ => true)
        };

        int ClassifyAppStream(ApplicationSummaryDto app)
        {
            var applicantServices = app.Applicants != null && app.Applicants.Count > 0
                ? string.Join(" ", app.Applicants.Select(ap => $"{ap.ServiceName ?? ""} {ap.ServiceVariantName ?? ""}"))
                : string.Empty;
            string corpus = $"{app.ServiceCategory ?? ""} {app.ServiceName ?? ""} {app.ServiceVariantName ?? ""} {applicantServices}".ToLowerInvariant();
            for (int i = 0; i < streams.Length - 1; i++)
            {
                if (streams[i].Matcher(corpus)) return i;
            }
            return streams.Length - 1;
        }

        int ClassifyTxStream(TenantTransactionDto tx)
        {
            string corpus = (tx.ServiceType ?? string.Empty).ToLowerInvariant();
            for (int i = 0; i < streams.Length - 1; i++)
            {
                if (streams[i].Matcher(corpus)) return i;
            }
            return 0;
        }

        bool isCompactMonths = monthBuckets.Count > 6;
        float monthColWidth = isCompactMonths ? 34f : 48f;
        uint totalMatrixCols = (uint)(monthBuckets.Count + 5);

        container.Column(col =>
        {
            // Table I: Monthly Application Volume Matrix
            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(2.1f);
                    foreach (var _ in monthBuckets) cd.ConstantColumn(monthColWidth);
                    cd.ConstantColumn(44); // Total Apps
                    cd.ConstantColumn(44); // Units
                    cd.ConstantColumn(44); // Issued
                    cd.ConstantColumn(44); // Share %
                });

                RenderSectionTitleRow(t, totalMatrixCols, $"I. APPLICATION VOLUME MATRIX BY REGULATORY SERVICE STREAM ({_model.Period.ToUpperInvariant()})");
                RenderTableHeaderCell(t, "REGULATORY SERVICE STREAM", alignLeft: true);
                foreach (var m in monthBuckets)
                {
                    string label = isCompactMonths
                        ? m.ToString("MMM", CultureInfo.InvariantCulture).ToUpperInvariant()
                        : m.ToString("MMM yy", CultureInfo.InvariantCulture).ToUpperInvariant();
                    RenderTableHeaderCell(t, label);
                }
                RenderTableHeaderCell(t, "APPS");
                RenderTableHeaderCell(t, "UNITS");
                RenderTableHeaderCell(t, "ISSUED");
                RenderTableHeaderCell(t, "SHARE");

                int[] colTotals = new int[monthBuckets.Count];
                int grandTotalApps = 0;
                int grandTotalUnits = 0;
                int grandIssued = 0;

                for (int sIdx = 0; sIdx < streams.Length; sIdx++)
                {
                    var streamApps = apps.Where(a => ClassifyAppStream(a) == sIdx).ToList();
                    RenderBodyCell(t, streams[sIdx].Name, alignLeft: true, bold: true);

                    for (int mIdx = 0; mIdx < monthBuckets.Count; mIdx++)
                    {
                        var mb = monthBuckets[mIdx];
                        int c = streamApps.Count(a => a.CreatedAt.Year == mb.Year && a.CreatedAt.Month == mb.Month);
                        colTotals[mIdx] += c;
                        RenderBodyCell(t, c.ToString("N0"), bold: c > 0);
                    }

                    int rowTotal = streamApps.Count;
                    int rowUnits = streamApps.Sum(a => a.Applicants != null && a.Applicants.Count > 1 ? a.Applicants.Count : 1);
                    int rowIssued = streamApps.Count(a => string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Completed", StringComparison.OrdinalIgnoreCase));
                    double share = apps.Count > 0 ? rowTotal * 100.0 / apps.Count : 0.0;

                    grandTotalApps += rowTotal;
                    grandTotalUnits += rowUnits;
                    grandIssued += rowIssued;

                    RenderBodyCell(t, rowTotal.ToString("N0"), bold: true);
                    RenderBodyCell(t, rowUnits.ToString("N0"));
                    RenderBodyCell(t, rowIssued.ToString("N0"), bold: true);
                    RenderBodyCell(t, $"{share:F1}%");
                }

                RenderTotalCell(t, "TOTAL REGIONAL APPLICATION VOLUME", alignLeft: true);
                for (int mIdx = 0; mIdx < monthBuckets.Count; mIdx++)
                {
                    RenderTotalCell(t, colTotals[mIdx].ToString("N0"));
                }
                RenderTotalCell(t, grandTotalApps.ToString("N0"));
                RenderTotalCell(t, grandTotalUnits.ToString("N0"));
                RenderTotalCell(t, grandIssued.ToString("N0"));
                RenderTotalCell(t, "100.0%");
            });

            // Table II: Volume of Applications vs. Collections & Bank Deposits Summary
            var depositMetrics = ComputeDepositMetrics(paidTx, 0m);
            col.Item().PaddingTop(6).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(2.1f);
                    cd.ConstantColumn(48); // Apps
                    cd.ConstantColumn(52); // In Process
                    cd.ConstantColumn(48); // Returned
                    cd.ConstantColumn(48); // ORs
                    cd.ConstantColumn(74); // Collected
                    cd.ConstantColumn(74); // Deposited
                    cd.ConstantColumn(68); // Undeposited
                    cd.ConstantColumn(52); // SLA %
                });

                RenderSectionTitleRow(t, 9, "II. APPLICATION VOLUME PROCESSING STATUS, REVENUE COLLECTIONS & BANK DEPOSITS BY STREAM");
                RenderTableHeaderCell(t, "REGULATORY SERVICE STREAM", alignLeft: true);
                RenderTableHeaderCell(t, "FILED");
                RenderTableHeaderCell(t, "IN-PROC");
                RenderTableHeaderCell(t, "RETURNED");
                RenderTableHeaderCell(t, "ORs");
                RenderTableHeaderCell(t, "COLLECTED (PHP)");
                RenderTableHeaderCell(t, "DEPOSITED (BTr)");
                RenderTableHeaderCell(t, "UNDEPOSITED");
                RenderTableHeaderCell(t, "SLA %");

                int totFiled = 0, totInProc = 0, totRet = 0, totOrs = 0;
                decimal totColl = 0m, totDep = 0m, totUndep = 0m;

                for (int sIdx = 0; sIdx < streams.Length; sIdx++)
                {
                    var streamApps = apps.Where(a => ClassifyAppStream(a) == sIdx).ToList();
                    var streamTx = paidTx.Where(tx => ClassifyTxStream(tx) == sIdx).ToList();

                    int filed = streamApps.Count;
                    int issued = streamApps.Count(a => string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Completed", StringComparison.OrdinalIgnoreCase));
                    int ret = streamApps.Count(a => string.Equals(a.Status, "Returned", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Rejected", StringComparison.OrdinalIgnoreCase));
                    int inProc = Math.Max(0, filed - issued - ret);
                    int ors = streamTx.Count;

                    decimal coll = streamTx.Sum(tx => tx.Amount);
                    decimal undep = streamTx
                        .Select(FindMatchingReceipt)
                        .Where(r => r != null && r.Status == ReceiptStatus.Issued && r.DepositId == null)
                        .Sum(r => r!.Amount);
                    decimal dep = Math.Max(0m, coll - undep);
                    int sla = filed > 0 ? (int)Math.Round(issued * 100.0 / filed) : 100;

                    totFiled += filed;
                    totInProc += inProc;
                    totRet += ret;
                    totOrs += ors;
                    totColl += coll;
                    totDep += dep;
                    totUndep += undep;

                    RenderBodyCell(t, streams[sIdx].Name, alignLeft: true);
                    RenderBodyCell(t, filed.ToString("N0"), bold: true);
                    RenderBodyCell(t, inProc.ToString("N0"));
                    RenderBodyCell(t, ret.ToString("N0"));
                    RenderBodyCell(t, ors.ToString("N0"));
                    RenderBodyCell(t, FormatCurrency(coll), alignRight: true, bold: coll > 0);
                    RenderBodyCell(t, FormatCurrency(dep), alignRight: true, bold: dep > 0);
                    RenderBodyCell(t, FormatCurrency(undep), alignRight: true);
                    RenderBodyCell(t, $"{sla}%", bold: true);
                }

                // Reconcile deposit total if explicit BankDeposits total exceeds per-OR stream total
                decimal effectiveTotalDeposited = Math.Max(totDep, depositMetrics.TotalDeposited);
                decimal effectiveTotalUndeposited = Math.Max(0m, totColl - effectiveTotalDeposited);
                int overallSla = totFiled > 0
                    ? (int)Math.Round(apps.Count(a => string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Completed", StringComparison.OrdinalIgnoreCase)) * 100.0 / totFiled)
                    : 100;

                RenderTotalCell(t, "GRAND TOTAL VOLUME & COLLECTIONS", alignLeft: true);
                RenderTotalCell(t, totFiled.ToString("N0"));
                RenderTotalCell(t, totInProc.ToString("N0"));
                RenderTotalCell(t, totRet.ToString("N0"));
                RenderTotalCell(t, totOrs.ToString("N0"));
                RenderTotalCell(t, $"PHP {FormatCurrency(totColl)}", alignRight: true);
                RenderTotalCell(t, $"PHP {FormatCurrency(effectiveTotalDeposited)}", alignRight: true);
                RenderTotalCell(t, $"PHP {FormatCurrency(effectiveTotalUndeposited)}", alignRight: true);
                RenderTotalCell(t, $"{overallSla}%");
            });

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", _model.GeneratedBy, "MIS / Statistics Officer"),
                ("NOTED BY:", "CHIEF, ENFORCEMENT & OPERATIONS DIV.", "Chief, EOD"),
                ("APPROVED BY:", $"REGIONAL DIRECTOR — {_model.TenantName.ToUpperInvariant()}", "Regional Director")));
        });
    }

    // =========================================================================
    // 7. NTC-EXAM-MST-01: Radio Operator Examination Masterlist
    // =========================================================================
    private void ComposeExamMasterlistReport(IContainer container)
    {
        var apps = _model.Applications;

        container.Column(col =>
        {
            col.Item().Border(0.8f).BorderColor(Colors.Black).Padding(5).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text($"EXAMINATION CENTER: {_model.TenantName.ToUpperInvariant()} — REGIONAL EXAMINATION HALL").Bold().FontSize(7.5f);
                    c.Item().Text($"EXAM CLASS / SCHEDULE FILTER: {(string.IsNullOrWhiteSpace(_model.SecondaryFilter) || _model.SecondaryFilter == "all" ? "ALL SCHEDULED RADIO OPERATOR EXAMINATIONS (COMMERCIAL & AMATEUR)" : _model.SecondaryFilter.ToUpperInvariant())}").FontSize(7f);
                });
                r.ConstantItem(165).Column(c =>
                {
                    c.Item().AlignRight().Text($"TOTAL EXAMINEES: {apps.Count}").Bold().FontSize(8f);
                    c.Item().AlignRight().Text($"PERIOD: {_model.Period}").FontSize(7f);
                });
            });

            col.Item().PaddingTop(5).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(32); // Seat #
                    cd.ConstantColumn(68); // Ref / App No.
                    cd.RelativeColumn(1.4f); // Examinee Full Name
                    cd.RelativeColumn(1.2f); // Exam Class / Element
                    cd.ConstantColumn(55); // OR No.
                    cd.ConstantColumn(48); // Fee Paid
                    cd.ConstantColumn(56); // Status
                    cd.ConstantColumn(80); // Examinee Signature
                });

                RenderSectionTitleRow(t, 8, "OFFICIAL RADIO OPERATOR EXAMINATION ROSTER & ATTENDANCE SHEET");
                RenderTableHeaderCell(t, "SEAT");
                RenderTableHeaderCell(t, "APP / REF NO.");
                RenderTableHeaderCell(t, "EXAMINEE FULL NAME", alignLeft: true);
                RenderTableHeaderCell(t, "EXAMINATION CLASS / ELEMENT", alignLeft: true);
                RenderTableHeaderCell(t, "OR NO.");
                RenderTableHeaderCell(t, "FEE PAID");
                RenderTableHeaderCell(t, "STATUS");
                RenderTableHeaderCell(t, "SIGNATURE");

                if (apps.Count == 0)
                {
                    t.Cell().ColumnSpan(8).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No examination candidates found for the selected date range and exam class filter.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    int idx = 1;
                    foreach (var app in apps.Take(40))
                    {
                        var matchedTx = FindMatchingTransactionForApp(app);
                        var matchedOrs = _receiptsByAppId.TryGetValue(app.Id, out var appOrList) ? appOrList : null;

                        string examineeName = app.Applicants?.FirstOrDefault()?.Name
                            ?? app.FilingUser?.Name
                            ?? app.PayorName
                            ?? "Examinee";
                        string examClass = !string.IsNullOrWhiteSpace(app.ServiceVariantName)
                            ? app.ServiceVariantName!
                            : (!string.IsNullOrWhiteSpace(app.Element) ? app.Element! : (app.ServiceName ?? "Radio Operator Examination"));
                        string orNo = matchedOrs != null && matchedOrs.Count > 0
                            ? string.Join(", ", matchedOrs.Select(r => r.OfficialReceiptNumber))
                            : (!string.IsNullOrWhiteSpace(app.OfficialReceiptNumber)
                                ? app.OfficialReceiptNumber!
                                : (matchedTx?.RefNo ?? "—"));
                        decimal fee = matchedOrs != null && matchedOrs.Count > 0
                            ? matchedOrs.Sum(r => r.Amount)
                            : (app.AmountPaid ?? matchedTx?.Amount ?? app.TotalAmountDue ?? 0m);

                        RenderBodyCell(t, $"{idx:D3}", bold: true);
                        RenderBodyCell(t, app.ApplicationNumber ?? app.ReferenceNumber ?? app.Id.ToString("N")[..8].ToUpperInvariant());
                        RenderBodyCell(t, Truncate(examineeName.ToUpperInvariant(), 30), alignLeft: true, bold: true);
                        RenderBodyCell(t, Truncate(examClass, 28), alignLeft: true);
                        RenderBodyCell(t, orNo);
                        RenderBodyCell(t, FormatCurrency(fee), alignRight: true);
                        RenderBodyCell(t, app.Status.ToUpperInvariant());
                        RenderBodyCell(t, string.Empty);
                        idx++;
                    }
                }
            });

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED / VERIFIED BY:", _model.GeneratedBy, "Examination Marshall / Licensing Evaluator"),
                ("PROCTORED & ATTESTED BY:", "REGIONAL EXAMINATION COMMITTEE", "Authorized Examination Proctor"),
                ("APPROVED BY:", $"REGIONAL DIRECTOR — {_model.TenantName.ToUpperInvariant()}", "Chairperson / Regional Director")));
        });
    }

    // =========================================================================
    // Helper Methods, Real Line-Item UACS Classification & Deposit Metrics
    // =========================================================================
    private List<DateTime> BuildVolumeMonthBuckets()
    {
        bool hasStart = DateTime.TryParse(_model.StartDate, out var sDate);
        bool hasEnd = DateTime.TryParse(_model.EndDate, out var eDate);

        if (hasStart && hasEnd && eDate >= sDate)
        {
            var startMonth = new DateTime(sDate.Year, sDate.Month, 1);
            var endMonth = new DateTime(eDate.Year, eDate.Month, 1);
            int monthSpan = (endMonth.Year - startMonth.Year) * 12 + (endMonth.Month - startMonth.Month) + 1;

            if (monthSpan >= 2 && monthSpan <= 12)
            {
                return Enumerable.Range(0, monthSpan)
                    .Select(offset => startMonth.AddMonths(offset))
                    .ToList();
            }
        }

        DateTime anchor = hasEnd ? eDate : DateTime.UtcNow;
        if (_model.Applications.Count > 0)
        {
            var maxAppDate = _model.Applications.Max(a => a.CreatedAt);
            if (anchor > DateTime.UtcNow.AddMonths(1) && maxAppDate <= DateTime.UtcNow.AddMonths(1))
            {
                anchor = maxAppDate;
            }
        }

        return Enumerable.Range(0, 6)
            .Select(offset => new DateTime(anchor.Year, anchor.Month, 1).AddMonths(-(5 - offset)))
            .ToList();
    }

    private OfficialReceipt? FindMatchingReceipt(TenantTransactionDto tx)
    {
        if (_receiptById.TryGetValue(tx.Id, out var byId)) return byId;
        if (!string.IsNullOrWhiteSpace(tx.RefNo) && _receiptByOrNo.TryGetValue(tx.RefNo.Trim(), out var byOr)) return byOr;
        return null;
    }

    private TenantTransactionDto? FindMatchingTransactionForApp(ApplicationSummaryDto app)
    {
        foreach (var tx in _model.PaidTransactions)
        {
            if (tx.Id == app.Id) return tx;
            if (app.OrderOfPaymentId.HasValue && tx.Id == app.OrderOfPaymentId.Value) return tx;
            if (!string.IsNullOrWhiteSpace(app.OfficialReceiptNumber) &&
                string.Equals(tx.RefNo?.Trim(), app.OfficialReceiptNumber.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return tx;
            }
            if (!string.IsNullOrWhiteSpace(app.OpNumber) &&
                string.Equals(tx.RefNo?.Trim(), app.OpNumber.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return tx;
            }
        }
        return null;
    }

    private record DepositMetrics(
        decimal TotalCollected,
        decimal CashCollected,
        decimal CheckCollected,
        decimal OnlineCollected,
        decimal TotalDeposited,
        decimal UndepositedBalance,
        int UndepositedOrCount,
        decimal DstDeposited);

    private DepositMetrics ComputeDepositMetrics(IReadOnlyList<TenantTransactionDto> paidTx, decimal totalDst)
    {
        decimal totalCollected = paidTx.Sum(t => t.Amount);

        decimal undepositedAmount = 0m;
        int undepositedOrCount = 0;
        decimal cashCollected = 0m;
        decimal checkCollected = 0m;
        decimal onlineCollected = 0m;
        decimal undepositedDst = 0m;

        foreach (var tx in paidTx)
        {
            var r = FindMatchingReceipt(tx);
            if (r != null)
            {
                if (r.PaymentMethod == PaymentMethod.Check) checkCollected += tx.Amount;
                else if (r.PaymentMethod == PaymentMethod.Online) onlineCollected += tx.Amount;
                else cashCollected += tx.Amount;

                if (r.Status == ReceiptStatus.Issued && r.DepositId == null)
                {
                    undepositedAmount += tx.Amount;
                    undepositedOrCount++;
                    var b = ClassifyTransactionUacs(tx, r);
                    undepositedDst += b.Dst;
                }
            }
            else
            {
                cashCollected += tx.Amount;
            }
        }

        decimal explicitDepositsSum = _model.BankDeposits.Sum(d => d.TotalAmount);
        decimal totalDeposited = Math.Max(explicitDepositsSum, Math.Max(0m, totalCollected - undepositedAmount));
        if (totalDeposited > totalCollected && totalCollected > 0m)
        {
            totalDeposited = totalCollected;
        }
        decimal finalUndeposited = Math.Max(0m, totalCollected - totalDeposited);
        decimal dstDeposited = Math.Max(0m, totalDst - undepositedDst);

        return new DepositMetrics(
            TotalCollected: totalCollected,
            CashCollected: cashCollected,
            CheckCollected: checkCollected,
            OnlineCollected: onlineCollected,
            TotalDeposited: totalDeposited,
            UndepositedBalance: finalUndeposited,
            UndepositedOrCount: undepositedOrCount,
            DstDeposited: dstDeposited);
    }

    private record UacsBreakdown(
        decimal PermitFees,
        decimal LicenseFees,
        decimal RegistrationFees,
        decimal ClearanceFees,
        decimal SupervisionFees,
        decimal SpectrumSuf,
        decimal ExamFees,
        decimal FinesPenalties,
        decimal Dst,
        decimal OtherIncome);

    private static UacsBreakdown ClassifyLineItemUacs(string? feeCode, string? description, decimal amount)
    {
        if (amount <= 0m) return new UacsBreakdown(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        string code = (feeCode ?? string.Empty).Trim().ToUpperInvariant();
        string desc = (description ?? string.Empty).Trim().ToLowerInvariant();

        if (code == "DST" || desc.Contains("documentary stamp") || desc.Contains("dst"))
            return new UacsBreakdown(0, 0, 0, 0, 0, 0, 0, 0, amount, 0);
        if (code.Contains("SUR") || code.Contains("PEN") || desc.Contains("surcharg") || desc.Contains("fine") || desc.Contains("penalt"))
            return new UacsBreakdown(0, 0, 0, 0, 0, 0, 0, amount, 0, 0);
        if (code == "SUF" || desc.Contains("spectrum") || desc.Contains("suf"))
            return new UacsBreakdown(0, 0, 0, 0, 0, amount, 0, 0, 0, 0);
        if (code == "SRF" || desc.Contains("supervis") || desc.Contains("srf") || desc.Contains("regulation"))
            return new UacsBreakdown(0, 0, 0, 0, amount, 0, 0, 0, 0, 0);
        if (code.Contains("EXM") || code.Contains("EXAM") || desc.Contains("exam") || desc.Contains("roce"))
            return new UacsBreakdown(0, 0, 0, 0, 0, 0, amount, 0, 0, 0);
        if (code.Contains("CLR") || code.Contains("CERT") || code == "DUP" || desc.Contains("clear") || desc.Contains("certif") || desc.Contains("duplicate"))
            return new UacsBreakdown(0, 0, 0, amount, 0, 0, 0, 0, 0, 0);
        if (code.Contains("REG") || desc.Contains("regist"))
            return new UacsBreakdown(0, 0, amount, 0, 0, 0, 0, 0, 0, 0);
        if (code.Contains("PER") || code == "CP" || desc.Contains("permit") || desc.Contains("purchase") || desc.Contains("possess") || desc.Contains("construct"))
            return new UacsBreakdown(amount, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        if (code.Contains("LIC") || code.Contains("RSL") || code.Contains("ROC") || desc.Contains("license") || desc.Contains("station") || desc.Contains("operator"))
            return new UacsBreakdown(0, amount, 0, 0, 0, 0, 0, 0, 0, 0);

        return new UacsBreakdown(0, 0, 0, 0, 0, 0, 0, 0, 0, amount);
    }

    private UacsBreakdown ClassifyTransactionUacs(TenantTransactionDto tx, OfficialReceipt? matchedOr = null)
    {
        matchedOr ??= FindMatchingReceipt(tx);
        if (matchedOr != null && matchedOr.LineItems != null && matchedOr.LineItems.Count > 0)
        {
            decimal permit = 0, license = 0, reg = 0, clear = 0, sup = 0, suf = 0, exam = 0, fines = 0, dst = 0, other = 0;
            foreach (var li in matchedOr.LineItems)
            {
                var b = ClassifyLineItemUacs(li.FeeCode, li.Description, li.Amount);
                permit += b.PermitFees;
                license += b.LicenseFees;
                reg += b.RegistrationFees;
                clear += b.ClearanceFees;
                sup += b.SupervisionFees;
                suf += b.SpectrumSuf;
                exam += b.ExamFees;
                fines += b.FinesPenalties;
                dst += b.Dst;
                other += b.OtherIncome;
            }
            return new UacsBreakdown(permit, license, reg, clear, sup, suf, exam, fines, dst, other);
        }

        decimal amt = tx.Amount;
        if (amt <= 0m)
        {
            return new UacsBreakdown(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        string s = (tx.ServiceType ?? string.Empty).ToLowerInvariant();
        bool isExam = s.Contains("exam") || s.Contains("roce") || s.Contains("1-01");
        decimal estDst = !isExam && amt >= 60m ? 30m : 0m;
        decimal net = Math.Max(0m, amt - estDst);

        if (isExam)
            return new UacsBreakdown(0, 0, 0, 0, 0, 0, net, 0, estDst, 0);
        if (s.Contains("fine") || s.Contains("penalt") || s.Contains("surcharg"))
            return new UacsBreakdown(0, 0, 0, 0, 0, 0, 0, net, estDst, 0);
        if (s.Contains("suf") || s.Contains("spectrum"))
            return new UacsBreakdown(0, 0, 0, 0, 0, net, 0, 0, estDst, 0);
        if (s.Contains("supervis") || s.Contains("srf") || s.Contains("authoriz"))
            return new UacsBreakdown(0, 0, 0, 0, net, 0, 0, 0, estDst, 0);
        if (s.Contains("clear") || s.Contains("certif") || s.Contains("duplicate") || s.Contains("authent"))
            return new UacsBreakdown(0, 0, 0, net, 0, 0, 0, 0, estDst, 0);
        if (s.Contains("regist") || s.Contains("1-19") || s.Contains("cor") || s.Contains("vas") || s.Contains("cpe") || s.Contains("dealer") || s.Contains("accredit"))
            return new UacsBreakdown(0, 0, net, 0, 0, 0, 0, 0, estDst, 0);
        if (s.Contains("purchase") || s.Contains("possess") || s.Contains("construct") || s.Contains("1-09") || s.Contains("1-11") || s.Contains("permit") || s.Contains("temp"))
            return new UacsBreakdown(net, 0, 0, 0, 0, 0, 0, 0, estDst, 0);
        if (s.Contains("rsl") || s.Contains("station") || s.Contains("roc") || s.Contains("operator") || s.Contains("amateur") || s.Contains("coastal") || s.Contains("ship") || s.Contains("aircraft") || s.Contains("license"))
        {
            decimal sufPortion = (s.Contains("station") || s.Contains("rsl") || s.Contains("coastal") || s.Contains("fixed") || s.Contains("mobile"))
                ? Math.Round(net * 0.25m, 2)
                : 0m;
            return new UacsBreakdown(0, net - sufPortion, 0, 0, 0, sufPortion, 0, 0, estDst, 0);
        }

        return new UacsBreakdown(0, net, 0, 0, 0, 0, 0, 0, estDst, 0);
    }

    private UacsBreakdown ComputeUacsTotals(IReadOnlyList<TenantTransactionDto> paidTx)
    {
        decimal permit = 0, license = 0, reg = 0, clear = 0, sup = 0, suf = 0, exam = 0, fines = 0, dst = 0, other = 0;
        foreach (var tx in paidTx)
        {
            var b = ClassifyTransactionUacs(tx);
            permit += b.PermitFees;
            license += b.LicenseFees;
            reg += b.RegistrationFees;
            clear += b.ClearanceFees;
            sup += b.SupervisionFees;
            suf += b.SpectrumSuf;
            exam += b.ExamFees;
            fines += b.FinesPenalties;
            dst += b.Dst;
            other += b.OtherIncome;
        }
        return new UacsBreakdown(permit, license, reg, clear, sup, suf, exam, fines, dst, other);
    }

    private UacsBreakdown ComputeDepositedUacsTotals(IReadOnlyList<TenantTransactionDto> paidTx)
    {
        decimal permit = 0, license = 0, reg = 0, clear = 0, sup = 0, suf = 0, exam = 0, fines = 0, dst = 0, other = 0;
        foreach (var tx in paidTx)
        {
            var r = FindMatchingReceipt(tx);
            if (r != null && r.Status == ReceiptStatus.Issued && r.DepositId == null)
            {
                continue; // Undeposited receipt on hand
            }
            var b = ClassifyTransactionUacs(tx, r);
            permit += b.PermitFees;
            license += b.LicenseFees;
            reg += b.RegistrationFees;
            clear += b.ClearanceFees;
            sup += b.SupervisionFees;
            suf += b.SpectrumSuf;
            exam += b.ExamFees;
            fines += b.FinesPenalties;
            dst += b.Dst;
            other += b.OtherIncome;
        }
        return new UacsBreakdown(permit, license, reg, clear, sup, suf, exam, fines, dst, other);
    }

    private static void RenderSectionTitleRow(TableDescriptor table, uint colSpan, string title)
    {
        table.Cell().ColumnSpan(colSpan).Background("#1E293B").Border(0.6f).BorderColor(Colors.Black)
            .PaddingHorizontal(5).PaddingVertical(3)
            .Text(title).FontSize(7.2f).Bold().FontColor(Colors.White);
    }

    private static void RenderTableHeaderCell(TableDescriptor table, string text, bool alignLeft = false)
    {
        var cell = table.Cell().Background("#E2E8F0").Border(0.5f).BorderColor(Colors.Black)
            .PaddingHorizontal(3).PaddingVertical(2.5f).AlignMiddle();
        if (alignLeft) cell.AlignLeft().Text(text).FontSize(6.5f).Bold();
        else cell.AlignCenter().Text(text).FontSize(6.5f).Bold();
    }

    private static void RenderBodyCell(TableDescriptor table, string text, bool alignLeft = false, bool alignRight = false, bool bold = false)
    {
        var cell = table.Cell().Border(0.4f).BorderColor("#94A3B8")
            .PaddingHorizontal(3).PaddingVertical(2f).AlignMiddle();

        IContainer aligned = alignLeft ? cell.AlignLeft() : alignRight ? cell.AlignRight() : cell.AlignCenter();
        var span = aligned.Text(text ?? string.Empty).FontSize(6.5f);
        if (bold) span.Bold();
    }

    private static void RenderTotalCell(TableDescriptor table, string text, uint colspan = 1, bool alignLeft = false, bool alignRight = false)
    {
        var cell = table.Cell().ColumnSpan(colspan).Background("#F1F5F9").Border(0.6f).BorderColor(Colors.Black)
            .PaddingHorizontal(3).PaddingVertical(2.5f).AlignMiddle();

        IContainer aligned = alignLeft ? cell.AlignLeft() : alignRight ? cell.AlignRight() : cell.AlignCenter();
        aligned.Text(text ?? string.Empty).FontSize(6.8f).Bold();
    }

    private static void ComposeSignatories(
        IContainer container,
        (string Label, string Name, string Role) left,
        (string Label, string Name, string Role) center,
        (string Label, string Name, string Role) right)
    {
        container.Border(0.6f).BorderColor("#94A3B8").Padding(6).Row(row =>
        {
            RenderSignatoryColumn(row.RelativeItem(), left.Label, left.Name, left.Role);
            row.ConstantItem(16);
            RenderSignatoryColumn(row.RelativeItem(), center.Label, center.Name, center.Role);
            row.ConstantItem(16);
            RenderSignatoryColumn(row.RelativeItem(), right.Label, right.Name, right.Role);
        });
    }

    private static void RenderSignatoryColumn(IContainer container, string label, string name, string role)
    {
        container.Column(c =>
        {
            c.Item().Text(label).FontSize(6.5f).Bold().FontColor("#475569");
            c.Item().PaddingTop(14).BorderBottom(0.7f).BorderColor(Colors.Black).PaddingBottom(1).AlignCenter()
                .Text(name.ToUpperInvariant()).FontSize(7.2f).Bold();
            c.Item().PaddingTop(1).AlignCenter().Text(role).FontSize(6.5f).FontColor("#334155");
        });
    }

    private static string FormatCurrency(decimal amount) => amount.ToString("N2", CultureInfo.InvariantCulture);

    private static string FormatZeroDash(decimal amount) => amount > 0m ? amount.ToString("N2", CultureInfo.InvariantCulture) : "—";

    private static string Truncate(string? value, int maxLen)
    {
        if (string.IsNullOrWhiteSpace(value)) return "—";
        var trimmed = value.Trim();
        return trimmed.Length <= maxLen ? trimmed : trimmed[..(maxLen - 1)] + "…";
    }

    private static void RenderLogo(IContainer container, string filename, string placeholderLabel)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var candidates = new[]
        {
            Path.Combine(baseDir, "Printing", "Assets", "Logos", filename),
            Path.Combine(Directory.GetCurrentDirectory(), "Printing", "Assets", "Logos", filename),
            Path.Combine(baseDir, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Assets", "Logos", filename),
            Path.Combine(Directory.GetCurrentDirectory(), "apps", "backend", "EDGE.Infrastructure", "Printing", "Assets", "Logos", filename)
        };

        string? found = candidates.FirstOrDefault(File.Exists);

        if (!string.IsNullOrEmpty(found))
        {
            container.Image(found).FitHeight();
        }
        else
        {
            container.Border(0.6f).BorderColor(Colors.Grey.Lighten1)
                .Background(Colors.Grey.Lighten4)
                .AlignCenter().AlignMiddle()
                .Padding(2)
                .Text(placeholderLabel)
                .FontSize(5.5f)
                .Bold()
                .FontColor(Colors.Grey.Darken1);
        }
    }
}

using System;
using System.Globalization;
using System.Linq;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

public partial class StatutoryReportDocument
{
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

            string evaluator = ResolveApplicationStaffDisplayName(app, issuedDoc);

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

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 12, $"{_model.Title.ToUpperInvariant()} — DETAILED REGISTER ({rows.Count} RECORDS)");
                    RenderTableHeaderCell(h, "#");
                    RenderTableHeaderCell(h, "EVALUATOR", alignLeft: true);
                    RenderTableHeaderCell(h, "SERVICE APPLIED", alignLeft: true);
                    RenderTableHeaderCell(h, "TYPE");
                    RenderTableHeaderCell(h, "CATEGORY");
                    RenderTableHeaderCell(h, "CLIENT / ENTITY NAME", alignLeft: true);
                    RenderTableHeaderCell(h, "APP DATE");
                    RenderTableHeaderCell(h, "ISSUED");
                    RenderTableHeaderCell(h, "OR NO.");
                    RenderTableHeaderCell(h, "AMOUNT");
                    RenderTableHeaderCell(h, "LICENSE / REF NO.");
                    RenderTableHeaderCell(h, "VALIDITY");
                });

                if (rows.Count == 0)
                {
                    t.Cell().ColumnSpan(12).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No applications matched the selected period and filter criteria.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var r in rows)
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

            var sumPrepared = ResolvePreparedByCurrentOfficer("Licensing Evaluator / Records Officer");
            var sumChiefEod = ResolveChiefEod("Chief, EOD");
            var sumDirector = ResolveRegionalDirector("Regional Director");

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", sumPrepared.Name, sumPrepared.Role),
                ("REVIEWED BY:", sumChiefEod.Name, sumChiefEod.Role),
                ("APPROVED BY:", sumDirector.Name, sumDirector.Role)));
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

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, totalMatrixCols, $"I. APPLICATION VOLUME MATRIX BY REGULATORY SERVICE STREAM ({_model.Period.ToUpperInvariant()})");
                    RenderTableHeaderCell(h, "REGULATORY SERVICE STREAM", alignLeft: true);
                    foreach (var m in monthBuckets)
                    {
                        string label = isCompactMonths
                            ? m.ToString("MMM", CultureInfo.InvariantCulture).ToUpperInvariant()
                            : m.ToString("MMM yy", CultureInfo.InvariantCulture).ToUpperInvariant();
                        RenderTableHeaderCell(h, label);
                    }
                    RenderTableHeaderCell(h, "APPS");
                    RenderTableHeaderCell(h, "UNITS");
                    RenderTableHeaderCell(h, "ISSUED");
                    RenderTableHeaderCell(h, "SHARE");
                });

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

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 9, "II. APPLICATION VOLUME PROCESSING STATUS, REVENUE COLLECTIONS & BANK DEPOSITS BY STREAM");
                    RenderTableHeaderCell(h, "REGULATORY SERVICE STREAM", alignLeft: true);
                    RenderTableHeaderCell(h, "FILED");
                    RenderTableHeaderCell(h, "IN-PROC");
                    RenderTableHeaderCell(h, "RETURNED");
                    RenderTableHeaderCell(h, "ORs");
                    RenderTableHeaderCell(h, "COLLECTED (PHP)");
                    RenderTableHeaderCell(h, "DEPOSITED (BTr)");
                    RenderTableHeaderCell(h, "UNDEPOSITED");
                    RenderTableHeaderCell(h, "SLA %");
                });

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

            var volPrepared = ResolveMisOfficer("MIS / Statistics Officer");
            var volChiefEod = ResolveChiefEod("Chief, EOD");
            var volDirector = ResolveRegionalDirector("Regional Director");

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", volPrepared.Name, volPrepared.Role),
                ("NOTED BY:", volChiefEod.Name, volChiefEod.Role),
                ("APPROVED BY:", volDirector.Name, volDirector.Role)));
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

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 8, "OFFICIAL RADIO OPERATOR EXAMINATION ROSTER & ATTENDANCE SHEET");
                    RenderTableHeaderCell(h, "SEAT");
                    RenderTableHeaderCell(h, "APP / REF NO.");
                    RenderTableHeaderCell(h, "EXAMINEE FULL NAME", alignLeft: true);
                    RenderTableHeaderCell(h, "EXAMINATION CLASS / ELEMENT", alignLeft: true);
                    RenderTableHeaderCell(h, "OR NO.");
                    RenderTableHeaderCell(h, "FEE PAID");
                    RenderTableHeaderCell(h, "STATUS");
                    RenderTableHeaderCell(h, "SIGNATURE");
                });

                if (apps.Count == 0)
                {
                    t.Cell().ColumnSpan(8).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No examination candidates found for the selected date range and exam class filter.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    int idx = 1;
                    foreach (var app in apps)
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

            var examPrepared = ResolvePreparedByCurrentOfficer("Examination Marshall / Licensing Evaluator");
            var examProctor = ResolveExamProctor("Authorized Examination Proctor");
            var examDirector = ResolveRegionalDirector("Chairperson / Regional Director");

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED / VERIFIED BY:", examPrepared.Name, examPrepared.Role),
                ("PROCTORED & ATTESTED BY:", examProctor.Name, examProctor.Role),
                ("APPROVED BY:", examDirector.Name, examDirector.Role)));
        });
    }
}

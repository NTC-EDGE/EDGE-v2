using System;
using System.Collections.Generic;
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
    // NTC SHEET FORMATS (Aligned with NTC V2 Development Google Sheets Templates)
    // Offered alongside existing Standard Statutory formats so evaluators have
    // both options without altering any existing report format.
    // =========================================================================

    private static void RenderSheetHeaderCell(
        TableCellDescriptor header,
        string text,
        uint colSpan = 1,
        uint rowSpan = 1,
        bool alignLeft = false)
    {
        var cell = header.Cell().ColumnSpan(colSpan).RowSpan(rowSpan)
            .Background("#E2E8F0").Border(0.6f).BorderColor(Colors.Black)
            .PaddingHorizontal(3).PaddingVertical(3).AlignMiddle();
        if (alignLeft)
            cell.AlignLeft().Text(text).FontSize(6.4f).Bold();
        else
            cell.AlignCenter().Text(text).FontSize(6.4f).Bold();
    }

    private static string ResolveSheetAccountCode(TenantTransactionDto tx)
    {
        string s = (tx.ServiceType ?? string.Empty).Trim().ToLowerInvariant();
        if (s.Contains("surcharg") || s.Contains("penalt") || s.Contains("fine")) return "4-02-01-140";
        if (s.Contains("inspection")) return "4-02-02-100";
        if (s.Contains("supervis") || s.Contains("srf") || s.Contains("regulation")) return "4-02-01-070";
        if (s.Contains("spectrum") || s.Contains("suf")) return "4-02-01-080";
        if (s.Contains("clear") || s.Contains("certif") || s.Contains("exam") || s.Contains("roce") || s.Contains("duplicate")) return "4-02-01-040";
        if (s.Contains("regist") || s.Contains("cor") || s.Contains("1-19")) return "4-02-01-020";
        if (s.Contains("processing") || s.Contains("filing") || s.Contains("application fee")) return "4-02-01-130";
        if (s.Contains("license") || s.Contains("rsl") || s.Contains("station") || s.Contains("operator") || s.Contains("amateur")) return "4-02-01-060";
        if (s.Contains("permit") || s.Contains("purchase") || s.Contains("possess") || s.Contains("construct") || s.Contains("dealer") || s.Contains("accredit")) return "4-02-01-010";
        if (s.Contains("non-operating")) return "4-06-01-010";
        if (s.Contains("misc")) return "4-06-09-990";
        return "4-02-01-990";
    }

    private static string ResolveApplicationFullAddress(ApplicationSummaryDto app, string fallbackTenant)
    {
        var company = app.FilingUser?.Company ?? app.Applicants?.FirstOrDefault()?.Company;
        if (company != null)
        {
            var parts = new[]
            {
                company.Address,
                company.BarangayName,
                company.CityMunicipalityName,
                company.ProvinceName
            }
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Select(p => p!.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

            if (parts.Count > 0)
            {
                return string.Join(", ", parts);
            }
        }

        if (!string.IsNullOrWhiteSpace(app.Office))
        {
            return app.Office.Trim();
        }

        return !string.IsNullOrWhiteSpace(fallbackTenant) ? fallbackTenant : "—";
    }

    private static string ResolveFilingTypeCode(ApplicationSummaryDto app)
    {
        string raw = app.ServiceVariantType
            ?? app.Services?.FirstOrDefault()?.ApplicationType
            ?? app.Applicants?.FirstOrDefault()?.ApplicationType
            ?? app.ServiceVariantName
            ?? (app.RenewedFromApplicationId.HasValue ? "RENEWAL" : "NEW");

        string upper = raw.Trim().ToUpperInvariant();
        if (upper.Contains("RENEW")) return "REN";
        if (upper.Contains("DUP")) return "DUP";
        if (upper.Contains("MOD")) return "MOD";
        if (upper.Contains("NEW")) return "NEW";
        return upper.Length > 10 ? upper[..10] : upper;
    }

    private static string ClassifyFiveCategoryVolumeStream(ApplicationSummaryDto app)
    {
        var applicantServices = app.Applicants != null && app.Applicants.Count > 0
            ? string.Join(" ", app.Applicants.Select(ap => $"{ap.ServiceName ?? ""} {ap.ServiceVariantName ?? ""}"))
            : string.Empty;
        string text = $"{app.ServiceCategory ?? ""} {app.ServiceName ?? ""} {app.ServiceVariantName ?? ""} {applicantServices}".ToLowerInvariant();

        if (text.Contains("exam") || text.Contains("roce") || text.Contains("admission") || text.Contains("1-01"))
            return "Exams";
        if (text.Contains("accredit") || text.Contains("vas") || text.Contains("value added") || text.Contains("supplier") || text.Contains("service center"))
            return "Accreditations";
        if (text.Contains("cert") || text.Contains("roc") || text.Contains("goc") || text.Contains("rroc") || text.Contains("registration") || text.Contains("dealer"))
            return "Certificates";
        if (text.Contains("licens") || text.Contains("rsl") || text.Contains("ship") || text.Contains("aircraft") || text.Contains("land mobile") || text.Contains("fixed"))
            return "Licenses";
        return "Permits";
    }

    private void ComposePreparedByFooter(IContainer container)
    {
        var preparedBy = ResolvePreparedByCurrentOfficer("Authorized Officer");
        container.PaddingTop(10).Column(c =>
        {
            c.Item().Text($"Prepared by: {preparedBy.Name}").FontSize(7.2f).Bold();
            c.Item().PaddingTop(2).Text($"Date Generated: {_model.GeneratedAt:MMMM dd, yyyy}").FontSize(7f).FontColor("#334155");
        });
    }

    // =========================================================================
    // 1. NTC-BTR-INC-01 (NTC Sheet Format — 12 NG Accounts • This Month & YTD)
    //    Matches Google Sheet: 1yDft3fA7HAslDg-o5V6pCJGDV_PNEjnAXBTSoxu6QWo
    // =========================================================================
    private void ComposeBtrIncomeNtcSheet(IContainer container)
    {
        var monthTx = _model.PaidTransactions;
        var ytdTx = _model.YtdPaidTransactions.Count > 0 ? _model.YtdPaidTransactions : _model.PaidTransactions;

        var ngAccounts = new (string Title, string Code)[]
        {
            ("Permit Fees", "4-02-01-010"),
            ("Registration Fees", "4-02-01-020"),
            ("Clearance and Certification Fees", "4-02-01-040"),
            ("Licensing Fees", "4-02-01-060"),
            ("Supervision & Regulation Enforcement Fees", "4-02-01-070"),
            ("Spectrum Usage Fees", "4-02-01-080"),
            ("Inspection Fees", "4-02-02-100"),
            ("Processing Fees", "4-02-01-130"),
            ("Fines and Penalties - Service Income", "4-02-01-140"),
            ("Other Service Income", "4-02-01-990"),
            ("Other Non-Operating Income", "4-06-01-010"),
            ("Miscellaneous Income", "4-06-09-990")
        };

        (decimal IncomeCollected, decimal DstCollected, decimal RemittedDst, decimal DepositedBtr, decimal Undeposited) ComputeAccountMetrics(
            IReadOnlyList<TenantTransactionDto> txList,
            string accountCode)
        {
            decimal incomeCollected = 0m;
            decimal dstCollected = 0m;
            decimal remittedDst = 0m;
            decimal depositedBtr = 0m;
            decimal undeposited = 0m;

            foreach (var tx in txList)
            {
                if (!string.Equals(ResolveSheetAccountCode(tx), accountCode, StringComparison.OrdinalIgnoreCase))
                    continue;

                var receipt = FindMatchingReceipt(tx);
                var breakdown = ClassifyTransactionUacs(tx, receipt);
                decimal dst = breakdown.Dst;
                decimal netIncome = Math.Max(0m, tx.Amount - dst);
                bool isUndeposited = receipt != null && receipt.Status == ReceiptStatus.Issued && receipt.DepositId == null;

                incomeCollected += netIncome;
                dstCollected += dst;
                if (isUndeposited)
                {
                    undeposited += tx.Amount;
                }
                else
                {
                    remittedDst += dst;
                    depositedBtr += netIncome;
                }
            }

            return (incomeCollected, dstCollected, remittedDst, depositedBtr, undeposited);
        }

        container.Column(col =>
        {
            col.Item().PaddingBottom(4).Column(hdr =>
            {
                hdr.Item().AlignCenter().Text("MONTHLY REPORT OF INCOME COLLECTED AND INCOME DEPOSITED WITH THE BUREAU OF THE TREASURY")
                    .Bold().FontSize(8.2f);
                hdr.Item().AlignCenter().Text($"FOR THE PERIOD: {_model.Period.ToUpperInvariant()}")
                    .FontSize(7.2f).FontColor("#334155");
                hdr.Item().PaddingTop(3).Text("Office of the President").FontSize(7f);
                hdr.Item().Text("NATIONAL TELECOMMUNICATIONS COMMISSION").Bold().FontSize(7.4f);
                hdr.Item().Text(!string.IsNullOrWhiteSpace(_model.TenantName) ? _model.TenantName : "Regional Office").FontSize(7f);
            });

            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(2.2f); // ACCOUNT TITLE / DESCRIPTION OF INCOME
                    cd.ConstantColumn(68);   // ACCOUNT CODE
                    cd.ConstantColumn(72);   // THIS MONTH: INCOME COLLECTED
                    cd.ConstantColumn(62);   // THIS MONTH: DST COLLECTED
                    cd.ConstantColumn(68);   // THIS MONTH: REMITTED DST TO BIR
                    cd.ConstantColumn(76);   // THIS MONTH: INCOME DEPOSITED WITH BTR
                    cd.ConstantColumn(72);   // YTD: INCOME COLLECTED
                    cd.ConstantColumn(76);   // YTD: INCOME DEPOSITED WITH BTR
                    cd.ConstantColumn(72);   // UNDEPOSITED COLLECTION
                });

                t.Header(h =>
                {
                    RenderSheetHeaderCell(h, "ACCOUNT TITLE / DESCRIPTION OF INCOME", colSpan: 1, rowSpan: 2, alignLeft: true);
                    RenderSheetHeaderCell(h, "ACCOUNT\nCODE", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "THIS MONTH", colSpan: 4, rowSpan: 1);
                    RenderSheetHeaderCell(h, "YEAR TO DATE", colSpan: 2, rowSpan: 1);
                    RenderSheetHeaderCell(h, "UNDEPOSITED\nCOLLECTION", colSpan: 1, rowSpan: 2);

                    RenderSheetHeaderCell(h, "INCOME\nCOLLECTED");
                    RenderSheetHeaderCell(h, "DST\nCOLLECTED");
                    RenderSheetHeaderCell(h, "REMITTED DST\nTO BIR");
                    RenderSheetHeaderCell(h, "INCOME DEPOSITED\nWITH BTR");
                    RenderSheetHeaderCell(h, "INCOME\nCOLLECTED");
                    RenderSheetHeaderCell(h, "INCOME DEPOSITED\nWITH BTR");
                });

                // Group sub-header row matching Google Sheet
                t.Cell().ColumnSpan(9).Background("#F8FAFC").Border(0.5f).BorderColor(Colors.Black)
                    .PaddingHorizontal(4).PaddingVertical(2.5f)
                    .Text("NATIONAL GOVERNMENT ACCOUNT (NG)").Bold().FontSize(6.8f);

                decimal totMIncome = 0m, totMDst = 0m, totMRemDst = 0m, totMDep = 0m;
                decimal totYtdIncome = 0m, totYtdDep = 0m, totUndep = 0m;

                foreach (var acc in ngAccounts)
                {
                    var m = ComputeAccountMetrics(monthTx, acc.Code);
                    var y = ComputeAccountMetrics(ytdTx, acc.Code);

                    totMIncome += m.IncomeCollected;
                    totMDst += m.DstCollected;
                    totMRemDst += m.RemittedDst;
                    totMDep += m.DepositedBtr;
                    totYtdIncome += y.IncomeCollected;
                    totYtdDep += y.DepositedBtr;
                    totUndep += m.Undeposited;

                    RenderBodyCell(t, acc.Title, alignLeft: true);
                    RenderBodyCell(t, acc.Code, bold: true);
                    RenderBodyCell(t, FormatZeroDash(m.IncomeCollected), alignRight: true, bold: m.IncomeCollected > 0m);
                    RenderBodyCell(t, FormatZeroDash(m.DstCollected), alignRight: true);
                    RenderBodyCell(t, FormatZeroDash(m.RemittedDst), alignRight: true);
                    RenderBodyCell(t, FormatZeroDash(m.DepositedBtr), alignRight: true, bold: m.DepositedBtr > 0m);
                    RenderBodyCell(t, FormatZeroDash(y.IncomeCollected), alignRight: true, bold: y.IncomeCollected > 0m);
                    RenderBodyCell(t, FormatZeroDash(y.DepositedBtr), alignRight: true, bold: y.DepositedBtr > 0m);
                    RenderBodyCell(t, FormatZeroDash(m.Undeposited), alignRight: true, bold: m.Undeposited > 0m);
                }

                RenderTotalCell(t, "TOTAL", colspan: 2, alignLeft: true);
                RenderTotalCell(t, FormatCurrency(totMIncome), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totMDst), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totMRemDst), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totMDep), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totYtdIncome), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totYtdDep), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totUndep), alignRight: true);
            });

            var accountant = ResolveRegionalAccountant("Regional Accountant");
            var director = ResolveRegionalDirector("Regional Director / OIC");
            string dateStr = _model.GeneratedAt.ToString("MMMM dd, yyyy", CultureInfo.InvariantCulture);

            col.Item().PaddingTop(14).Row(r =>
            {
                r.RelativeItem().PaddingRight(40).Column(c =>
                {
                    c.Item().Text("Certified Correct:").FontSize(7.2f).Bold();
                    c.Item().PaddingTop(20).BorderBottom(0.7f).BorderColor(Colors.Black).PaddingBottom(1)
                        .Text(accountant.Name.ToUpperInvariant()).FontSize(7.5f).Bold();
                    c.Item().PaddingTop(1).Text(accountant.Role).FontSize(6.8f).FontColor("#334155");
                    c.Item().PaddingTop(2).Text($"Date: {dateStr}").FontSize(6.6f).FontColor("#475569");
                });

                r.RelativeItem().PaddingLeft(40).Column(c =>
                {
                    c.Item().Text("Noted By:").FontSize(7.2f).Bold();
                    c.Item().PaddingTop(20).BorderBottom(0.7f).BorderColor(Colors.Black).PaddingBottom(1)
                        .Text(director.Name.ToUpperInvariant()).FontSize(7.5f).Bold();
                    c.Item().PaddingTop(1).Text(director.Role).FontSize(6.8f).FontColor("#334155");
                    c.Item().PaddingTop(2).Text($"Date: {dateStr}").FontSize(6.6f).FontColor("#475569");
                });
            });
        });
    }

    // =========================================================================
    // 2. NTC-APP-SUM-EVAL / SVC / ENT (NTC Sheet Format)
    //    Matches Google Sheets:
    //    - 1Ef7kLdPoVqaf90QP4ntlBfpf4TSRiYm5nWBTH301vSs (Evaluator, 12 cols + SUMMARY)
    //    - 1eOVaTXdWlvGqp6xVpq0RjfkUxJti0VuDNtyKqOA9xAc (Service, 12 cols + SUMMARY)
    //    - 1r-Izh-Bz8l896NMWVZLjNgktlfckdhicutcAOWPvk0I (Entity, 11 cols + SUMMARY, Completed only)
    // =========================================================================
    private void ComposeApplicationSummaryNtcSheet(IContainer container)
    {
        bool isEntityReport = string.Equals(_model.Code, "NTC-APP-SUM-ENT", StringComparison.OrdinalIgnoreCase);
        bool isServiceReport = string.Equals(_model.Code, "NTC-APP-SUM-SVC", StringComparison.OrdinalIgnoreCase);

        var apps = _model.Applications;

        var rows = apps.Select(app =>
        {
            var matchedTx = FindMatchingTransactionForApp(app);
            var matchedOrs = _receiptsByAppId.TryGetValue(app.Id, out var appOrList) ? appOrList : null;
            var issuedDoc = app.IssuedDocumentDetails?.FirstOrDefault();

            string appType = !string.IsNullOrWhiteSpace(app.ServiceName)
                ? app.ServiceName!.Trim()
                : (app.Applicants?.FirstOrDefault(a => !string.IsNullOrWhiteSpace(a.ServiceName))?.ServiceName?.Trim()
                    ?? app.Services?.FirstOrDefault()?.ServiceName?.Trim()
                    ?? "Regulatory Permit");

            string companyOrName = !string.IsNullOrWhiteSpace(app.PayorName)
                ? app.PayorName!.Trim()
                : (app.FilingUser?.Company?.Name
                    ?? app.FilingUser?.Name
                    ?? app.Applicants?.FirstOrDefault()?.Company?.Name
                    ?? app.Applicants?.FirstOrDefault()?.Name
                    ?? "Walk-In Applicant");

            string statusCode = ResolveFilingTypeCode(app);
            string fullAddress = ResolveApplicationFullAddress(app, _model.TenantName);

            string permitNo = !string.IsNullOrWhiteSpace(issuedDoc?.LicenseNumber)
                ? issuedDoc!.LicenseNumber!
                : (!string.IsNullOrWhiteSpace(issuedDoc?.CallSign)
                    ? issuedDoc!.CallSign!
                    : (!string.IsNullOrWhiteSpace(issuedDoc?.FormNumber) ? issuedDoc!.FormNumber! : "—"));

            string refNo = app.ReferenceNumber ?? app.ApplicationNumber ?? app.Id.ToString("N")[..8].ToUpperInvariant();
            string dateFiling = app.CreatedAt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            string expDate = issuedDoc?.ExpiryDate.HasValue == true
                ? issuedDoc.ExpiryDate.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
                : "—";

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

            DateTime? paidDate = app.PaidAt
                ?? matchedOrs?.FirstOrDefault()?.IssuedAt
                ?? matchedTx?.Date;
            string datePaid = paidDate.HasValue ? paidDate.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) : "—";

            string byStaff = ResolveApplicationStaffDisplayName(app, issuedDoc);

            return (
                AppType: appType,
                CompanyName: companyOrName,
                StatusCode: statusCode,
                FullAddress: fullAddress,
                PermitNo: permitNo,
                RefNo: refNo,
                DateFiling: dateFiling,
                ExpDate: expDate,
                OrNo: orNo,
                Amount: amount,
                DatePaid: datePaid,
                By: byStaff
            );
        }).ToList();

        string filterSubtitle = !string.IsNullOrWhiteSpace(_model.SecondaryFilter) && !string.Equals(_model.SecondaryFilter, "all", StringComparison.OrdinalIgnoreCase)
            ? _model.SecondaryFilter!
            : (isEntityReport ? "All Entities (Completed Applications Only)" : isServiceReport ? "All Regulatory Services" : "All Evaluators");

        if (isServiceReport && !string.IsNullOrWhiteSpace(_model.ServiceTypeFilter) && !string.Equals(_model.ServiceTypeFilter, "all", StringComparison.OrdinalIgnoreCase))
        {
            filterSubtitle = $"{filterSubtitle}  •  Type: {_model.ServiceTypeFilter}";
        }
        else if (isEntityReport && !string.IsNullOrWhiteSpace(_model.SecondaryFilter) && !string.Equals(_model.SecondaryFilter, "all", StringComparison.OrdinalIgnoreCase))
        {
            filterSubtitle = $"{filterSubtitle} (Completed Applications Only)";
        }

        container.Column(col =>
        {
            col.Item().PaddingBottom(5).Column(hdr =>
            {
                hdr.Item().AlignCenter().Text(_model.Title.ToUpperInvariant()).Bold().FontSize(8.8f);
                hdr.Item().AlignCenter().Text(filterSubtitle).Bold().FontSize(7.6f).FontColor("#1E3A8A");
                hdr.Item().AlignCenter().Text($"{_model.TenantName}  |  {_model.Period}").FontSize(7f).FontColor("#334155");
            });

            if (isEntityReport)
            {
                // Entity Sheet Format (11 exact columns — REFERENCE NUMBER first, no Company Name column)
                col.Item().Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.ConstantColumn(68);   // REFERENCE NUMBER
                        cd.RelativeColumn(1.4f); // Application Type
                        cd.ConstantColumn(44);   // STATUS(NEW/REN/DUP)
                        cd.RelativeColumn(1.4f); // ADDRESS
                        cd.ConstantColumn(62);   // PERMIT NO.
                        cd.ConstantColumn(48);   // DATE OF FILING
                        cd.ConstantColumn(48);   // EXPIRATION DATE
                        cd.ConstantColumn(54);   // OR NUMBER
                        cd.ConstantColumn(52);   // AMOUNT
                        cd.ConstantColumn(48);   // DATE PAID
                        cd.RelativeColumn(0.9f); // BY
                    });

                    t.Header(h =>
                    {
                        RenderTableHeaderCell(h, "REFERENCE NUMBER");
                        RenderTableHeaderCell(h, "APPLICATION TYPE", alignLeft: true);
                        RenderTableHeaderCell(h, "STATUS\n(NEW/REN/DUP)");
                        RenderTableHeaderCell(h, "ADDRESS", alignLeft: true);
                        RenderTableHeaderCell(h, "PERMIT NO.");
                        RenderTableHeaderCell(h, "DATE OF\nFILING");
                        RenderTableHeaderCell(h, "EXPIRATION\nDATE");
                        RenderTableHeaderCell(h, "OR NUMBER");
                        RenderTableHeaderCell(h, "AMOUNT");
                        RenderTableHeaderCell(h, "DATE PAID");
                        RenderTableHeaderCell(h, "BY", alignLeft: true);
                    });

                    if (rows.Count == 0)
                    {
                        t.Cell().ColumnSpan(11).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                            .Text("No completed applications matched the selected entity and date range.").Italic().FontColor(Colors.Grey.Darken1);
                    }
                    else
                    {
                        foreach (var r in rows)
                        {
                            RenderBodyCell(t, Truncate(r.RefNo, 18), bold: true);
                            RenderBodyCell(t, Truncate(r.AppType, 32), alignLeft: true);
                            RenderBodyCell(t, r.StatusCode, bold: true);
                            RenderBodyCell(t, Truncate(r.FullAddress, 32), alignLeft: true);
                            RenderBodyCell(t, Truncate(r.PermitNo, 16));
                            RenderBodyCell(t, r.DateFiling);
                            RenderBodyCell(t, r.ExpDate);
                            RenderBodyCell(t, Truncate(r.OrNo, 14));
                            RenderBodyCell(t, FormatCurrency(r.Amount), alignRight: true, bold: r.Amount > 0m);
                            RenderBodyCell(t, r.DatePaid);
                            RenderBodyCell(t, Truncate(r.By, 20), alignLeft: true);
                        }
                    }

                    RenderTotalCell(t, $"TOTAL ({rows.Count} COMPLETED APPLICATIONS)", colspan: 8, alignLeft: true);
                    RenderTotalCell(t, FormatCurrency(rows.Sum(x => x.Amount)), alignRight: true);
                    RenderTotalCell(t, string.Empty, colspan: 2);
                });
            }
            else
            {
                // Evaluator & Service Sheet Format (12 exact columns)
                col.Item().Table(t =>
                {
                    t.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn(1.3f); // Application Type
                        cd.RelativeColumn(1.25f);// COMPANY NAME / NAME
                        cd.ConstantColumn(42);   // STATUS(NEW/REN/DUP)
                        cd.RelativeColumn(1.2f); // FULL ADDRESS
                        cd.ConstantColumn(58);   // PERMIT NO.
                        cd.ConstantColumn(62);   // REFERENCE NUMBER
                        cd.ConstantColumn(46);   // DATE OF FILING
                        cd.ConstantColumn(46);   // EXPIRATION DATE
                        cd.ConstantColumn(52);   // OR NUMBER
                        cd.ConstantColumn(50);   // AMOUNT
                        cd.ConstantColumn(46);   // DATE PAID
                        cd.RelativeColumn(0.85f);// BY
                    });

                    t.Header(h =>
                    {
                        RenderTableHeaderCell(h, "APPLICATION TYPE", alignLeft: true);
                        RenderTableHeaderCell(h, "COMPANY NAME / NAME", alignLeft: true);
                        RenderTableHeaderCell(h, "STATUS\n(NEW/REN/DUP)");
                        RenderTableHeaderCell(h, "FULL ADDRESS", alignLeft: true);
                        RenderTableHeaderCell(h, "PERMIT NO.");
                        RenderTableHeaderCell(h, "REFERENCE\nNUMBER");
                        RenderTableHeaderCell(h, "DATE OF\nFILING");
                        RenderTableHeaderCell(h, "EXPIRATION\nDATE");
                        RenderTableHeaderCell(h, "OR NUMBER");
                        RenderTableHeaderCell(h, "AMOUNT");
                        RenderTableHeaderCell(h, "DATE PAID");
                        RenderTableHeaderCell(h, "BY", alignLeft: true);
                    });

                    if (rows.Count == 0)
                    {
                        t.Cell().ColumnSpan(12).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                            .Text("No applications matched the selected filter criteria and date range.").Italic().FontColor(Colors.Grey.Darken1);
                    }
                    else
                    {
                        foreach (var r in rows)
                        {
                            RenderBodyCell(t, Truncate(r.AppType, 28), alignLeft: true);
                            RenderBodyCell(t, Truncate(r.CompanyName, 26), alignLeft: true, bold: true);
                            RenderBodyCell(t, r.StatusCode, bold: true);
                            RenderBodyCell(t, Truncate(r.FullAddress, 28), alignLeft: true);
                            RenderBodyCell(t, Truncate(r.PermitNo, 15));
                            RenderBodyCell(t, Truncate(r.RefNo, 16));
                            RenderBodyCell(t, r.DateFiling);
                            RenderBodyCell(t, r.ExpDate);
                            RenderBodyCell(t, Truncate(r.OrNo, 14));
                            RenderBodyCell(t, FormatCurrency(r.Amount), alignRight: true, bold: r.Amount > 0m);
                            RenderBodyCell(t, r.DatePaid);
                            RenderBodyCell(t, Truncate(r.By, 18), alignLeft: true);
                        }
                    }

                    RenderTotalCell(t, $"TOTAL ({rows.Count} APPLICATIONS)", colspan: 9, alignLeft: true);
                    RenderTotalCell(t, FormatCurrency(rows.Sum(x => x.Amount)), alignRight: true);
                    RenderTotalCell(t, string.Empty, colspan: 2);
                });
            }

            // Bottom SUMMARY Table (Exact TYPE | NUMBER(S) + TOTAL from Google Sheets)
            var summaryGroups = rows
                .GroupBy(r => $"{r.AppType} ({r.StatusCode})", StringComparer.OrdinalIgnoreCase)
                .Select(g => (TypeLabel: g.Key, Count: g.Count()))
                .OrderBy(g => g.TypeLabel, StringComparer.OrdinalIgnoreCase)
                .ToList();

            col.Item().PaddingTop(8).Width(360).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(3f);
                    cd.ConstantColumn(80);
                });

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 2, "SUMMARY");
                    RenderTableHeaderCell(h, "TYPE", alignLeft: true);
                    RenderTableHeaderCell(h, "NUMBER(S)");
                });

                if (summaryGroups.Count == 0)
                {
                    RenderBodyCell(t, "No records", alignLeft: true);
                    RenderBodyCell(t, "0");
                }
                else
                {
                    foreach (var sg in summaryGroups)
                    {
                        RenderBodyCell(t, sg.TypeLabel, alignLeft: true);
                        RenderBodyCell(t, sg.Count.ToString("N0"), bold: true);
                    }
                }

                RenderTotalCell(t, "TOTAL", alignLeft: true);
                RenderTotalCell(t, rows.Count.ToString("N0"));
            });

            col.Item().Element(ComposePreparedByFooter);
        });
    }

    // =========================================================================
    // 3. NTC-APP-VOL-01 (NTC Sheet Format — 5-Category Monthly Matrix)
    //    Matches Google Sheet: 1YLua1huda4ma9l4K2ukgK_aKqfcYwjK5rVa3djEKBaQ
    // =========================================================================
    private void ComposeApplicationVolumeNtcSheet(IContainer container)
    {
        var apps = _model.Applications;
        var monthBuckets = BuildVolumeMonthBuckets();
        var categories = new[] { "Accreditations", "Certificates", "Exams", "Licenses", "Permits" };
        bool isCompactMonths = monthBuckets.Count > 8;

        container.Column(col =>
        {
            col.Item().PaddingBottom(6).Column(hdr =>
            {
                hdr.Item().Text("EDGE APPLICATION VOLUME REPORT").Bold().FontSize(9.5f);
                hdr.Item().PaddingTop(2).Text($"{_model.TenantName}  |  {_model.Period}").FontSize(7.6f).FontColor("#334155");
            });

            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(1.8f); // Service Name
                    foreach (var _ in monthBuckets) cd.RelativeColumn(1f);
                    cd.ConstantColumn(60);   // TOTAL
                });

                t.Header(h =>
                {
                    RenderTableHeaderCell(h, "Service Name", alignLeft: true);
                    foreach (var mb in monthBuckets)
                    {
                        string monthLabel = isCompactMonths
                            ? mb.ToString("MMM yyyy", CultureInfo.InvariantCulture)
                            : mb.ToString("MMMM yyyy", CultureInfo.InvariantCulture);
                        RenderTableHeaderCell(h, monthLabel);
                    }
                    RenderTableHeaderCell(h, "TOTAL");
                });

                int[] colTotals = new int[monthBuckets.Count];
                int grandTotal = 0;

                foreach (var cat in categories)
                {
                    var catApps = apps.Where(a => string.Equals(ClassifyFiveCategoryVolumeStream(a), cat, StringComparison.OrdinalIgnoreCase)).ToList();
                    RenderBodyCell(t, cat, alignLeft: true, bold: true);

                    int rowSum = 0;
                    for (int i = 0; i < monthBuckets.Count; i++)
                    {
                        var mb = monthBuckets[i];
                        int count = catApps.Count(a => a.CreatedAt.Year == mb.Year && a.CreatedAt.Month == mb.Month);
                        colTotals[i] += count;
                        rowSum += count;
                        RenderBodyCell(t, count.ToString("N0"), bold: count > 0);
                    }

                    grandTotal += rowSum;
                    RenderBodyCell(t, rowSum.ToString("N0"), bold: true);
                }

                RenderTotalCell(t, "TOTAL", alignLeft: true);
                for (int i = 0; i < monthBuckets.Count; i++)
                {
                    RenderTotalCell(t, colTotals[i].ToString("N0"));
                }
                RenderTotalCell(t, grandTotal.ToString("N0"));
            });

            col.Item().Element(ComposePreparedByFooter);
        });
    }

    // =========================================================================
    // 4. NTC-BIR-DST-01 (Exact 3_DST.xlsx Monthly DST Collection & Remittance)
    // =========================================================================
    private void ComposeBirDstDailySeriesNtcSheet(IContainer container)
    {
        var groupedByDate = _model.PaidTransactions
            .GroupBy(tx => tx.Date.Date)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var refs = g.Select(x => x.RefNo?.Trim() ?? string.Empty)
                    .Where(r => r.Length > 0)
                    .OrderBy(r => r, StringComparer.OrdinalIgnoreCase)
                    .ToList();
                string fromRef = refs.Count > 0 ? refs.First() : "N/A";
                string toRef = refs.Count > 0 ? refs.Last() : "N/A";
                int certCount = g.Count();
                decimal dstTotal = g.Sum(tx =>
                {
                    var matchedOr = FindMatchingReceipt(tx);
                    var b = ClassifyTransactionUacs(tx, matchedOr);
                    return b.Dst > 0m ? b.Dst : (tx.Amount >= 30m ? 30m : 0m);
                });
                bool allDeposited = g.All(tx =>
                {
                    var matchedOr = FindMatchingReceipt(tx);
                    return matchedOr == null || matchedOr.Status == ReceiptStatus.Deposited || matchedOr.Deposit != null;
                });

                return (
                    Date: g.Key,
                    FromRef: fromRef,
                    ToRef: toRef,
                    CertCount: certCount,
                    DstAmount: dstTotal,
                    AllDeposited: allDeposited
                );
            })
            .ToList();

        int grandCerts = groupedByDate.Sum(x => x.CertCount);
        decimal grandDst = groupedByDate.Sum(x => x.DstAmount);
        decimal amountRemitted = groupedByDate.Where(x => x.AllDeposited).Sum(x => x.DstAmount);

        var remitDates = _model.BankDeposits.Count > 0
            ? _model.BankDeposits.Select(d => d.DepositDate.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture)).Distinct().ToList()
            : groupedByDate.Where(x => x.AllDeposited).Select(x => x.Date.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture)).Distinct().ToList();
        string dateRemittedLabel = remitDates.Count > 0 ? string.Join(", ", remitDates) : "—";

        var bankNames = _model.BankDeposits
            .Select(d => d.BankAccount?.BankName)
            .Where(b => !string.IsNullOrWhiteSpace(b))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        string aabWhereRemitted = bankNames.Count > 0
            ? string.Join(" / ", bankNames!)
            : "LandBank of the Philippines (AGDB)";

        container.Column(col =>
        {
            col.Item().PaddingBottom(5).Column(hdr =>
            {
                hdr.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS COMMISSION").Bold().FontSize(8.4f);
                hdr.Item().AlignCenter().Text($"For the Period: {_model.Period}").FontSize(7.2f).FontColor("#334155");
                hdr.Item().PaddingTop(2).AlignCenter().Text("MONTHLY REPORT OF DOCUMENTARY STAMP TAX COLLECTION AND REMITTANCE")
                    .Bold().FontSize(8.2f);
            });

            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(70);   // DATE ISSUED
                    cd.RelativeColumn(1.2f); // GOR FROM
                    cd.RelativeColumn(1.2f); // GOR TO
                    cd.ConstantColumn(90);   // NO. OF CERTIFICATIONS ISSUED
                    cd.ConstantColumn(96);   // AMOUNT OF DST COLLECTED
                });

                t.Header(h =>
                {
                    RenderSheetHeaderCell(h, "DATE ISSUED", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "INCLUSIVE SERIAL NUMBER OF GOR", colSpan: 2, rowSpan: 1);
                    RenderSheetHeaderCell(h, "NO. OF CERTIFICATIONS\nISSUED", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "AMOUNT OF DST\nCOLLECTED", colSpan: 1, rowSpan: 2);

                    RenderSheetHeaderCell(h, "FROM");
                    RenderSheetHeaderCell(h, "TO");
                });

                if (groupedByDate.Count == 0)
                {
                    t.Cell().ColumnSpan(5).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No Documentary Stamp Tax collections recorded for the selected period.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var row in groupedByDate)
                    {
                        RenderBodyCell(t, row.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
                        RenderBodyCell(t, row.FromRef, bold: true);
                        RenderBodyCell(t, row.ToRef, bold: true);
                        RenderBodyCell(t, row.CertCount.ToString("N0"));
                        RenderBodyCell(t, FormatCurrency(row.DstAmount), alignRight: true, bold: true);
                    }
                }

                RenderTotalCell(t, "TOTAL", colspan: 3, alignLeft: true);
                RenderTotalCell(t, grandCerts.ToString("N0"));
                RenderTotalCell(t, $"PHP {FormatCurrency(grandDst)}", alignRight: true);

                RenderBodyCell(t, "AMOUNT REMITTED", alignLeft: true, bold: true);
                t.Cell().ColumnSpan(3).Border(0.4f).BorderColor("#94A3B8").PaddingHorizontal(3).PaddingVertical(2f);
                RenderBodyCell(t, $"PHP {FormatCurrency(amountRemitted)}", alignRight: true, bold: true);

                RenderBodyCell(t, "DATE REMITTED", alignLeft: true, bold: true);
                t.Cell().ColumnSpan(4).Border(0.4f).BorderColor("#94A3B8").PaddingHorizontal(3).PaddingVertical(2f)
                    .AlignRight().Text(dateRemittedLabel).FontSize(6.5f);

                RenderBodyCell(t, "AAB WHERE REMITTED", alignLeft: true, bold: true);
                t.Cell().ColumnSpan(4).Border(0.4f).BorderColor("#94A3B8").PaddingHorizontal(3).PaddingVertical(2f)
                    .AlignRight().Text(aabWhereRemitted).FontSize(6.5f).Bold();
            });

            var dstCashier = ResolveCollectingOfficer("Collecting Officer");
            var dstAccountant = ResolveRegionalAccountant("Accountant II");

            col.Item().PaddingTop(14).Row(r =>
            {
                r.RelativeItem().PaddingRight(40).Column(c =>
                {
                    c.Item().Text("Prepared by:").FontSize(7.2f).Bold();
                    c.Item().PaddingTop(18).BorderBottom(0.7f).BorderColor(Colors.Black).PaddingBottom(1)
                        .Text(dstCashier.Name.ToUpperInvariant()).FontSize(7.4f).Bold();
                    c.Item().PaddingTop(1).Text(dstCashier.Role).FontSize(6.8f).FontColor("#334155");
                });
                r.RelativeItem().PaddingLeft(40).Column(c =>
                {
                    c.Item().Text("Noted by:").FontSize(7.2f).Bold();
                    c.Item().PaddingTop(18).BorderBottom(0.7f).BorderColor(Colors.Black).PaddingBottom(1)
                        .Text(dstAccountant.Name.ToUpperInvariant()).FontSize(7.4f).Bold();
                    c.Item().PaddingTop(1).Text(dstAccountant.Role).FontSize(6.8f).FontColor("#334155");
                });
            });
        });
    }

    // =========================================================================
    // 5. NTC-EXAM-MST-01 (Exact 9_ExamMasterlist.xlsx Exam-Class Masterlist)
    // =========================================================================
    private void ComposeExamMasterlistRoomSheet(IContainer container)
    {
        var apps = _model.Applications;

        var groupedByExamType = apps
            .GroupBy(a =>
            {
                string label = !string.IsNullOrWhiteSpace(a.ServiceVariantName)
                    ? a.ServiceVariantName!.Trim()
                    : (!string.IsNullOrWhiteSpace(a.Element)
                        ? a.Element!.Trim()
                        : (!string.IsNullOrWhiteSpace(a.ServiceName) ? a.ServiceName!.Trim() : "Radio Operator Examination"));
                return label;
            }, StringComparer.OrdinalIgnoreCase)
            .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase)
            .ToList();

        container.Column(col =>
        {
            col.Item().PaddingBottom(5).Column(hdr =>
            {
                hdr.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS COMMISSION").Bold().FontSize(8.4f);
                if (!string.IsNullOrWhiteSpace(_model.RegionalOfficeAddress))
                {
                    hdr.Item().AlignCenter().Text($"{_model.TenantName} — {_model.RegionalOfficeAddress}").FontSize(6.8f).FontColor("#334155");
                }
                hdr.Item().PaddingTop(2).AlignCenter().Text("MASTERLIST FOR COMMERCIAL AND NON-COMMERCIAL RADIO OPERATOR EXAMINATION")
                    .Bold().FontSize(8.2f);
                hdr.Item().AlignCenter().Text($"{_model.TenantName}  •  Schedule: {_model.Period}")
                    .FontSize(7f).FontColor("#334155");
            });

            if (groupedByExamType.Count == 0)
            {
                col.Item().Border(0.5f).BorderColor("#CBD5E1").Padding(10).AlignCenter()
                    .Text("No examination candidates found for the selected schedule and filter.").Italic().FontColor(Colors.Grey.Darken1);
            }
            else
            {
                int globalNo = 1;
                int roomNumber = 1;
                foreach (var group in groupedByExamType)
                {
                    var candidates = group.ToList();
                    col.Item().PaddingTop(roomNumber == 1 ? 0 : 8).Table(t =>
                    {
                        t.ColumnsDefinition(cd =>
                        {
                            cd.ConstantColumn(30);   // No. (global)
                            cd.RelativeColumn(2.0f); // Name
                            cd.ConstantColumn(48);   // Sex
                            cd.ConstantColumn(125);  // Signature
                            cd.ConstantColumn(34);   // No. (class index)
                        });

                        t.Header(h =>
                        {
                            h.Cell().ColumnSpan(3).Background("#E2EFDA").Border(0.6f).BorderColor(Colors.Black)
                                .PaddingHorizontal(4).PaddingVertical(3)
                                .Text(group.Key).Bold().FontSize(7.2f);
                            h.Cell().ColumnSpan(2).Background("#E2EFDA").Border(0.6f).BorderColor(Colors.Black)
                                .PaddingHorizontal(4).PaddingVertical(3).AlignRight()
                                .Text($"ROOM # {roomNumber}").Bold().FontSize(7.2f);

                            RenderTableHeaderCell(h, "No.");
                            RenderTableHeaderCell(h, "Name", alignLeft: true);
                            RenderTableHeaderCell(h, "Sex");
                            RenderTableHeaderCell(h, "Signature");
                            RenderTableHeaderCell(h, "No.");
                        });

                        int classIdx = 1;
                        foreach (var app in candidates)
                        {
                            string examineeName = app.Applicants?.FirstOrDefault()?.Name
                                ?? app.FilingUser?.Name
                                ?? app.PayorName
                                ?? "Examinee";

                            RenderBodyCell(t, globalNo.ToString());
                            RenderBodyCell(t, Truncate(examineeName.ToUpperInvariant(), 42), alignLeft: true, bold: true);
                            RenderBodyCell(t, "—");
                            RenderBodyCell(t, string.Empty);
                            RenderBodyCell(t, classIdx.ToString());
                            globalNo++;
                            classIdx++;
                        }
                    });
                    roomNumber++;
                }
            }

            // Bottom SUMMARY table matching 9_ExamMasterlist.xlsx (TYPE OF EXAMINATION | NUMBER OF EXAMINEE(S) | TOTAL)
            col.Item().PaddingTop(10).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(3f);
                    cd.ConstantColumn(120);
                });

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 2, "SUMMARY");
                    RenderTableHeaderCell(h, "TYPE OF EXAMINATION", alignLeft: true);
                    RenderTableHeaderCell(h, "NUMBER OF EXAMINEE(S)");
                });

                if (groupedByExamType.Count == 0)
                {
                    RenderBodyCell(t, "No examinees", alignLeft: true);
                    RenderBodyCell(t, "0");
                }
                else
                {
                    foreach (var group in groupedByExamType)
                    {
                        RenderBodyCell(t, group.Key, alignLeft: true);
                        RenderBodyCell(t, group.Count().ToString("N0"), bold: true);
                    }
                }

                RenderTotalCell(t, "TOTAL", alignLeft: true);
                RenderTotalCell(t, apps.Count.ToString("N0"));
            });

            col.Item().Element(ComposePreparedByFooter);
        });
    }

    // =========================================================================
    // 6. NTC-MIS-OPS (Exact 0_MIS.pdf — Reporting_Format_Licensing_Final.pdf)
    //    Clean 3-section NEW / REN-MOD licensing count tables + III. Existing
    // =========================================================================
    private void ComposeMisLicensingNtcSheet(IContainer container)
    {
        var apps = _model.Applications;
        const string BannerBg = "#FCE4D6";
        const string GroupBg = "#E2EFDA";

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

        (int NewCount, int RenCount) CountPair(Func<string, bool> matcher)
        {
            int n = 0, r = 0;
            foreach (var a in apps)
            {
                if (!matcher(Corpus(a))) continue;
                int units = a.Applicants != null && a.Applicants.Count > 1 ? a.Applicants.Count : 1;
                if (IsNewApp(a)) n += units; else r += units;
            }
            return (n, r);
        }

        var rslGroups = new (string GroupName, (string Label, Func<string, bool> Match)[] Rows)[]
        {
            ("Amateur Service", new (string, Func<string, bool>)[]
            {
                ("Amateur Repeater (ATR)", c => c.Contains("amateur") && (c.Contains("repeater") || c.Contains("atr"))),
                ("AT Repeater Club", c => c.Contains("amateur") && c.Contains("club")),
                ("AT Radio Lic. Temp. Permit", c => c.Contains("amateur") && (c.Contains("temp") || c.Contains("special") || c.Contains("vanity")))
            }),
            ("Fixed/Land Mobile Service/Private", new (string, Func<string, bool>)[]
            {
                ("Private Portable (P-CV)", c => (c.Contains("private") || c.Contains("p-cv")) && c.Contains("portable") && !c.Contains("gov")),
                ("Private Land Mobile (ML-CV)", c => (c.Contains("private") || c.Contains("ml-cv")) && c.Contains("mobile") && !c.Contains("gov")),
                ("Private Land Base (FB)", c => (c.Contains("private") || c.Contains("fb")) && c.Contains("base") && !c.Contains("gov") && !c.Contains("bts")),
                ("Private Fixed (FX-CV) / (FX-FB-CV)", c => (c.Contains("private") || c.Contains("fx-cv") || c.Contains("fx-fb")) && c.Contains("fixed") && !c.Contains("gov")),
                ("Private Repeater (RPT-CV) / Trunk Repeater", c => (c.Contains("repeater") || c.Contains("rpt-cv") || c.Contains("trunk")) && !c.Contains("amateur") && !c.Contains("gov") && !c.Contains("cp")),
                ("PRS (Land Base / ML / Portable) & Civic Action", c => c.Contains("prs") || c.Contains("civic") || c.Contains("citizens")),
                ("VSAT / Private Earth Station / Telemetry", c => (c.Contains("vsat") || c.Contains("earth station") || c.Contains("telemetry")) && !c.Contains("tc-cp")),
                ("WDN (Base / Portable / Mobile)", c => c.Contains("wdn") || c.Contains("wireless data"))
            }),
            ("Maritime Service", new (string, Func<string, bool>)[]
            {
                ("Int'l (MS) Ship Stn. License", c => c.Contains("ship") && !c.Contains("domestic") && !c.Contains("inmarsat")),
                ("Int'l Cert. SESC / SSAS / LRIT / SESF / SEFB", c => c.Contains("inmarsat") || c.Contains("sesc") || c.Contains("ssas") || c.Contains("lrit") || c.Contains("sesf") || c.Contains("sefb")),
                ("Coastal / FC", c => c.Contains("coastal")),
                ("Fishing Boat / Ship MS (Domestic)", c => c.Contains("fishing") || (c.Contains("ship") && c.Contains("domestic")))
            }),
            ("Aeronautical Service", new (string, Func<string, bool>)[]
            {
                ("Aircraft / MA", c => c.Contains("aircraft") && !c.Contains("rroc") && !c.Contains("operator")),
                ("Aeronautical FA", c => c.Contains("aeronautical") && !c.Contains("rroc"))
            }),
            ("Fixed/Land Mobile - Government", new (string, Func<string, bool>)[]
            {
                ("Gov't (P-CO / ML-CO / FX-CO / FB-CO / RPT-CO / Gov't PRS)", c => c.Contains("gov") && (c.Contains("station") || c.Contains("rsl") || c.Contains("co") || c.Contains("prs")))
            }),
            ("Public Correspondence (NFD)", new (string, Func<string, bool>)[]
            {
                ("RPT-CP / Fixed Microwave (FX-CP) / Cellsites (FB/CP)", c => c.Contains("rpt-cp") || c.Contains("fx-cp") || c.Contains("bts") || c.Contains("cellsite") || c.Contains("microwave")),
                ("TC/CP (TELCO) / VSAT (TC-CP) / Broadband WDN / Public Earth Stn.", c => c.Contains("telco") || c.Contains("tc-cp") || c.Contains("public correspondence"))
            }),
            ("Broadcast", new (string, Func<string, bool>)[]
            {
                ("TVRO Reg. (One time - New) / TVRO License", c => c.Contains("tvro")),
                ("CATV License", c => c.Contains("catv")),
                ("STL License (Studio to Transmitter Link)", c => c.Contains("stl") || c.Contains("broadcast"))
            })
        };

        var otherPermits = new (string Label, Func<string, bool> Match)[]
        {
            ("Permit to Transport", c => c.Contains("transport")),
            ("Permit to Purchase", c => c.Contains("purchase") && !c.Contains("possess")),
            ("Permit to Possess", c => c.Contains("possess")),
            ("Permit to Sell/Transfer", c => c.Contains("sell") || c.Contains("transfer")),
            ("Construction Permit", c => c.Contains("construction") || c.Contains("1-11")),
            ("Dealer / MFTR (Manufacturer Transceiver Permit)", c => (c.Contains("dealer") || c.Contains("mftr") || c.Contains("manufacturer")) && !c.Contains("mobile phone") && !c.Contains("wdn") && !c.Contains("cpe")),
            ("MPDP (Mobile Phone Dealers Permit)", c => c.Contains("mpdp") || (c.Contains("mobile phone") && c.Contains("dealer"))),
            ("MPRR (Mobile Phone Retailer/Reseller Permit)", c => c.Contains("mprr") || c.Contains("retailer") || c.Contains("reseller")),
            ("MPSCP (Mobile Phone Service Center Permit)", c => c.Contains("mpscp") || (c.Contains("mobile phone") && c.Contains("service center"))),
            ("Service Center (RCE / WDN)", c => c.Contains("service center") && !c.Contains("mobile phone")),
            ("SRD / WDN / TVRO / RFID / Radio Registration", c => c.Contains("srd") || c.Contains("rfid") || c.Contains("registration") || c.Contains("1-19")),
            ("Commercial Radio Dealer / Commercial WDN Dealer / CPE Supplier", c => c.Contains("cpe") || c.Contains("supplier") || (c.Contains("commercial") && c.Contains("dealer"))),
            ("Permit to Import / Certificate of Exemption / Release Clearance", c => c.Contains("import") || c.Contains("exemption") || c.Contains("release clearance")),
            ("Demo Permit / TP / Storage", c => c.Contains("demo") || c.Contains("storage")),
            ("RSL Duplicate / Permit to Duplicate / Permit for Modification", c => c.Contains("duplicate") || c.Contains("modification")),
            ("VAS (Value Added Service)", c => c.Contains("vas") || c.Contains("value added"))
        };

        var commOps = new (string Label, Func<string, bool> Match)[]
        {
            ("1st RTG", c => c.Contains("1rtg") || c.Contains("1st rtg")),
            ("1st PHN", c => c.Contains("1phn") || c.Contains("1st phn")),
            ("2nd RTG", c => c.Contains("2rtg") || c.Contains("2nd rtg")),
            ("2nd PHN", c => c.Contains("2phn") || c.Contains("2nd phn")),
            ("3rd RTG", c => c.Contains("3rtg") || c.Contains("3rd rtg")),
            ("3rd PHN", c => c.Contains("3phn") || c.Contains("3rd phn"))
        };

        var specOps = new (string Label, Func<string, bool> Match)[]
        {
            ("Amateur Certificate (Operator only) / Class A / B / C / D", c => c.Contains("amateur") && !c.Contains("station") && !c.Contains("repeater") && !c.Contains("exam")),
            ("RLMOP", c => c.Contains("rlm") || c.Contains("rlmop")),
            ("RROC-Aircraft (RMAP)", c => (c.Contains("rroc") || c.Contains("rmap")) && c.Contains("aircraft")),
            ("RROC - SHIP", c => c.Contains("rroc") && c.Contains("ship")),
            ("RSTP / SLOP / RTTY", c => c.Contains("rstp") || c.Contains("slop") || c.Contains("rtty")),
            ("SROP-FB / SROP-GOV (GROC)", c => c.Contains("srop") || c.Contains("groc"))
        };

        container.Column(col =>
        {
            col.Item().AlignCenter().PaddingBottom(4).Text($"MONTHLY MANAGEMENT INFORMATION SERVICE (MIS) LICENSING REPORT — {_model.Period.ToUpperInvariant()}")
                .Bold().FontSize(8.2f);

            // I. RADIO STATION LICENSE
            col.Item().Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(3f);
                    cd.ConstantColumn(80);
                    cd.ConstantColumn(80);
                });

                t.Header(h =>
                {
                    h.Cell().ColumnSpan(3).Background(BannerBg).Border(0.6f).BorderColor(Colors.Black)
                        .PaddingVertical(2.5f).AlignCenter().Text("I. RADIO STATION LICENSE").Bold().FontSize(7.4f);
                    RenderSheetHeaderCell(h, "SERVICES", alignLeft: true);
                    RenderSheetHeaderCell(h, "NEW");
                    RenderSheetHeaderCell(h, "REN/MOD");
                });

                int totNew = 0, totRen = 0;
                foreach (var grp in rslGroups)
                {
                    t.Cell().ColumnSpan(3).Background(GroupBg).Border(0.5f).BorderColor(Colors.Black)
                        .PaddingHorizontal(4).PaddingVertical(2).Text(grp.GroupName).Bold().FontSize(6.6f);

                    foreach (var r in grp.Rows)
                    {
                        var (n, rn) = CountPair(r.Match);
                        totNew += n; totRen += rn;
                        RenderBodyCell(t, r.Label, alignLeft: true);
                        RenderBodyCell(t, n.ToString("N0"), bold: n > 0);
                        RenderBodyCell(t, rn.ToString("N0"), bold: rn > 0);
                    }
                }

                RenderTotalCell(t, "TOTAL", alignLeft: true);
                RenderTotalCell(t, totNew.ToString("N0"));
                RenderTotalCell(t, totRen.ToString("N0"));
            });

            // II. OTHER CERTIFICATES / PERMITS
            col.Item().PaddingTop(8).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(3f);
                    cd.ConstantColumn(80);
                    cd.ConstantColumn(80);
                });

                t.Header(h =>
                {
                    h.Cell().ColumnSpan(3).Background(BannerBg).Border(0.6f).BorderColor(Colors.Black)
                        .PaddingVertical(2.5f).AlignCenter().Text("II - OTHER CERTIFICATES / PERMITS").Bold().FontSize(7.4f);
                    RenderSheetHeaderCell(h, "SERVICES", alignLeft: true);
                    RenderSheetHeaderCell(h, "NEW");
                    RenderSheetHeaderCell(h, "REN");
                });

                int totNew = 0, totRen = 0;
                foreach (var r in otherPermits)
                {
                    var (n, rn) = CountPair(r.Match);
                    totNew += n; totRen += rn;
                    RenderBodyCell(t, r.Label, alignLeft: true);
                    RenderBodyCell(t, n.ToString("N0"), bold: n > 0);
                    RenderBodyCell(t, rn.ToString("N0"), bold: rn > 0);
                }

                RenderTotalCell(t, "TOTAL", alignLeft: true);
                RenderTotalCell(t, totNew.ToString("N0"));
                RenderTotalCell(t, totRen.ToString("N0"));
            });

            // II-B. OPERATOR'S CERTIFICATES / PERMITS & III. NUMBER OF EXISTING
            col.Item().PaddingTop(8).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(3f);
                    cd.ConstantColumn(80);
                    cd.ConstantColumn(80);
                });

                t.Header(h =>
                {
                    h.Cell().ColumnSpan(3).Background(BannerBg).Border(0.6f).BorderColor(Colors.Black)
                        .PaddingVertical(2.5f).AlignCenter().Text("II - OPERATOR'S CERTIFICATES / PERMITS").Bold().FontSize(7.4f);
                    RenderSheetHeaderCell(h, "SERVICES", alignLeft: true);
                    RenderSheetHeaderCell(h, "NEW");
                    RenderSheetHeaderCell(h, "REN");
                });

                t.Cell().ColumnSpan(3).Background(GroupBg).Border(0.5f).BorderColor(Colors.Black)
                    .PaddingHorizontal(4).PaddingVertical(2).Text("COMMERCIAL OPERATOR").Bold().FontSize(6.6f);
                int cNew = 0, cRen = 0;
                foreach (var r in commOps)
                {
                    var (n, rn) = CountPair(r.Match);
                    cNew += n; cRen += rn;
                    RenderBodyCell(t, r.Label, alignLeft: true);
                    RenderBodyCell(t, n.ToString("N0"), bold: n > 0);
                    RenderBodyCell(t, rn.ToString("N0"), bold: rn > 0);
                }
                RenderTotalCell(t, "TOTAL — COMMERCIAL OPERATOR", alignLeft: true);
                RenderTotalCell(t, cNew.ToString("N0"));
                RenderTotalCell(t, cRen.ToString("N0"));

                t.Cell().ColumnSpan(3).Background(GroupBg).Border(0.5f).BorderColor(Colors.Black)
                    .PaddingHorizontal(4).PaddingVertical(2).Text("SPECIAL OPERATORS").Bold().FontSize(6.6f);
                int sNew = 0, sRen = 0;
                foreach (var r in specOps)
                {
                    var (n, rn) = CountPair(r.Match);
                    sNew += n; sRen += rn;
                    RenderBodyCell(t, r.Label, alignLeft: true);
                    RenderBodyCell(t, n.ToString("N0"), bold: n > 0);
                    RenderBodyCell(t, rn.ToString("N0"), bold: rn > 0);
                }
                RenderTotalCell(t, "TOTAL — SPECIAL OPERATORS", alignLeft: true);
                RenderTotalCell(t, sNew.ToString("N0"));
                RenderTotalCell(t, sRen.ToString("N0"));

                RenderTotalCell(t, "GRAND TOTAL", alignLeft: true);
                RenderTotalCell(t, (cNew + sNew).ToString("N0"));
                RenderTotalCell(t, (cRen + sRen).ToString("N0"));
            });

            int dealers = apps.Count(a => Corpus(a).Contains("dealer") && !Corpus(a).Contains("mobile phone"));
            int mfrs = apps.Count(a => Corpus(a).Contains("manufacturer") || Corpus(a).Contains("mftr"));
            int suppliers = apps.Count(a => Corpus(a).Contains("supplier"));
            int wdnSrd = apps.Count(a => Corpus(a).Contains("wdn") || Corpus(a).Contains("srd") || Corpus(a).Contains("short range"));
            int mobileEq = apps.Count(a => Corpus(a).Contains("mobile phone") || Corpus(a).Contains("cpe"));

            col.Item().PaddingTop(8).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(3f);
                    cd.ConstantColumn(160);
                });

                t.Header(h =>
                {
                    h.Cell().ColumnSpan(2).Background(BannerBg).Border(0.6f).BorderColor(Colors.Black)
                        .PaddingVertical(2.5f).AlignCenter().Text("III. NUMBER OF EXISTING").Bold().FontSize(7.4f);
                });

                RenderBodyCell(t, "No. of Radio Dealer", alignLeft: true);
                RenderBodyCell(t, dealers.ToString("N0"), bold: dealers > 0);
                RenderBodyCell(t, "No. of Radio Manufacturer / Supplier", alignLeft: true);
                RenderBodyCell(t, mfrs.ToString("N0"), bold: mfrs > 0);
                RenderBodyCell(t, "No. of Radio Supplier", alignLeft: true);
                RenderBodyCell(t, suppliers.ToString("N0"), bold: suppliers > 0);
                RenderBodyCell(t, "No. of Registered Wireless Data Network / Short Range", alignLeft: true);
                RenderBodyCell(t, wdnSrd.ToString("N0"), bold: wdnSrd > 0);
                RenderBodyCell(t, "No. of Registered Mobile Phone Equipment", alignLeft: true);
                RenderBodyCell(t, mobileEq.ToString("N0"), bold: mobileEq > 0);
                RenderTotalCell(t, "TOTAL", alignLeft: true);
                RenderTotalCell(t, (dealers + mfrs + suppliers + wdnSrd + mobileEq).ToString("N0"));
            });

            var misPrepared = ResolveMisOfficer("MIS / Planning Officer");
            var chiefEod = ResolveChiefEod("Chief, EOD");
            var director = ResolveRegionalDirector("Regional Director");

            col.Item().PaddingTop(10).Element(c => ComposeSignatories(
                c,
                ("Prepared by:", misPrepared.Name, misPrepared.Role),
                ("Noted by:", chiefEod.Name, chiefEod.Role),
                ("Approved by:", director.Name, director.Role)));
        });
    }

    // =========================================================================
    // 7. NTC-COA-APP26-M (Exact 1_RCD.xlsx — Appendix 26 Taxes/Fees + DST Breakdown)
    // =========================================================================
    private void ComposeRcdAppendix26NtcSheet(IContainer container)
    {
        var paidTx = _model.PaidTransactions;
        var rcCode = !string.IsNullOrWhiteSpace(_model.ResponsibilityCenterCode) ? _model.ResponsibilityCenterCode.Trim() : "—";
        var mfoPap = !string.IsNullOrWhiteSpace(_model.MfoPapCode) ? _model.MfoPapCode.Trim() : "—";
        var effectiveFundCluster = !string.IsNullOrWhiteSpace(_model.FundCluster) ? _model.FundCluster.Trim() : "01101101";

        var rows = paidTx.Select(tx =>
        {
            var matchedOr = FindMatchingReceipt(tx);
            var b = ClassifyTransactionUacs(tx, matchedOr);
            decimal taxes = b.Dst;
            decimal fees = Math.Max(0m, tx.Amount - taxes);
            return (Tx: tx, Taxes: taxes, Fees: fees);
        }).ToList();

        decimal totalOr = rows.Sum(r => r.Tx.Amount);
        decimal totalTaxes = rows.Sum(r => r.Taxes);
        decimal totalFees = rows.Sum(r => r.Fees);
        var depositMetrics = ComputeDepositMetrics(paidTx, totalTaxes);

        var orderedOrs = paidTx
            .Where(tx => !string.IsNullOrWhiteSpace(tx.RefNo))
            .OrderBy(tx => tx.RefNo, StringComparer.OrdinalIgnoreCase)
            .Select(tx => tx.RefNo.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        string orRange = orderedOrs.Count > 0
            ? (orderedOrs.Count == 1 ? orderedOrs[0] : $"{orderedOrs.First()}-{orderedOrs.Last()}")
            : "N/A";

        var dstByDate = rows
            .Where(r => r.Taxes > 0m)
            .GroupBy(r => r.Tx.Date.Date)
            .OrderBy(g => g.Key)
            .Select(g => (Date: g.Key, Amount: g.Sum(x => x.Taxes)))
            .ToList();

        container.Column(col =>
        {
            col.Item().AlignRight().Text("Appendix 26").Italic().Bold().FontSize(7.5f);
            col.Item().AlignCenter().Text("REPORT OF COLLECTIONS AND DEPOSITS").Bold().FontSize(9f);

            col.Item().PaddingTop(4).Border(0.6f).BorderColor(Colors.Black).Padding(4).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text($"Entity Name :  NTC — {_model.TenantName}").Bold().FontSize(7.2f);
                    c.Item().Text($"Fund Cluster :  {effectiveFundCluster}").FontSize(7f);
                });
                r.ConstantItem(200).Column(c =>
                {
                    c.Item().AlignRight().Text($"Report No. :  {_model.GeneratedAt:yyyy-MM}").FontSize(7f);
                    c.Item().AlignRight().Text("Sheet No. :  001").FontSize(7f);
                    c.Item().AlignRight().Text($"Date :  {_model.GeneratedAt:yyyy-MM-dd}").FontSize(7f);
                });
            });

            col.Item().PaddingTop(4).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(52);   // Date
                    cd.ConstantColumn(68);   // Number
                    cd.ConstantColumn(54);   // RC Code
                    cd.RelativeColumn(1.6f); // Payor
                    cd.RelativeColumn(1.4f); // Particulars
                    cd.ConstantColumn(58);   // MFO/PAP
                    cd.ConstantColumn(68);   // Total per OR
                    cd.ConstantColumn(66);   // Taxes (40101010)
                    cd.ConstantColumn(68);   // Fees (40201010)
                });

                t.Header(h =>
                {
                    RenderSheetHeaderCell(h, "Official Receipt / Report of\nCollections by Sub-Collector", colSpan: 2, rowSpan: 1);
                    RenderSheetHeaderCell(h, "Responsibility\nCenter Code", colSpan: 1, rowSpan: 3);
                    RenderSheetHeaderCell(h, "Payor", colSpan: 1, rowSpan: 3, alignLeft: true);
                    RenderSheetHeaderCell(h, "Particulars", colSpan: 1, rowSpan: 3, alignLeft: true);
                    RenderSheetHeaderCell(h, "MFO/PAP", colSpan: 1, rowSpan: 3);
                    RenderSheetHeaderCell(h, "Amount", colSpan: 3, rowSpan: 1);

                    RenderSheetHeaderCell(h, "Date", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "Number", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "Total per OR", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "Breakdown of Collections", colSpan: 2, rowSpan: 1);

                    RenderSheetHeaderCell(h, "Taxes\n40101010");
                    RenderSheetHeaderCell(h, "Fees\n40201010");
                });

                if (rows.Count == 0)
                {
                    t.Cell().ColumnSpan(9).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No collections recorded for the selected date range.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var r in rows)
                    {
                        RenderBodyCell(t, r.Tx.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
                        RenderBodyCell(t, r.Tx.RefNo, bold: true);
                        RenderBodyCell(t, rcCode);
                        RenderBodyCell(t, Truncate(r.Tx.ApplicantName, 36), alignLeft: true);
                        RenderBodyCell(t, Truncate(r.Tx.ServiceType, 32), alignLeft: true);
                        RenderBodyCell(t, Truncate(mfoPap, 14));
                        RenderBodyCell(t, FormatCurrency(r.Tx.Amount), alignRight: true, bold: true);
                        RenderBodyCell(t, FormatCurrency(r.Taxes), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(r.Fees), alignRight: true);
                    }
                }

                RenderTotalCell(t, "TOTAL", colspan: 6, alignLeft: true);
                RenderTotalCell(t, FormatCurrency(totalOr), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totalTaxes), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totalFees), alignRight: true);
            });

            // Summary + Deposits + DST Breakdown (matching 1_RCD.xlsx rows 54-86)
            col.Item().PaddingTop(6).Border(0.6f).BorderColor(Colors.Black).Padding(5).Row(r =>
            {
                r.RelativeItem(0.55f).Column(c =>
                {
                    c.Item().Text("Summary:").Bold().FontSize(7.2f);
                    c.Item().PaddingTop(2).Text("Undeposited Collections per last Report:  PHP 0.00").FontSize(6.6f);
                    c.Item().Text($"Collections per OR Nos. {orRange}:  PHP {FormatCurrency(totalOr)}").Bold().FontSize(6.6f);
                    c.Item().PaddingTop(3).Text("Deposits:").Bold().FontSize(6.8f);
                    if (_model.BankDeposits.Count == 0)
                    {
                        c.Item().Text($"  Total Deposited / Remitted:  PHP {FormatCurrency(depositMetrics.TotalDeposited)}").FontSize(6.5f);
                    }
                    else
                    {
                        foreach (var d in _model.BankDeposits)
                        {
                            c.Item().Text($"  {d.DepositSlipNumber}  ({d.DepositDate:yyyy-MM-dd}):  PHP {FormatCurrency(d.TotalAmount)}").FontSize(6.4f);
                        }
                    }
                    c.Item().PaddingTop(3).Text($"Undeposited Collections, this Report:  PHP {FormatCurrency(depositMetrics.UndepositedBalance)}").Bold().FontSize(6.8f);
                });

                r.RelativeItem(0.45f).PaddingLeft(10).Column(c =>
                {
                    c.Item().Text($"Breakdown — DST (Total: PHP {FormatCurrency(totalTaxes)}):").Bold().FontSize(7.2f);
                    if (dstByDate.Count == 0)
                    {
                        c.Item().PaddingTop(2).Text("No DST collections in this period.").FontSize(6.5f).Italic();
                    }
                    else
                    {
                        foreach (var item in dstByDate.Take(12))
                        {
                            c.Item().Text($"  {item.Date:yyyy-MM-dd}:  PHP {FormatCurrency(item.Amount)}").FontSize(6.4f);
                        }
                    }
                });
            });

            // Official Oath Certification (1_RCD.xlsx rows 89-96)
            var cashier = ResolveCollectingOfficer("Collecting Officer");
            col.Item().PaddingTop(6).Border(0.6f).BorderColor(Colors.Black).Padding(6).Column(c =>
            {
                c.Item().AlignCenter().Text("CERTIFICATION").Bold().FontSize(7.5f);
                c.Item().PaddingTop(3).Text(
                    $"I hereby certify on my official oath that the above is a true statement of all collections and deposits had by me during the period stated above for which Official Receipts Nos. {orRange} inclusive, were actually issued by me in the amounts shown hereon. I also certify that I have not received money from whatever source without having issued the necessary Official Receipt in acknowledgement thereof. Collections received by sub-collectors are recorded above in lump-sum opposite their respective collection report numbers. I certify further that the balance shown above agrees with the balance appearing in my Cash Receipts Record.")
                    .FontSize(6.4f).Italic();

                c.Item().PaddingTop(14).AlignCenter().Width(240).Column(sig =>
                {
                    sig.Item().BorderBottom(0.7f).BorderColor(Colors.Black).AlignCenter()
                        .Text(cashier.Name.ToUpperInvariant()).FontSize(7.4f).Bold();
                    sig.Item().PaddingTop(1).AlignCenter().Text(cashier.Role).FontSize(6.6f).FontColor("#334155");
                });
            });
        });
    }

    // =========================================================================
    // 8. NTC-COA-APP26-D (Exact 2_DailyCollection.xls — Daily Sub-Column Breakdown + Recap)
    // =========================================================================
    private void ComposeDailyCollectionNtcSheet(IContainer container)
    {
        var paidTx = _model.PaidTransactions;
        var rcCode = !string.IsNullOrWhiteSpace(_model.ResponsibilityCenterCode) ? _model.ResponsibilityCenterCode.Trim() : "—";
        var effectiveFundCluster = !string.IsNullOrWhiteSpace(_model.FundCluster) ? _model.FundCluster.Trim() : "101101";

        var rows = paidTx.Select(tx =>
        {
            var matchedOr = FindMatchingReceipt(tx);
            var b = ClassifyTransactionUacs(tx, matchedOr);
            string s = (tx.ServiceType ?? string.Empty).ToLowerInvariant();
            bool isRoc = s.Contains("roc") || s.Contains("operator") || s.Contains("amateur");
            bool isCp = s.Contains("construction") || s.Contains("1-11");
            bool isInspection = s.Contains("inspection");
            bool isAppFee = s.Contains("application") || s.Contains("filing") || s.Contains("processing");

            decimal rslLf = isRoc ? 0m : b.LicenseFees;
            decimal rocCf = isRoc ? b.LicenseFees : 0m;
            decimal reg = b.RegistrationFees;
            decimal surFines = b.FinesPenalties;
            decimal permitPp = isCp ? 0m : b.PermitFees;
            decimal constCp = isCp ? b.PermitFees : 0m;
            decimal inspIf = isInspection ? b.OtherIncome : 0m;
            decimal appAf = isAppFee && !isInspection ? b.OtherIncome : 0m;
            decimal miscDup = Math.Max(0m, b.OtherIncome - inspIf - appAf) + b.ClearanceFees + b.ExamFees;

            return (
                Tx: tx,
                Dst: b.Dst,
                RslLf: rslLf,
                RocCf: rocCf,
                Reg: reg,
                SurFines: surFines,
                PermitPp: permitPp,
                ConstCp: constCp,
                InspIf: inspIf,
                AppAf: appAf,
                Srf: b.SupervisionFees,
                Suf: b.SpectrumSuf,
                MiscDup: miscDup
            );
        }).ToList();

        decimal totAll = rows.Sum(x => x.Tx.Amount);
        decimal totDst = rows.Sum(x => x.Dst);
        decimal totRsl = rows.Sum(x => x.RslLf);
        decimal totRoc = rows.Sum(x => x.RocCf);
        decimal totReg = rows.Sum(x => x.Reg);
        decimal totSur = rows.Sum(x => x.SurFines);
        decimal totPmt = rows.Sum(x => x.PermitPp);
        decimal totCp = rows.Sum(x => x.ConstCp);
        decimal totInsp = rows.Sum(x => x.InspIf);
        decimal totApp = rows.Sum(x => x.AppAf);
        decimal totSrf = rows.Sum(x => x.Srf);
        decimal totSuf = rows.Sum(x => x.Suf);
        decimal totMisc = rows.Sum(x => x.MiscDup);

        var depositMetrics = ComputeDepositMetrics(paidTx, totDst);
        var orderedOrs = paidTx
            .Where(tx => !string.IsNullOrWhiteSpace(tx.RefNo))
            .OrderBy(tx => tx.RefNo, StringComparer.OrdinalIgnoreCase)
            .Select(tx => tx.RefNo.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        string orRange = orderedOrs.Count > 0
            ? (orderedOrs.Count == 1 ? orderedOrs[0] : $"{orderedOrs.First()} to {orderedOrs.Last()}")
            : "N/A";

        container.Column(col =>
        {
            col.Item().AlignRight().Text("Appendix 26").Italic().Bold().FontSize(7.4f);
            col.Item().AlignCenter().Text("DAILY COLLECTION REPORT (REPORT OF COLLECTIONS AND DEPOSITS)").Bold().FontSize(8.6f);

            col.Item().PaddingTop(3).Border(0.6f).BorderColor(Colors.Black).Padding(4).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text($"Entity Name :  National Telecommunications Commission — {_model.TenantName}").Bold().FontSize(7.1f);
                    c.Item().Text($"Fund Cluster :  {effectiveFundCluster}   |   Responsibility Center :  {rcCode}").FontSize(6.8f);
                });
                r.ConstantItem(195).Column(c =>
                {
                    c.Item().AlignRight().Text($"Report No. :  DCR-{_model.GeneratedAt:yyyyMMdd}").FontSize(6.8f);
                    c.Item().AlignRight().Text($"Date / Period :  {_model.Period}").FontSize(6.8f);
                });
            });

            col.Item().PaddingTop(4).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(44);   // Date
                    cd.ConstantColumn(52);   // OR No.
                    cd.RelativeColumn(1.25f);// Payor
                    cd.ConstantColumn(34);   // DOC STAMPS
                    cd.ConstantColumn(38);   // RSL (LF)
                    cd.ConstantColumn(36);   // ROC (CF)
                    cd.ConstantColumn(36);   // REG
                    cd.ConstantColumn(36);   // FINES/SUR
                    cd.ConstantColumn(38);   // PERMIT P/P
                    cd.ConstantColumn(34);   // CONST CP
                    cd.ConstantColumn(34);   // INSP IF
                    cd.ConstantColumn(34);   // APP AF
                    cd.ConstantColumn(34);   // SRF
                    cd.ConstantColumn(34);   // SUF
                    cd.ConstantColumn(38);   // MISC/DUP
                    cd.ConstantColumn(48);   // TOTAL
                });

                t.Header(h =>
                {
                    RenderSheetHeaderCell(h, "OR DATE", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "OR NO.", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "PAYOR", colSpan: 1, rowSpan: 2, alignLeft: true);
                    RenderSheetHeaderCell(h, "DOC.\nSTAMPS", colSpan: 1, rowSpan: 2);
                    RenderSheetHeaderCell(h, "FRANCHISING & LICENSING FEES", colSpan: 3, rowSpan: 1);
                    RenderSheetHeaderCell(h, "SURCHARGES", colSpan: 1, rowSpan: 1);
                    RenderSheetHeaderCell(h, "PERMIT & CONST. FEES", colSpan: 2, rowSpan: 1);
                    RenderSheetHeaderCell(h, "OTHER SERVICE INCOME", colSpan: 5, rowSpan: 1);
                    RenderSheetHeaderCell(h, "TOTAL", colSpan: 1, rowSpan: 2);

                    RenderSheetHeaderCell(h, "RSL (LF)");
                    RenderSheetHeaderCell(h, "ROC (CF)");
                    RenderSheetHeaderCell(h, "REG.");
                    RenderSheetHeaderCell(h, "FINES");
                    RenderSheetHeaderCell(h, "PUR/POS");
                    RenderSheetHeaderCell(h, "CP");
                    RenderSheetHeaderCell(h, "INSP");
                    RenderSheetHeaderCell(h, "APP");
                    RenderSheetHeaderCell(h, "SRF");
                    RenderSheetHeaderCell(h, "SUF");
                    RenderSheetHeaderCell(h, "MISC/DUP");
                });

                if (rows.Count == 0)
                {
                    t.Cell().ColumnSpan(16).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No daily Official Receipt collections recorded for the selected period.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var r in rows)
                    {
                        RenderBodyCell(t, r.Tx.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
                        RenderBodyCell(t, r.Tx.RefNo, bold: true);
                        RenderBodyCell(t, Truncate(r.Tx.ApplicantName, 24), alignLeft: true);
                        RenderBodyCell(t, FormatZeroDash(r.Dst), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.RslLf), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.RocCf), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.Reg), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.SurFines), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.PermitPp), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.ConstCp), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.InspIf), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.AppAf), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.Srf), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.Suf), alignRight: true);
                        RenderBodyCell(t, FormatZeroDash(r.MiscDup), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(r.Tx.Amount), alignRight: true, bold: true);
                    }
                }

                RenderTotalCell(t, "TOTAL", colspan: 3, alignLeft: true);
                RenderTotalCell(t, FormatCurrency(totDst), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totRsl), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totRoc), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totReg), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totSur), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totPmt), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totCp), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totInsp), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totApp), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totSrf), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totSuf), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totMisc), alignRight: true);
                RenderTotalCell(t, FormatCurrency(totAll), alignRight: true);
            });

            // Recap & Certification matching 2_DailyCollection.xls
            var sco = ResolveCollectingOfficer("SCO - Designate / Collecting Officer");
            col.Item().PaddingTop(6).Row(r =>
            {
                r.RelativeItem(0.45f).Border(0.6f).BorderColor(Colors.Black).Padding(5).Column(c =>
                {
                    c.Item().Text("Recap:").Bold().FontSize(7.2f);
                    c.Item().Text($"• RSL / MF & ROC Fees:  PHP {FormatCurrency(totRsl + totRoc)}").FontSize(6.4f);
                    c.Item().Text($"• Registration Fee:  PHP {FormatCurrency(totReg)}").FontSize(6.4f);
                    c.Item().Text($"• Permits / CP:  PHP {FormatCurrency(totPmt + totCp)}").FontSize(6.4f);
                    c.Item().Text($"• Inspection / Application Fees:  PHP {FormatCurrency(totInsp + totApp)}").FontSize(6.4f);
                    c.Item().Text($"• Supervision / Reg. Fees (SRF):  PHP {FormatCurrency(totSrf)}").FontSize(6.4f);
                    c.Item().Text($"• Spectrum Users Fee (SUF):  PHP {FormatCurrency(totSuf)}").FontSize(6.4f);
                    c.Item().Text($"• Fines & Penalties - Svc. Inc.:  PHP {FormatCurrency(totSur)}").FontSize(6.4f);
                    c.Item().Text($"• Clearance / Exam / Misc. Income:  PHP {FormatCurrency(totMisc)}").FontSize(6.4f);
                    c.Item().Text($"• Documentary Stamps (DST):  PHP {FormatCurrency(totDst)}").FontSize(6.4f);
                    c.Item().PaddingTop(2).Text($"GRAND TOTAL:  PHP {FormatCurrency(totAll)}").Bold().FontSize(6.8f);
                });

                r.RelativeItem(0.55f).PaddingLeft(8).Border(0.6f).BorderColor(Colors.Black).Padding(5).Column(c =>
                {
                    c.Item().Text("Summary & Certification:").Bold().FontSize(7.2f);
                    c.Item().Text($"Collections per OR Nos. {orRange}:  PHP {FormatCurrency(totAll)}   |   Deposited: PHP {FormatCurrency(depositMetrics.TotalDeposited)}   |   Undeposited: PHP {FormatCurrency(depositMetrics.UndepositedBalance)}").FontSize(6.4f);
                    c.Item().PaddingTop(4).Text(
                        $"I hereby certify on my official oath that the above is a true statement of all collections and deposits had by me during the period stated above for which Official Receipt Nos. {orRange} inclusive, were actually issued by me in the amounts shown thereon.")
                        .FontSize(6.3f).Italic();
                    c.Item().PaddingTop(14).AlignCenter().Width(210).Column(sig =>
                    {
                        sig.Item().BorderBottom(0.7f).BorderColor(Colors.Black).AlignCenter()
                            .Text(sco.Name.ToUpperInvariant()).FontSize(7.2f).Bold();
                        sig.Item().PaddingTop(1).AlignCenter().Text($"{sco.Role} (Official Designation)").FontSize(6.4f).FontColor("#334155");
                    });
                });
            });
        });
    }
}

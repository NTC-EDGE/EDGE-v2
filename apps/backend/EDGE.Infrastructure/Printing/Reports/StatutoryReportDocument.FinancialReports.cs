using System;
using System.Linq;
using EDGE.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

public partial class StatutoryReportDocument
{
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
}

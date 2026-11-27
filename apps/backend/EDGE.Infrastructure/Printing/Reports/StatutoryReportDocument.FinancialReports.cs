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
            // COA Appendix 26 Metadata Banner (Official GAM Vol. II Header Fields)
            var effectiveFundCluster = !string.IsNullOrWhiteSpace(_model.FundCluster) ? _model.FundCluster.Trim() : "—";
            var rcCode = !string.IsNullOrWhiteSpace(_model.ResponsibilityCenterCode) ? _model.ResponsibilityCenterCode.Trim() : "—";
            var mfoPap = !string.IsNullOrWhiteSpace(_model.MfoPapCode) ? _model.MfoPapCode.Trim() : "—";
            var entityDisplay = !string.IsNullOrWhiteSpace(_model.TenantName)
                ? $"NATIONAL TELECOMMUNICATIONS COMMISSION — {_model.TenantName.ToUpperInvariant()}"
                : "NATIONAL TELECOMMUNICATIONS COMMISSION";
            var orderedOrs = paidTx
                .Where(tx => !string.IsNullOrWhiteSpace(tx.RefNo))
                .OrderBy(tx => tx.RefNo, StringComparer.OrdinalIgnoreCase)
                .Select(tx => tx.RefNo.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            var orRangeLabel = orderedOrs.Count > 0
                ? (orderedOrs.Count == 1 ? orderedOrs[0] : $"{orderedOrs.First()} to {orderedOrs.Last()}")
                : "N/A";

            col.Item().Border(0.8f).BorderColor(Colors.Black).Padding(4).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text($"Entity Name: {entityDisplay}").Bold().FontSize(7.5f);
                    c.Item().Text($"Fund Cluster: {effectiveFundCluster}   |   Responsibility Center Code: {rcCode}   |   MFO/PAP: {mfoPap}").FontSize(6.8f);
                });
                r.ConstantItem(235).Column(c =>
                {
                    c.Item().AlignRight().Text("COA GAM Volume II — Appendix 26 (RCD)").Bold().FontSize(7.5f);
                    c.Item().AlignRight().Text($"Report No.: RCD-{_model.GeneratedAt:yyyyMMdd}   •   Period: {_model.Period}").FontSize(6.8f);
                });
            });

            // A. COLLECTIONS TABLE (Official GAM Vol. II Appendix 26 Columns)
            col.Item().PaddingTop(4).Table(t =>
            {
                t.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(42); // OR Date
                    cd.ConstantColumn(52); // OR No.
                    cd.ConstantColumn(28); // RC Code
                    cd.RelativeColumn(1.15f); // Payor
                    cd.RelativeColumn(1.05f); // Particulars
                    cd.ConstantColumn(44); // MFO/PAP
                    cd.ConstantColumn(46); // Total per OR
                    cd.ConstantColumn(38); // Permit (40201010)
                    cd.ConstantColumn(38); // License (40201010)
                    cd.ConstantColumn(38); // Reg (40201020)
                    cd.ConstantColumn(36); // Clear/Exam (40201030)
                    cd.ConstantColumn(36); // SRF (40201070)
                    cd.ConstantColumn(36); // SUF (40201140)
                    cd.ConstantColumn(34); // Fines (40201140)
                    cd.ConstantColumn(32); // DST (20201050)
                    cd.ConstantColumn(36); // Other (40201990)
                    cd.ConstantColumn(52); // Deposit Status
                });

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 17, "I. REPORT OF COLLECTIONS AND DEPOSITS — SCHEDULE OF OFFICIAL RECEIPTS BY UACS OBJECT CODE");
                    RenderTableHeaderCell(h, "OR DATE");
                    RenderTableHeaderCell(h, "OR NO.");
                    RenderTableHeaderCell(h, "RC\nCODE");
                    RenderTableHeaderCell(h, "PAYOR / ENTITY", alignLeft: true);
                    RenderTableHeaderCell(h, "PARTICULARS", alignLeft: true);
                    RenderTableHeaderCell(h, "MFO /\nPAP");
                    RenderTableHeaderCell(h, "TOTAL\nPER OR");
                    RenderTableHeaderCell(h, "PERMIT\n40201010");
                    RenderTableHeaderCell(h, "LICENSE\n40201010");
                    RenderTableHeaderCell(h, "REGIST.\n40201020");
                    RenderTableHeaderCell(h, "CLR/EXM\n40201030");
                    RenderTableHeaderCell(h, "SUPERV.\n40201070");
                    RenderTableHeaderCell(h, "SPECTRUM\n40201140");
                    RenderTableHeaderCell(h, "FINES\n40201140");
                    RenderTableHeaderCell(h, "DST\n20201050");
                    RenderTableHeaderCell(h, "OTHER\n40201990");
                    RenderTableHeaderCell(h, "DEPOSIT\nSTATUS");
                });

                if (uacsRows.Count == 0)
                {
                    t.Cell().ColumnSpan(17).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No Official Receipt collections recorded for the selected date range.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var item in uacsRows)
                    {
                        var tx = item.Tx;
                        var b = item.Breakdown;
                        RenderBodyCell(t, tx.Date.ToString("yyyy-MM-dd"));
                        RenderBodyCell(t, tx.RefNo, bold: true);
                        RenderBodyCell(t, rcCode);
                        RenderBodyCell(t, Truncate(tx.ApplicantName, 22), alignLeft: true);
                        RenderBodyCell(t, Truncate(tx.ServiceType, 20), alignLeft: true);
                        RenderBodyCell(t, Truncate(mfoPap, 10));
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
                        RenderBodyCell(t, Truncate(item.DepositStatus, 13), bold: item.DepositStatus.StartsWith("DEPOSITED"));
                    }
                }

                RenderTotalCell(t, "TOTAL", colspan: 6, alignLeft: true);
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

                    t.Header(h =>
                    {
                        RenderSectionTitleRow(h, 9, "II. SCHEDULE OF VALIDATED BANK DEPOSITS / AGDB REMITTANCE BATCHES");
                        RenderTableHeaderCell(h, "DEPOSIT DATE");
                        RenderTableHeaderCell(h, "DEPOSIT SLIP NO.");
                        RenderTableHeaderCell(h, "AUTHORIZED GOVT DEPOSITORY BANK (AGDB)", alignLeft: true);
                        RenderTableHeaderCell(h, "FUND CLUSTER");
                        RenderTableHeaderCell(h, "CASH AMOUNT");
                        RenderTableHeaderCell(h, "CHECK AMOUNT");
                        RenderTableHeaderCell(h, "TOTAL DEPOSITED");
                        RenderTableHeaderCell(h, "OR COUNT");
                        RenderTableHeaderCell(h, "STATUS");
                    });

                    foreach (var d in _model.BankDeposits)
                    {
                        string bankInfo = d.BankAccount != null
                            ? $"{d.BankAccount.BankName} — Acct #{d.BankAccount.AccountNumber}"
                            : "LandBank / DBP — BTr Treasury Account";
                        string fundCluster = d.BankAccount != null && !string.IsNullOrWhiteSpace(d.BankAccount.FundCluster)
                            ? d.BankAccount.FundCluster
                            : $"{effectiveFundCluster} (NGP)";

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

            // Summary of Remittances & Official Oath Certification (COA GAM Vol. II Appendix 26)
            col.Item().PaddingTop(4).Border(0.8f).BorderColor(Colors.Black).Padding(5).Row(r =>
            {
                r.RelativeItem(0.48f).Column(c =>
                {
                    c.Item().Text("III. SUMMARY (RECONCILIATION OF COLLECTIONS & DEPOSITS)").Bold().FontSize(7.2f);
                    c.Item().PaddingTop(2).Text("• Undeposited Collections per last Report: PHP 0.00").FontSize(6.5f);
                    c.Item().Text($"• Add: Collections per OR Nos. {orRangeLabel} ({paidTx.Count} ORs): PHP {FormatCurrency(depositMetrics.TotalCollected)} (Cash: {FormatCurrency(depositMetrics.CashCollected)} | Check: {FormatCurrency(depositMetrics.CheckCollected)} | Online: {FormatCurrency(depositMetrics.OnlineCollected)})").FontSize(6.5f);
                    c.Item().Text($"• Less: Deposits with AGDB / BTr ({_model.BankDeposits.Count} Batches): PHP {FormatCurrency(depositMetrics.TotalDeposited)}").Bold().FontSize(6.5f);
                    c.Item().Text($"• Undeposited Collections, this Report ({depositMetrics.UndepositedOrCount} ORs Awaiting Deposit): PHP {FormatCurrency(depositMetrics.UndepositedBalance)}").Bold().FontSize(6.5f);
                });

                r.RelativeItem(0.52f).PaddingLeft(8).Column(c =>
                {
                    c.Item().Text("CERTIFICATION (COA GAM VOL. II — APPENDIX 26):").Bold().FontSize(7.2f);
                    c.Item().PaddingTop(2).Text(
                        $"I hereby certify on my official oath that the above is a true statement of all collections and deposits had by me during the period stated above for which Official Receipt Nos. {orRangeLabel} inclusive, were actually issued by me in the amounts shown thereon, and that I have not received money from whatever source without having issued the necessary Official Receipt in acknowledgement thereof.")
                        .FontSize(6.3f).Italic();
                });
            });

            var cashierSig = ResolveCollectingOfficer("Collecting Officer / Regional Cashier III");
            var accountantSig = ResolveRegionalAccountant("Head, Accounting Unit (FAD)");
            var directorSig = ResolveRegionalDirector("Regional Director");

            col.Item().PaddingTop(5).Element(c => ComposeSignatories(
                c,
                ("PREPARED & CERTIFIED CORRECT BY:", cashierSig.Name, cashierSig.Role),
                ("VERIFIED & RECONCILED BY:", accountantSig.Name, accountantSig.Role),
                ("APPROVED BY:", directorSig.Name, directorSig.Role)));
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
                    c.Item().Text("STATUTORY TAX RETURN REFERENCE: BIR Form No. 2000 (Monthly DST Declaration/Return) — NIRC Sec. 173 & 188 (TRAIN Law)").Bold().FontSize(7.3f);
                    c.Item().Text("Tax Type: Documentary Stamp Tax (Constructive Affixture)   |   ATC: DS125 (Certificates / Licenses / Permits)   |   Filing Deadline: Within 5 days after close of month").FontSize(6.6f);
                });
                r.ConstantItem(225).Column(c =>
                {
                    c.Item().AlignRight().Text($"DST Collected: PHP {FormatCurrency(totalDst)}   |   Remitted: PHP {FormatCurrency(totalDstDeposited)}").Bold().FontSize(7.1f);
                    c.Item().AlignRight().Text($"UACS Code: 2-02-01-050 (Due to BIR)   |   Undeposited: PHP {FormatCurrency(totalDstUndeposited)}").FontSize(6.6f);
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

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 8, "SCHEDULE OF CONSTRUCTIVE DOCUMENTARY STAMP TAX (DST) COLLECTIONS & REMITTANCE STATUS");
                    RenderTableHeaderCell(h, "OR DATE");
                    RenderTableHeaderCell(h, "OR NUMBER");
                    RenderTableHeaderCell(h, "TAXPAYER / PAYOR NAME", alignLeft: true);
                    RenderTableHeaderCell(h, "TAXABLE CERTIFICATE / LICENSE / PERMIT", alignLeft: true);
                    RenderTableHeaderCell(h, "GROSS OR");
                    RenderTableHeaderCell(h, "NET REG. FEE");
                    RenderTableHeaderCell(h, "DST (SEC. 188)");
                    RenderTableHeaderCell(h, "REMITTANCE");
                });

                if (rows.Count == 0)
                {
                    t.Cell().ColumnSpan(8).Border(0.5f).BorderColor("#CBD5E1").Padding(8).AlignCenter()
                        .Text("No Documentary Stamp Tax collections recorded for the selected period.").Italic().FontColor(Colors.Grey.Darken1);
                }
                else
                {
                    foreach (var r in rows)
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

            var dstCashier = ResolveCollectingOfficer("Collecting Officer / Cashier III");
            var dstAccountant = ResolveRegionalAccountant("Head, Accounting Unit");
            var dstDirector = ResolveRegionalDirector("Regional Director");

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", dstCashier.Name, dstCashier.Role),
                ("CERTIFIED CORRECT BY:", dstAccountant.Name, dstAccountant.Role),
                ("APPROVED FOR REMITTANCE BY:", dstDirector.Name, dstDirector.Role)));
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

        var effectiveFundCluster = !string.IsNullOrWhiteSpace(_model.FundCluster) ? _model.FundCluster.Trim() : "—";
        var effectiveRcCode = !string.IsNullOrWhiteSpace(_model.ResponsibilityCenterCode) ? _model.ResponsibilityCenterCode.Trim() : "—";
        var ngpFundLabel = effectiveFundCluster != "—"
            ? $"{effectiveFundCluster} — BTr-NGAs Fees & Charges"
            : "BTr-NGAs Fees & Charges";

        var schedule = new (string Code, string Title, string LegalBasis, decimal Collected, decimal Deposited, string Fund)[]
        {
            ("4-02-01-010-A", "Permit Fees — Purchase / Possess / Construction / Temporary Permits", "Act 3846 / EO 546", totals.PermitFees, depositedTotals.PermitFees, ngpFundLabel),
            ("4-02-01-010-B", "License Fees — Radio Station License (RSL) & Operator Certificates (ROC)", "Act 3846 / RA 7925", totals.LicenseFees, depositedTotals.LicenseFees, ngpFundLabel),
            ("4-02-01-020", "Registration Fees — Radio Transceivers, Telecom & CPE Registration", "EO 546 / NTC MC", totals.RegistrationFees, depositedTotals.RegistrationFees, ngpFundLabel),
            ("4-02-01-030", "Examination Fees — Radio Operator & Amateur Examinations", "Act 3846 / RA 11032", totals.ExamFees, depositedTotals.ExamFees, ngpFundLabel),
            ("4-02-01-040", "Clearance and Certification Fees — Certified True Copies & Verifications", "EO 546 / NTC Charter", totals.ClearanceFees, depositedTotals.ClearanceFees, ngpFundLabel),
            ("4-02-01-070", "Supervision and Regulation Enforcement Fees (SRF)", "CA 146 / RA 7925", totals.SupervisionFees, depositedTotals.SupervisionFees, ngpFundLabel),
            ("4-02-01-140-A", "Spectrum User's Fee (SUF)", "RA 7925 Sec. 15", totals.SpectrumSuf, depositedTotals.SpectrumSuf, ngpFundLabel),
            ("4-02-01-140-B", "Fines and Penalties — Service Income & Late Renewal Surcharges", "Act 3846 / NTC Schedule", totals.FinesPenalties, depositedTotals.FinesPenalties, ngpFundLabel),
            ("4-02-01-990", "Other Service Income — Modifications, Call Sign & Miscellaneous Fees", "GAM Vol. I / EO 546", totals.OtherIncome, depositedTotals.OtherIncome, ngpFundLabel),
            ("2-02-01-050", "Due to BIR — Documentary Stamp Tax (Constructive Affixture)", "NIRC Sec. 188 / RA 10963", totals.Dst, depositedTotals.Dst, "BTr-Inter-Agency Trust Fund (IATF)")
        };

        container.Column(col =>
        {
            col.Item().Border(0.8f).BorderColor(Colors.Black).Padding(4).Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    var btrEntity = !string.IsNullOrWhiteSpace(_model.TenantName) ? $"NTC {_model.TenantName}" : "NTC";
                    c.Item().Text("BTr Treasury Circular Nos. 02-2022 / 03-2024 / 03-2025 — List of Deposited Collections (NGCDS / UACS)").Bold().FontSize(7.3f);
                    c.Item().Text($"Entity: {btrEntity}   |   Fund Cluster: {effectiveFundCluster}   |   RC Code: {effectiveRcCode}").FontSize(6.6f);
                });
                r.ConstantItem(215).Column(c =>
                {
                    c.Item().AlignRight().Text($"Total Collected: PHP {FormatCurrency(depositMetrics.TotalCollected)}").Bold().FontSize(7.1f);
                    c.Item().AlignRight().Text($"Deposited to AGDB/BTr: PHP {FormatCurrency(depositMetrics.TotalDeposited)}").FontSize(6.6f);
                });
            });

            col.Item().PaddingTop(4).Table(t =>
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

                t.Header(h =>
                {
                    RenderSectionTitleRow(h, 7, "I. STATEMENT OF INCOME COLLECTED AND DEPOSITED WITH THE BUREAU OF THE TREASURY (BTr)");
                    RenderTableHeaderCell(h, "UACS CODE");
                    RenderTableHeaderCell(h, "REVENUE ACCOUNT TITLE / DESCRIPTION", alignLeft: true);
                    RenderTableHeaderCell(h, "STATUTORY BASIS", alignLeft: true);
                    RenderTableHeaderCell(h, "FUND CLUSTER", alignLeft: true);
                    RenderTableHeaderCell(h, "COLLECTED (PHP)");
                    RenderTableHeaderCell(h, "DEPOSITED (BTr)");
                    RenderTableHeaderCell(h, "UNDEPOSITED");
                });

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

                    t.Header(h =>
                    {
                        RenderSectionTitleRow(h, 7, "II. VALIDATED BANK DEPOSIT SLIPS / AGDB TREASURY REMITTANCES");
                        RenderTableHeaderCell(h, "DEPOSIT DATE");
                        RenderTableHeaderCell(h, "DEPOSIT SLIP NO.");
                        RenderTableHeaderCell(h, "DEPOSITORY BANK & ACCOUNT", alignLeft: true);
                        RenderTableHeaderCell(h, "FUND CLUSTER");
                        RenderTableHeaderCell(h, "CASH REMITTED");
                        RenderTableHeaderCell(h, "CHECK REMITTED");
                        RenderTableHeaderCell(h, "TOTAL DEPOSITED");
                    });

                    foreach (var d in _model.BankDeposits)
                    {
                        string bankInfo = d.BankAccount != null
                            ? $"{d.BankAccount.BankName} ({d.BankAccount.AccountNumber})"
                            : "Authorized Govt Depository Bank (BTr)";
                        RenderBodyCell(t, d.DepositDate.ToString("yyyy-MM-dd"));
                        RenderBodyCell(t, d.DepositSlipNumber, bold: true);
                        RenderBodyCell(t, bankInfo, alignLeft: true);
                        RenderBodyCell(t, d.BankAccount?.FundCluster ?? effectiveFundCluster);
                        RenderBodyCell(t, FormatCurrency(d.CashAmount), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(d.CheckAmount), alignRight: true);
                        RenderBodyCell(t, FormatCurrency(d.TotalAmount), alignRight: true, bold: true);
                    }
                });
            }

            var btrCashier = ResolveCollectingOfficer("Regional Cashier III");
            var btrAccountant = ResolveRegionalAccountant("Chief Accountant / FAD");
            var btrDirector = ResolveRegionalDirector("Regional Director");

            col.Item().PaddingTop(8).Element(c => ComposeSignatories(
                c,
                ("PREPARED BY:", btrCashier.Name, btrCashier.Role),
                ("CERTIFIED CORRECT BY:", btrAccountant.Name, btrAccountant.Role),
                ("APPROVED BY:", btrDirector.Name, btrDirector.Role)));
        });
    }
}

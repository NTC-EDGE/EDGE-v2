using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

public partial class StatutoryReportDocument
{
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

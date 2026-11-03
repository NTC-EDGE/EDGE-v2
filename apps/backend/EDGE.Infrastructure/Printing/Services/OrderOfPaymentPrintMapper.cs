using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Application.Common.Helpers;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps real database OrderOfPayment, StatementOfAccount, and Application entities
/// to printable OrderOfPaymentModel matching official NTC OP document layout.
/// </summary>
public static class OrderOfPaymentPrintMapper
{
    public static OrderOfPaymentModel MapToPrintModel(
        OrderOfPayment op,
        StatementOfAccount? soa = null,
        EDGE.Domain.Entities.Application? app = null,
        string? fundCluster = null,
        IEnumerable<AgencyBankAccount>? agencyBankAccounts = null,
        OfficialReceipt? receipt = null,
        string? overrideOrNumber = null,
        IEnumerable<OfficialReceipt>? receipts = null)
    {
        var model = new OrderOfPaymentModel();

        model.AgencyName = "NATIONAL TELECOMMUNICATIONS COMMISSION";
        model.RegionalOffice = !string.IsNullOrWhiteSpace(app?.Office) ? app.Office : null;
        model.Fund = !string.IsNullOrWhiteSpace(fundCluster)
            ? (fundCluster.StartsWith("Fund", StringComparison.OrdinalIgnoreCase) ? fundCluster : $"Fund Cluster {fundCluster}")
            : "General Fund";
        model.Title = "ORDER OF PAYMENT";

        model.SerialNo = op.OpNumber ?? string.Empty;
        model.Date = op.CreatedAt != default
            ? op.CreatedAt.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

        static string BuildFullAddress(ApplicantDetail? detail, CompanyDetail? comp)
        {
            var street = !string.IsNullOrWhiteSpace(detail?.Address)
                ? detail.Address
                : comp?.Address;
            var brgy = detail?.Barangay?.Name ?? comp?.Barangay?.Name;
            var muni = detail?.Barangay?.Municipality?.Name ?? comp?.Barangay?.Municipality?.Name;
            var prov = detail?.Barangay?.Municipality?.Province?.Name ?? comp?.Barangay?.Municipality?.Province?.Name;
            var reg = detail?.Barangay?.Municipality?.Province?.Region?.Name ?? comp?.Barangay?.Municipality?.Province?.Region?.Name;
            var zip = detail?.ZipCode;

            var parts = new[] { street, brgy, muni, prov, reg, zip }
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p!.Trim())
                .Distinct()
                .ToList();

            return parts.Count > 0 ? string.Join(", ", parts) : string.Empty;
        }

        var fallbackApplicantName = app?.ApplicationApplicants
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a => a?.CompanyDetail?.Name ?? (a?.ApplicantDetail != null ? $"{a.ApplicantDetail.FirstName} {a.ApplicantDetail.LastName}".Trim() : null))
            .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        var fallbackAddress = app?.ApplicationApplicants
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a =>
            {
                var full = BuildFullAddress(a?.ApplicantDetail, a?.CompanyDetail);
                if (!string.IsNullOrWhiteSpace(full)) return full;
                return a?.CompanyDetail?.Address ?? (a?.ApplicantDetail != null ? a.ApplicantDetail.Address : null);
            })
            .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        var fallbackUserAddress = app?.User?.CompanyDetail != null
            ? (BuildFullAddress(null, app.User.CompanyDetail) is var uAddr && !string.IsNullOrWhiteSpace(uAddr) ? uAddr : app.User.CompanyDetail.Address)
            : null;

        model.PayorName = !string.IsNullOrWhiteSpace(soa?.IssuedToName)
            ? soa.IssuedToName
            : (fallbackApplicantName ?? (app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Applicant"));

        model.PayorAddress = !string.IsNullOrWhiteSpace(soa?.IssuedToAddress)
            ? soa.IssuedToAddress
            : (!string.IsNullOrWhiteSpace(fallbackAddress)
                ? fallbackAddress
                : (fallbackUserAddress ?? "N/A"));

        model.Amount = op.AmountDue;
        model.TotalAmount = op.AmountDue;
        model.AmountInWords = NumberToWordsConverter.Convert(op.AmountDue);

        // Build Purpose description from Application / SOA particulars
        var serviceName = app?.ApplicationApplicants.FirstOrDefault()?.Applicant?.Service?.Name ?? "Application";
        var particulars = soa?.LineItems.Select(li => li.Particular).Where(p => !string.IsNullOrWhiteSpace(p)).Distinct().ToList();
        if (particulars != null && particulars.Any())
        {
            model.Purpose = $"{serviceName} - {string.Join(", ", particulars)}";
        }
        else
        {
            model.Purpose = $"{serviceName} Assessment & Regulatory Fees";
        }

        // SOA Reference
        var activeSoa = soa ?? op.StatementOfAccount ?? app?.StatementsOfAccount.FirstOrDefault(s => s.Id == op.StatementOfAccountId);
        model.StatementOfAccountNo = activeSoa?.SoaNumber ?? "N/A";
        model.StatementOfAccountDate = activeSoa?.CreatedAt != default
            ? activeSoa?.CreatedAt.ToString("dd/MM/yyyy")
            : op.CreatedAt.ToString("dd/MM/yyyy");

        // Bank Account entries - populated only from configured depository accounts; otherwise blank
        model.BankAccounts = new List<OrderOfPaymentBankAccount>();
        if (agencyBankAccounts != null)
        {
            var activeAccounts = agencyBankAccounts.Where(b => b.IsActive).ToList();
            if (activeAccounts.Count > 0)
            {
                model.BankAccounts = activeAccounts.Select((b, idx) => new OrderOfPaymentBankAccount
                {
                    No = b.AccountNumber,
                    BankName = b.BankName,
                    Amount = idx == 0 ? op.AmountDue : null
                }).ToList();
            }
        }

        model.TotalAmount = model.BankAccounts.Count > 0 ? op.AmountDue : null;

        // O.R. Stamp Box if paid - supports single or multiple Official Receipts
        var allReceiptNumbers = new List<string>();

        // Identify any explicitly cancelled receipts to avoid exposing stale or voided receipt numbers
        var cancelledReceiptNumbers = (receipts ?? Enumerable.Empty<OfficialReceipt>())
            .Concat(receipt != null ? new[] { receipt } : Enumerable.Empty<OfficialReceipt>())
            .Where(r => r != null && (r.Status == ReceiptStatus.Cancelled || r.CancelledAt != null) && !string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
            .Select(r => r.OfficialReceiptNumber.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(overrideOrNumber))
        {
            allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(overrideOrNumber));
        }
        else
        {
            if (receipts != null)
            {
                allReceiptNumbers.AddRange(receipts
                    .Where(r => r != null && r.Status != ReceiptStatus.Cancelled && r.CancelledAt == null && !string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
                    .Select(r => r.OfficialReceiptNumber.Trim()));
            }

            if (receipt != null && receipt.Status != ReceiptStatus.Cancelled && receipt.CancelledAt == null && !string.IsNullOrWhiteSpace(receipt.OfficialReceiptNumber))
            {
                allReceiptNumbers.Add(receipt.OfficialReceiptNumber.Trim());
            }

            if (op.Status != OpStatus.Returned && !string.IsNullOrWhiteSpace(op.OfficialReceiptNumber))
            {
                allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(op.OfficialReceiptNumber));
            }

            if (app?.OrdersOfPayment != null)
            {
                foreach (var otherOp in app.OrdersOfPayment)
                {
                    if (otherOp.Status != OpStatus.Returned && !string.IsNullOrWhiteSpace(otherOp.OfficialReceiptNumber))
                    {
                        allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(otherOp.OfficialReceiptNumber));
                    }
                }
            }

            if (app?.IssuedDocumentDetails != null)
            {
                foreach (var doc in app.IssuedDocumentDetails)
                {
                    if (!string.IsNullOrWhiteSpace(doc.OfficialReceiptNumber))
                    {
                        allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(doc.OfficialReceiptNumber));
                    }
                }
            }

            if (op.Histories != null)
            {
                foreach (var h in op.Histories)
                {
                    if (!string.IsNullOrWhiteSpace(h.OfficialReceiptNumber) &&
                        (h.Action == null || (!h.Action.Contains("Returned", StringComparison.OrdinalIgnoreCase) && !h.Action.Contains("Cancel", StringComparison.OrdinalIgnoreCase))))
                    {
                        allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(h.OfficialReceiptNumber));
                    }
                }
            }
        }

        var distinctOrNumbers = DelimitedStringHelper.ParseDistinctTokens(
            allReceiptNumbers.Where(n => !cancelledReceiptNumbers.Contains(n.Trim())),
            comparer: StringComparer.OrdinalIgnoreCase);

        var effectiveOrNumber = DelimitedStringHelper.FormatOrDisplay(distinctOrNumbers);

        model.OrNumbers = distinctOrNumbers;

        bool isPaid = distinctOrNumbers.Count > 0
            || op.Status == OpStatus.Paid
            || receipt != null
            || (receipts != null && receipts.Any())
            || (app != null && (app.Status == ApplicationStatus.ForIssuance || app.Status == ApplicationStatus.Completed || app.Status == ApplicationStatus.Approved));

        if (isPaid)
        {
            decimal effectiveAmount;
            if (!string.IsNullOrWhiteSpace(overrideOrNumber))
            {
                var matchingReceipt = receipts?.FirstOrDefault(r => string.Equals(r.OfficialReceiptNumber?.Trim(), overrideOrNumber.Trim(), StringComparison.OrdinalIgnoreCase))
                    ?? (string.Equals(receipt?.OfficialReceiptNumber?.Trim(), overrideOrNumber.Trim(), StringComparison.OrdinalIgnoreCase) ? receipt : null);

                effectiveAmount = matchingReceipt?.Amount > 0
                    ? matchingReceipt.Amount
                    : (op.AmountReceived > 0 ? op.AmountReceived : op.AmountDue);
            }
            else
            {
                var receiptsSum = receipts?.Where(r => r.Status != ReceiptStatus.Cancelled).Sum(r => r.Amount) ?? 0;
                effectiveAmount = op.AmountReceived > 0
                    ? op.AmountReceived
                    : (receiptsSum > 0
                        ? receiptsSum
                        : (receipt != null && receipt.Amount > 0
                            ? receipt.Amount
                            : op.AmountDue));
            }

            var effectiveDate = op.PaidAt
                ?? receipt?.IssuedAt
                ?? receipts?.OrderByDescending(r => r.IssuedAt).Select(r => (DateTime?)r.IssuedAt).FirstOrDefault()
                ?? op.Histories?.FirstOrDefault(h => h.Action.Contains("Verified") || h.Action.Contains("Paid"))?.Timestamp
                ?? (op.CreatedAt != default ? op.CreatedAt : DateTime.UtcNow);

            var cashierStaff = op.Histories?.FirstOrDefault(h => h.Action.Contains("Verified") || h.Action.Contains("Paid"))?.StaffName
                ?? app?.Histories?.FirstOrDefault(h => h.StaffRole != null && h.StaffRole.Contains("Cashier", StringComparison.OrdinalIgnoreCase))?.StaffName
                ?? (receipt?.IssuedByUser != null ? $"{receipt.IssuedByUser.FirstName} {receipt.IssuedByUser.LastName}".Trim() : null)
                ?? (receipts?.FirstOrDefault(r => r.IssuedByUser != null)?.IssuedByUser != null ? $"{receipts.First(r => r.IssuedByUser != null).IssuedByUser!.FirstName} {receipts.First(r => r.IssuedByUser != null).IssuedByUser!.LastName}".Trim() : null)
                ?? "Cashier";

            model.OrNo = !string.IsNullOrWhiteSpace(effectiveOrNumber) ? effectiveOrNumber : "OR-RECORDED";
            model.OrAmount = $"P{effectiveAmount:N2}";
            model.OrDate = effectiveDate.ToString("MMM dd yyyy");
            model.OrBy = cashierStaff;
        }

        var regionalOfficeLabel = !string.IsNullOrWhiteSpace(app?.Office)
            ? app.Office
            : (!string.IsNullOrWhiteSpace(app?.Region?.Name) ? $"NTC {app.Region.Name}" : null);

        model.CollectingOfficer = !string.IsNullOrWhiteSpace(regionalOfficeLabel)
            ? $"Special Collecting Officer, {regionalOfficeLabel}"
            : "Special Collecting Officer";

        return model;
    }
}

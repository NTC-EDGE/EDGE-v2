using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps real database OfficialReceipt, OrderOfPayment, StatementOfAccount, and Application entities
/// to printable OfficialReceiptModel matching official NTC Accountable Form No. 51 layout.
/// </summary>
public static class OfficialReceiptPrintMapper
{
    public static OfficialReceiptModel MapToPrintModel(
        OfficialReceipt? receipt = null,
        OrderOfPayment? op = null,
        StatementOfAccount? soa = null,
        EDGE.Domain.Entities.Application? app = null,
        string? template = null)
    {
        var isLandscape = string.Equals(template, "landscape", StringComparison.OrdinalIgnoreCase);

        var model = new OfficialReceiptModel
        {
            Orientation = isLandscape ? ReceiptOrientation.Landscape : ReceiptOrientation.Portrait,
            AccountableFormNo = "Accountable Form No. 51",
            RevisionInfo = "Revised January, 1992",
            CopyType = "ORIGINAL"
        };

        // 1. Resolve effective Order of Payment & SOA references if not passed
        var activeOp = op
            ?? receipt?.OrderOfPayment
            ?? app?.OrdersOfPayment.FirstOrDefault(o => receipt != null && o.OfficialReceiptNumber == receipt.OfficialReceiptNumber)
            ?? app?.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

        var activeSoa = soa
            ?? activeOp?.StatementOfAccount
            ?? app?.StatementsOfAccount.FirstOrDefault(s => activeOp != null && s.Id == activeOp.StatementOfAccountId)
            ?? app?.StatementsOfAccount.OrderByDescending(s => s.CreatedAt).FirstOrDefault();

        // 2. Receipt metadata
        var effectiveOrNumber = !string.IsNullOrWhiteSpace(receipt?.OfficialReceiptNumber)
            ? receipt.OfficialReceiptNumber
            : (!string.IsNullOrWhiteSpace(activeOp?.OfficialReceiptNumber) ? activeOp.OfficialReceiptNumber : "OR-PENDING");

        model.ReceiptNo = effectiveOrNumber;

        var issuedDate = receipt != null && receipt.IssuedAt != default
            ? receipt.IssuedAt
            : (activeOp?.PaidAt ?? activeOp?.CreatedAt ?? app?.CreatedAt ?? DateTime.UtcNow);

        model.Date = issuedDate.ToString("MMMM dd, yyyy");

        // 3. Payor Name & Address
        var fallbackApplicantName = app?.ApplicationApplicants
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a => a?.CompanyDetail?.Name ?? (a?.ApplicantDetail != null ? $"{a.ApplicantDetail.FirstName} {a.ApplicantDetail.LastName}".Trim() : null))
            .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        var fallbackAddress = app?.ApplicationApplicants
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a => a?.CompanyDetail?.Address ?? (a?.ApplicantDetail != null ? a.ApplicantDetail.Address : null))
            .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        model.Payor = !string.IsNullOrWhiteSpace(receipt?.PayorName)
            ? receipt.PayorName
            : (!string.IsNullOrWhiteSpace(activeSoa?.IssuedToName)
                ? activeSoa.IssuedToName
                : (fallbackApplicantName ?? (app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Applicant")));

        // 4. Amount and Line Items
        decimal totalAmount = 0m;
        if (receipt != null && receipt.Amount > 0)
        {
            totalAmount = receipt.Amount;
        }
        else if (activeOp != null && activeOp.AmountReceived > 0)
        {
            totalAmount = activeOp.AmountReceived;
        }
        else if (activeOp != null && activeOp.AmountDue > 0)
        {
            totalAmount = activeOp.AmountDue;
        }
        else if (activeSoa != null && activeSoa.TotalAmount > 0)
        {
            totalAmount = activeSoa.TotalAmount;
        }

        model.TotalAmount = totalAmount;
        model.AmountInWords = NumberToWordsConverter.Convert(totalAmount);

        // Map line items: Prioritize SOA breakdown so the exact fee item types and amounts from the SOA are displayed
        var itemsList = new List<OfficialReceiptItem>();
        if (activeSoa?.LineItems != null && activeSoa.LineItems.Any())
        {
            foreach (var li in activeSoa.LineItems)
            {
                var label = BuildItemDetailedDescription(li);

                itemsList.Add(new OfficialReceiptItem
                {
                    NatureOfCollection = label,
                    Amount = li.Amount
                });
            }
        }
        else if (receipt?.LineItems != null && receipt.LineItems.Any())
        {
            foreach (var li in receipt.LineItems)
            {
                var desc = !string.IsNullOrWhiteSpace(li.Description) ? li.Description.Trim() : (!string.IsNullOrWhiteSpace(li.FeeCode) ? li.FeeCode.Trim() : "Assessment Fee");
                if (!string.IsNullOrWhiteSpace(li.FeeCode) &&
                    !string.Equals(li.FeeCode.Trim(), "FEE", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(li.FeeCode.Trim(), "PAYMENT", StringComparison.OrdinalIgnoreCase) &&
                    !desc.Contains(li.FeeCode.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    desc = $"{desc} ({li.FeeCode.Trim()})";
                }

                itemsList.Add(new OfficialReceiptItem
                {
                    NatureOfCollection = desc,
                    Amount = li.Amount
                });
            }
        }
        else
        {
            var serviceName = app?.ApplicationApplicants.FirstOrDefault()?.Applicant?.Service?.Name ?? "Application Assessment";
            itemsList.Add(new OfficialReceiptItem
            {
                NatureOfCollection = $"{serviceName} Fees",
                Amount = totalAmount
            });
        }

        model.Items = itemsList;

        // 5. Payment Instrument & Check Details
        var paymentMethod = receipt?.PaymentMethod ?? activeOp?.PaymentMethod ?? PaymentMethod.Cash;
        if (paymentMethod == PaymentMethod.Check)
        {
            model.SelectedPaymentType = PaymentType.Check;
            var checkNo = receipt?.CheckNumber ?? activeOp?.CheckNumber;
            var checkBank = receipt?.CheckBank ?? activeOp?.CheckBank ?? activeOp?.CheckName;
            var checkDate = receipt?.CheckDate ?? activeOp?.CheckDate;

            model.TreasuryWarrantCheckMoneyOrderInfo = !string.IsNullOrWhiteSpace(checkBank)
                ? $"{checkBank} #{checkNo}"
                : checkNo;

            model.DateOfTreasuryWarrantCheckMoneyOrder = checkDate.HasValue
                ? checkDate.Value.ToString("MM/dd/yyyy")
                : issuedDate.ToString("MM/dd/yyyy");
        }
        else
        {
            model.SelectedPaymentType = PaymentType.Cash;
        }

        // 6. Collecting Officer / Cashier
        var cashierStaffName = receipt?.IssuedByUser != null
            ? $"{receipt.IssuedByUser.FirstName} {receipt.IssuedByUser.LastName}".Trim()
            : activeOp?.Histories.FirstOrDefault(h =>
                (h.Action != null && (h.Action.Contains("Payment") || h.Action.Contains("Official Receipt") || h.Action.Contains("Verified"))) ||
                h.StaffRole == "Cashier")?.StaffName;

        model.CollectingOfficer = !string.IsNullOrWhiteSpace(cashierStaffName)
            ? cashierStaffName
            : "Collecting Officer";

        return model;
    }

    private static string BuildItemDetailedDescription(EDGE.Domain.Entities.SoaLineItem li)
    {
        var particular = !string.IsNullOrWhiteSpace(li.Particular) ? li.Particular.Trim() : (!string.IsNullOrWhiteSpace(li.ItemCode) ? li.ItemCode.Trim() : "Assessment Fee");
        var details = new List<string>();

        if (!string.IsNullOrWhiteSpace(li.ItemCode) &&
            !string.Equals(li.ItemCode.Trim(), particular, StringComparison.OrdinalIgnoreCase) &&
            !particular.Contains(li.ItemCode.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            details.Add(li.ItemCode.Trim());
        }

        if (li.NoOfUnits > 0)
        {
            details.Add($"{li.NoOfUnits} unit{(li.NoOfUnits > 1 ? "s" : "")}");
        }

        if (li.ValidityYears > 0)
        {
            details.Add($"{li.ValidityYears} yr{(li.ValidityYears > 1 ? "s" : "")}");
        }

        if (details.Any())
        {
            return $"{particular} ({string.Join(" • ", details)})";
        }

        return particular;
    }
}

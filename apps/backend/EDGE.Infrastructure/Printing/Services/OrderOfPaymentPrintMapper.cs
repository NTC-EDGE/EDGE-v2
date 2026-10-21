using System;
using System.Linq;
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
        string? fundCluster = null)
    {
        var model = new OrderOfPaymentModel();

        model.AgencyName = "NATIONAL TELECOMMUNICATIONS COMMISSION";
        model.RegionalOffice = !string.IsNullOrWhiteSpace(app?.Office) ? app.Office : "Regional Office No. VII";
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

        // Bank Account entries default
        model.BankAccounts = new List<OrderOfPaymentBankAccount>
        {
            new OrderOfPaymentBankAccount
            {
                BankName = "Land Bank of the Philippines",
                Amount = op.AmountDue
            }
        };

        // O.R. Stamp Box if paid
        if (!string.IsNullOrWhiteSpace(op.OfficialReceiptNumber))
        {
            model.OrNo = op.OfficialReceiptNumber;
            model.OrAmount = op.AmountReceived > 0 ? $"P{op.AmountReceived:N2}" : $"P{op.AmountDue:N2}";
            model.OrDate = op.PaidAt?.ToString("MMM dd yyyy") ?? op.CreatedAt.ToString("MMM dd yyyy");
            model.OrBy = op.Histories.FirstOrDefault(h => h.Action.Contains("Verified") || h.Action.Contains("Paid"))?.StaffName ?? "Cashier";
        }

        model.CollectingOfficer = "Special Collecting Officer";

        return model;
    }
}

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
        EDGE.Domain.Entities.Application? app = null)
    {
        var model = new OrderOfPaymentModel();

        model.AgencyName = "NATIONAL TELECOMMUNICATIONS COMMISSION";
        model.RegionalOffice = !string.IsNullOrWhiteSpace(app?.Office) ? app.Office : "Regional Office No. VII";
        model.Fund = "General Fund";
        model.Title = "ORDER OF PAYMENT";

        model.SerialNo = op.OpNumber ?? string.Empty;
        model.Date = op.CreatedAt != default
            ? op.CreatedAt.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

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

        model.PayorName = !string.IsNullOrWhiteSpace(soa?.IssuedToName)
            ? soa.IssuedToName
            : (fallbackApplicantName ?? (app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Applicant"));

        model.PayorAddress = !string.IsNullOrWhiteSpace(soa?.IssuedToAddress)
            ? soa.IssuedToAddress
            : (fallbackAddress ?? (app?.User?.CompanyDetail != null ? app.User.CompanyDetail.Address : "N/A"));

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

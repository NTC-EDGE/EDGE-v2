namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// An individual bank account entry for deposit breakdown on the Order of Payment.
/// </summary>
public class OrderOfPaymentBankAccount
{
    public string? No { get; set; }
    public string BankName { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
}

/// <summary>
/// Data model for NTC Order of Payment document.
/// Supports both blank templates and populated sample/production forms.
/// Renders as a 2-up page (Top and Bottom identical copies) on standard A4/Letter paper.
/// </summary>
public class OrderOfPaymentModel
{
    public string AgencyName { get; set; } = "NATIONAL TELECOMMUNICATIONS COMMISSION";
    public string RegionalOffice { get; set; } = "Regional Office No. VII";
    public string Fund { get; set; } = "General Fund";
    public string Title { get; set; } = "ORDER OF PAYMENT";

    public string? SerialNo { get; set; }
    public string? Date { get; set; }

    public string? PayorName { get; set; }
    public string? PayorAddress { get; set; }

    public string? AmountInWords { get; set; }
    public decimal? Amount { get; set; }

    public string? Purpose { get; set; }

    public string? StatementOfAccountNo { get; set; }
    public string? StatementOfAccountDate { get; set; }

    /// <summary>
    /// Bank accounts deposit breakdown.
    /// </summary>
    public List<OrderOfPaymentBankAccount> BankAccounts { get; set; } = new();

    public decimal? TotalAmount { get; set; }

    // Bottom-left O.R. Box / Stamp fields
    public string? OrNo { get; set; }
    public string? OrAmount { get; set; }
    public string? OrDate { get; set; }
    public string? OrBy { get; set; }

    public string? CollectingOfficer { get; set; }
}

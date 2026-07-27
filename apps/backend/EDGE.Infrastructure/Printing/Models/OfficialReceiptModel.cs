namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// Target page orientation for Official Receipt.
/// </summary>
public enum ReceiptOrientation
{
    /// <summary>
    /// Portrait layout: 5.5 x 8.5 inches (396 x 612 points).
    /// </summary>
    Portrait,

    /// <summary>
    /// Landscape layout: 8.5 x 5.5 inches (612 x 396 points).
    /// </summary>
    Landscape
}

/// <summary>
/// Payment instrument selection for Official Receipt.
/// </summary>
public enum PaymentType
{
    Cash,
    TreasuryWarrant,
    Check,
    MoneyOrder,
    CheckOrPmo
}

/// <summary>
/// An individual item line on the Official Receipt nature of collection / details of payment table.
/// </summary>
public class OfficialReceiptItem
{
    public string NatureOfCollection { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
}

/// <summary>
/// Data model for NTC Official Receipt (Accountable Form No. 51).
/// Supports both portrait (396x612 pt) and landscape (612x396 pt) layouts,
/// as well as blank templates and populated receipts.
/// </summary>
public class OfficialReceiptModel
{
    /// <summary>
    /// Target orientation for rendering (Portrait or Landscape).
    /// </summary>
    public ReceiptOrientation Orientation { get; set; } = ReceiptOrientation.Portrait;

    public string AccountableFormNo { get; set; } = "Accountable Form No. 51";
    public string RevisionInfo { get; set; } = "Revised January, 1992";
    public string CopyType { get; set; } = "ORIGINAL";

    public string? Date { get; set; }
    public string? ReceiptNo { get; set; }
    public string? Payor { get; set; }

    /// <summary>
    /// Custom color hex for receipt number (e.g. #3182CE for portrait blue, #D32F2F for landscape red).
    /// </summary>
    public string? ReceiptNumberColor { get; set; }

    /// <summary>
    /// Line items for collection table.
    /// </summary>
    public List<OfficialReceiptItem> Items { get; set; } = new();

    public decimal? TotalAmount { get; set; }
    public string? AmountInWords { get; set; }

    public PaymentType? SelectedPaymentType { get; set; }
    public string? TreasuryWarrantCheckMoneyOrderInfo { get; set; }
    public string? DateOfTreasuryWarrantCheckMoneyOrder { get; set; }

    public string? CollectingOfficer { get; set; }

    /// <summary>
    /// File path or asset relative path to Republic of the Philippines Seal (Left Logo).
    /// </summary>
    public string? LeftLogoPath { get; set; }

    /// <summary>
    /// File path or asset relative path to NTC Seal/Logo (Right Logo).
    /// </summary>
    public string? RightLogoPath { get; set; }

    /// <summary>
    /// Optional signature image bytes for collecting officer.
    /// </summary>
    public byte[]? SignatureImageBytes { get; set; }
}

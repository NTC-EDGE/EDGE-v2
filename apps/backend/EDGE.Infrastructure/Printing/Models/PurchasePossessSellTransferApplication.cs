namespace EDGE.Infrastructure.Printing.Models;

public enum TypeOfApplicationSpecific
{
    Purchase,
    Possess,
    SellTransfer
}

public enum IntendedUse
{
    NewRadioStation,
    AdditionalRadioStation,
    ChangeOfEquipment,
    AdditionalEquipment,
    Storage,
    Other
}

public class SourceOfEquipment
{
    public string NameOfDealer { get; set; } = "";
    public string OrInvoiceNo { get; set; } = "";
    public string AuthorizedSellerBuyer { get; set; } = "";
    public string PermitRslNo { get; set; } = "";
}

/// <summary>
/// NTC 1-09 — Application for Permit to Purchase/Possess/Sell/Transfer.
/// See JSON contract section 4.2. Unlike NTC 1-11, this form carries a single
/// "proposed_station" (not a Stations[] array) plus a dealer/source block —
/// good second example of how a form-specific DTO diverges from the shared
/// ApplicationBase pattern while still reusing Equipment/Station/Payment.
/// </summary>
public class PurchasePossessSellTransferApplication : ApplicationBase
{
    public TypeOfApplicationSpecific TypeOfApplicationSpecific { get; set; }
    public TypeOfRadioService TypeOfRadioService { get; set; }
    public NatureOfService NatureOfService { get; set; }
    public ClassOfStation ClassOfStation { get; set; } = new();
    public string CpcCpcnPaRslNo { get; set; } = "";
    public DateOnly Validity { get; set; }

    // Single station profile, not a Stations[] array — printed separately
    // from the shared Stations collection (which stays empty for this form).
    public Station ProposedStation { get; set; } = new();

    public SourceOfEquipment SourceOfEquipment { get; set; } = new();
    public IntendedUse IntendedUse { get; set; }

    public PurchasePossessSellTransferApplication()
    {
        FormType = "PURCHASE_POSSESS_SELL_TRANSFER";
        FormNo = "NTC 1-09";
    }
}

namespace EDGE.Infrastructure.Printing.Models;

public enum EquipmentDeviceType
{
    WdnIndoor,
    Srd,
    Rfid,
    Srrs,
    PublicTrunkedRadioMobilePortable
}

/// <summary>
/// A registered device row — deliberately NOT the generic Equipment entity.
/// The contract calls this out explicitly (section 4.8 / ERD section "Key
/// relationships"): NTC 1-19 devices only have make/type/model + quantity +
/// serial number, no power output or frequency range, so reusing Equipment
/// would leave those fields always null.
/// </summary>
public class Device
{
    public Guid DeviceId { get; set; }
    public string MakeTypeModel { get; set; } = "";
    public int Quantity { get; set; }
    public string SerialNumber { get; set; } = "";
}

/// <summary>
/// NTC 1-19 — Application for Certificate of Registration.
/// See JSON contract section 4.8. Third example DTO: shows a form that does
/// NOT use the shared Equipment[]/Stations[] blocks at all — it has its own
/// Devices[] collection instead, which the report renders with a bespoke
/// table rather than ComposeEquipmentTable().
/// </summary>
public class CertificateOfRegistrationApplication : ApplicationBase
{
    public EquipmentDeviceType EquipmentDeviceType { get; set; }
    public string PermitToImportNo { get; set; } = "";
    public string InvoiceNo { get; set; } = "";
    public string CpcnPaRslNo { get; set; } = "";
    public DateOnly Validity { get; set; }
    public List<Device> Devices { get; set; } = new();
    public int TotalQuantity => Devices.Sum(d => d.Quantity);

    public CertificateOfRegistrationApplication()
    {
        FormType = "CERTIFICATE_OF_REGISTRATION";
        FormNo = "NTC 1-19";
    }
}

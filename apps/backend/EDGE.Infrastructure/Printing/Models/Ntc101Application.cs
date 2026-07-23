namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// NTC 1-01 — Application Form.
/// </summary>
public class Ntc101Application : ApplicationBase
{
    public string PermitNo { get; set; } = "";
    public string Particulars { get; set; } = "";

    public Ntc101Application()
    {
        FormType = "NTC_1_01";
        FormNo = "NTC 1-01";
    }
}

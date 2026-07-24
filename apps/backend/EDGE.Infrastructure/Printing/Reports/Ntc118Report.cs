using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-18 (Application for Dealer/Manufacturer/Service Center/Retailer/Reseller Permit/CPE Supplier Accreditation).
/// QuestPDF code-driven generator providing fallback document generation.
/// Reuses shared models (Applicant, Payment, Declaration, TypeOfApplication, EntityType) from Shared.cs.
/// </summary>
public class Ntc118Report : FormDocument
{
    private readonly Ntc118Application _app;

    public Ntc118Report(Ntc118Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-18",
        RevisionNo = app.RevisionNo,
        RevisionDate = app.RevisionDate,
        TypeOfApplication = app.TypeOfApplication,
        Applicant = app.Applicant,
        Declaration = app.Declaration,
        Payment = app.Payment
    })
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "APPLICATION FOR DEALER/MANUFACTURER/SERVICE CENTER/RETAILER/RESELLER PERMIT/CPE SUPPLIER ACCREDITATION";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicationTypeAndCategory(col);
            ComposeApplicantDetails(col);
            ComposePersonnelRequired(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeApplicationTypeAndCategory(ColumnDescriptor col)
    {
        SectionHeading(col, "Type of Application & Category");

        col.Item().Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text(t =>
                {
                    t.Span("Type of Application: ").SemiBold();
                    t.Span(_app.TypeOfApplication.ToString());
                });

                if (!string.IsNullOrWhiteSpace(_app.ModificationReason))
                {
                    c.Item().Text(t =>
                    {
                        t.Span("Reason for Modification: ").SemiBold();
                        t.Span(_app.ModificationReason);
                    });
                }
            });

            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Selected Permit Category:").SemiBold();
                var pc = _app.PermitCategory;
                if (pc != null)
                {
                    if (pc.RceDealerTransceiver) c.Item().Text("• RCE Dealer (Radio Transmitter/Transceiver)");
                    if (pc.RceDealerWdnIndoorSrdRfid) c.Item().Text("• RCE Dealer (WDN Indoor/SRD/RFID)");
                    if (pc.RceManufacturer) c.Item().Text("• RCE Manufacturer");
                    if (pc.RceServiceCenter) c.Item().Text("• RCE Service Center");
                    if (pc.MpDealer) c.Item().Text("• Mobile Phone Dealer (MPDP)");
                    if (pc.MpRetailerReseller) c.Item().Text("• Mobile Phone Retailer/Reseller (MPRR)");
                    if (pc.MpServiceCenter) c.Item().Text("• Mobile Phone Service Center (MPSCP)");
                    if (pc.CpeSupplierAccreditation) c.Item().Text("• CPE Supplier Accreditation");
                }
            });
        });
    }

    private void ComposeApplicantDetails(ColumnDescriptor col)
    {
        SectionHeading(col, "Applicant's Details");
        col.Item().Column(c =>
        {
            c.Item().Text(t => { t.Span("Applicant Name: ").SemiBold(); t.Span(_app.Applicant.Name); });
            c.Item().Text(t => { t.Span("Entity Type: ").SemiBold(); t.Span(_app.Applicant.TypeOfEntity == EntityType.Other ? _app.EntityTypeOther ?? "Other" : _app.Applicant.TypeOfEntity.ToString()); });
            if (!string.IsNullOrWhiteSpace(_app.ExistingPermitNo))
            {
                c.Item().Text(t => { t.Span("Permit No: ").SemiBold(); t.Span($"{_app.ExistingPermitNo} (Valid: {_app.ExistingPermitValidity:MM/dd/yy})"); });
            }
            c.Item().Text(t => { t.Span("Address: ").SemiBold(); t.Span(_app.Applicant.Address.ToSingleLine()); });
            c.Item().Text(t => { t.Span("Contact Number: ").SemiBold(); t.Span(_app.Applicant.ContactNumber); });
            c.Item().Text(t => { t.Span("Email Address: ").SemiBold(); t.Span(_app.Applicant.Email); });
        });
    }

    private void ComposePersonnelRequired(ColumnDescriptor col)
    {
        SectionHeading(col, "Personnel Required");

        col.Item().Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Supervising Engineer (PECE/ECE)").Bold();
                var eng = _app.SupervisingEngineer;
                c.Item().Text(t => { t.Span("Name: ").SemiBold(); t.Span(eng.Name); });
                c.Item().Text(t => { t.Span("PECE/ECE No: ").SemiBold(); t.Span(eng.LicenseNo); });
                c.Item().Text(t => { t.Span("Validity: ").SemiBold(); t.Span(eng.ValidityDate != default ? eng.ValidityDate.ToString("MM/dd/yy") : "N/A"); });
            });

            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Technician (ECT)").Bold();
                var tech = _app.Technician;
                c.Item().Text(t => { t.Span("Name: ").SemiBold(); t.Span(tech.Name); });
                c.Item().Text(t => { t.Span("Certificate/ECT No: ").SemiBold(); t.Span(tech.LicenseNo); });
                c.Item().Text(t => { t.Span("Validity: ").SemiBold(); t.Span(tech.ValidityDate != default ? tech.ValidityDate.ToString("MM/dd/yy") : "N/A"); });
            });
        });
    }
}

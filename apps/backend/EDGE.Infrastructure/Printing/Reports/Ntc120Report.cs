using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-20 (Application for Certificate of Registration - VAS / VOIP / PCSOTSP).
/// QuestPDF code-driven generator providing fallback document generation.
/// Reuses shared models (Applicant, Payment, Declaration, TypeOfApplication, EntityType) from Shared.cs.
/// </summary>
public class Ntc120Report : FormDocument
{
    private readonly Ntc120Application _app;

    public Ntc120Report(Ntc120Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-20",
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
        "APPLICATION FOR CERTIFICATE OF REGISTRATION";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicationTypeAndCategory(col);
            ComposeApplicantDetails(col);
            ComposeVasServicesList(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeApplicationTypeAndCategory(ColumnDescriptor col)
    {
        SectionHeading(col, "Type of Application & Registration Category");

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
                c.Item().Text("Registration Category:").SemiBold();
                var cat = _app.RegistrationCategory;
                if (cat != null)
                {
                    if (cat.VasProvider) c.Item().Text("• Value-Added Service (VAS) Provider");
                    if (cat.PcsotspProvider) c.Item().Text("• Public Calling Station/Office PCSOTSP");
                    if (cat.VoipProvider) c.Item().Text("• Voice Over Internet Protocol (VOIP) Provider");
                    if (cat.VoipReseller) c.Item().Text("• Voice Over Internet Protocol (VOIP) Reseller");
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
            if (!string.IsNullOrWhiteSpace(_app.CpcnPaCaNo))
            {
                c.Item().Text(t => { t.Span("CPCN/PA/CA No: ").SemiBold(); t.Span($"{_app.CpcnPaCaNo} (Valid: {_app.CpcnPaCaValidity:MM/dd/yy})"); });
            }
            if (!string.IsNullOrWhiteSpace(_app.CorNo))
            {
                c.Item().Text(t => { t.Span("COR No: ").SemiBold(); t.Span($"{_app.CorNo} (Valid: {_app.CorValidity:MM/dd/yy})"); });
            }
            if (_app.FormerNameInfo != null && _app.FormerNameInfo.IsKnownByFormerName)
            {
                c.Item().Text(t => { t.Span("Former Name: ").SemiBold(); t.Span(_app.FormerNameInfo.FormerName ?? "N/A"); });
            }
            c.Item().Text(t => { t.Span("Address: ").SemiBold(); t.Span(_app.Applicant.Address.ToSingleLine()); });
            c.Item().Text(t => { t.Span("Contact Number: ").SemiBold(); t.Span(_app.Applicant.ContactNumber); });
            c.Item().Text(t => { t.Span("Email Address: ").SemiBold(); t.Span(_app.Applicant.Email); });
        });
    }

    private void ComposeVasServicesList(ColumnDescriptor col)
    {
        SectionHeading(col, "List of Value-Added Services");

        var vas = _app.VasServices;
        if (vas == null) return;

        var selected = new System.Collections.Generic.List<string>();
        if (vas.MessagingService) selected.Add("Messaging Service");
        if (vas.ContentAndProgramService) selected.Add("Content & Program Service");
        if (vas.AudioConferencing) selected.Add("Audio Conferencing");
        if (vas.AudiotextService) selected.Add("Audiotext Service");
        if (vas.AudioAndVideoConferencing) selected.Add("Audio & Video Conferencing");
        if (vas.FacsimileService) selected.Add("Facsimile Service");
        if (vas.VoiceMailService) selected.Add("Voice Mail Service");
        if (vas.VirtualPrivateNetworkService) selected.Add("Virtual Private Network (VPN) Service");
        if (vas.ElectronicMailService) selected.Add("Electronic Mail Service");
        if (vas.HostingService) selected.Add("Hosting Service");
        if (vas.InformationService) selected.Add("Information Service");
        if (vas.ElectronicGamingServices) selected.Add("Electronic Gaming Services");
        if (vas.ApplicationService) selected.Add("Application Service");
        if (vas.Others && !string.IsNullOrWhiteSpace(vas.OthersSpecify)) selected.Add($"Others: {vas.OthersSpecify}");

        col.Item().Column(c =>
        {
            foreach (var item in selected)
            {
                c.Item().Text($"• {item}");
            }
        });
    }
}

using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-21 (Application for Duplicate of Permit/License/Certificate).
/// </summary>
public static class Ntc121FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc121Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. Applicant Details
        var p = app.ApplicantPerson;
        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.LastName, p.LastName));
        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.FirstName, p.FirstName));
        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.MiddleName, p.MiddleName));

        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.UnitRoomBldgNo, p.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.Street, p.Address.Street));

        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.Barangay, p.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.CityMunicipality, p.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.Province, p.Address.Province));
        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.ZipCode, p.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.ContactNumber, p.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc121Fields.Applicant.Email, p.Email));

        // 2. Circumstances of Loss / Mutilation
        if (!string.IsNullOrWhiteSpace(app.CircumstancesOfLossMutilation))
        {
            items.Add(new TextFieldOverlay(Ntc121Fields.CircumstancesOfLossMutilation, app.CircumstancesOfLossMutilation));
        }

        // 3. Permit / License / Certificate Details
        items.Add(new TextFieldOverlay(Ntc121Fields.PermitLicenseCert.Type, app.PermitLicenseCertType));
        items.Add(new TextFieldOverlay(Ntc121Fields.PermitLicenseCert.Number, app.PermitLicenseCertNo));
        if (app.PermitLicenseCertValidity != default)
        {
            items.Add(new TextFieldOverlay(Ntc121Fields.PermitLicenseCert.Validity, app.PermitLicenseCertValidity.ToString("MM/dd/yyyy")));
        }

        // 4. Declaration & Signature
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc121Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc121Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 5. Official Receipt Box
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc121Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc121Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc121Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc121Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc121Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }
}

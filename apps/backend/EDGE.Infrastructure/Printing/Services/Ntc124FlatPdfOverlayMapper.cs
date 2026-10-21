using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-24 (Affidavit of Ownership and Loss with Undertaking).
/// </summary>
public static class Ntc124FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc124Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. Action Requested (Block / Unblock)
        var actionField = app.ActionRequested == ActionRequested124.Unblock ? Ntc124Fields.ActionRequested.Unblock : Ntc124Fields.ActionRequested.Block;
        items.Add(new CheckboxFieldOverlay(actionField, true));

        // 2. Affiant Details
        items.Add(new TextFieldOverlay(Ntc124Fields.Affiant.Name, app.AffiantName));
        items.Add(new TextFieldOverlay(Ntc124Fields.Affiant.Address, app.ResidentialAddress.ToSingleLine()));
        items.Add(new TextFieldOverlay(Ntc124Fields.Affiant.TelephoneNumber, app.TelephoneNumber));
        items.Add(new TextFieldOverlay(Ntc124Fields.Affiant.OfficeAddress, app.OfficeAddress.ToSingleLine()));
        items.Add(new TextFieldOverlay(Ntc124Fields.Affiant.OfficeTelephoneNumber, app.OfficeTelephoneNumber));

        // 3. Mobile Particulars
        items.Add(new TextFieldOverlay(Ntc124Fields.MobileDetails.ImeiNo, app.ImeiNo));
        items.Add(new TextFieldOverlay(Ntc124Fields.MobileDetails.MakeModelType, app.MakeModelType));
        items.Add(new TextFieldOverlay(Ntc124Fields.MobileDetails.SimMobileNumber, app.SimMobileNumber));

        // 4. Proof of Ownership Checkboxes
        var p = app.ProofOfOwnership;
        if (p.CopyGovernmentId) items.Add(new CheckboxFieldOverlay(Ntc124Fields.ProofOfOwnership.CopyGovernmentId, true));
        if (p.CopySchoolId) items.Add(new CheckboxFieldOverlay(Ntc124Fields.ProofOfOwnership.CopySchoolId, true));
        if (p.CopyBirthCertOrNbi) items.Add(new CheckboxFieldOverlay(Ntc124Fields.ProofOfOwnership.CopyBirthCertOrNbi, true));
        if (p.ProofOfOwnershipReceipt) items.Add(new CheckboxFieldOverlay(Ntc124Fields.ProofOfOwnership.ProofOfOwnershipReceipt, true));
        if (p.BoxWithImei) items.Add(new CheckboxFieldOverlay(Ntc124Fields.ProofOfOwnership.BoxWithImei, true));
        if (p.CertificateOfPurchase) items.Add(new CheckboxFieldOverlay(Ntc124Fields.ProofOfOwnership.CertificateOfPurchase, true));
        if (p.AffidavitInAbsence) items.Add(new CheckboxFieldOverlay(Ntc124Fields.ProofOfOwnership.AffidavitInAbsence, true));

        // 5. Incident Details
        var inc = app.Incident;
        var incidentTypeField = inc.IncidentType == IncidentType124.Stolen ? Ntc124Fields.Incident.Stolen : inc.IncidentType == IncidentType124.LostMisplaced ? Ntc124Fields.Incident.LostMisplaced : null;
        if (incidentTypeField != null) items.Add(new CheckboxFieldOverlay(incidentTypeField, true));



        var sexField = inc.Sex == Sex.Male ? Ntc124Fields.Incident.Male : Ntc124Fields.Incident.Female;
        items.Add(new CheckboxFieldOverlay(sexField, true));

        var ageGroupField = inc.AgeGroup switch
        {
            AgeGroup124.Below18 => Ntc124Fields.Incident.Below18,
            AgeGroup124.Age18_29 => Ntc124Fields.Incident.Age18_29,
            AgeGroup124.Age30_39 => Ntc124Fields.Incident.Age30_39,
            AgeGroup124.Age40_49 => Ntc124Fields.Incident.Age40_49,
            AgeGroup124.Age50_59 => Ntc124Fields.Incident.Age50_59,
            AgeGroup124.Age60Up => Ntc124Fields.Incident.Age60Up,
            _ => Ntc124Fields.Incident.Age18_29
        };
        items.Add(new CheckboxFieldOverlay(ageGroupField, true));

        var timeOfDayField = inc.TimeOfDay == TimeOfDay124.Nighttime ? Ntc124Fields.Incident.Nighttime : Ntc124Fields.Incident.Daytime;
        items.Add(new CheckboxFieldOverlay(timeOfDayField, true));

        items.Add(new TextFieldOverlay(Ntc124Fields.Incident.PlaceOfIncident, inc.PlaceOfIncident));
        if (inc.DateOfIncident != default)
        {
            items.Add(new TextFieldOverlay(Ntc124Fields.Incident.DateOfIncident, inc.DateOfIncident.ToString("MM/dd/yyyy")));
        }

        // 6. Signatory
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc124Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }

        // 7. Notary Public
        var np = app.NotaryPublic;
        if (!string.IsNullOrWhiteSpace(np.SubscribedDay)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.SubscribedDay, np.SubscribedDay));
        if (!string.IsNullOrWhiteSpace(np.SubscribedMonthYear)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.SubscribedMonthYear, np.SubscribedMonthYear));
        if (!string.IsNullOrWhiteSpace(np.ResidenceCertNo)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.ResidenceCertNo, np.ResidenceCertNo));
        if (!string.IsNullOrWhiteSpace(np.IssuedAt)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.IssuedAt, np.IssuedAt));
        if (!string.IsNullOrWhiteSpace(np.IssuedDate)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.IssuedDate, np.IssuedDate));

        if (!string.IsNullOrWhiteSpace(np.DocNo)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.DocNo, np.DocNo));
        if (!string.IsNullOrWhiteSpace(np.PageNo)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.PageNo, np.PageNo));
        if (!string.IsNullOrWhiteSpace(np.BookNo)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.BookNo, np.BookNo));
        if (!string.IsNullOrWhiteSpace(np.SeriesOf)) items.Add(new TextFieldOverlay(Ntc124Fields.NotaryPublic.SeriesOf, np.SeriesOf));

        return items;
    }
}

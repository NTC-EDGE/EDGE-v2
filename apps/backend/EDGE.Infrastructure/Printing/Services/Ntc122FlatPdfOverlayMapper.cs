using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-22 (Application for TVRO / CATV Station License / Registration).
/// </summary>
public static class Ntc122FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc122Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. Type of Application
        var actionField = app.TypeOfApplication == TypeOfApplication.Renewal ? Ntc122Fields.TypeOfApplication.Renewal : Ntc122Fields.TypeOfApplication.New;
        items.Add(new CheckboxFieldOverlay(actionField, true));

        // 2. Type of License / Certificate
        var certField = app.TypeOfLicenseCert switch
        {
            TypeOfLicenseCert122.TvroRegistrationCert => Ntc122Fields.TypeOfLicenseCert.TvroRegistrationCert,
            TypeOfLicenseCert122.TvroStationLicense => Ntc122Fields.TypeOfLicenseCert.TvroStationLicense,
            TypeOfLicenseCert122.CatvStationLicense => Ntc122Fields.TypeOfLicenseCert.CatvStationLicense,
            _ => Ntc122Fields.TypeOfLicenseCert.TvroRegistrationCert
        };
        items.Add(new CheckboxFieldOverlay(certField, true));

        // 3. Classification of Applicant & No. of Years
        var classField = app.ClassificationOfApplicant switch
        {
            ClassificationOfApplicant122.CommercialBroadcasting => Ntc122Fields.ClassificationOfApplicant.CommercialBroadcasting,
            ClassificationOfApplicant122.NonCommercial => Ntc122Fields.ClassificationOfApplicant.NonCommercial,
            ClassificationOfApplicant122.Catv => Ntc122Fields.ClassificationOfApplicant.Catv,
            ClassificationOfApplicant122.Others => Ntc122Fields.ClassificationOfApplicant.Others,
            _ => Ntc122Fields.ClassificationOfApplicant.CommercialBroadcasting
        };
        items.Add(new CheckboxFieldOverlay(classField, true));

        if (app.ClassificationOfApplicant == ClassificationOfApplicant122.Others && !string.IsNullOrWhiteSpace(app.ClassificationOthersDetails))
        {
            items.Add(new TextFieldOverlay(Ntc122Fields.ClassificationOfApplicant.OthersDetails, app.ClassificationOthersDetails));
        }

        if (app.NoOfYears.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc122Fields.ClassificationOfApplicant.NoOfYears, app.NoOfYears.Value.ToString()));
        }

        // 4. Applicant Details
        var a = app.Applicant;
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Name, a.Name));

        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.UnitRoomBldgNo, a.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Street, a.Address.Street));

        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Barangay, a.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.CityMunicipality, a.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Province, a.Address.Province));
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.ZipCode, a.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.ContactNumber, a.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Email, a.Email));

        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.PaCaNo, app.PaCaNo));
        if (app.Validity != default)
        {
            items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Validity, app.Validity.ToString("MM/dd/yy")));
        }

        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.ServiceArea, app.ServiceArea));

        var st = app.ProposedStation;
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.ExactLocation, st.ExactLocation));
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Longitude, st.Longitude));
        items.Add(new TextFieldOverlay(Ntc122Fields.Applicant.Latitude, st.Latitude));

        // 5. Equipment Particulars
        var eq = app.Equipment;
        items.Add(new TextFieldOverlay(Ntc122Fields.Equipment.MakeTypeModel, eq.MakeTypeModel));
        items.Add(new TextFieldOverlay(Ntc122Fields.Equipment.SerialNumber, eq.SerialNumber));
        items.Add(new TextFieldOverlay(Ntc122Fields.Equipment.FrequencyRange, eq.FrequencyRange));

        // 6. Antenna System
        var ant = app.AntennaSystem;
        items.Add(new TextFieldOverlay(Ntc122Fields.AntennaSystem.DishDiameter, ant.DishDiameter));
        items.Add(new TextFieldOverlay(Ntc122Fields.AntennaSystem.Polarization, ant.Polarization));
        items.Add(new TextFieldOverlay(Ntc122Fields.AntennaSystem.Azimuth, ant.Azimuth));

        // 7. Signal To Be Received
        var sig = app.SignalToBeReceived;
        items.Add(new TextFieldOverlay(Ntc122Fields.SignalToBeReceived.Satellite, sig.Satellite));
        items.Add(new TextFieldOverlay(Ntc122Fields.SignalToBeReceived.Polarization, sig.Polarization));
        items.Add(new TextFieldOverlay(Ntc122Fields.SignalToBeReceived.ReceivedFrequency, sig.ReceivedFrequency));
        items.Add(new TextFieldOverlay(Ntc122Fields.SignalToBeReceived.NameOfPrograms, sig.NameOfPrograms));

        // 8. Declaration & Signature
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc122Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc122Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 9. Official Receipt Box
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc122Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc122Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc122Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc122Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc122Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }
}

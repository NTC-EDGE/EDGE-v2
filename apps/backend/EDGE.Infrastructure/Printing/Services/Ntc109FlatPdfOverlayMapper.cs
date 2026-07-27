using System.Collections.Generic;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-09 (Purchase/Possess/Sell/Transfer Application).
/// </summary>
public static class Ntc109FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(PurchasePossessSellTransferApplication app)
    {
        var items = new List<FieldOverlay>();

        // 1. TYPE OF APPLICATION
        var appTypeField = app.TypeOfApplicationSpecific switch
        {
            TypeOfApplicationSpecific.Purchase => Ntc109Fields.TypeOfApplication.Purchase,
            TypeOfApplicationSpecific.Possess => Ntc109Fields.TypeOfApplication.Possess,
            TypeOfApplicationSpecific.SellTransfer => Ntc109Fields.TypeOfApplication.SellTransfer,
            _ => Ntc109Fields.TypeOfApplication.Purchase
        };
        items.Add(new CheckboxFieldOverlay(appTypeField, true));

        // 2. TYPE OF RADIO SERVICE
        var radioServiceField = app.TypeOfRadioService switch
        {
            TypeOfRadioService.FixedAndLandMobile => Ntc109Fields.TypeOfRadioService.FixedAndLandMobile,
            TypeOfRadioService.Aeronautical => Ntc109Fields.TypeOfRadioService.Aeronautical,
            TypeOfRadioService.MaritimePublicPrivateCoastal => Ntc109Fields.TypeOfRadioService.MaritimePublicPrivateCoastal,
            TypeOfRadioService.Broadcast => Ntc109Fields.TypeOfRadioService.Broadcast,
            TypeOfRadioService.Amateur => Ntc109Fields.TypeOfRadioService.Amateur,
            TypeOfRadioService.Other => Ntc109Fields.TypeOfRadioService.Other,
            _ => Ntc109Fields.TypeOfRadioService.FixedAndLandMobile
        };
        items.Add(new CheckboxFieldOverlay(radioServiceField, true));

        // 3. NATURE OF SERVICE
        var natureField = app.NatureOfService switch
        {
            NatureOfService.CvPrivate => Ntc109Fields.NatureOfService.CvPrivate,
            NatureOfService.CoGovernment => Ntc109Fields.NatureOfService.CoGovernment,
            NatureOfService.CpPublicCorrespondence => Ntc109Fields.NatureOfService.CpPublicCorrespondence,
            _ => Ntc109Fields.NatureOfService.CvPrivate
        };
        items.Add(new CheckboxFieldOverlay(natureField, true));

        // 4. CLASS OF STATION
        if (app.ClassOfStation != null)
        {
            var stationCounts = new (string code, int count, PdfField field)[]
            {
                ("RT", app.ClassOfStation.RT, Ntc109Fields.ClassOfStation.RT),
                ("ML", app.ClassOfStation.ML, Ntc109Fields.ClassOfStation.ML),
                ("FC", app.ClassOfStation.FC, Ntc109Fields.ClassOfStation.FC),
                ("TC", app.ClassOfStation.TC, Ntc109Fields.ClassOfStation.TC),
                ("FX", app.ClassOfStation.FX, Ntc109Fields.ClassOfStation.FX),
                ("P",  app.ClassOfStation.P,  Ntc109Fields.ClassOfStation.P),
                ("FA", app.ClassOfStation.FA, Ntc109Fields.ClassOfStation.FA),
                ("FB", app.ClassOfStation.FB, Ntc109Fields.ClassOfStation.FB),
                ("BC", app.ClassOfStation.BC, Ntc109Fields.ClassOfStation.BC),
                ("MA", app.ClassOfStation.MA, Ntc109Fields.ClassOfStation.MA)
            };

            foreach (var (_, count, field) in stationCounts)
            {
                if (count > 0)
                {
                    items.Add(new TextFieldOverlay(field, count.ToString()));
                }
            }

            if (!string.IsNullOrWhiteSpace(app.ClassOfStation.Other))
            {
                items.Add(new TextFieldOverlay(Ntc109Fields.ClassOfStation.Other, app.ClassOfStation.Other));
            }
        }

        // 5. APPLICANT'S DETAILS
        var a = app.Applicant;
        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.Name, a.Name));
        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.CpcCpcnPaRslNo, app.CpcCpcnPaRslNo));
        if (app.Validity != default)
        {
            items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.Validity, app.Validity.ToString("MM/dd/yy")));
        }

        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.UnitRoomBldgNo, a.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.Street, a.Address.Street));

        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.Barangay, a.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.CityMunicipality, a.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.Province, a.Address.Province));
        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.ZipCode, a.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.ContactNumber, a.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc109Fields.Applicant.Email, a.Email));

        // 6. PARTICULARS OF PROPOSED STATION/EQUIPMENT
        var st = app.ProposedStation;
        var eq = app.Equipment.FirstOrDefault() ?? new Equipment();
        string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
            ? $"{eq.Make} {eq.TypeModel}".Trim()
            : eq.RadioEquipment;

        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.ExactLocation, st.ExactLocation));
        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.MakeModel, makeModel));

        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.Longitude, st.Longitude));
        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.SerialNumber, eq.SerialNumber));

        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.Latitude, st.Latitude));
        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.BwEmission, st.BwEmission));

        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.PointsOfCommServiceArea, st.PointsOfCommServiceArea));
        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.PowerOutput, eq.PowerOutput));

        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.AssignedFreq, st.AssignedFreq));
        items.Add(new TextFieldOverlay(Ntc109Fields.ProposedStation.FrequencyRange, eq.FrequencyRange));

        // 7. SOURCE OF EQUIPMENT
        var src = app.SourceOfEquipment;
        items.Add(new TextFieldOverlay(Ntc109Fields.SourceOfEquipment.NameOfDealer, src.NameOfDealer));
        items.Add(new TextFieldOverlay(Ntc109Fields.SourceOfEquipment.OrInvoiceNo, src.OrInvoiceNo));

        items.Add(new TextFieldOverlay(Ntc109Fields.SourceOfEquipment.AuthorizedSellerBuyer, src.AuthorizedSellerBuyer));
        items.Add(new TextFieldOverlay(Ntc109Fields.SourceOfEquipment.PermitRslNo, src.PermitRslNo));

        // 8. INTENDED USE OF EQUIPMENT
        var intendedField = app.IntendedUse switch
        {
            IntendedUse.NewRadioStation => Ntc109Fields.IntendedUse.NewRadioStation,
            IntendedUse.AdditionalEquipment => Ntc109Fields.IntendedUse.AdditionalEquipment,
            IntendedUse.AdditionalRadioStation => Ntc109Fields.IntendedUse.AdditionalRadioStation,
            IntendedUse.Storage => Ntc109Fields.IntendedUse.Storage,
            IntendedUse.ChangeOfEquipment => Ntc109Fields.IntendedUse.ChangeOfEquipment,
            IntendedUse.Other => Ntc109Fields.IntendedUse.Other,
            _ => Ntc109Fields.IntendedUse.NewRadioStation
        };
        items.Add(new CheckboxFieldOverlay(intendedField, true));

        if (app.IntendedUse == IntendedUse.Storage && !string.IsNullOrWhiteSpace(st.ExactLocation))
        {
            items.Add(new TextFieldOverlay(Ntc109Fields.IntendedUse.StorageLocation, st.ExactLocation));
        }
        else if (app.IntendedUse == IntendedUse.Other && !string.IsNullOrWhiteSpace(st.Others))
        {
            items.Add(new TextFieldOverlay(Ntc109Fields.IntendedUse.OtherDetails, st.Others));
        }

        // 9. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc109Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc109Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 10. OFFICIAL RECEIPT BOX
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc109Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc109Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc109Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc109Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc109Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(PurchasePossessSellTransferApplication app)
    {
        var items = new List<TextOverlayItem>();
        foreach (var fieldOverlay in MapToFieldOverlays(app))
        {
            if (fieldOverlay is TextFieldOverlay text)
            {
                items.Add(new TextOverlayItem
                {
                    X = text.Field.X,
                    Y = text.Field.Y,
                    Text = text.Text,
                    FontSize = text.Field.FontSize,
                    IsBold = text.Field.IsBold
                });
            }
            else if (fieldOverlay is CheckboxFieldOverlay check && check.IsChecked)
            {
                items.Add(new TextOverlayItem
                {
                    X = check.Field.X,
                    Y = check.Field.Y,
                    Text = "✔",
                    FontSize = check.Field.FontSize,
                    IsBold = check.Field.IsBold
                });
            }
        }
        return items;
    }
}

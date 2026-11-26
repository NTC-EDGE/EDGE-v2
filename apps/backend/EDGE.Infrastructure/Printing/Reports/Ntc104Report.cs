using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-04 — Application for Ship Station License / Maritime License.
/// QuestPDF code-driven generator providing 1:1 official fallback document generation.
/// </summary>
public class Ntc104Report : FormDocument
{
    private readonly Ntc104Application _app;

    public Ntc104Report(Ntc104Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-04",
        RevisionNo = app.RevisionNo,
        RevisionDate = app.RevisionDate,
        TypeOfApplication = app.TypeOfApplication,
        ModificationReason = app.ModificationReason,
        NoOfYears = app.NoOfYears,
        Applicant = app.Applicant,
        Equipment = app.Equipment,
        Declaration = app.Declaration,
        Payment = app.Payment
    })
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "APPLICATION FOR SHIP STATION LICENSE / MARITIME LICENSE";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicationTypeAndLicenseCategory(col);
            ComposeApplicant(col);
            ComposeVesselParticulars(col);
            ComposeEquipmentTable(col);
            ComposeRadioOfficersTable(col);
            ComposePayment(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeApplicationTypeAndLicenseCategory(ColumnDescriptor col)
    {
        SectionHeading(col, "Type of Application & Maritime License Category");

        col.Item().Row(row =>
        {
            row.RelativeItem(1).Column(c =>
            {
                c.Item().Text("Type of Application:").SemiBold();
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.New)} NEW");
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.Renewal)} RENEWAL");
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.Modification)} MODIFICATION");

                if (!string.IsNullOrWhiteSpace(_app.ModificationReason))
                {
                    c.Item().PaddingTop(2).Text(t =>
                    {
                        t.Span("Reason for Modification: ").SemiBold();
                        t.Span(_app.ModificationReason);
                    });
                }

                c.Item().PaddingTop(2).Text(t =>
                {
                    t.Span("No. of Years: ").SemiBold();
                    t.Span(_app.NoOfYears?.ToString() ?? "N/A");
                });
            });

            row.RelativeItem(1.5f).Column(c =>
            {
                c.Item().Text("License / Permit / Certificate Category:").SemiBold();
                var tp = _app.TypeOfPermitLicenseCert;
                var tr = _app.TradingRoute;
                bool isPrivateCoastal = _app.VesselCategory == VesselCategory.Others &&
                                        (_app.OtherVesselCategoryDetails?.Contains("Private Coastal", StringComparison.OrdinalIgnoreCase) ?? false);
                bool isPublicCoastal = _app.VesselCategory == VesselCategory.Others &&
                                       (_app.OtherVesselCategoryDetails?.Contains("Public Coastal", StringComparison.OrdinalIgnoreCase) ?? false);

                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert104.ShipStationLicense && tr == TradingRoute.Domestic)} Ship Station License (Domestic)");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert104.ShipStationLicense && tr == TradingRoute.International)} Ship Station License (International)");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert104.ShipEarthStationLicense)} Ship Earth Station License");
                c.Item().Text($"{Checkbox(isPrivateCoastal)} Private Coastal Station License");
                c.Item().Text($"{Checkbox(isPublicCoastal)} Public Coastal Station License");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert104.CargoShipSafetyRadioCertificate)} Cargo Ship Safety Radio Certificate");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert104.TemporaryPermit)} Temporary Permit");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert104.FerryingPermit)} Ferrying Permit");
            });

            row.RelativeItem(1).Column(c =>
            {
                c.Item().Text("Vessel Category & Trading Area:").SemiBold();
                c.Item().Text($"{Checkbox(_app.VesselCategory == VesselCategory.Ship)} Ship");
                c.Item().Text($"{Checkbox(_app.VesselCategory == VesselCategory.Aircraft)} Aircraft");
                c.Item().Text($"{Checkbox(_app.VesselCategory == VesselCategory.Others)} Others: {_app.OtherVesselCategoryDetails ?? ""}");
                c.Item().PaddingTop(2).Text($"Trading Area: {Checkbox(_app.TradingRoute == TradingRoute.Domestic)} Domestic   {Checkbox(_app.TradingRoute == TradingRoute.International)} International");
            });
        });
    }

    private void ComposeVesselParticulars(ColumnDescriptor col)
    {
        SectionHeading(col, "Vessel Particulars");
        var sh = _app.ShipDetails;

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(cd =>
            {
                cd.RelativeColumn();
                cd.RelativeColumn();
                cd.RelativeColumn();
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Vessel Name: ").SemiBold(); t.Span(sh.NameOfShipVessel); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Call Sign: ").SemiBold(); t.Span(sh.CallSign); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Station License No.: ").SemiBold(); t.Span(sh.StationLicenseNo); });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("MMSI / Gross Tonnage: ").SemiBold(); t.Span(sh.MmsiNo); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("IMO No. / Net Tonnage: ").SemiBold(); t.Span(sh.ImoNo); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("License Validity: ").SemiBold(); t.Span(sh.Validity != default ? sh.Validity.ToString("MM/dd/yyyy") : ""); });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Trading Area: ").SemiBold(); t.Span(_app.TradingRoute.ToString()); });
            table.Cell().ColumnSpan(2).Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Homeport / Details: ").SemiBold(); t.Span(!string.IsNullOrWhiteSpace(_app.OtherVesselCategoryDetails) ? _app.OtherVesselCategoryDetails : _app.Applicant.Address.CityMunicipality); });
        });
    }

    private void ComposeRadioOfficersTable(ColumnDescriptor col)
    {
        SectionHeading(col, "Particulars of Radio Officers / Operators");

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.ConstantColumn(30);
                c.RelativeColumn(2);
                c.RelativeColumn(1.5f);
                c.RelativeColumn(1);
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("#").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Name of Radio Officer / Operator").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Certificate Number").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Validity").Bold().FontSize(8);
            });

            int count = Math.Max(2, _app.Operators.Count);
            for (int i = 0; i < count; i++)
            {
                var op = i < _app.Operators.Count ? _app.Operators[i] : null;
                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text((i + 1).ToString()).FontSize(8);
                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(op?.Name ?? "").FontSize(8);
                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(op?.CertificateNumber ?? "").FontSize(8);
                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(op != null && op.Validity != default ? op.Validity.ToString("MM/dd/yyyy") : "").FontSize(8);
            }
        });
    }

    private static string Checkbox(bool isChecked) => isChecked ? "[✔]" : "[  ]";
}

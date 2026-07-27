using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-19 — Application for Certificate of Registration.
/// Re-architected to mimic the official NTC 1-19 PDF form design 1:1.
/// </summary>
public class CertificateOfRegistrationReport : IDocument
{
    private readonly CertificateOfRegistrationApplication _app;

    public CertificateOfRegistrationReport(CertificateOfRegistrationApplication app)
    {
        _app = app;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(18);
            page.DefaultTextStyle(x => x.FontSize(7.5f).FontFamily(Fonts.Arial));

            page.Content().Border(1.2f).BorderColor(Colors.Black).Padding(8).Column(col =>
            {
                ComposeHeader(col);
                ComposeTitle(col);
                ComposeInstructions(col);
                ComposeEquipmentType(col);
                ComposeApplicantDetails(col);
                ComposeParticularsTable(col);
                ComposeDeclarationSection(col);
                ComposeFooterAndOrBox(col);
            });
        });
    }

    private void ComposeHeader(ColumnDescriptor col)
    {
        col.Item().Row(row =>
        {
            // Left: NTC Seal Representation
            row.ConstantItem(55).Height(55).Element(e =>
            {
                e.Border(1.5f).BorderColor(Colors.Red.Medium).Padding(2).Column(c =>
                {
                    c.Item().AlignCenter().Text("NATIONAL").FontSize(5).Bold().FontColor(Colors.Blue.Darken2);
                    c.Item().AlignCenter().Text("TELECOMMUNICATIONS").FontSize(4).Bold().FontColor(Colors.Red.Medium);
                    c.Item().AlignCenter().Text("NTC").FontSize(8).Bold().FontColor(Colors.Black);
                    c.Item().AlignCenter().Text("COMMISSION").FontSize(5).Bold().FontColor(Colors.Blue.Darken2);
                });
            });

            // Center: Department / Commission Info
            row.RelativeItem().PaddingLeft(10).Column(c =>
            {
                c.Item().Text("Republic of the Philippines").FontSize(8);
                c.Item().Text("NATIONAL TELECOMMUNICATIONS COMMISSION").FontSize(10).Bold();
                c.Item().Text("BIR Road, East Triangle, Diliman, Quezon City").FontSize(8);
            });

            // Right: Form Meta Box (Dashed Border)
            row.ConstantItem(150).Border(1).BorderColor(Colors.Black).Padding(4).Column(c =>
            {
                c.Item().Row(r =>
                {
                    r.RelativeItem().Text("Form No.").FontSize(7.5f);
                    r.AutoItem().Text(_app.FormNo).Bold().Underline().FontSize(8.5f);
                });
                c.Item().Row(r =>
                {
                    r.RelativeItem().Text("Revision No.").FontSize(7.5f);
                    r.AutoItem().Text(!string.IsNullOrWhiteSpace(_app.RevisionNo) ? _app.RevisionNo : "02").Underline().FontSize(7.5f);
                });
                c.Item().Row(r =>
                {
                    r.RelativeItem().Text("Revision Date").FontSize(7.5f);
                    r.AutoItem().Text(_app.RevisionDate != default ? _app.RevisionDate.ToString("MM/dd/yyyy") : "03/31/2023").Underline().FontSize(7.5f);
                });
            });
        });
    }

    private void ComposeTitle(ColumnDescriptor col)
    {
        col.Item().PaddingTop(5).Background(Colors.Grey.Lighten3).Border(1).BorderColor(Colors.Black).Padding(3)
            .AlignCenter().Text("APPLICATION FOR CERTIFICATE OF REGISTRATION").Bold().FontSize(9.5f);
    }

    private void ComposeInstructions(ColumnDescriptor col)
    {
        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Black).Padding(4).Column(c =>
        {
            c.Item().Text("INSTRUCTIONS:").Bold().Underline().FontSize(7.5f);
            c.Item().PaddingTop(1).Text("(1) Accomplish this application form properly, in ALL CAPS, handwritten or computer-printed.").FontSize(7.5f);
            c.Item().Text(t =>
            {
                t.Span("(2) Attach the complete requirements including supporting documents. For the List of requirements,").FontSize(7.5f);
                t.Span(" please refer to the ").FontSize(7.5f);
                t.Span("NTC Citizen's Charter").Bold().Italic().FontSize(7.5f);
                t.Span(" at the NTC website: ").FontSize(7.5f);
                t.Span("ntc.gov.ph").FontColor(Colors.Blue.Medium).Underline().FontSize(7.5f);
            });
            c.Item().Text("(3) Check (\u2714) appropriate box. Indicate \"N/A\" for items not applicable.").FontSize(7.5f);
        });
    }

    private void ComposeEquipmentType(ColumnDescriptor col)
    {
        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Black).Column(c =>
        {
            c.Item().Background(Colors.Grey.Lighten3).Padding(2).Text("TYPE OF EQUIPMENT/DEVICE").Bold().FontSize(8);

            var types = new[]
            {
                (EquipmentDeviceType.WdnIndoor, "WIRELESS DATA NETWORK (WDN) DEVICES - INDOOR"),
                (EquipmentDeviceType.Srd, "SHORT RANGE DEVICES (SRD)"),
                (EquipmentDeviceType.Rfid, "RADIO FREQUENCY IDENTIFICATION (RFID) DEVICES"),
                (EquipmentDeviceType.Srrs, "SHORT RANGE RADIO SERVICE (SRRS) DEVICES"),
                (EquipmentDeviceType.PublicTrunkedRadioMobilePortable, "PUBLIC TRUNKED RADIO EQUIPMENT (MOBILE/PORTABLE)")
            };

            foreach (var (typeEnum, label) in types)
            {
                var isChecked = _app.EquipmentDeviceType == typeEnum;
                c.Item().BorderTop(0.5f).BorderColor(Colors.Grey.Lighten1).Row(r =>
                {
                    r.ConstantItem(30).BorderRight(0.5f).BorderColor(Colors.Grey.Lighten1)
                        .Background(isChecked ? Colors.Blue.Lighten5 : Colors.White)
                        .AlignCenter().AlignMiddle().Text(isChecked ? "\u2714" : "").Bold().FontSize(8);
                    r.RelativeItem().PaddingLeft(6).PaddingVertical(1.5f).Text(label).SemiBold().FontSize(7.5f);
                });
            }
        });
    }

    private void ComposeApplicantDetails(ColumnDescriptor col)
    {
        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Black).Column(c =>
        {
            c.Item().Background(Colors.Grey.Lighten3).Padding(2).Text("APPLICANT'S DETAILS").Bold().FontSize(8);

            var a = _app.Applicant;

            c.Item().Table(table =>
            {
                table.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(120);
                    cd.RelativeColumn();
                    cd.ConstantColumn(110);
                    cd.RelativeColumn();
                });

                void AddGridRow(string label1, string val1, string label2, string val2)
                {
                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.White).Padding(2).Text(label1).FontSize(7.5f);
                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Blue.Lighten5).Padding(2).Text(val1).Bold().FontSize(7.5f);
                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.White).Padding(2).Text(label2).FontSize(7.5f);
                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Blue.Lighten5).Padding(2).Text(val2).Bold().FontSize(7.5f);
                }

                // Row 1: Applicant Name
                table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.White).Padding(2).Text("Applicant").FontSize(7.5f);
                table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Black).Background(Colors.Blue.Lighten5).Padding(2).Text(a.Name).Bold().FontSize(7.5f);

                // Row 2-7
                AddGridRow("Unit/Rm/Bldg No.", a.Address.UnitRoomBldgNo, "Street", a.Address.Street);
                AddGridRow("Barangay", a.Address.Barangay, "City/Municipality", a.Address.CityMunicipality);
                AddGridRow("Province", a.Address.Province, "Zip Code", a.Address.ZipCode);
                AddGridRow("Contact Number", a.ContactNumber, "Email Address", a.Email);
                AddGridRow("Permit to Import No.", _app.PermitToImportNo, "Invoice No.", _app.InvoiceNo);
                AddGridRow("CPCN/PA/RSL No.", _app.CpcnPaRslNo, "Validity (mm/dd/yy)", _app.Validity != default ? _app.Validity.ToString("MM/dd/yy") : "");
            });
        });
    }

    private void ComposeParticularsTable(ColumnDescriptor col)
    {
        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Black).Column(c =>
        {
            c.Item().Background(Colors.Grey.Lighten3).Padding(2).Text(t =>
            {
                t.Span("PARTICULARS OF EQUIPMENT & DEVICES ").Bold().FontSize(8);
                t.Span("(Use separate sheet/s, if necessary)").Italic().FontSize(7.5f);
            });

            c.Item().Table(table =>
            {
                table.ColumnsDefinition(cd =>
                {
                    cd.RelativeColumn(4);
                    cd.RelativeColumn(3);
                    cd.RelativeColumn(4);
                });

                table.Header(header =>
                {
                    header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.White).Padding(3).AlignCenter().Text("Make/Type/Model").Bold().FontSize(7.5f);
                    header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.White).Padding(3).AlignCenter().Text("Quantity").Bold().FontSize(7.5f);
                    header.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.White).Padding(3).AlignCenter().Text("Serial Number").Bold().FontSize(7.5f);
                });

                int totalRows = Math.Max(10, _app.Devices.Count);
                for (int i = 0; i < totalRows; i++)
                {
                    var d = i < _app.Devices.Count ? _app.Devices[i] : null;
                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2).Text(d?.MakeTypeModel ?? "").FontSize(7.5f);
                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2).AlignCenter().Text(d != null ? d.Quantity.ToString() : "").FontSize(7.5f);
                    table.Cell().Border(0.5f).BorderColor(Colors.Black).Padding(2).Text(d?.SerialNumber ?? "").FontSize(7.5f);
                }

                // Summary Row
                table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten4).Padding(2).AlignCenter().Text("TOTAL").Bold().FontSize(7.5f);
                table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Blue.Lighten5).Padding(2).AlignCenter().Text(_app.TotalQuantity.ToString()).Bold().FontSize(7.5f);
                table.Cell().Border(0.5f).BorderColor(Colors.Black).Background(Colors.Grey.Lighten4).Padding(2).Text("");
            });
        });
    }

    private void ComposeDeclarationSection(ColumnDescriptor col)
    {
        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Black).Column(c =>
        {
            c.Item().Background(Colors.Grey.Lighten3).Padding(2).Text("DECLARATION").Bold().FontSize(8);
            c.Item().Padding(4).Text(
                "I hereby declare that all the above entries are true and correct. Under the Revised Penal Code, I shall be held liable for any willful false statement(s) or misrepresentation(s) made in this application form that may serve as a valid ground for the denial of this application and/or cancellation/revocation of the permit issued/granted. Further, I am freely giving full consent for the collection and processing of personal information in accordance with Republic Act No. 10713, Data Privacy Act of 2012."
            ).Italic().FontSize(7.2f);
        });
    }

    private void ComposeFooterAndOrBox(ColumnDescriptor col)
    {
        col.Item().PaddingTop(6).Row(row =>
        {
            // Left side: Signature & Date Boxes
            row.RelativeItem(3).Column(c =>
            {
                c.Item().PaddingTop(6).Column(sigCol =>
                {
                    sigCol.Item().Width(240).Border(0.5f).BorderColor(Colors.Black).Height(20).Padding(2).AlignCenter().AlignMiddle()
                        .Text(_app.Declaration.SignatoryName).Bold().FontSize(8);
                    sigCol.Item().PaddingTop(1).Text("Signature over Printed Name of Applicant /").FontSize(7);
                    sigCol.Item().Text("Duly Authorized Signatory/Representative").FontSize(7);

                    sigCol.Item().PaddingTop(6).Width(160).Border(0.5f).BorderColor(Colors.Black).Height(18).Padding(2).AlignCenter().AlignMiddle()
                        .Text(_app.Declaration.DateAccomplished != default ? _app.Declaration.DateAccomplished.ToString("MM/dd/yyyy") : "").FontSize(7.5f);
                    sigCol.Item().PaddingTop(1).Text("Date Accomplished").FontSize(7);
                });
            });

            // Right side: Official Receipt Box (Dashed Border)
            row.RelativeItem(2).Border(1).BorderColor(Colors.Black).Padding(4).Column(orCol =>
            {
                var p = _app.Payment;
                orCol.Item().Row(r =>
                {
                    r.AutoItem().Text("OR ").Bold().FontSize(12);
                    r.RelativeItem().Column(rc =>
                    {
                        rc.Item().Row(r2 =>
                        {
                            r2.AutoItem().Text("NO.: ").FontSize(7);
                            r2.RelativeItem().Text(p?.OrNo ?? "").Underline().FontSize(7.5f);
                        });
                        rc.Item().Row(r2 =>
                        {
                            r2.AutoItem().Text("DATE: ").FontSize(7);
                            r2.RelativeItem().Text(p?.OrDate != default ? p?.OrDate.ToString("MM/dd/yyyy") : "").Underline().FontSize(7.5f);
                        });
                    });
                });

                orCol.Item().PaddingTop(2).Row(r =>
                {
                    r.AutoItem().Text("AMOUNT: ").FontSize(7);
                    r.RelativeItem().Text(p != null ? $"PHP {p.Amount:N2}" : "").Underline().FontSize(7.5f);
                });

                orCol.Item().PaddingTop(10).LineHorizontal(0.5f).LineColor(Colors.Black);
                orCol.Item().AlignCenter().Text(p?.CollectingOfficer ?? "Collecting Officer").FontSize(7);
            });
        });

        // Bottom disclaimer text inside outer frame
        col.Item().PaddingTop(6).AlignCenter().Text("THIS FORM IS NOT FOR SALE AND CAN BE REPRODUCED").Bold().FontSize(7.5f);
    }
}

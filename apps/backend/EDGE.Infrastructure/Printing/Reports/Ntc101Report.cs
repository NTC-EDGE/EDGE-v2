using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-01 — Application for Radio Operator Examination.
/// Generates a PDF for individual exam applicants.
/// </summary>
public class Ntc101Report : IDocument
{
    private readonly Ntc101Application _app;

    public Ntc101Report(Ntc101Application app)
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
                ComposeApplicantDetails(col);
                ComposeExamDetails(col);
                ComposeDeclaration(col);
            });
        });
    }

    private void ComposeHeader(ColumnDescriptor col)
    {
        col.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS COMMISSION").FontSize(9).Bold();
        col.Item().AlignCenter().Text("Application for Radio Operator Examination").FontSize(8);
    }

    private void ComposeTitle(ColumnDescriptor col)
    {
        col.Item().PaddingTop(5).AlignCenter().Text("Form NTC 1-01").FontSize(8).Bold();
    }

    private void ComposeApplicantDetails(ColumnDescriptor col)
    {
        col.Item().PaddingTop(5).Background(Colors.Grey.Lighten3).Padding(2).Text("APPLICANT INFORMATION").Bold().FontSize(8);

        col.Item().BorderBottom(0.5f).BorderColor(Colors.Black).Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Last Name").FontSize(7);
                c.Item().Padding(1).Text(_app.ApplicantPerson.LastName).FontSize(7);
            });
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("First Name").FontSize(7);
                c.Item().Padding(1).Text(_app.ApplicantPerson.FirstName).FontSize(7);
            });
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Middle Name").FontSize(7);
                c.Item().Padding(1).Text(_app.ApplicantPerson.MiddleName).FontSize(7);
            });
        });

        col.Item().BorderBottom(0.5f).BorderColor(Colors.Black).Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Date of Birth").FontSize(7);
                c.Item().Padding(1).Text(_app.ApplicantPerson.DateOfBirth.ToString("MM/dd/yyyy")).FontSize(7);
            });
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Nationality").FontSize(7);
                c.Item().Padding(1).Text(_app.ApplicantPerson.Nationality).FontSize(7);
            });
        });

        col.Item().PaddingTop(3).Text("Address").FontSize(7).Bold();
        col.Item().BorderBottom(0.5f).BorderColor(Colors.Black).Padding(2).Text(_app.ApplicantPerson.Address.ToSingleLine()).FontSize(7);

        col.Item().BorderBottom(0.5f).BorderColor(Colors.Black).Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Contact Number").FontSize(7);
                c.Item().Padding(1).Text(_app.ApplicantPerson.ContactNumber).FontSize(7);
            });
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Email").FontSize(7);
                c.Item().Padding(1).Text(_app.ApplicantPerson.Email).FontSize(7);
            });
        });
    }

    private void ComposeExamDetails(ColumnDescriptor col)
    {
        col.Item().PaddingTop(5).Background(Colors.Grey.Lighten3).Padding(2).Text("EXAMINATION DETAILS").Bold().FontSize(8);

        col.Item().BorderBottom(0.5f).BorderColor(Colors.Black).Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Exam Code").FontSize(7);
                c.Item().Padding(1).Text(_app.ExamCode.ToString()).FontSize(7);
            });
            row.RelativeItem().Column(c =>
            {
                c.Item().Text("Date of Exam").FontSize(7);
                c.Item().Padding(1).Text(_app.DateOfExam.ToString("MM/dd/yyyy")).FontSize(7);
            });
        });
    }

    private void ComposeDeclaration(ColumnDescriptor col)
    {
        col.Item().PaddingTop(5).Background(Colors.Grey.Lighten3).Padding(2).Text("DECLARATION").Bold().FontSize(8);
        col.Item().BorderBottom(0.5f).BorderColor(Colors.Black).MinHeight(100);
    }
}

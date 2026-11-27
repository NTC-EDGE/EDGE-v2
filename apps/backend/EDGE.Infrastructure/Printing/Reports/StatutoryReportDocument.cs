using System;
using System.Collections.Generic;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

public partial class StatutoryReportDocument : IDocument
{
    private readonly StatutoryReportModel _model;
    private readonly Dictionary<string, OfficialReceipt> _receiptByOrNo;
    private readonly Dictionary<Guid, OfficialReceipt> _receiptById;
    private readonly Dictionary<Guid, List<OfficialReceipt>> _receiptsByAppId;

    public StatutoryReportDocument(StatutoryReportModel model)
    {
        _model = model ?? new StatutoryReportModel();

        _receiptByOrNo = new Dictionary<string, OfficialReceipt>(StringComparer.OrdinalIgnoreCase);
        _receiptById = new Dictionary<Guid, OfficialReceipt>();
        _receiptsByAppId = new Dictionary<Guid, List<OfficialReceipt>>();

        foreach (var r in _model.OfficialReceipts)
        {
            _receiptById[r.Id] = r;
            if (!string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
            {
                _receiptByOrNo[r.OfficialReceiptNumber.Trim()] = r;
            }
            var appId = r.ApplicationId ?? r.OrderOfPayment?.ApplicationId;
            if (appId.HasValue && appId.Value != Guid.Empty)
            {
                if (!_receiptsByAppId.TryGetValue(appId.Value, out var list))
                {
                    list = new List<OfficialReceipt>();
                    _receiptsByAppId[appId.Value] = list;
                }
                list.Add(r);
            }
        }
    }

    public DocumentMetadata GetMetadata() => new DocumentMetadata
    {
        Title = $"{_model.Code} - {_model.Title}",
        Author = "National Telecommunications Commission (EDGE v2)",
        Subject = _model.LegalBasis,
        Creator = "NTC EDGE QuestPDF Engine"
    };

    private bool IsLandscape =>
        _model.Code is "NTC-COA-APP26-M"
            or "NTC-COA-APP26-D"
            or "NTC-BTR-INC-01"
            or "NTC-APP-SUM-EVAL"
            or "NTC-APP-SUM-SVC"
            or "NTC-APP-SUM-ENT"
            or "NTC-APP-VOL-01";

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(IsLandscape ? PageSizes.A4.Landscape() : PageSizes.A4.Portrait());
            page.MarginHorizontal(22);
            page.MarginVertical(18);
            page.DefaultTextStyle(x => x.FontSize(7.5f).FontFamily(Fonts.Arial).FontColor(Colors.Black));

            page.Header().Element(ComposeOfficialHeader);
            page.Content().PaddingTop(6).Element(ComposeReportBody);
            page.Footer().Element(ComposeOfficialFooter);
        });
    }

    private void ComposeOfficialHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().BorderBottom(1.2f).BorderColor(Colors.Black).PaddingBottom(5).Row(row =>
            {
                row.ConstantItem(46).Height(46).Element(e => RenderLogo(e, "ph-seal.png", "PH SEAL"));

                row.RelativeItem().PaddingHorizontal(8).Column(c =>
                {
                    c.Item().AlignCenter().Text("REPUBLIC OF THE PHILIPPINES")
                        .FontSize(7.5f).FontFamily(Fonts.TimesNewRoman).Bold();
                    c.Item().AlignCenter().Text("DEPARTMENT OF INFORMATION AND COMMUNICATIONS TECHNOLOGY")
                        .FontSize(7f).FontFamily(Fonts.TimesNewRoman);
                    c.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS COMMISSION")
                        .FontSize(10f).FontFamily(Fonts.TimesNewRoman).Bold();
                    c.Item().AlignCenter().Text(_model.TenantName.ToUpperInvariant())
                        .FontSize(8.5f).FontFamily(Fonts.Arial).Bold().FontColor("#0F172A");
                    if (!string.IsNullOrWhiteSpace(_model.RegionalOfficeAddress))
                    {
                        c.Item().AlignCenter().Text(_model.RegionalOfficeAddress)
                            .FontSize(6.5f).FontFamily(Fonts.Arial).FontColor("#475569");
                    }
                    c.Item().PaddingTop(2).AlignCenter().Text(_model.Title.ToUpperInvariant())
                        .FontSize(9.5f).FontFamily(Fonts.Arial).Bold().FontColor("#1E3A8A");
                    c.Item().AlignCenter().Text($"PERIOD COVERED: {_model.Period.ToUpperInvariant()}   •   FORM CODE: {_model.Code}")
                        .FontSize(7f).FontFamily(Fonts.Arial).Bold().FontColor("#334155");
                });

                row.ConstantItem(46).Height(46).Element(e => RenderLogo(e, "ntc-Logo.png", "NTC SEAL"));
            });

            col.Item().PaddingTop(3).Background("#F8FAFC").Border(0.6f).BorderColor("#CBD5E1").PaddingHorizontal(6).PaddingVertical(3).Row(meta =>
            {
                meta.RelativeItem().Text(t =>
                {
                    t.Span("Receiving Agency: ").Bold().FontSize(6.8f);
                    t.Span(_model.Agency).FontSize(6.8f);
                });
                meta.RelativeItem().AlignCenter().Text(t =>
                {
                    t.Span("Statutory Basis: ").Bold().FontSize(6.8f);
                    t.Span(_model.LegalBasis).FontSize(6.8f);
                });
                meta.RelativeItem().AlignRight().Text(t =>
                {
                    t.Span("Frequency: ").Bold().FontSize(6.8f);
                    t.Span(_model.Frequency).FontSize(6.8f);
                    if (!string.IsNullOrWhiteSpace(_model.SecondaryFilter) && !string.Equals(_model.SecondaryFilter, "all", StringComparison.OrdinalIgnoreCase))
                    {
                        t.Span($"  |  Filter: {_model.SecondaryFilter}").Bold().FontSize(6.8f);
                    }
                    if (!string.IsNullOrWhiteSpace(_model.FieldOfficeFilter) && !string.Equals(_model.FieldOfficeFilter, "all", StringComparison.OrdinalIgnoreCase))
                    {
                        t.Span($"  |  Field Office (Monitoring): {_model.FieldOfficeFilter}").Bold().FontSize(6.8f);
                    }
                });
            });
        });
    }

    private void ComposeOfficialFooter(IContainer container)
    {
        container.PaddingTop(4).BorderTop(0.5f).BorderColor("#CBD5E1").Row(row =>
        {
            row.RelativeItem().Text($"NTC EDGE Official Statutory Document • {_model.Code} • Generated {_model.GeneratedAt:yyyy-MM-dd HH:mm} UTC by {_model.GeneratedBy}")
                .FontSize(6.5f).FontColor(Colors.Grey.Darken2);

            row.AutoItem().Text(t =>
            {
                t.DefaultTextStyle(s => s.FontSize(6.5f).FontColor(Colors.Grey.Darken2).Bold());
                t.Span("Page ");
                t.CurrentPageNumber();
                t.Span(" of ");
                t.TotalPages();
            });
        });
    }

    private void ComposeReportBody(IContainer container)
    {
        switch (_model.Code)
        {
            case "NTC-MIS-OPS":
                ComposeMisOperationsReport(container);
                break;
            case "NTC-COA-APP26-M":
            case "NTC-COA-APP26-D":
                ComposeCoaAppendix26Report(container);
                break;
            case "NTC-BIR-DST-01":
                ComposeBirDstReport(container);
                break;
            case "NTC-BTR-INC-01":
                ComposeBtrIncomeReport(container);
                break;
            case "NTC-APP-SUM-EVAL":
            case "NTC-APP-SUM-SVC":
            case "NTC-APP-SUM-ENT":
                ComposeApplicationSummaryReport(container);
                break;
            case "NTC-APP-VOL-01":
                ComposeApplicationVolumeReport(container);
                break;
            case "NTC-EXAM-MST-01":
                ComposeExamMasterlistReport(container);
                break;
            default:
                ComposeMisOperationsReport(container);
                break;
        }
    }
}

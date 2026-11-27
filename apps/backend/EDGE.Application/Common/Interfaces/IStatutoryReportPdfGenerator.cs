using EDGE.Application.Reports.DTOs;

namespace EDGE.Application.Common.Interfaces;

/// <summary>
/// Renders a statutory report PDF from Application-layer aggregated data.
/// Implemented in EDGE.Infrastructure via QuestPDF.
/// </summary>
public interface IStatutoryReportPdfGenerator
{
    byte[] GeneratePdf(StatutoryReportDocumentData data);
}

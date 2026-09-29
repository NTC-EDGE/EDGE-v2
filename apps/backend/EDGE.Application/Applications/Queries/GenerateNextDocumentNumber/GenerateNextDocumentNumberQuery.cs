using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GenerateNextDocumentNumber;

public record GenerateNextDocumentNumberQuery : IRequest<ApiResponse<GeneratedDocumentNumbersDto>>
{
    public Guid ApplicationId { get; init; }
}

public record GeneratedDocumentNumbersDto
{
    public string RecommendedFormNumber { get; init; } = string.Empty;
    public string? RecommendedLicenseNumber { get; init; }
    public string? ServiceCategory { get; init; }
    public string? OfficePrefix { get; init; }
    public int SequenceNumber { get; init; }
    public string? OfficialReceiptNumber { get; init; }
    public string? OriginalEvaluatorName { get; init; }
    public bool IsPaid { get; init; }
}

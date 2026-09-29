using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.IssueApplication;

public record IssueApplicationCommand : IRequest<ApiResponse<IssuedDocumentDto>>
{
    public Guid ApplicationId { get; init; }
    public Guid? ApplicantId { get; init; }
    public string DocumentType { get; init; } = "Certificate";
    public string FormNumber { get; init; } = string.Empty;
    public string? LicenseNumber { get; init; }
    public string? CallSign { get; init; }
    public string? StationClass { get; init; }
    public string? FrequencyBand { get; init; }
    public DateTime IssueDate { get; init; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; init; }
    public string? Remarks { get; init; }
}

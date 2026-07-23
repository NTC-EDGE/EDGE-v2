using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UploadApplicantRequirement;

public record UploadApplicantRequirementCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public Guid ApplicantId { get; init; }
    public required Guid RequirementId { get; init; }
    public Guid? ServiceVariantRequirementId { get; init; }
    public Guid? StoredFileId { get; init; }
    public required Guid TenantId { get; init; }
    public string Url { get; init; } = string.Empty;
}

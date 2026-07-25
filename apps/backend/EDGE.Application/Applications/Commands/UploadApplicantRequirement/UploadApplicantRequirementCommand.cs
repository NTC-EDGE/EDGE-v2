using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UploadApplicantRequirement;

public record UploadApplicantRequirementCommand : IRequest<ApiResponse<Guid>>
{
    // Injected from route params by endpoint — not from request body
    public Guid ApplicationId { get; init; }
    public Guid ApplicantId { get; init; }

    // Public request body — only these three
    public Guid? RequirementId { get; init; }
    public Guid? ServiceVariantRequirementId { get; init; }
    public required Guid StoredFileId { get; init; }
}
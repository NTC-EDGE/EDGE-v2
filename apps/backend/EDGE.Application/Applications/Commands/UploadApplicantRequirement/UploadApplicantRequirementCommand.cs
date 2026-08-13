using System;
using System.Text.Json.Serialization;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UploadApplicantRequirement;

public record UploadApplicantRequirementCommand : IRequest<ApiResponse<Guid>>
{
    // Injected from route params by endpoint — not from request body
    [JsonIgnore]
    public Guid ApplicationId { get; init; }
    [JsonIgnore]
    public Guid ApplicantId { get; init; }

    // Public request body
    public Guid? RequirementId { get; init; }
    public Guid? ServiceVariantRequirementId { get; init; }
    public required Guid StoredFileId { get; init; }
}
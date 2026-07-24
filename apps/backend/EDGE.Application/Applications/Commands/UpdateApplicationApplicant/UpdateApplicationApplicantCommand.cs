using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using MediatR;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateApplicationApplicant;

public record UpdateApplicationApplicantCommand : IRequest<ApiResponse<Guid>>
{
    [JsonIgnore]
    public Guid ApplicationId { get; init; }

    [JsonIgnore]
    public Guid ApplicantId { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Email { get; init; }
    public string? ContactNumber { get; init; }
    public string? Address { get; init; }
    public DateOnly? BirthDate { get; init; }
    public List<FormFieldValueSubmissionDto>? FormFieldValues { get; init; }
}

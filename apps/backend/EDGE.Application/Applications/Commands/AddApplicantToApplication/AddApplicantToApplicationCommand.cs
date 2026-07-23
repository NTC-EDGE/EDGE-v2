using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AddApplicantToApplication;

public record AddApplicantToApplicationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? ContactNumber { get; init; }
    public string? Address { get; init; }
    public DateOnly BirthDate { get; init; }
    public List<FormFieldValueSubmissionDto> FormFieldValues { get; init; } = new();
}

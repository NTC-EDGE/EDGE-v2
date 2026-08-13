using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.CreateFormSubmission;

public record CreateFormSubmissionCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public Guid? ApplicantId { get; init; }
    public Guid FormId { get; init; }
    public List<FormFieldValueInputDto> FieldValues { get; init; } = new();
}

public record FormFieldValueInputDto(string FieldId, string? CustomLabel, string? Value);

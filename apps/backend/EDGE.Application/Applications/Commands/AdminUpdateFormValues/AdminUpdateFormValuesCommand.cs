using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateFormValues;

public record AdminUpdateFormValuesCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public Guid ApplicantId { get; init; }
    public Guid? SubmissionId { get; init; }
    public List<AdminFormFieldValueDto> FormFields { get; init; } = new();
}

public record AdminFormFieldValueDto(string FieldId, string FieldLabel, string? Value);

using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Applications.Commands.CreateFormSubmission;

namespace EDGE.Application.Applications.Commands.UpdateFormSubmissionValues;

public record UpdateFormSubmissionValuesCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public Guid SubmissionId { get; init; }
    public Guid? ApplicantId { get; init; }
    public List<FormFieldValueInputDto> FieldValues { get; init; } = new();
}

using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Applications.Dtos;

namespace EDGE.Application.Applications.Queries.GetApplicationFormWithSubmission;

public record GetApplicationFormWithSubmissionQuery(
    Guid ApplicationId,
    Guid? ApplicantId = null
) : IRequest<ApiResponse<ApplicationFormSubmissionDto>>;

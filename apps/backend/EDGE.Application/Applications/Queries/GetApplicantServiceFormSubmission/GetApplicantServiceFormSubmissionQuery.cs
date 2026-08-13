using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Applications.Dtos;

namespace EDGE.Application.Applications.Queries.GetApplicantServiceFormSubmission;

public record GetApplicantServiceFormSubmissionQuery(
    Guid ApplicationId,
    Guid ApplicantId,
    Guid? ServiceVariantId = null
) : IRequest<ApiResponse<ApplicationFormSubmissionDto>>;

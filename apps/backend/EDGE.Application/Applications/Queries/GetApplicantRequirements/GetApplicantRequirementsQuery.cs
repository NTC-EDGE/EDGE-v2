using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicantRequirements;

public record GetApplicantRequirementsQuery(
    Guid ApplicationId,
    Guid ApplicantId
) : IRequest<ApiResponse<List<ApplicantRequirementItemDto>>>;

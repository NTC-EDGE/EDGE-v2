using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicationsByApplicant;

public record GetApplicationsByApplicantQuery(Guid ApplicantId) : IRequest<ApiResponse<List<ApplicantApplicationDto>>>;

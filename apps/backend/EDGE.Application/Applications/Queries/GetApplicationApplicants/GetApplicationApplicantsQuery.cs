using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicationApplicants;

public record GetApplicationApplicantsQuery(Guid ApplicationId) : IRequest<ApiResponse<List<ApplicantDto>>>;

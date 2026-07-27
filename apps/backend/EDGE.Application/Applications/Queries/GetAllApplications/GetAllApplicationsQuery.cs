using System.Collections.Generic;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Queries.GetAllApplications;

public record GetAllApplicationsQuery(ApplicationStatus? Status = null) : IRequest<ApiResponse<List<ApplicationDto>>>;

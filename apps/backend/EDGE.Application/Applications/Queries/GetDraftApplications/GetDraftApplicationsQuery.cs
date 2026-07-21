using System.Collections.Generic;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetDraftApplications;

public record GetDraftApplicationsQuery : IRequest<ApiResponse<List<ApplicationDto>>>;

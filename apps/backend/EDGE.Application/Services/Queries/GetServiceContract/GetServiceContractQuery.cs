using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Queries.GetServiceContract;

public record GetServiceContractQuery(Guid ServiceId) : IRequest<ApiResponse<object>>;

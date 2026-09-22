using System;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicationById;

public record GetApplicationByIdQuery(Guid Id) : IRequest<ApiResponse<ApplicationDto>>;

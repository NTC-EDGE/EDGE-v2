using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceInformations.Dtos;

namespace EDGE.Application.ServiceInformations.Queries.GetServiceInformationById;

public record GetServiceInformationByIdQuery(Guid Id) : IRequest<ApiResponse<ServiceInformationDto>>;

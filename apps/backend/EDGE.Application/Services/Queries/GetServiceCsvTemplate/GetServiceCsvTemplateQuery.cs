using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Queries.GetServiceCsvTemplate;

public record GetServiceCsvTemplateQuery(Guid ServiceId) : IRequest<ApiResponse<ServiceCsvTemplateResultDto>>;

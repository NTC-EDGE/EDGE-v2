using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServiceVariants;

public record GetServiceVariantsQuery(Guid ServiceId) : IRequest<ApiResponse<List<ServiceVariantDto>>>;

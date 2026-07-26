using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariantRequirements.Dtos;

namespace EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirements;

public record GetServiceVariantRequirementsQuery(Guid? ServiceVariantId = null) : IRequest<ApiResponse<List<ServiceVariantRequirementDto>>>;

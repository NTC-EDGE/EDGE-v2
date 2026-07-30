using System;
using MediatR;
using System.Collections.Generic;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFees;

public record GetServiceVariantFeesQuery(Guid? ServiceVariantId = null) : IRequest<List<ServiceVariantFeeDto>>;

using System;
using MediatR;
using System.Collections.Generic;
using EDGE.Application.ServiceVariantElementFees.DTOs;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;

public record GetServiceVariantElementFeesQuery(Guid? ServiceVariantId = null) : IRequest<List<ServiceVariantElementFeeDto>>;

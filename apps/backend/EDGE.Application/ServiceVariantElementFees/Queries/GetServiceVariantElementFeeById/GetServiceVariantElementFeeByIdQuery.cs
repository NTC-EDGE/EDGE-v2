using System;
using MediatR;
using EDGE.Application.ServiceVariantElementFees.DTOs;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFeeById;

public record GetServiceVariantElementFeeByIdQuery(Guid Id) : IRequest<ServiceVariantElementFeeDto?>;

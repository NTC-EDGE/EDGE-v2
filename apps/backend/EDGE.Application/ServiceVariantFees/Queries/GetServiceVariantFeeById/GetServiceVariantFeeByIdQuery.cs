using System;
using MediatR;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFeeById;

public record GetServiceVariantFeeByIdQuery(Guid Id) : IRequest<ServiceVariantFeeDto?>;

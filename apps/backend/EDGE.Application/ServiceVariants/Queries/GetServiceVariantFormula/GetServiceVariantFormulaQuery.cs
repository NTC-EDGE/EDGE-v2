using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariants.DTOs;

namespace EDGE.Application.ServiceVariants.Queries.GetServiceVariantFormula;

public record GetServiceVariantFormulaQuery(Guid ServiceVariantId) : IRequest<ApiResponse<ServiceVariantFormulaDto?>>;

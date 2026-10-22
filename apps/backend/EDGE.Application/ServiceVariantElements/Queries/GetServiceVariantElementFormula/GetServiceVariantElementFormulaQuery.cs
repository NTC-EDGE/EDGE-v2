using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariantElements.DTOs;

namespace EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElementFormula;

public record GetServiceVariantElementFormulaQuery(Guid ServiceVariantId, Guid ElementId) : IRequest<ApiResponse<ServiceVariantElementFormulaDto?>>;

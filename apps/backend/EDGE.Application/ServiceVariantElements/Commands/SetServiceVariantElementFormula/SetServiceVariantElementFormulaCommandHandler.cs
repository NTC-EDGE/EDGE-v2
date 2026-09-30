using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.ServiceVariantElements.Commands.SetServiceVariantElementFormula;

public class SetServiceVariantElementFormulaCommandHandler : IRequestHandler<SetServiceVariantElementFormulaCommand, ApiResponse<bool>>
{
    private readonly IServiceVariantRepository _variantRepository;
    private readonly IElementRepository _elementRepository;
    private readonly IServiceVariantFormulaRepository _formulaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SetServiceVariantElementFormulaCommandHandler(
        IServiceVariantRepository variantRepository,
        IElementRepository elementRepository,
        IServiceVariantFormulaRepository formulaRepository,
        IUnitOfWork unitOfWork)
    {
        _variantRepository = variantRepository;
        _elementRepository = elementRepository;
        _formulaRepository = formulaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(SetServiceVariantElementFormulaCommand request, CancellationToken cancellationToken)
    {
        var variant = await _variantRepository.GetByIdAsync(request.ServiceVariantId, cancellationToken);
        if (variant == null)
        {
            return ApiResponse<bool>.NotFound("Service variant not found.");
        }

        var element = await _elementRepository.GetByIdAsync(request.ElementId, cancellationToken);
        if (element == null)
        {
            return ApiResponse<bool>.NotFound("Billing element not found.");
        }

        var formula = await _formulaRepository.GetElementFormulaAsync(request.ServiceVariantId, request.ElementId, cancellationToken);
        if (formula == null)
        {
            formula = new ServiceVariantElementFormula
            {
                Id = Guid.NewGuid(),
                ServiceVariantId = request.ServiceVariantId,
                ElementId = request.ElementId,
                FormulaExpression = request.FormulaExpression.Trim(),
                Description = request.Description?.Trim(),
                ApplyLateRenewalSurcharge = request.ApplyLateRenewalSurcharge,
                IsActive = true
            };
            await _formulaRepository.AddElementFormulaAsync(formula, cancellationToken);
        }
        else
        {
            formula.FormulaExpression = request.FormulaExpression.Trim();
            formula.Description = request.Description?.Trim();
            formula.ApplyLateRenewalSurcharge = request.ApplyLateRenewalSurcharge;
            formula.IsActive = true;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true, "Billing element statutory formula updated successfully.");
    }
}

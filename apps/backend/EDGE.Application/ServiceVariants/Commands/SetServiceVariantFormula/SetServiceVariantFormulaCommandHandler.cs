using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.ServiceVariants.Commands.SetServiceVariantFormula;

public class SetServiceVariantFormulaCommandHandler : IRequestHandler<SetServiceVariantFormulaCommand, ApiResponse<bool>>
{
    private readonly IServiceVariantRepository _variantRepository;
    private readonly IServiceVariantFormulaRepository _formulaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SetServiceVariantFormulaCommandHandler(
        IServiceVariantRepository variantRepository,
        IServiceVariantFormulaRepository formulaRepository,
        IUnitOfWork unitOfWork)
    {
        _variantRepository = variantRepository;
        _formulaRepository = formulaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(SetServiceVariantFormulaCommand request, CancellationToken cancellationToken)
    {
        var variant = await _variantRepository.GetByIdAsync(request.ServiceVariantId, cancellationToken);
        if (variant == null)
        {
            return ApiResponse<bool>.NotFound("Service variant not found.");
        }

        var formula = await _formulaRepository.GetByServiceVariantIdAsync(request.ServiceVariantId, cancellationToken);
        if (formula == null)
        {
            formula = new ServiceVariantFormula
            {
                Id = Guid.NewGuid(),
                ServiceVariantId = request.ServiceVariantId,
                FormulaExpression = request.FormulaExpression.Trim(),
                Description = request.Description?.Trim(),
                ApplyLateRenewalSurcharge = request.ApplyLateRenewalSurcharge,
                IsActive = true
            };
            await _formulaRepository.AddAsync(formula, cancellationToken);
        }
        else
        {
            formula.FormulaExpression = request.FormulaExpression.Trim();
            formula.Description = request.Description?.Trim();
            formula.ApplyLateRenewalSurcharge = request.ApplyLateRenewalSurcharge;
            formula.IsActive = true;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true, "Service variant statutory formula updated successfully.");
    }
}

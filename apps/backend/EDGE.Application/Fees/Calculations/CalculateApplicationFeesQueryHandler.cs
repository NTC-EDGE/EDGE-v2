using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Fees.Calculations;

public class CalculateApplicationFeesQueryHandler : IRequestHandler<CalculateApplicationFeesQuery, ApiResponse<FeeCalculationResultDto>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IFeeCalculationEngine _calculationEngine;
    private readonly IServiceFeeRepository? _serviceFeeRepository;
    private readonly IServiceVariantFeeRepository? _variantFeeRepository;
    private readonly IServiceVariantElementFeeRepository? _elementFeeRepository;
    private readonly IServiceVariantFormulaRepository? _formulaRepository;

    public CalculateApplicationFeesQueryHandler(
        IApplicationFullRepository repository,
        IFeeCalculationEngine calculationEngine,
        IServiceFeeRepository? serviceFeeRepository = null,
        IServiceVariantFeeRepository? variantFeeRepository = null,
        IServiceVariantElementFeeRepository? elementFeeRepository = null,
        IServiceVariantFormulaRepository? formulaRepository = null)
    {
        _repository = repository;
        _calculationEngine = calculationEngine;
        _serviceFeeRepository = serviceFeeRepository;
        _variantFeeRepository = variantFeeRepository;
        _elementFeeRepository = elementFeeRepository;
        _formulaRepository = formulaRepository;
    }

    public async Task<ApiResponse<FeeCalculationResultDto>> Handle(CalculateApplicationFeesQuery request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<FeeCalculationResultDto>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        var targetApplicant = request.ApplicantId.HasValue
            ? app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId.Value)?.Applicant
            : null;

        var primaryService = targetApplicant?.Service
            ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var primaryVariant = targetApplicant?.ServiceVariant
            ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

        var activity = primaryService?.ServiceCategory?.Name ?? primaryService?.Name ?? "Radio Operator Certificates";
        var appType = primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? "New";
        var element = primaryVariant?.ServiceVariantElements?.FirstOrDefault()?.Code
            ?? primaryVariant?.ServiceVariantElements?.FirstOrDefault()?.Description;

        var applicantsCount = app.ApplicationApplicants.Count > 0 ? app.ApplicationApplicants.Count : 1;
        var units = request.NoOfUnits ?? applicantsCount;
        var years = request.ValidityYears ?? 1;

        var serviceFees = _serviceFeeRepository != null && primaryService != null
            ? await _serviceFeeRepository.GetAllAsync(serviceId: primaryService.Id, activeOnly: true, cancellationToken: cancellationToken)
            : null;

        var variantFees = _variantFeeRepository != null && primaryVariant != null
            ? await _variantFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
            : null;

        var elementFees = _elementFeeRepository != null && primaryVariant != null
            ? await _elementFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
            : null;

        string? formulaExpression = null;
        if (_formulaRepository != null)
        {
            if (primaryVariant != null)
            {
                var primaryElement = primaryVariant.ServiceVariantElements?.FirstOrDefault();
                if (primaryElement != null)
                {
                    var elemFormula = await _formulaRepository.GetElementFormulaAsync(primaryVariant.Id, primaryElement.Id, cancellationToken);
                    formulaExpression = elemFormula?.FormulaExpression;
                }

                if (string.IsNullOrWhiteSpace(formulaExpression))
                {
                    var variantFormula = await _formulaRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken);
                    formulaExpression = variantFormula?.FormulaExpression;
                }
            }

            if (string.IsNullOrWhiteSpace(formulaExpression) && primaryService != null)
            {
                var serviceFormula = await _formulaRepository.GetServiceFormulaAsync(primaryService.Id, cancellationToken);
                formulaExpression = serviceFormula?.FormulaExpression;
            }
        }

        var calculationRequest = new FeeCalculationRequest(
            Activity: activity,
            ApplicationType: appType,
            Element: element,
            ValidityYears: years,
            NoOfUnits: units,
            ExpirationDate: request.ExpirationDate,
            AdditionalServicesCount: request.AdditionalServicesCount ?? 0,
            NoOfCopies: request.NoOfCopies ?? 1,
            AsOfDate: DateTime.UtcNow,
            Category: primaryService?.ServiceCategory?.Type,
            ServiceId: primaryService?.Id,
            ServiceVariantId: primaryVariant?.Id,
            ServiceFees: serviceFees,
            VariantFees: variantFees,
            ElementFees: elementFees,
            FormulaExpression: formulaExpression
        );

        var result = _calculationEngine.Calculate(calculationRequest);
        return ApiResponse<FeeCalculationResultDto>.Success(result);
    }
}

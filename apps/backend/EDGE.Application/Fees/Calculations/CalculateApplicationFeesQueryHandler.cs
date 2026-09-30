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
    private readonly IServiceVariantFeeRepository? _variantFeeRepository;
    private readonly IServiceVariantElementFeeRepository? _elementFeeRepository;

    public CalculateApplicationFeesQueryHandler(
        IApplicationFullRepository repository,
        IFeeCalculationEngine calculationEngine,
        IServiceVariantFeeRepository? variantFeeRepository = null,
        IServiceVariantElementFeeRepository? elementFeeRepository = null)
    {
        _repository = repository;
        _calculationEngine = calculationEngine;
        _variantFeeRepository = variantFeeRepository;
        _elementFeeRepository = elementFeeRepository;
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

        var variantFees = _variantFeeRepository != null && primaryVariant != null
            ? await _variantFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
            : null;

        var elementFees = _elementFeeRepository != null && primaryVariant != null
            ? await _elementFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
            : null;

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
            ServiceVariantId: primaryVariant?.Id,
            VariantFees: variantFees,
            ElementFees: elementFees
        );

        var result = _calculationEngine.Calculate(calculationRequest);
        return ApiResponse<FeeCalculationResultDto>.Success(result);
    }
}

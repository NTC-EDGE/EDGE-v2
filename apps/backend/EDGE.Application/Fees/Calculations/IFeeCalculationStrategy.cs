using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations;

public interface IFeeCalculationStrategy
{
    ServiceCategoryType Category { get; }
    bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType);
    FeeCalculationResultDto Calculate(FeeCalculationRequest request);
}

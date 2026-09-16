using FluentValidation;

namespace EDGE.Application.Reports.Queries.GetOperationalReportStatistics;

public class GetOperationalReportStatisticsQueryValidator : AbstractValidator<GetOperationalReportStatisticsQuery>
{
    private static readonly string[] ValidPeriodModes = ["monthly", "quarterly", "yearly", "rolling"];

    public GetOperationalReportStatisticsQueryValidator()
    {
        RuleFor(x => x.PeriodMode)
            .Must(m => string.IsNullOrEmpty(m) || System.Array.Exists(ValidPeriodModes, valid => valid.Equals(m, System.StringComparison.OrdinalIgnoreCase)))
            .WithMessage("PeriodMode must be one of: 'monthly', 'quarterly', 'yearly', 'rolling'.");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100)
            .When(x => x.Year.HasValue)
            .WithMessage("Year must be between 2000 and 2100.");

        RuleFor(x => x.Quarter)
            .InclusiveBetween(1, 4)
            .When(x => x.Quarter.HasValue)
            .WithMessage("Quarter must be between 1 and 4.");

        RuleFor(x => x.Month)
            .InclusiveBetween(1, 12)
            .When(x => x.Month.HasValue)
            .WithMessage("Month must be between 1 and 12.");
    }
}

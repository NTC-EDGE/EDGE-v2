using System;
using FluentValidation;
using EDGE.Application.Reports.Constants;

namespace EDGE.Application.Reports.Queries.GenerateStatutoryReportPdf;

public sealed class GenerateStatutoryReportPdfQueryValidator : AbstractValidator<GenerateStatutoryReportPdfQuery>
{
    public GenerateStatutoryReportPdfQueryValidator()
    {
        RuleFor(x => x.Code)
            .MaximumLength(64)
            .When(x => !string.IsNullOrWhiteSpace(x.Code))
            .WithMessage("Report code cannot exceed 64 characters.");

        RuleFor(x => x.Period)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.Period))
            .WithMessage("Period label cannot exceed 100 characters.");

        RuleFor(x => x.SecondaryFilter)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.SecondaryFilter))
            .WithMessage("Secondary filter cannot exceed 200 characters.");

        RuleFor(x => x.FieldOffices)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.FieldOffices))
            .WithMessage("Field offices filter cannot exceed 500 characters.");

        RuleFor(x => x.Format)
            .Must(f =>
                string.Equals(f!.Trim(), ReportConstants.FormatStandard, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(f.Trim(), ReportConstants.FormatNtcSheet, StringComparison.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.Format))
            .WithMessage($"Format must be '{ReportConstants.FormatStandard}' or '{ReportConstants.FormatNtcSheet}'.");

        RuleFor(x => x.ServiceType)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.ServiceType))
            .WithMessage("ServiceType filter cannot exceed 100 characters.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate!.Value)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("EndDate must be greater than or equal to StartDate.");
    }
}

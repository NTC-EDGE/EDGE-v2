using EDGE.Application.Common.Interfaces;
using FluentValidation;

namespace EDGE.Application.Tenants.Validators;

public class RegionalConfigurationDtoValidator : AbstractValidator<RegionalConfigurationDto>
{
    public RegionalConfigurationDtoValidator()
    {
        RuleFor(x => x.RcCodeSoa)
            .MaximumLength(32)
            .WithMessage("RC Code (SOA) must not exceed 32 characters.");

        RuleFor(x => x.RcCodeOp)
            .MaximumLength(32)
            .WithMessage("RC Code (OP) must not exceed 32 characters.");

        RuleFor(x => x.FundCluster)
            .MaximumLength(32)
            .WithMessage("Fund Cluster must not exceed 32 characters.");

        When(x => x.ReportSignatories != null, () =>
        {
            RuleFor(x => x.ReportSignatories!.RegionalDirectorName).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.RegionalDirectorTitle).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.ChiefEodName).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.ChiefEodTitle).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.RegionalAccountantName).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.RegionalAccountantTitle).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.CollectingOfficerName).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.CollectingOfficerTitle).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.MisOfficerName).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.MisOfficerTitle).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.ExamProctorName).MaximumLength(150);
            RuleFor(x => x.ReportSignatories!.ExamProctorTitle).MaximumLength(150);
        });
    }
}

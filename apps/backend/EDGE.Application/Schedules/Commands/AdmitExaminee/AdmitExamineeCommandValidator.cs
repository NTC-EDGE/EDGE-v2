using System;
using FluentValidation;

namespace EDGE.Application.Schedules.Commands.AdmitExaminee;

public class AdmitExamineeCommandValidator : AbstractValidator<AdmitExamineeCommand>
{
    public AdmitExamineeCommandValidator()
    {
        RuleFor(x => x)
            .Must(x =>
                !string.IsNullOrWhiteSpace(x.Code) ||
                (x.IssuedDocumentId.HasValue && x.IssuedDocumentId.Value != Guid.Empty) ||
                (x.ApplicationId.HasValue && x.ApplicationId.Value != Guid.Empty))
            .WithMessage("A valid QR verification code, IssuedDocumentId, or ApplicationId is required to admit an examinee.");

        RuleFor(x => x.Code)
            .MaximumLength(200)
            .When(x => !string.IsNullOrEmpty(x.Code));

        RuleFor(x => x.Remarks)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Remarks));
    }
}

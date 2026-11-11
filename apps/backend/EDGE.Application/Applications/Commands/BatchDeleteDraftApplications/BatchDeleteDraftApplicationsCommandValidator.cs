using System;
using System.Collections.Generic;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.BatchDeleteDraftApplications;

public class BatchDeleteDraftApplicationsCommandValidator : AbstractValidator<BatchDeleteDraftApplicationsCommand>
{
    public BatchDeleteDraftApplicationsCommandValidator()
    {
        RuleFor(x => x.Ids)
            .NotEmpty().WithMessage("At least one draft application ID must be provided.")
            .Must(ids => ids != null && ids.Count > 0).WithMessage("Draft application ID list cannot be empty.");
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.CreateFormSubmission;

public class CreateFormSubmissionCommandHandler : IRequestHandler<CreateFormSubmissionCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateFormSubmissionCommandHandler> _logger;

    public CreateFormSubmissionCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateFormSubmissionCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateFormSubmissionCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var submission = new FormSubmission
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                ApplicantId = request.ApplicantId ?? Guid.Empty,
                FormId = request.FormId,
                FieldValues = new List<FormFieldValue>()
            };

            if (request.FieldValues != null)
            {
                foreach (var fvInput in request.FieldValues)
                {
                    if (Guid.TryParse(fvInput.FieldId, out var fieldId))
                    {
                        submission.FieldValues.Add(new FormFieldValue
                        {
                            Id = Guid.NewGuid(),
                            FormSubmissionId = submission.Id,
                            FieldId = fieldId,
                            CustomLabel = fvInput.CustomLabel,
                            Value = fvInput.Value ?? string.Empty
                        });
                    }
                }
            }

            app.FormSubmissions.Add(submission);

            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(submission.Id, "Form submission created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create form submission for ApplicationId {ApplicationId}, FormId {FormId}", request.ApplicationId, request.FormId);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during form submission creation.");
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while creating form submission. Please try again or contact support.");
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.CreateFormSubmission;

public class CreateFormSubmissionCommandHandler : IRequestHandler<CreateFormSubmissionCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFormSubmissionCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
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
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch
            {
                // Ignore rollback exceptions to preserve primary exception details
            }
            return ApiResponse<Guid>.Fail($"Failed to create form submission. Error: {ex.Message}");
        }
    }
}

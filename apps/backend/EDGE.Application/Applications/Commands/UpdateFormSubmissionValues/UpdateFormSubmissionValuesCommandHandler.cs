using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateFormSubmissionValues;

public class UpdateFormSubmissionValuesCommandHandler : IRequestHandler<UpdateFormSubmissionValuesCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFormSubmissionValuesCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateFormSubmissionValuesCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            FormSubmission? submission = null;
            if (request.SubmissionId != Guid.Empty)
            {
                submission = app.FormSubmissions.FirstOrDefault(fs => fs.Id == request.SubmissionId);
            }

            if (submission == null && request.ApplicantId.HasValue && request.ApplicantId.Value != Guid.Empty)
            {
                submission = app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId.Value);
            }

            if (submission == null)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return ApiResponse<Guid>.Fail($"No form submission found for ID {request.SubmissionId}.");
            }

            if (request.FieldValues != null)
            {
                foreach (var fvInput in request.FieldValues)
                {
                    if (Guid.TryParse(fvInput.FieldId, out var fieldId))
                    {
                        var existingVal = submission.FieldValues.FirstOrDefault(fv => fv.FieldId == fieldId);
                        var newValue = fvInput.Value ?? string.Empty;

                        if (existingVal != null)
                        {
                            existingVal.Value = newValue;
                            if (!string.IsNullOrWhiteSpace(fvInput.CustomLabel))
                            {
                                existingVal.CustomLabel = fvInput.CustomLabel;
                            }
                        }
                        else
                        {
                            submission.FieldValues.Add(new FormFieldValue
                            {
                                Id = Guid.NewGuid(),
                                FormSubmissionId = submission.Id,
                                FieldId = fieldId,
                                CustomLabel = fvInput.CustomLabel,
                                Value = newValue
                            });
                        }
                    }
                }
            }

            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(submission.Id, "Form submission field values updated successfully.");
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
            return ApiResponse<Guid>.Fail($"Failed to update form submission values. Error: {ex.Message}");
        }
    }
}

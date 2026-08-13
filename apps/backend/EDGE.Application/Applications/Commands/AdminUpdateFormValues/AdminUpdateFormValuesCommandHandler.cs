using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateFormValues;

public class AdminUpdateFormValuesCommandHandler : IRequestHandler<AdminUpdateFormValuesCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public AdminUpdateFormValuesCommandHandler(
        IApplicationFullRepository applicationRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(AdminUpdateFormValuesCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        var staffName = _currentUserService.UserId ?? "NTC Agency Staff";

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // Find form submission for applicant (or application level)
            var submission = app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId)
                ?? app.FormSubmissions.FirstOrDefault(fs => fs.ApplicationId == app.Id);

            if (submission != null && request.FormFields != null)
            {
                foreach (var fieldDto in request.FormFields)
                {
                    if (Guid.TryParse(fieldDto.FieldId, out var fieldId))
                    {
                        var existingVal = submission.FieldValues.FirstOrDefault(fv => fv.FieldId == fieldId);
                        var newValue = fieldDto.Value ?? string.Empty;

                        if (existingVal != null)
                        {
                            if (existingVal.Value != newValue)
                            {
                                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                                {
                                    ApplicationId = app.Id,
                                    Category = "Form Submissions",
                                    FieldName = string.IsNullOrWhiteSpace(fieldDto.FieldLabel)
                                        ? (existingVal.Field?.Label ?? "Field")
                                        : fieldDto.FieldLabel,
                                    OldValue = existingVal.Value ?? string.Empty,
                                    NewValue = newValue,
                                    CorrectedByStaff = staffName,
                                    CorrectedAt = DateTime.UtcNow
                                }, cancellationToken);

                                existingVal.Value = newValue;
                            }
                        }
                        else
                        {
                            await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                            {
                                ApplicationId = app.Id,
                                Category = "Form Submissions",
                                FieldName = string.IsNullOrWhiteSpace(fieldDto.FieldLabel) ? "Field" : fieldDto.FieldLabel,
                                OldValue = string.Empty,
                                NewValue = newValue,
                                CorrectedByStaff = staffName,
                                CorrectedAt = DateTime.UtcNow
                            }, cancellationToken);

                            submission.FieldValues.Add(new FormFieldValue
                            {
                                Id = Guid.NewGuid(),
                                FormSubmissionId = submission.Id,
                                FieldId = fieldId,
                                CustomLabel = fieldDto.FieldLabel,
                                Value = newValue
                            });
                        }
                    }
                }
            }

            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(request.ApplicantId, "Form field values updated successfully by staff.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to update form values. Error: {ex.Message}");
        }
    }
}

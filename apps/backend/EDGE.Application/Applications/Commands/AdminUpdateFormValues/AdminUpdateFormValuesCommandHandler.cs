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
    private readonly IFormRepository _formRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public AdminUpdateFormValuesCommandHandler(
        IApplicationFullRepository applicationRepository,
        IFormRepository formRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _formRepository = formRepository;
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
            // Find form submission for applicant
            var submission = app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId);
            if (submission == null)
            {
                submission = app.FormSubmissions.FirstOrDefault(fs => fs.ApplicationId == app.Id);
            }

            if (submission == null)
            {
                var serviceId = app.ApplicationServices.FirstOrDefault()?.ServiceId ?? Guid.Empty;
                var form = serviceId != Guid.Empty ? await _formRepository.GetFormByServiceIdAsync(serviceId, cancellationToken) : null;

                submission = new FormSubmission
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    ApplicantId = request.ApplicantId,
                    FormId = form?.Id ?? Guid.Empty,
                };
                app.FormSubmissions.Add(submission);
            }
            else if (submission.ApplicantId != request.ApplicantId && request.ApplicantId != Guid.Empty)
            {
                submission.ApplicantId = request.ApplicantId;
            }

            if (request.FormFields != null)
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

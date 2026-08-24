using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.Applications.Commands.UpdateApplicationApplicant;

public class UpdateApplicationApplicantCommandHandler : IRequestHandler<UpdateApplicationApplicantCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApplicationApplicantCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateApplicationApplicantCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        if (appApplicant == null || appApplicant.Applicant == null)
        {
            return ApiResponse<Guid>.Fail($"Applicant with ID '{request.ApplicantId}' was not found in application '{request.ApplicationId}'.");
        }

        var applicant = appApplicant.Applicant;
        var detail = applicant.ApplicantDetail;

        if (detail != null)
        {
            if (!string.IsNullOrWhiteSpace(request.FirstName)) detail.FirstName = request.FirstName;
            if (!string.IsNullOrWhiteSpace(request.LastName)) detail.LastName = request.LastName;
            if (!string.IsNullOrWhiteSpace(request.Email)) detail.EmailAddress = request.Email;
            if (!string.IsNullOrWhiteSpace(request.ContactNumber)) detail.ContactNumber = request.ContactNumber;
            if (!string.IsNullOrWhiteSpace(request.Address)) detail.Address = request.Address;
            if (request.BirthDate.HasValue) detail.BirthDate = request.BirthDate.Value;
        }

        // Update FormFieldValues if provided
        if (request.FormFieldValues != null && request.FormFieldValues.Any())
        {
            var submission = app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId);
            if (submission != null)
            {
                foreach (var fv in request.FormFieldValues)
                {
                    if (fv.FieldId.HasValue && fv.FieldId.Value != Guid.Empty)
                    {
                        var existingFv = submission.FieldValues.FirstOrDefault(v => v.FieldId == fv.FieldId.Value);
                        if (existingFv != null)
                        {
                            existingFv.Value = fv.Value ?? "";
                        }
                        else
                        {
                            await _applicationRepository.AddFormFieldValueAsync(new FormFieldValue
                            {
                                Id = Guid.NewGuid(),
                                FormSubmissionId = submission.Id,
                                FieldId = fv.FieldId.Value,
                                Value = fv.Value ?? ""
                            }, cancellationToken);
                        }
                    }
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(applicant.Id, "Applicant details updated successfully.");
    }
}

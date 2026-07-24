using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.AddApplicantToApplication;

public class AddApplicantToApplicationCommandHandler : IRequestHandler<AddApplicantToApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IApplicantRepository _applicantRepository;
    private readonly IFormRepository _formRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddApplicantToApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IApplicantRepository applicantRepository,
        IFormRepository formRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _applicantRepository = applicantRepository;
        _formRepository = formRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(AddApplicantToApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        if (app.Status != ApplicationStatus.Draft)
        {
            return ApiResponse<Guid>.Fail("Additional applicants can only be added to Draft applications.");
        }

        // 1. Create ApplicantDetail
        var detail = new ApplicantDetail
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailAddress = request.Email,
            ContactNumber = request.ContactNumber ?? string.Empty,
            Address = request.Address ?? string.Empty,
            BirthDate = request.BirthDate
        };
        await _applicantRepository.AddApplicantDetailAsync(detail, cancellationToken);

        // 2. Create Applicant
        bool isBulk = app.SubmissionMode == SubmissionMode.Bulk;
        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            TenantId = app.TenantId,
            ApplicantType = isBulk ? ApplicantType.Company : ApplicantType.Individual,
            ApplicantDetailId = detail.Id,
            Status = ApplicantStatus.Complete
        };
        await _applicantRepository.AddApplicantAsync(applicant, cancellationToken);

        // 3. Link Applicant to Application
        int nextOrder = (app.ApplicationApplicants.Max(x => (int?)x.SequenceOrder) ?? 0) + 1;
        var appApplicant = new ApplicationApplicant
        {
            ApplicationId = app.Id,
            ApplicantId = applicant.Id,
            SequenceOrder = nextOrder
        };
        await _applicationRepository.AddApplicationApplicantAsync(appApplicant, cancellationToken);

        // 4. Populate FormSubmission if formFieldValues provided
        if (request.FormFieldValues != null && request.FormFieldValues.Any())
        {
            var appService = app.ApplicationServices.FirstOrDefault();
            if (appService?.ServiceId != null)
            {
                var form = await _formRepository.GetFormByServiceIdAsync(appService.ServiceId.Value, cancellationToken);
                if (form != null)
                {
                    var submission = new FormSubmission
                    {
                        Id = Guid.NewGuid(),
                        ApplicationId = app.Id,
                        ApplicantId = applicant.Id,
                        FormId = form.Id
                    };
                    await _applicationRepository.AddFormSubmissionAsync(submission, cancellationToken);

                    foreach (var fv in request.FormFieldValues)
                    {
                        await _applicationRepository.AddFormFieldValueAsync(new FormFieldValue
                        {
                            Id = Guid.NewGuid(),
                            FormSubmissionId = submission.Id,
                            FieldId = fv.FieldId,
                            Value = fv.Value
                        }, cancellationToken);
                    }
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(applicant.Id, "Applicant added successfully to draft application.");
    }
}

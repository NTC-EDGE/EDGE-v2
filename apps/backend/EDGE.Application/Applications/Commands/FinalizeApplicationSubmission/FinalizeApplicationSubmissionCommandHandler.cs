using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;

public class FinalizeApplicationSubmissionCommandHandler : IRequestHandler<FinalizeApplicationSubmissionCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public FinalizeApplicationSubmissionCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(FinalizeApplicationSubmissionCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.Id} was not found.");
        }

        if (app.Status != ApplicationStatus.Draft)
        {
            return ApiResponse<Guid>.Fail("Application has already been submitted or is not in Draft state.");
        }

        // 1. Strict Validation: Verify mandatory fields on linked applicants
        foreach (var aa in app.ApplicationApplicants)
        {
            var a = aa.Applicant;
            if (a?.ApplicantDetail == null)
            {
                return ApiResponse<Guid>.Fail($"Submission rejected: Applicant record #{aa.SequenceOrder} is missing biographical details.");
            }

            var ad = a.ApplicantDetail;
            if (string.IsNullOrWhiteSpace(ad.FirstName) || string.IsNullOrWhiteSpace(ad.LastName))
            {
                return ApiResponse<Guid>.Fail($"Submission rejected: Applicant #{aa.SequenceOrder} ({ad.FirstName} {ad.LastName}) is missing mandatory name fields.");
            }

            if (string.IsNullOrWhiteSpace(ad.ContactNumber))
            {
                return ApiResponse<Guid>.Fail($"Submission rejected: Applicant #{aa.SequenceOrder} ({ad.FirstName} {ad.LastName}) is missing contact number.");
            }

            // Verify requirement attachments for each applicant if requirements exist
            var reqs = app.ApplicationRequirements.Where(r => r.ApplicantId == a.Id).ToList();
            if (a.ServiceId.HasValue && !reqs.Any())
            {
                return ApiResponse<Guid>.Fail($"Submission rejected: Applicant #{aa.SequenceOrder} ({ad.FirstName} {ad.LastName}) is lacking required document uploads.");
            }
        }

        // 2. Transition status to Submitted & generate ApplicationNumber
        app.Status = ApplicationStatus.Submitted;
        app.ApplicationNumber = $"APP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(app.Id, "Application finalized and submitted successfully.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to finalize application. Error: {ex.Message}");
        }
    }
}

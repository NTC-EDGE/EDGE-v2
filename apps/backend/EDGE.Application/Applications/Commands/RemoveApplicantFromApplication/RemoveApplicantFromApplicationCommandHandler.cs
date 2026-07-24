using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.RemoveApplicantFromApplication;

public class RemoveApplicantFromApplicationCommandHandler : IRequestHandler<RemoveApplicantFromApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IApplicantRepository _applicantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveApplicantFromApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IApplicantRepository applicantRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _applicantRepository = applicantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(RemoveApplicantFromApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        if (app.Status != ApplicationStatus.Draft)
        {
            return ApiResponse<Guid>.Fail("Applicants can only be removed from Draft applications.");
        }

        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        if (appApplicant == null)
        {
            return ApiResponse<Guid>.Fail($"Applicant with ID '{request.ApplicantId}' is not associated with application '{request.ApplicationId}'.");
        }

        if (app.ApplicationApplicants.Count <= 1)
        {
            return ApiResponse<Guid>.Fail("Cannot remove the last applicant from an application.");
        }

        app.ApplicationApplicants.Remove(appApplicant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(request.ApplicantId, "Applicant removed successfully from draft application.");
    }
}

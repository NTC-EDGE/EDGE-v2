using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applicants.Commands.CreateApplicant;

public class CreateApplicantCommandHandler : IRequestHandler<CreateApplicantCommand, ApiResponse<ApplicantDto>>
{
    private readonly IApplicantRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateApplicantCommandHandler(IApplicantRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ApplicantDto>> Handle(CreateApplicantCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<ApplicantType>(request.ApplicantType, true, out var applicantType))
        {
            return ApiResponse<ApplicantDto>.Fail($"Invalid ApplicantType '{request.ApplicantType}'. Must be Individual or Company.");
        }

        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            UserId = request.UserId,
            IsGuest = request.IsGuest,
            ApplicantType = applicantType,
            Status = ApplicantStatus.Incomplete
        };

        await _repository.AddApplicantAsync(applicant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ApplicantDto
        {
            Id = applicant.Id,
            TenantId = applicant.TenantId,
            UserId = applicant.UserId,
            IsGuest = applicant.IsGuest,
            ApplicantType = applicant.ApplicantType.ToString()
        };

        return ApiResponse<ApplicantDto>.Success(dto);
    }
}

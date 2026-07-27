using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applicants.Commands.UpdateApplicantDetail;

public class UpdateApplicantDetailCommandHandler : IRequestHandler<UpdateApplicantDetailCommand, ApiResponse<ApplicantDto>>
{
    private readonly IApplicantRepository _repository;
    private readonly IGeographicRepository _geographicRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApplicantDetailCommandHandler(
        IApplicantRepository repository,
        IGeographicRepository geographicRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _geographicRepository = geographicRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ApplicantDto>> Handle(UpdateApplicantDetailCommand request, CancellationToken cancellationToken)
    {
        var applicant = await _repository.GetApplicantWithDetailsByIdAsync(request.Id, cancellationToken);
        if (applicant == null)
        {
            return ApiResponse<ApplicantDto>.Fail($"Applicant with ID {request.Id} was not found.");
        }

        // Validate BarangayId if provided
        if (request.BarangayId.HasValue && request.BarangayId != Guid.Empty)
        {
            var barangay = await _geographicRepository.GetBarangayByIdAsync(request.BarangayId.Value, cancellationToken);
            if (barangay == null)
            {
                return ApiResponse<ApplicantDto>.Fail($"Barangay with ID {request.BarangayId} does not exist.");
            }
        }

        // 1. Process Individual Details (ApplicantDetail)
        var hasIndividualFields = request.BarangayId.HasValue ||
                                   !string.IsNullOrEmpty(request.Address) ||
                                   !string.IsNullOrEmpty(request.FirstName) ||
                                   !string.IsNullOrEmpty(request.LastName);

        if (hasIndividualFields || applicant.ApplicantType == ApplicantType.Individual)
        {
            var detail = applicant.ApplicantDetail;
            var isNew = false;
            if (detail == null)
            {
                detail = new ApplicantDetail { Id = Guid.NewGuid() };
                isNew = true;
            }

            if (request.BarangayId.HasValue) detail.BarangayId = request.BarangayId.Value;
            if (request.Address != null) detail.Address = request.Address;
            if (request.FirstName != null) detail.FirstName = request.FirstName;
            if (request.MiddleName != null) detail.MiddleName = request.MiddleName;
            if (request.LastName != null) detail.LastName = request.LastName;
            if (request.Suffix != null) detail.Suffix = request.Suffix;
            if (request.Nationality != null) detail.Nationality = request.Nationality;
            if (request.Sex != null) detail.Sex = request.Sex;
            if (request.Height.HasValue) detail.Height = request.Height.Value;
            if (request.Weight.HasValue) detail.Weight = request.Weight.Value;
            if (request.BirthDate.HasValue) detail.BirthDate = request.BirthDate.Value;
            if (request.ContactNumber != null) detail.ContactNumber = request.ContactNumber;
            if (request.ZipCode != null) detail.ZipCode = request.ZipCode;
            if (request.SchoolAttended != null) detail.SchoolAttended = request.SchoolAttended;
            if (request.CourseTaken != null) detail.CourseTaken = request.CourseTaken;
            if (request.YearGraduated != null) detail.YearGraduated = request.YearGraduated;
            if (request.ESignature != null) detail.ESignature = request.ESignature;

            if (isNew)
            {
                await _repository.AddApplicantDetailAsync(detail, cancellationToken);
                applicant.ApplicantDetail = detail;
                applicant.ApplicantDetailId = detail.Id;
            }
            else
            {
                _repository.UpdateApplicantDetail(detail);
            }
        }

        // 2. Process Company Details (CompanyDetail)
        var hasCompanyFields = !string.IsNullOrEmpty(request.CompanyName) ||
                               !string.IsNullOrEmpty(request.CompanyRegistrationNumber) ||
                               !string.IsNullOrEmpty(request.CompanyContactNumber);

        if (hasCompanyFields || applicant.ApplicantType == ApplicantType.Company)
        {
            var company = applicant.CompanyDetail;
            var isNew = false;
            if (company == null)
            {
                company = new CompanyDetail { Id = Guid.NewGuid() };
                isNew = true;
            }

            if (request.BarangayId.HasValue) company.BarangayId = request.BarangayId.Value;
            if (request.Address != null) company.Address = request.Address;
            if (request.CompanyName != null) company.Name = request.CompanyName;
            if (request.CompanyRegistrationNumber != null) company.RegistrationNumber = request.CompanyRegistrationNumber;
            if (request.CompanyContactNumber != null) company.ContactNumber = request.CompanyContactNumber;
            if (request.CompanyEmail != null) company.Email = request.CompanyEmail;
            if (request.CompanyEntityType != null)
            {
                company.EntityType = Enum.TryParse<CompanyEntityType>(request.CompanyEntityType, true, out var parsedEnum)
                    ? parsedEnum
                    : null;
            }

            if (isNew)
            {
                await _repository.AddCompanyDetailAsync(company, cancellationToken);
                applicant.CompanyDetail = company;
                applicant.CompanyDetailId = company.Id;
            }
            else
            {
                _repository.UpdateCompanyDetail(company);
            }
        }

        // 3. Status Auto-completion check
        if (applicant.ApplicantType == ApplicantType.Individual)
        {
            var detail = applicant.ApplicantDetail;
            if (detail != null &&
                !string.IsNullOrWhiteSpace(detail.FirstName) &&
                !string.IsNullOrWhiteSpace(detail.LastName) &&
                !string.IsNullOrWhiteSpace(detail.Address) &&
                detail.BarangayId != Guid.Empty &&
                detail.BirthDate != default &&
                !string.IsNullOrWhiteSpace(detail.ContactNumber))
            {
                applicant.Status = ApplicantStatus.Complete;
            }
            else
            {
                applicant.Status = ApplicantStatus.Draft;
            }
        }
        else if (applicant.ApplicantType == ApplicantType.Company)
        {
            var company = applicant.CompanyDetail;
            if (company != null &&
                !string.IsNullOrWhiteSpace(company.Name) &&
                !string.IsNullOrWhiteSpace(company.RegistrationNumber) &&
                !string.IsNullOrWhiteSpace(company.Address) &&
                company.BarangayId != Guid.Empty &&
                !string.IsNullOrWhiteSpace(company.ContactNumber))
            {
                applicant.Status = ApplicantStatus.Complete;
            }
            else
            {
                applicant.Status = ApplicantStatus.Draft;
            }
        }

        _repository.UpdateApplicant(applicant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map and build response
        var dto = new ApplicantDto
        {
            Id = applicant.Id,
            TenantId = applicant.TenantId,
            UserId = applicant.UserId,
            IsGuest = applicant.IsGuest,
            ApplicantType = applicant.ApplicantType.ToString(),
            Details = applicant.ApplicantDetail != null ? new ApplicantDetailDto
            {
                Id = applicant.ApplicantDetail.Id,
                BarangayId = applicant.ApplicantDetail.BarangayId ?? Guid.Empty,
                Address = applicant.ApplicantDetail.Address,
                FirstName = applicant.ApplicantDetail.FirstName,
                MiddleName = applicant.ApplicantDetail.MiddleName,
                LastName = applicant.ApplicantDetail.LastName,
                Suffix = applicant.ApplicantDetail.Suffix,
                Nationality = applicant.ApplicantDetail.Nationality,
                Sex = applicant.ApplicantDetail.Sex,
                Height = applicant.ApplicantDetail.Height,
                Weight = applicant.ApplicantDetail.Weight,
                BirthDate = applicant.ApplicantDetail.BirthDate,
                ContactNumber = applicant.ApplicantDetail.ContactNumber,
                ZipCode = applicant.ApplicantDetail.ZipCode,
                SchoolAttended = applicant.ApplicantDetail.SchoolAttended,
                CourseTaken = applicant.ApplicantDetail.CourseTaken,
                YearGraduated = applicant.ApplicantDetail.YearGraduated,
                ESignature = applicant.ApplicantDetail.ESignature
            } : null
        };

        if (applicant.CompanyDetail != null)
        {
            if (dto.Details == null)
            {
                dto.Details = new ApplicantDetailDto();
            }
            dto.Details.Company = new CompanyDetailDto
            {
                Id = applicant.CompanyDetail.Id,
                BarangayId = applicant.CompanyDetail.BarangayId,
                Address = applicant.CompanyDetail.Address,
                Name = applicant.CompanyDetail.Name,
                RegistrationNumber = applicant.CompanyDetail.RegistrationNumber,
                ContactNumber = applicant.CompanyDetail.ContactNumber,
                Email = applicant.CompanyDetail.Email,
                EntityType = applicant.CompanyDetail.EntityType?.ToString()
            };
        }

        return ApiResponse<ApplicantDto>.Success(dto);
    }
}

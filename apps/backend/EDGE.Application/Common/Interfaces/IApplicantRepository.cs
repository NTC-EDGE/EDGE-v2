using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IApplicantRepository
{
    Task<List<Applicant>> GetApplicantsAsync(string? applicantType = null, bool? isGuest = null, CancellationToken cancellationToken = default);
    Task<Applicant?> GetApplicantWithDetailsByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddApplicantAsync(Applicant applicant, CancellationToken cancellationToken = default);
    Task AddApplicantDetailAsync(ApplicantDetail detail, CancellationToken cancellationToken = default);
    Task AddCompanyDetailAsync(CompanyDetail company, CancellationToken cancellationToken = default);
    void UpdateApplicant(Applicant applicant);
    void UpdateApplicantDetail(ApplicantDetail detail);
    void UpdateCompanyDetail(CompanyDetail company);
    void DeleteApplicant(Applicant applicant);
    void DeleteApplicantDetail(ApplicantDetail detail);
    void DeleteCompanyDetail(CompanyDetail company);
}

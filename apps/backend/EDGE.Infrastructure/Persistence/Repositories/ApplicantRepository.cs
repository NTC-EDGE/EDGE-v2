using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ApplicantRepository : IApplicantRepository
{
    private readonly ApplicationDbContext _context;

    public ApplicantRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Applicant>> GetApplicantsAsync(string? applicantType = null, bool? isGuest = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Applicants
            .Include(a => a.ApplicantDetail)
                .ThenInclude(ad => ad!.CompanyDetail)
                    .ThenInclude(cd => cd!.Barangay)
            .Include(a => a.ApplicantDetail)
                .ThenInclude(ad => ad!.Barangay)
            .AsQueryable();

        if (!string.IsNullOrEmpty(applicantType) && 
            Enum.TryParse<ApplicantType>(applicantType, true, out var typeEnum))
        {
            query = query.Where(a => a.ApplicantType == typeEnum);
        }

        if (isGuest.HasValue)
        {
            query = query.Where(a => a.IsGuest == isGuest.Value);
        }

        return await query.OrderByDescending(a => a.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<Applicant?> GetApplicantByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Applicants
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Applicant?> GetApplicantWithDetailsByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Applicants
            .Include(a => a.ApplicantDetail)
                .ThenInclude(ad => ad!.CompanyDetail)
                    .ThenInclude(cd => cd!.Barangay)
            .Include(a => a.ApplicantDetail)
                .ThenInclude(ad => ad!.Barangay)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task AddApplicantAsync(Applicant applicant, CancellationToken cancellationToken = default)
    {
        await _context.Applicants.AddAsync(applicant, cancellationToken);
    }

    public async Task AddApplicantDetailAsync(ApplicantDetail detail, CancellationToken cancellationToken = default)
    {
        await _context.ApplicantDetails.AddAsync(detail, cancellationToken);
    }

    public async Task AddCompanyDetailAsync(CompanyDetail company, CancellationToken cancellationToken = default)
    {
        await _context.CompanyDetails.AddAsync(company, cancellationToken);
    }

    public void UpdateApplicant(Applicant applicant)
    {
        _context.Applicants.Update(applicant);
    }

    public void UpdateApplicantDetail(ApplicantDetail detail)
    {
        _context.ApplicantDetails.Update(detail);
    }

    public void UpdateCompanyDetail(CompanyDetail company)
    {
        _context.CompanyDetails.Update(company);
    }

    public void DeleteApplicant(Applicant applicant)
    {
        _context.Applicants.Remove(applicant);
    }

    public void DeleteApplicantDetail(ApplicantDetail detail)
    {
        _context.ApplicantDetails.Remove(detail);
    }

    public void DeleteCompanyDetail(CompanyDetail company)
    {
        _context.CompanyDetails.Remove(company);
    }
}

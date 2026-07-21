using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ApplicationFullRepository : IApplicationFullRepository
{
    private readonly ApplicationDbContext _context;

    public ApplicationFullRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default)
    {
        await _context.Applications.AddAsync(application, cancellationToken);
    }

    public async Task<Domain.Entities.Application?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Domain.Entities.Application?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Include(a => a.ApplicationServices)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
                        .ThenInclude(ad => ad!.CompanyDetail)
            .Include(a => a.ApplicationRequirements)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetUserDraftsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Include(a => a.ApplicationServices)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
            .Where(a => a.UserId == userId && a.Status == ApplicationStatus.Draft)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task UpdateAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default)
    {
        _context.Applications.Update(application);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default)
    {
        _context.Applications.Remove(application);
        return Task.CompletedTask;
    }

    public async Task AddApplicationServiceAsync(ApplicationService appService, CancellationToken cancellationToken = default)
    {
        await _context.ApplicationServices.AddAsync(appService, cancellationToken);
    }

    public async Task AddApplicationApplicantAsync(ApplicationApplicant appApplicant, CancellationToken cancellationToken = default)
    {
        await _context.ApplicationApplicants.AddAsync(appApplicant, cancellationToken);
    }

    public async Task AddApplicationRequirementAsync(ApplicationRequirement appRequirement, CancellationToken cancellationToken = default)
    {
        await _context.ApplicationRequirements.AddAsync(appRequirement, cancellationToken);
    }

    public async Task<List<ApplicationRequirement>> GetApplicantRequirementsAsync(Guid applicationId, Guid applicantId, CancellationToken cancellationToken = default)
    {
        return await _context.ApplicationRequirements
            .Where(r => r.ApplicationId == applicationId && r.ApplicantId == applicantId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddApplicationStatusHistoryAsync(ApplicationStatusHistory statusHistory, CancellationToken cancellationToken = default)
    {
        await _context.ApplicationStatusHistories.AddAsync(statusHistory, cancellationToken);
    }
}

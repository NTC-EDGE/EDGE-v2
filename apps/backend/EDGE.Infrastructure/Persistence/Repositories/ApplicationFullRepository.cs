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
            .Include(a => a.FormSubmissions)
                .ThenInclude(fs => fs.FieldValues)
                    .ThenInclude(fv => fv.Field)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetUserDraftsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Include(a => a.ApplicationServices)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
            .Include(a => a.FormSubmissions)
                .ThenInclude(fs => fs.FieldValues)
                    .ThenInclude(fv => fv.Field)
            .Where(a => a.UserId == userId && a.Status == ApplicationStatus.Draft)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetUserApplicationsAsync(Guid userId, ApplicationStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Applications
            .Include(a => a.ApplicationServices)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
            .Include(a => a.FormSubmissions)
                .ThenInclude(fs => fs.FieldValues)
                    .ThenInclude(fv => fv.Field)
            .Where(a => a.UserId == userId);

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetAllApplicationsAsync(ApplicationStatus? status = null, string? queueTab = null, string? scope = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Applications
            .Include(a => a.User)
                .ThenInclude(u => u!.CompanyDetail)
            .Include(a => a.ApplicationServices)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
                        .ThenInclude(ad => ad!.CompanyDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.CompanyDetail)
            .Include(a => a.FormSubmissions)
                .ThenInclude(fs => fs.FieldValues)
                    .ThenInclude(fv => fv.Field)
            .Include(a => a.StatementsOfAccount)
                .ThenInclude(s => s.LineItems)
            .Include(a => a.OrdersOfPayment)
            .Include(a => a.Histories)
            .AsQueryable();

        // Agency portal feed never shows unsubmitted client Drafts nor archived applications
        query = query.Where(a => a.Status != ApplicationStatus.Draft && !a.IsArchived);

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(queueTab))
        {
            var tab = queueTab.Trim().ToLowerInvariant();
            if (tab == "pending")
            {
                query = query.Where(a => a.Status == ApplicationStatus.Submitted || a.Status == ApplicationStatus.Evaluating);
            }
            else if (tab == "history")
            {
                query = query.Where(a => a.Status == ApplicationStatus.Approved || a.Status == ApplicationStatus.Returned || a.Status == ApplicationStatus.Completed);
            }
        }

        return await query
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetByApplicantIdAsync(Guid applicantId, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .Include(a => a.ApplicationServices)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
            .Include(a => a.ApplicationRequirements)
            .Include(a => a.FormSubmissions)
                .ThenInclude(fs => fs.FieldValues)
                    .ThenInclude(fv => fv.Field)
            .Where(a => a.ApplicationApplicants.Any(aa => aa.ApplicantId == applicantId))
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

    public async Task AddFormSubmissionAsync(FormSubmission formSubmission, CancellationToken cancellationToken = default)
    {
        await _context.FormSubmissions.AddAsync(formSubmission, cancellationToken);
    }

    public async Task AddFormFieldValueAsync(FormFieldValue fieldValue, CancellationToken cancellationToken = default)
    {
        await _context.FormFieldValues.AddAsync(fieldValue, cancellationToken);
    }

    public async Task<StatementOfAccount?> GetSoaByIdAsync(Guid soaId, CancellationToken cancellationToken = default)
    {
        return await _context.StatementsOfAccount
            .Include(s => s.Application)
            .Include(s => s.LineItems)
            .Include(s => s.Histories)
            .FirstOrDefaultAsync(s => s.Id == soaId, cancellationToken);
    }

    public async Task AddSoaAsync(StatementOfAccount soa, CancellationToken cancellationToken = default)
    {
        await _context.StatementsOfAccount.AddAsync(soa, cancellationToken);
    }

    public async Task<OrderOfPayment?> GetOpByIdAsync(Guid opId, CancellationToken cancellationToken = default)
    {
        return await _context.OrdersOfPayment
            .Include(o => o.Application)
            .Include(o => o.StatementOfAccount)
                .ThenInclude(s => s.LineItems)
            .Include(o => o.Histories)
            .FirstOrDefaultAsync(o => o.Id == opId, cancellationToken);
    }

    public async Task AddOpAsync(OrderOfPayment op, CancellationToken cancellationToken = default)
    {
        await _context.OrdersOfPayment.AddAsync(op, cancellationToken);
    }

    public async Task AddApplicationHistoryAsync(ApplicationHistory history, CancellationToken cancellationToken = default)
    {
        await _context.ApplicationHistories.AddAsync(history, cancellationToken);
    }

    public async Task AddSoaHistoryAsync(SoaHistory history, CancellationToken cancellationToken = default)
    {
        await _context.SoaHistories.AddAsync(history, cancellationToken);
    }

    public async Task<bool> UserExistsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users.AnyAsync(u => u.Id == userId, cancellationToken);
    }
}

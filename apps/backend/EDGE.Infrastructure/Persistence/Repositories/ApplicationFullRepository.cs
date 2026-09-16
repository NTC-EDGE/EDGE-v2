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
            .AsNoTrackingWithIdentityResolution()
            .AsSplitQuery()
            .Include(a => a.User)
                .ThenInclude(u => u!.CompanyDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
                        .ThenInclude(ad => ad!.CompanyDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.CompanyDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.Service)
                        .ThenInclude(s => s!.ServiceCategory)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ServiceVariant)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.FormSubmission)
                        .ThenInclude(fs => fs!.FieldValues)
                            .ThenInclude(fv => fv!.Field)
            .Include(a => a.ApplicationRequirements)
                .ThenInclude(ar => ar.StoredFile)
            .Include(a => a.ApplicationRequirements)
                .ThenInclude(ar => ar.Requirement)
            .Include(a => a.ApplicationRequirements)
                .ThenInclude(ar => ar.ServiceVariantRequirement)
            .Include(a => a.FormSubmissions)
                .ThenInclude(fs => fs.FieldValues)
                    .ThenInclude(fv => fv.Field)
            .Include(a => a.StatementsOfAccount)
                .ThenInclude(s => s.LineItems)
            .Include(a => a.StatementsOfAccount)
                .ThenInclude(s => s.Histories)
            .Include(a => a.OrdersOfPayment)
                .ThenInclude(o => o.Histories)
            .Include(a => a.Histories)
            .Include(a => a.CorrectionAuditTrails)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetUserDraftsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await GetUserDraftsAsync(new List<Guid> { userId }, cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetUserDraftsAsync(List<Guid> userIds, CancellationToken cancellationToken = default)
    {
        if (userIds == null || userIds.Count == 0)
        {
            return new List<Domain.Entities.Application>();
        }

        return await _context.Applications
            .AsSplitQuery()
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ApplicantDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.CompanyDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.Service)
                        .ThenInclude(s => s!.ServiceCategory)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.ServiceVariant)
            .Include(a => a.FormSubmissions)
                .ThenInclude(fs => fs.FieldValues)
                    .ThenInclude(fv => fv.Field)
            .Where(a => a.UserId.HasValue && userIds.Contains(a.UserId.Value) && a.Status == ApplicationStatus.Draft)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetUserApplicationsAsync(Guid userId, ApplicationStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Applications
            .AsSplitQuery()
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
            .AsSplitQuery()
            .Include(a => a.User)
                .ThenInclude(u => u!.CompanyDetail)
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
            .Include(a => a.CorrectionAuditTrails)
            .AsNoTracking()
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

        if (!string.IsNullOrWhiteSpace(scope))
        {
            var s = scope.Trim().ToLowerInvariant();
            if (s == "queue")
            {
                query = query.Where(a => a.Status != ApplicationStatus.Draft && !a.IsArchived);
            }
            else if (s == "office")
            {
                query = query.Where(a => !string.IsNullOrEmpty(a.Office));
            }
        }

        return await query
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<EDGE.Application.Applications.Dtos.ApplicationSummaryDto>> GetApplicationSummaryDtosAsync(ApplicationStatus? status = null, string? queueTab = null, string? scope = null, Guid? userId = null, string? userEmail = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Applications
            .AsNoTracking()
            .AsQueryable();

        // Agency portal feed never shows unsubmitted client Drafts nor archived applications
        query = query.Where(a => a.Status != ApplicationStatus.Draft && !a.IsArchived);

        if (userId.HasValue || !string.IsNullOrEmpty(userEmail))
        {
            var normalizedEmail = userEmail?.Trim().ToLowerInvariant();
            query = query.Where(a =>
                (userId.HasValue && a.UserId == userId.Value) ||
                (normalizedEmail != null && a.User != null && a.User.Email.ToLower() == normalizedEmail) ||
                (normalizedEmail != null && a.ApplicationApplicants.Any(aa => aa.Applicant != null && aa.Applicant.ApplicantDetail != null && aa.Applicant.ApplicantDetail.EmailAddress != null && aa.Applicant.ApplicantDetail.EmailAddress.ToLower() == normalizedEmail)));
        }

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

        if (!string.IsNullOrWhiteSpace(scope))
        {
            var s = scope.Trim().ToLowerInvariant();
            if (s == "queue")
            {
                query = query.Where(a => a.Status != ApplicationStatus.Draft && !a.IsArchived);
            }
            else if (s == "office")
            {
                query = query.Where(a => !string.IsNullOrEmpty(a.Office));
            }
        }

        return await query
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.CreatedAt)
            .Select(app => new EDGE.Application.Applications.Dtos.ApplicationSummaryDto
            {
                Id = app.Id,
                ApplicationNumber = app.ApplicationNumber,
                ReferenceNumber = app.ReferenceNumber,
                Status = app.Status.ToString(),
                SubmissionMode = app.SubmissionMode.ToString(),
                Office = app.Office,
                Remarks = app.Remarks,
                IsGuest = app.IsGuest,
                IsPinned = app.IsPinned,
                IsArchived = app.IsArchived,
                CreatedAt = app.CreatedAt,
                ServiceId = app.ApplicationApplicants.Select(aa => aa.Applicant != null ? aa.Applicant.ServiceId : null).FirstOrDefault(),
                ServiceName = app.ApplicationApplicants.Select(aa => aa.Applicant != null && aa.Applicant.Service != null ? aa.Applicant.Service.Name : null).FirstOrDefault(),
                ServiceCategory = app.ApplicationApplicants.Select(aa => aa.Applicant != null && aa.Applicant.Service != null && aa.Applicant.Service.ServiceCategory != null ? aa.Applicant.Service.ServiceCategory.Name : null).FirstOrDefault(),
                ServiceVariantId = app.ApplicationApplicants.Select(aa => aa.Applicant != null ? aa.Applicant.ServiceVariantId : null).FirstOrDefault(),
                ServiceVariantName = app.ApplicationApplicants.Select(aa => aa.Applicant != null && aa.Applicant.ServiceVariant != null ? (aa.Applicant.ServiceVariant.Description ?? aa.Applicant.ServiceVariant.Type.ToString()) : null).FirstOrDefault(),
                FilingUser = app.User != null ? new EDGE.Application.Applications.Dtos.FilingUserSummaryDto
                {
                    Id = app.User.Id,
                    Name = (app.User.FirstName + " " + app.User.LastName).Trim(),
                    Email = app.User.Email,
                    AccountType = app.User.AccountType.ToString(),
                    Company = app.User.CompanyDetail != null ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                    {
                        Id = app.User.CompanyDetail.Id,
                        BarangayId = app.User.CompanyDetail.BarangayId,
                        Address = app.User.CompanyDetail.Address,
                        Name = app.User.CompanyDetail.Name,
                        RegistrationNumber = app.User.CompanyDetail.RegistrationNumber,
                        ContactNumber = app.User.CompanyDetail.ContactNumber,
                        Email = app.User.CompanyDetail.Email,
                        EntityType = app.User.CompanyDetail.EntityType != null ? app.User.CompanyDetail.EntityType.Value.ToString() : null
                    } : null
                } : null,
                Applicants = app.ApplicationApplicants.Select(aa => new EDGE.Application.Applications.Dtos.ApplicantSummaryDto
                {
                    Id = aa.Applicant != null ? aa.Applicant.Id : Guid.Empty,
                    ServiceId = aa.Applicant != null ? aa.Applicant.ServiceId : null,
                    ServiceName = aa.Applicant != null && aa.Applicant.Service != null ? aa.Applicant.Service.Name : null,
                    ServiceVariantId = aa.Applicant != null ? aa.Applicant.ServiceVariantId : null,
                    ServiceVariantName = aa.Applicant != null && aa.Applicant.ServiceVariant != null ? (aa.Applicant.ServiceVariant.Description ?? aa.Applicant.ServiceVariant.Type.ToString()) : null,
                    SubmissionId = aa.Applicant != null && aa.Applicant.FormSubmission != null
                        ? (Guid?)aa.Applicant.FormSubmission.Id
                        : null,
                    ApplicantType = aa.Applicant != null ? aa.Applicant.ApplicantType.ToString() : "Individual",
                    Status = aa.Applicant != null ? aa.Applicant.Status.ToString() : "Incomplete",
                    Name = aa.Applicant != null && aa.Applicant.ApplicantDetail != null
                        ? (aa.Applicant.ApplicantDetail.FirstName + " " + aa.Applicant.ApplicantDetail.LastName).Trim()
                        : (aa.Applicant != null && aa.Applicant.CompanyDetail != null ? aa.Applicant.CompanyDetail.Name : "Applicant"),
                    Company = (aa.Applicant != null && aa.Applicant.CompanyDetail != null)
                        ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                        {
                            Id = aa.Applicant.CompanyDetail.Id,
                            BarangayId = aa.Applicant.CompanyDetail.BarangayId,
                            Address = aa.Applicant.CompanyDetail.Address,
                            Name = aa.Applicant.CompanyDetail.Name,
                            RegistrationNumber = aa.Applicant.CompanyDetail.RegistrationNumber,
                            ContactNumber = aa.Applicant.CompanyDetail.ContactNumber,
                            Email = aa.Applicant.CompanyDetail.Email,
                            EntityType = aa.Applicant.CompanyDetail.EntityType != null ? aa.Applicant.CompanyDetail.EntityType.Value.ToString() : null
                        }
                        : (aa.Applicant != null && aa.Applicant.ApplicantDetail != null && aa.Applicant.ApplicantDetail.CompanyDetail != null)
                        ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                        {
                            Id = aa.Applicant.ApplicantDetail.CompanyDetail.Id,
                            BarangayId = aa.Applicant.ApplicantDetail.CompanyDetail.BarangayId,
                            Address = aa.Applicant.ApplicantDetail.CompanyDetail.Address,
                            Name = aa.Applicant.ApplicantDetail.CompanyDetail.Name,
                            RegistrationNumber = aa.Applicant.ApplicantDetail.CompanyDetail.RegistrationNumber,
                            ContactNumber = aa.Applicant.ApplicantDetail.CompanyDetail.ContactNumber,
                            Email = aa.Applicant.ApplicantDetail.CompanyDetail.Email,
                            EntityType = aa.Applicant.ApplicantDetail.CompanyDetail.EntityType != null ? aa.Applicant.ApplicantDetail.CompanyDetail.EntityType.Value.ToString() : null
                        }
                        : null
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<EDGE.Application.Applications.Dtos.PagedApplicationListDto> GetPagedApplicationSummaryDtosAsync(
        ApplicationStatus? status = null,
        string? queueTab = null,
        string? scope = null,
        Guid? userId = null,
        string? userEmail = null,
        int pageNumber = 1,
        int pageSize = 10,
        string? searchTerm = null,
        string? mode = null,
        Guid? tenantId = null,
        List<Guid>? tenantIds = null,
        CancellationToken cancellationToken = default)
    {
        var baseQuery = _context.Applications
            .AsNoTracking()
            .Where(a => a.Status != ApplicationStatus.Draft && !a.IsArchived);

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            baseQuery = baseQuery.Where(a => a.TenantId == tenantId.Value);
        }
        else if (tenantIds != null && tenantIds.Count > 0)
        {
            baseQuery = baseQuery.Where(a => tenantIds.Contains(a.TenantId));
        }

        if (userId.HasValue || !string.IsNullOrEmpty(userEmail))
        {
            var normalizedEmail = userEmail?.Trim().ToLowerInvariant();
            baseQuery = baseQuery.Where(a =>
                (userId.HasValue && a.UserId == userId.Value) ||
                (normalizedEmail != null && a.User != null && a.User.Email.ToLower() == normalizedEmail) ||
                (normalizedEmail != null && a.ApplicationApplicants.Any(aa => aa.Applicant != null && aa.Applicant.ApplicantDetail != null && aa.Applicant.ApplicantDetail.EmailAddress != null && aa.Applicant.ApplicantDetail.EmailAddress.ToLower() == normalizedEmail)));
        }

        // Global statistics for the user/scope dashboard metrics
        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var singleCount = await baseQuery.CountAsync(a => a.SubmissionMode == SubmissionMode.Single, cancellationToken);
        var bulkCount = await baseQuery.CountAsync(a => a.SubmissionMode == SubmissionMode.Bulk, cancellationToken);
        var evaluatingCount = await baseQuery.CountAsync(a => a.Status == ApplicationStatus.Evaluating || a.Status == ApplicationStatus.Submitted, cancellationToken);
        var approvedCount = await baseQuery.CountAsync(a => a.Status == ApplicationStatus.Approved, cancellationToken);
        var paymentRequiredCount = await _context.StatementsOfAccount
            .Where(s => baseQuery.Select(a => a.Id).Contains(s.ApplicationId) && s.Status == SoaStatus.Approved)
            .CountAsync(cancellationToken);
        var completedCount = await baseQuery.CountAsync(a => a.Status == ApplicationStatus.Completed, cancellationToken);
        var returnedCount = await baseQuery.CountAsync(a => a.Status == ApplicationStatus.Returned, cancellationToken);
        var readyDocsCount = await _context.ApplicationRequirements
            .Where(r => baseQuery.Select(a => a.Id).Contains(r.ApplicationId) && r.IsApproved)
            .CountAsync(cancellationToken);

        var filteredQuery = baseQuery;

        if (status.HasValue)
        {
            filteredQuery = filteredQuery.Where(a => a.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(mode))
        {
            if (Enum.TryParse<SubmissionMode>(mode.Trim(), true, out var parsedMode))
            {
                filteredQuery = filteredQuery.Where(a => a.SubmissionMode == parsedMode);
            }
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLowerInvariant();
            filteredQuery = filteredQuery.Where(a =>
                (a.ReferenceNumber != null && a.ReferenceNumber.ToLower().Contains(term)) ||
                (a.ApplicationNumber != null && a.ApplicationNumber.ToLower().Contains(term)) ||
                (a.Office != null && a.Office.ToLower().Contains(term)) ||
                a.ApplicationApplicants.Any(aa => aa.Applicant != null && aa.Applicant.ApplicantDetail != null &&
                    ((aa.Applicant.ApplicantDetail.FirstName + " " + aa.Applicant.ApplicantDetail.LastName).ToLower().Contains(term) ||
                     (aa.Applicant.ApplicantDetail.EmailAddress != null && aa.Applicant.ApplicantDetail.EmailAddress.ToLower().Contains(term)))));
        }

        if (!string.IsNullOrWhiteSpace(queueTab))
        {
            var tab = queueTab.Trim().ToLowerInvariant();
            if (tab == "pending")
            {
                filteredQuery = filteredQuery.Where(a => a.Status == ApplicationStatus.Submitted || a.Status == ApplicationStatus.Evaluating);
            }
            else if (tab == "history")
            {
                filteredQuery = filteredQuery.Where(a => a.Status == ApplicationStatus.Approved || a.Status == ApplicationStatus.Returned || a.Status == ApplicationStatus.Completed);
            }
        }

        if (!string.IsNullOrWhiteSpace(scope))
        {
            var s = scope.Trim().ToLowerInvariant();
            if (s == "queue")
            {
                filteredQuery = filteredQuery.Where(a => a.Status != ApplicationStatus.Draft && !a.IsArchived);
            }
            else if (s == "office")
            {
                filteredQuery = filteredQuery.Where(a => !string.IsNullOrEmpty(a.Office));
            }
        }

        var filteredTotal = await filteredQuery.CountAsync(cancellationToken);

        var page = pageNumber < 1 ? 1 : pageNumber;
        var size = pageSize <= 0 ? 10 : pageSize;

        var items = await filteredQuery
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .Select(app => new EDGE.Application.Applications.Dtos.ApplicationSummaryDto
            {
                Id = app.Id,
                ApplicationNumber = app.ApplicationNumber,
                ReferenceNumber = app.ReferenceNumber,
                Status = app.Status.ToString(),
                SubmissionMode = app.SubmissionMode.ToString(),
                Office = app.Office,
                Remarks = app.Remarks,
                IsGuest = app.IsGuest,
                IsPinned = app.IsPinned,
                IsArchived = app.IsArchived,
                CreatedAt = app.CreatedAt,
                ServiceId = app.ApplicationApplicants.Select(aa => aa.Applicant != null ? aa.Applicant.ServiceId : null).FirstOrDefault(),
                ServiceName = app.ApplicationApplicants.Select(aa => aa.Applicant != null && aa.Applicant.Service != null ? aa.Applicant.Service.Name : null).FirstOrDefault(),
                ServiceCategory = app.ApplicationApplicants.Select(aa => aa.Applicant != null && aa.Applicant.Service != null && aa.Applicant.Service.ServiceCategory != null ? aa.Applicant.Service.ServiceCategory.Name : null).FirstOrDefault(),
                ServiceVariantId = app.ApplicationApplicants.Select(aa => aa.Applicant != null ? aa.Applicant.ServiceVariantId : null).FirstOrDefault(),
                ServiceVariantName = app.ApplicationApplicants.Select(aa => aa.Applicant != null && aa.Applicant.ServiceVariant != null ? (aa.Applicant.ServiceVariant.Description ?? aa.Applicant.ServiceVariant.Type.ToString()) : null).FirstOrDefault(),
                FilingUser = app.User != null ? new EDGE.Application.Applications.Dtos.FilingUserSummaryDto
                {
                    Id = app.User.Id,
                    Name = (app.User.FirstName + " " + app.User.LastName).Trim(),
                    Email = app.User.Email,
                    AccountType = app.User.AccountType.ToString(),
                    Company = app.User.CompanyDetail != null ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                    {
                        Id = app.User.CompanyDetail.Id,
                        BarangayId = app.User.CompanyDetail.BarangayId,
                        Address = app.User.CompanyDetail.Address,
                        Name = app.User.CompanyDetail.Name,
                        RegistrationNumber = app.User.CompanyDetail.RegistrationNumber,
                        ContactNumber = app.User.CompanyDetail.ContactNumber,
                        Email = app.User.CompanyDetail.Email,
                        EntityType = app.User.CompanyDetail.EntityType != null ? app.User.CompanyDetail.EntityType.Value.ToString() : null
                    } : null
                } : null,
                Applicants = app.ApplicationApplicants.Select(aa => new EDGE.Application.Applications.Dtos.ApplicantSummaryDto
                {
                    Id = aa.Applicant != null ? aa.Applicant.Id : Guid.Empty,
                    ServiceId = aa.Applicant != null ? aa.Applicant.ServiceId : null,
                    ServiceName = aa.Applicant != null && aa.Applicant.Service != null ? aa.Applicant.Service.Name : null,
                    ServiceVariantId = aa.Applicant != null ? aa.Applicant.ServiceVariantId : null,
                    ServiceVariantName = aa.Applicant != null && aa.Applicant.ServiceVariant != null ? (aa.Applicant.ServiceVariant.Description ?? aa.Applicant.ServiceVariant.Type.ToString()) : null,
                    SubmissionId = aa.Applicant != null && aa.Applicant.FormSubmission != null
                        ? (Guid?)aa.Applicant.FormSubmission.Id
                        : null,
                    ApplicantType = aa.Applicant != null ? aa.Applicant.ApplicantType.ToString() : "Individual",
                    Status = aa.Applicant != null ? aa.Applicant.Status.ToString() : "Incomplete",
                    Name = aa.Applicant != null && aa.Applicant.ApplicantDetail != null
                        ? (aa.Applicant.ApplicantDetail.FirstName + " " + aa.Applicant.ApplicantDetail.LastName).Trim()
                        : (aa.Applicant != null && aa.Applicant.CompanyDetail != null ? aa.Applicant.CompanyDetail.Name : "Applicant"),
                    Company = (aa.Applicant != null && aa.Applicant.CompanyDetail != null)
                        ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                        {
                            Id = aa.Applicant.CompanyDetail.Id,
                            BarangayId = aa.Applicant.CompanyDetail.BarangayId,
                            Address = aa.Applicant.CompanyDetail.Address,
                            Name = aa.Applicant.CompanyDetail.Name,
                            RegistrationNumber = aa.Applicant.CompanyDetail.RegistrationNumber,
                            ContactNumber = aa.Applicant.CompanyDetail.ContactNumber,
                            Email = aa.Applicant.CompanyDetail.Email,
                            EntityType = aa.Applicant.CompanyDetail.EntityType != null ? aa.Applicant.CompanyDetail.EntityType.Value.ToString() : null
                        }
                        : (aa.Applicant != null && aa.Applicant.ApplicantDetail != null && aa.Applicant.ApplicantDetail.CompanyDetail != null)
                        ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                        {
                            Id = aa.Applicant.ApplicantDetail.CompanyDetail.Id,
                            BarangayId = aa.Applicant.ApplicantDetail.CompanyDetail.BarangayId,
                            Address = aa.Applicant.ApplicantDetail.CompanyDetail.Address,
                            Name = aa.Applicant.ApplicantDetail.CompanyDetail.Name,
                            RegistrationNumber = aa.Applicant.ApplicantDetail.CompanyDetail.RegistrationNumber,
                            ContactNumber = aa.Applicant.ApplicantDetail.CompanyDetail.ContactNumber,
                            Email = aa.Applicant.ApplicantDetail.CompanyDetail.Email,
                            EntityType = aa.Applicant.ApplicantDetail.CompanyDetail.EntityType != null ? aa.Applicant.ApplicantDetail.CompanyDetail.EntityType.Value.ToString() : null
                        }
                        : null
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return new EDGE.Application.Applications.Dtos.PagedApplicationListDto
        {
            Items = items,
            PageNumber = page,
            PageSize = size,
            TotalCount = filteredTotal,
            Statistics = new EDGE.Application.Applications.Dtos.ApplicationStatisticsDto
            {
                TotalCount = totalCount,
                SingleCount = singleCount,
                BulkCount = bulkCount,
                EvaluatingCount = evaluatingCount,
                ApprovedCount = approvedCount,
                PaymentRequiredCount = paymentRequiredCount,
                CompletedCount = completedCount,
                ReturnedCount = returnedCount,
                ReadyDocumentsCount = readyDocsCount
            }
        };
    }

    public async Task<List<EDGE.Application.Applications.Dtos.ApplicationDto>> GetApplicationDtosAsync(ApplicationStatus? status = null, string? queueTab = null, string? scope = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Applications
            .AsNoTracking()
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
            .Select(app => new EDGE.Application.Applications.Dtos.ApplicationDto
            {
                Id = app.Id,
                TenantId = app.TenantId,
                ScheduleId = app.ScheduleId,
                RegionId = app.RegionId,
                Office = app.Office,
                ApplicationNumber = app.ApplicationNumber,
                ReferenceNumber = app.ReferenceNumber,
                Status = app.Status.ToString(),
                SubmissionMode = app.SubmissionMode.ToString(),
                DataEntryMethod = app.DataEntryMethod != null ? app.DataEntryMethod.Value.ToString() : null,
                Remarks = app.Remarks,
                UserId = app.UserId,
                IsGuest = app.IsGuest,
                IsPinned = app.IsPinned,
                IsArchived = app.IsArchived,
                CreatedAt = app.CreatedAt,
                FilingUser = app.User != null ? new EDGE.Application.Applications.Dtos.FilingUserDto
                {
                    Id = app.User.Id,
                    Name = (app.User.FirstName + " " + app.User.LastName).Trim(),
                    Email = app.User.Email,
                    AccountType = app.User.AccountType.ToString(),
                    Company = app.User.CompanyDetail != null ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                    {
                        Id = app.User.CompanyDetail.Id,
                        BarangayId = app.User.CompanyDetail.BarangayId,
                        Address = app.User.CompanyDetail.Address,
                        Name = app.User.CompanyDetail.Name,
                        RegistrationNumber = app.User.CompanyDetail.RegistrationNumber,
                        ContactNumber = app.User.CompanyDetail.ContactNumber,
                        Email = app.User.CompanyDetail.Email,
                        EntityType = app.User.CompanyDetail.EntityType != null ? app.User.CompanyDetail.EntityType.Value.ToString() : null
                    } : null
                } : null,
                Applicants = app.ApplicationApplicants.Select(aa => new EDGE.Application.Applicants.Dtos.ApplicantDto
                {
                    Id = aa.Applicant != null ? aa.Applicant.Id : Guid.Empty,
                    TenantId = aa.Applicant != null ? aa.Applicant.TenantId : Guid.Empty,
                    UserId = aa.Applicant != null ? aa.Applicant.UserId : null,
                    IsGuest = aa.Applicant != null ? aa.Applicant.IsGuest : true,
                    ApplicantType = aa.Applicant != null ? aa.Applicant.ApplicantType.ToString() : "Individual",
                    Status = aa.Applicant != null ? aa.Applicant.Status.ToString() : "Incomplete",
                    EvaluationRemarks = aa.Applicant != null ? aa.Applicant.EvaluationRemarks : null,
                    ServiceId = aa.Applicant != null ? aa.Applicant.ServiceId : null,
                    ServiceVariantId = aa.Applicant != null ? aa.Applicant.ServiceVariantId : null,
                    SubmissionId = aa.Applicant != null
                        ? (aa.Applicant.FormSubmission != null
                            ? (Guid?)aa.Applicant.FormSubmission.Id
                            : app.FormSubmissions.Where(fs => fs.ApplicantId == aa.Applicant.Id).Select(fs => (Guid?)fs.Id).FirstOrDefault())
                        : null,
                    Company = (aa.Applicant != null && aa.Applicant.CompanyDetail != null)
                        ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                        {
                            Id = aa.Applicant.CompanyDetail.Id,
                            BarangayId = aa.Applicant.CompanyDetail.BarangayId,
                            Address = aa.Applicant.CompanyDetail.Address,
                            Name = aa.Applicant.CompanyDetail.Name,
                            RegistrationNumber = aa.Applicant.CompanyDetail.RegistrationNumber,
                            ContactNumber = aa.Applicant.CompanyDetail.ContactNumber,
                            Email = aa.Applicant.CompanyDetail.Email,
                            EntityType = aa.Applicant.CompanyDetail.EntityType != null ? aa.Applicant.CompanyDetail.EntityType.Value.ToString() : null
                        }
                        : (aa.Applicant != null && aa.Applicant.ApplicantDetail != null && aa.Applicant.ApplicantDetail.CompanyDetail != null)
                        ? new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                        {
                            Id = aa.Applicant.ApplicantDetail.CompanyDetail.Id,
                            BarangayId = aa.Applicant.ApplicantDetail.CompanyDetail.BarangayId,
                            Address = aa.Applicant.ApplicantDetail.CompanyDetail.Address,
                            Name = aa.Applicant.ApplicantDetail.CompanyDetail.Name,
                            RegistrationNumber = aa.Applicant.ApplicantDetail.CompanyDetail.RegistrationNumber,
                            ContactNumber = aa.Applicant.ApplicantDetail.ContactNumber,
                            Email = aa.Applicant.ApplicantDetail.CompanyDetail.Email,
                            EntityType = aa.Applicant.ApplicantDetail.CompanyDetail.EntityType != null ? aa.Applicant.ApplicantDetail.CompanyDetail.EntityType.Value.ToString() : null
                        }
                        : null,
                    Details = aa.Applicant != null && aa.Applicant.ApplicantDetail != null ? new EDGE.Application.Applicants.Dtos.ApplicantDetailDto
                    {
                        Id = aa.Applicant.ApplicantDetail.Id,
                        BarangayId = aa.Applicant.ApplicantDetail.BarangayId ?? Guid.Empty,
                        Address = aa.Applicant.ApplicantDetail.Address,
                        FirstName = aa.Applicant.ApplicantDetail.FirstName,
                        MiddleName = aa.Applicant.ApplicantDetail.MiddleName,
                        LastName = aa.Applicant.ApplicantDetail.LastName,
                        Suffix = aa.Applicant.ApplicantDetail.Suffix,
                        Nationality = aa.Applicant.ApplicantDetail.Nationality,
                        Sex = aa.Applicant.ApplicantDetail.Sex,
                        Height = aa.Applicant.ApplicantDetail.Height,
                        Weight = aa.Applicant.ApplicantDetail.Weight,
                        BirthDate = aa.Applicant.ApplicantDetail.BirthDate,
                        ContactNumber = aa.Applicant.ApplicantDetail.ContactNumber,
                        EmailAddress = aa.Applicant.ApplicantDetail.EmailAddress,
                        ZipCode = aa.Applicant.ApplicantDetail.ZipCode,
                        SchoolAttended = aa.Applicant.ApplicantDetail.SchoolAttended,
                        CourseTaken = aa.Applicant.ApplicantDetail.CourseTaken,
                        YearGraduated = aa.Applicant.ApplicantDetail.YearGraduated,
                        ESignature = aa.Applicant.ApplicantDetail.ESignature
                    } : null,
                    FormFieldValues = app.FormSubmissions
                        .Where(fs => aa.Applicant != null && fs.ApplicantId == aa.Applicant.Id)
                        .SelectMany(fs => fs.FieldValues)
                        .Select(fv => new EDGE.Application.Applicants.Dtos.FormFieldValueDto
                        {
                            FieldId = fv.FieldId,
                            FieldLabel = fv.Field != null ? fv.Field.Label : (fv.CustomLabel ?? "Field"),
                            Value = fv.Value
                        }).ToList()
                }).ToList(),
                StatementsOfAccount = app.StatementsOfAccount.Select(s => new EDGE.Application.Applications.Dtos.StatementOfAccountDto
                {
                    Id = s.Id,
                    ApplicationId = s.ApplicationId,
                    ApplicantId = s.ApplicantId,
                    SoaNumber = s.SoaNumber,
                    Status = s.Status.ToString(),
                    IssuedToType = s.IssuedToType.ToString(),
                    IssuedToName = s.IssuedToName,
                    IssuedToAddress = s.IssuedToAddress,
                    TotalAmount = s.TotalAmount,
                    DueDate = s.DueDate,
                    PreparedByUserId = s.PreparedByUserId,
                    ApprovedByUserId = s.ApprovedByUserId,
                    ApprovedAt = s.ApprovedAt,
                    Remarks = s.Remarks,
                    LineItems = s.LineItems.Select(li => new EDGE.Application.Applications.Dtos.SoaLineItemDto
                    {
                        Id = li.Id,
                        Particular = li.Particular,
                        ItemCode = li.ItemCode,
                        Description = li.Description,
                        PeriodOfCoverageStart = li.PeriodOfCoverageStart,
                        PeriodOfCoverageEnd = li.PeriodOfCoverageEnd,
                        ValidityYears = li.ValidityYears,
                        NoOfUnits = li.NoOfUnits,
                        FeeRate = li.FeeRate,
                        Amount = li.Amount
                    }).ToList(),
                    Histories = s.Histories.Select(sh => new EDGE.Application.Applications.Dtos.SoaHistoryDto
                    {
                        Id = sh.Id,
                        Action = sh.Action,
                        FromStatus = sh.FromStatus != null ? sh.FromStatus.Value.ToString() : null,
                        ToStatus = sh.ToStatus.ToString(),
                        PerformedByUserId = sh.PerformedByUserId,
                        StaffName = sh.StaffName,
                        StaffRole = sh.StaffRole,
                        Remarks = sh.Remarks,
                        Timestamp = sh.Timestamp
                    }).ToList()
                }).ToList(),
                OrdersOfPayment = app.OrdersOfPayment.Select(op => new EDGE.Application.Applications.Dtos.OrderOfPaymentDto
                {
                    Id = op.Id,
                    ApplicationId = op.ApplicationId,
                    StatementOfAccountId = op.StatementOfAccountId,
                    OpNumber = op.OpNumber,
                    Status = op.Status.ToString(),
                    AmountDue = op.AmountDue,
                    AmountReceived = op.AmountReceived,
                    PaymentMethod = op.PaymentMethod != null ? op.PaymentMethod.Value.ToString() : null,
                    OfficialReceiptNumber = op.OfficialReceiptNumber,
                    CheckNumber = op.CheckNumber,
                    CheckName = op.CheckName,
                    CheckBank = op.CheckBank,
                    CheckDate = op.CheckDate,
                    VerifiedByCashierId = op.VerifiedByCashierId,
                    PaidAt = op.PaidAt,
                    Remarks = op.Remarks,
                    Histories = op.Histories.Select(oph => new EDGE.Application.Applications.Dtos.OpHistoryDto
                    {
                        Id = oph.Id,
                        Action = oph.Action,
                        FromStatus = oph.FromStatus != null ? oph.FromStatus.Value.ToString() : null,
                        ToStatus = oph.ToStatus.ToString(),
                        PerformedByUserId = oph.PerformedByUserId,
                        StaffName = oph.StaffName,
                        StaffRole = oph.StaffRole,
                        OfficialReceiptNumber = oph.OfficialReceiptNumber,
                        Remarks = oph.Remarks,
                        Timestamp = oph.Timestamp
                    }).ToList()
                }).ToList(),
                Histories = app.Histories.Select(h => new EDGE.Application.Applications.Dtos.ApplicationHistoryDto
                {
                    Id = h.Id,
                    Action = h.Action,
                    FromStatus = h.FromStatus != null ? h.FromStatus.Value.ToString() : null,
                    ToStatus = h.ToStatus.ToString(),
                    PerformedByUserId = h.PerformedByUserId,
                    StaffName = h.StaffName,
                    StaffRole = h.StaffRole,
                    Remarks = h.Remarks,
                    Timestamp = h.Timestamp
                }).ToList(),
                CorrectionAuditTrails = app.CorrectionAuditTrails.Select(c => new EDGE.Application.Applications.Dtos.CorrectionAuditTrailDto
                {
                    Id = c.Id,
                    Category = c.Category,
                    FieldName = c.FieldName,
                    OldValue = c.OldValue,
                    NewValue = c.NewValue,
                    CorrectedByStaff = c.CorrectedByStaff,
                    CorrectedAt = c.CorrectedAt
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Domain.Entities.Application>> GetByApplicantIdAsync(Guid applicantId, CancellationToken cancellationToken = default)
    {
        return await _context.Applications
            .AsSplitQuery()
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

    public async Task AddCorrectionAuditTrailAsync(CorrectionAuditTrail trail, CancellationToken cancellationToken = default)
    {
        await _context.CorrectionAuditTrails.AddAsync(trail, cancellationToken);
    }

    public async Task AddCompanyDetailAsync(CompanyDetail companyDetail, CancellationToken cancellationToken = default)
    {
        await _context.CompanyDetails.AddAsync(companyDetail, cancellationToken);
    }

    public async Task<bool> UserExistsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users.AnyAsync(u => u.Id == userId, cancellationToken);
    }
}

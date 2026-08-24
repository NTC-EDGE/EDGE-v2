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
        CancellationToken cancellationToken = default)
    {
        var baseQuery = _context.Applications
            .AsNoTracking()
            .Where(a => a.Status != ApplicationStatus.Draft && !a.IsArchived);

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

    public async Task<List<EDGE.Application.Applicants.Dtos.ApplicantDto>> GetApplicationApplicantsAsync(Guid applicationId, CancellationToken cancellationToken = default)
    {
        var app = await _context.Applications
            .AsNoTracking()
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(ap => ap!.ApplicantDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(ap => ap!.CompanyDetail)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(ap => ap!.FormSubmission)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(ap => ap!.Service)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(ap => ap!.ServiceVariant)
            .Include(a => a.FormSubmissions)
            .FirstOrDefaultAsync(a => a.Id == applicationId, cancellationToken);

        if (app == null)
        {
            return new List<EDGE.Application.Applicants.Dtos.ApplicantDto>();
        }

        return app.ApplicationApplicants.Select(aa =>
        {
            var a = aa.Applicant;
            var applicantDto = new EDGE.Application.Applicants.Dtos.ApplicantDto
            {
                Id = a?.Id ?? Guid.Empty,
                TenantId = a?.TenantId ?? Guid.Empty,
                UserId = a?.UserId,
                IsGuest = a?.IsGuest ?? true,
                ApplicantType = a?.ApplicantType.ToString() ?? "Individual",
                Status = a?.Status.ToString() ?? "Incomplete",
                EvaluationRemarks = a?.EvaluationRemarks,
                ServiceId = a?.ServiceId,
                ServiceName = a?.Service?.Name,
                ServiceCode = a?.Service?.Code,
                ServiceVariantId = a?.ServiceVariantId,
                ServiceVariantName = a?.ServiceVariant?.Type.ToString(),
                SubmissionId = a?.FormSubmission != null ? a.FormSubmission.Id : app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == a?.Id)?.Id
            };

            if (a?.ApplicantDetail != null)
            {
                var ad = a.ApplicantDetail;
                applicantDto.Details = new EDGE.Application.Applicants.Dtos.ApplicantDetailDto
                {
                    Id = ad.Id,
                    BarangayId = ad.BarangayId ?? Guid.Empty,
                    Address = ad.Address,
                    FirstName = ad.FirstName,
                    MiddleName = ad.MiddleName,
                    LastName = ad.LastName,
                    Suffix = ad.Suffix,
                    Nationality = ad.Nationality,
                    Sex = ad.Sex,
                    Height = ad.Height,
                    Weight = ad.Weight,
                    BirthDate = ad.BirthDate,
                    ContactNumber = ad.ContactNumber,
                    EmailAddress = ad.EmailAddress,
                    ZipCode = ad.ZipCode,
                    SchoolAttended = ad.SchoolAttended,
                    CourseTaken = ad.CourseTaken,
                    YearGraduated = ad.YearGraduated,
                    ESignature = ad.ESignature
                };
            }

            if (a?.CompanyDetail != null || a?.ApplicantDetail?.CompanyDetail != null)
            {
                var cd = a?.CompanyDetail ?? a?.ApplicantDetail?.CompanyDetail;
                if (cd != null)
                {
                    applicantDto.Company = new EDGE.Application.Applicants.Dtos.CompanyDetailDto
                    {
                        Id = cd.Id,
                        BarangayId = cd.BarangayId,
                        Address = cd.Address,
                        Name = cd.Name,
                        RegistrationNumber = cd.RegistrationNumber,
                        ContactNumber = cd.ContactNumber,
                        Email = cd.Email,
                        EntityType = cd.EntityType?.ToString()
                    };
                }
            }

            return applicantDto;
        }).ToList();
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
        if (_context.Entry(application).State == EntityState.Detached)
        {
            _context.Applications.Update(application);
        }
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
            .Include(s => s.LineItems)
            .Include(s => s.Histories)
            .FirstOrDefaultAsync(s => s.Id == soaId, cancellationToken);
    }

    public async Task AddSoaAsync(StatementOfAccount soa, CancellationToken cancellationToken = default)
    {
        await _context.StatementsOfAccount.AddAsync(soa, cancellationToken);
    }

    public async Task AddSoaLineItemAsync(SoaLineItem lineItem, CancellationToken cancellationToken = default)
    {
        await _context.SoaLineItems.AddAsync(lineItem, cancellationToken);
    }

    public void RemoveSoaLineItem(SoaLineItem lineItem)
    {
        _context.SoaLineItems.Remove(lineItem);
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

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

public class OfficialReceiptRepository : IOfficialReceiptRepository
{
    private readonly ApplicationDbContext _context;

    public OfficialReceiptRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OfficialReceipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.OfficialReceipts
            .Include(r => r.LineItems)
            .Include(r => r.Booklet)
            .Include(r => r.IssuedByUser)
            .Include(r => r.CancelledByUser)
            .Include(r => r.Deposit)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<OfficialReceipt?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.OfficialReceipts
            .Include(r => r.LineItems)
            .Include(r => r.Booklet)
            .Include(r => r.IssuedByUser)
            .Include(r => r.CancelledByUser)
            .Include(r => r.Deposit)
                .ThenInclude(d => d!.BankAccount)
            .Include(r => r.OrderOfPayment)
            .Include(r => r.Application)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<OfficialReceipt?> GetByOrNumberAsync(Guid tenantId, string orNumber, CancellationToken cancellationToken = default)
    {
        return await _context.OfficialReceipts
            .Include(r => r.LineItems)
            .Include(r => r.Booklet)
            .Include(r => r.IssuedByUser)
            .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.OfficialReceiptNumber == orNumber, cancellationToken);
    }

    public async Task<List<OfficialReceipt>> GetByTenantAsync(
        Guid tenantId,
        ReceiptStatus? status = null,
        PaymentMethod? paymentMethod = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        Guid? cashierUserId = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.OfficialReceipts
            .AsNoTracking()
            .Include(r => r.LineItems)
            .Include(r => r.Booklet)
            .Include(r => r.IssuedByUser)
            .Include(r => r.CancelledByUser)
            .Include(r => r.Deposit)
            .Include(r => r.OrderOfPayment)
            .Include(r => r.Application)
            .Where(r => tenantId == Guid.Empty || r.TenantId == tenantId);

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        if (paymentMethod.HasValue)
        {
            query = query.Where(r => r.PaymentMethod == paymentMethod.Value);
        }

        if (fromDate.HasValue)
        {
            var fromUtc = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Utc);
            query = query.Where(r => r.IssuedAt >= fromUtc);
        }

        if (toDate.HasValue)
        {
            var toUtc = DateTime.SpecifyKind(toDate.Value.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
            query = query.Where(r => r.IssuedAt <= toUtc);
        }

        if (cashierUserId.HasValue)
        {
            query = query.Where(r => r.IssuedByUserId == cashierUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(r =>
                r.OfficialReceiptNumber.ToLower().Contains(s) ||
                r.PayorName.ToLower().Contains(s) ||
                (r.CheckNumber != null && r.CheckNumber.ToLower().Contains(s)) ||
                (r.OrderOfPayment != null && r.OrderOfPayment.OpNumber.ToLower().Contains(s)) ||
                (r.Application != null && r.Application.ApplicationNumber != null && r.Application.ApplicationNumber.ToLower().Contains(s)));
        }

        return await query
            .OrderByDescending(r => r.IssuedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<OfficialReceipt>> GetUndepositedReceiptsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.OfficialReceipts
            .AsNoTracking()
            .Include(r => r.LineItems)
            .Include(r => r.IssuedByUser)
            .Where(r => (tenantId == Guid.Empty || r.TenantId == tenantId) && r.Status == ReceiptStatus.Issued && r.DepositId == null)
            .OrderBy(r => r.IssuedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<OrderOfPayment>> GetPendingOrdersOfPaymentAsync(Guid tenantId, string? search = null, string? fieldOffice = null, CancellationToken cancellationToken = default)
    {
        // Self-heal: if any application is in PendingPayment ("For Payment") with an active StatementOfAccount
        // but is missing a corresponding OrderOfPayment record, provision the OrderOfPayment automatically.
        var appsWithoutOp = await _context.Applications
            .Include(a => a.StatementsOfAccount)
                .ThenInclude(s => s.LineItems)
            .Include(a => a.OrdersOfPayment)
            .Where(a => !a.IsArchived &&
                        a.Status == ApplicationStatus.PendingPayment &&
                        (tenantId == Guid.Empty || a.TenantId == tenantId) &&
                        a.StatementsOfAccount.Any(s => !s.IsDeleted && s.Status != SoaStatus.Returned) &&
                        !a.OrdersOfPayment.Any(o => !o.IsDeleted && o.Status != OpStatus.Returned))
            .ToListAsync(cancellationToken);

        if (appsWithoutOp.Count > 0)
        {
            foreach (var app in appsWithoutOp)
            {
                var activeSoas = app.StatementsOfAccount
                    .Where(s => !s.IsDeleted && s.Status != SoaStatus.Returned)
                    .OrderBy(s => s.CreatedAt)
                    .ToList();

                foreach (var soa in activeSoas)
                {
                    if (soa.Status != SoaStatus.Approved)
                    {
                        soa.Status = SoaStatus.Approved;
                        soa.ApprovedAt ??= DateTime.UtcNow;
                    }

                    var totalAmount = soa.TotalAmount > 0
                        ? soa.TotalAmount
                        : (soa.LineItems?.Sum(li => li.Amount) ?? 0m);

                    var autoOp = new OrderOfPayment
                    {
                        Id = Guid.NewGuid(),
                        ApplicationId = app.Id,
                        StatementOfAccountId = soa.Id,
                        OpNumber = $"OP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                        AmountDue = totalAmount,
                        AmountReceived = 0m,
                        Status = OpStatus.Billed,
                        Remarks = "Order of Payment issued. Ready for client payment.",
                        CreatedAt = soa.ApprovedAt ?? DateTime.UtcNow
                    };
                    await _context.OrdersOfPayment.AddAsync(autoOp, cancellationToken);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        // Query pending OrdersOfPayment without navigation cycles in Include
        var query = _context.OrdersOfPayment
            .AsNoTracking()
            .Include(op => op.StatementOfAccount)
                .ThenInclude(soa => soa.LineItems)
            .Include(op => op.Application)
                .ThenInclude(app => app.Tenant)
            .Include(op => op.Application)
                .ThenInclude(app => app.User)
                    .ThenInclude(u => u!.CompanyDetail)
            .Include(op => op.Application)
                .ThenInclude(app => app.ApplicationApplicants)
                    .ThenInclude(aa => aa.Applicant)
                        .ThenInclude(a => a!.ApplicantDetail)
            .Include(op => op.Application)
                .ThenInclude(app => app.ApplicationApplicants)
                    .ThenInclude(aa => aa.Applicant)
                        .ThenInclude(a => a!.CompanyDetail)
            .Include(op => op.Application)
                .ThenInclude(app => app.ApplicationApplicants)
                    .ThenInclude(aa => aa.Applicant)
                        .ThenInclude(a => a!.Service)
                            .ThenInclude(s => s!.ServiceCategory)
            .Where(op => (op.Status == OpStatus.Billed || op.Status == OpStatus.Processing) &&
                         op.Application != null &&
                         !op.Application.IsArchived &&
                         (op.Application.Status == ApplicationStatus.PendingPayment ||
                          op.Application.Status == ApplicationStatus.ForIssuance ||
                          op.Application.Status == ApplicationStatus.Approved) &&
                         (tenantId == Guid.Empty || op.Application.TenantId == tenantId));

        if (!string.IsNullOrWhiteSpace(fieldOffice))
        {
            var fo = fieldOffice.Trim().ToLower();
            query = query.Where(op =>
                string.IsNullOrEmpty(op.Application.Office) ||
                (op.Application.Tenant != null && op.Application.Office.ToLower() == op.Application.Tenant.Name.ToLower()) ||
                op.Application.Office.ToLower().Contains(fo) ||
                fo.Contains(op.Application.Office.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(op =>
                op.OpNumber.ToLower().Contains(term) ||
                (op.StatementOfAccount != null && op.StatementOfAccount.SoaNumber.ToLower().Contains(term)) ||
                (op.Application.ApplicationNumber != null && op.Application.ApplicationNumber.ToLower().Contains(term)) ||
                (op.Application.ReferenceNumber != null && op.Application.ReferenceNumber.ToLower().Contains(term)) ||
                op.Application.ApplicationApplicants.Any(aa => aa.Applicant != null && aa.Applicant.ApplicantDetail != null &&
                    ((aa.Applicant.ApplicantDetail.FirstName + " " + aa.Applicant.ApplicantDetail.LastName).ToLower().Contains(term) ||
                     (aa.Applicant.ApplicantDetail.EmailAddress != null && aa.Applicant.ApplicantDetail.EmailAddress.ToLower().Contains(term)))) ||
                (op.Application.User != null && (op.Application.User.FirstName + " " + op.Application.User.LastName).ToLower().Contains(term)) ||
                (op.Application.User != null && op.Application.User.CompanyDetail != null && op.Application.User.CompanyDetail.Name.ToLower().Contains(term))
            );
        }

        var pendingOps = await query
            .OrderByDescending(op => op.Status == OpStatus.Processing)
            .ThenByDescending(op => op.CreatedAt)
            .ToListAsync(cancellationToken);

        // Populate sibling OrdersOfPayment on each Application without introducing an EF Core Include cycle
        var appIds = pendingOps
            .Select(op => op.ApplicationId)
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        if (appIds.Count > 0)
        {
            var allSiblingOps = await _context.OrdersOfPayment
                .AsNoTracking()
                .Include(o => o.StatementOfAccount)
                    .ThenInclude(s => s.LineItems)
                .Where(o => appIds.Contains(o.ApplicationId) && o.Status != OpStatus.Returned)
                .OrderBy(o => o.CreatedAt)
                .ToListAsync(cancellationToken);

            var opsByAppId = allSiblingOps
                .GroupBy(o => o.ApplicationId)
                .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var op in pendingOps)
            {
                if (op.Application != null && opsByAppId.TryGetValue(op.ApplicationId, out var siblings))
                {
                    op.Application.OrdersOfPayment = siblings;
                }
            }
        }

        return pendingOps;
    }

    public async Task<List<OfficialReceipt>> GetByOrderOfPaymentIdAsync(Guid orderOfPaymentId, CancellationToken cancellationToken = default)
    {
        return await _context.OfficialReceipts
            .AsNoTracking()
            .Include(r => r.LineItems)
            .Include(r => r.IssuedByUser)
            .Where(r => r.OrderOfPaymentId == orderOfPaymentId)
            .OrderBy(r => r.IssuedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsOrNumberAsync(Guid tenantId, string orNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.OfficialReceipts
            .Where(r => (tenantId == Guid.Empty || r.TenantId == tenantId) && r.OfficialReceiptNumber == orNumber);

        if (excludeId.HasValue)
        {
            query = query.Where(r => r.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(OfficialReceipt receipt, CancellationToken cancellationToken = default)
    {
        await _context.OfficialReceipts.AddAsync(receipt, cancellationToken);
    }

    public Task UpdateAsync(OfficialReceipt receipt, CancellationToken cancellationToken = default)
    {
        var entry = _context.Entry(receipt);
        if (entry.State == EntityState.Detached)
        {
            _context.OfficialReceipts.Update(receipt);
        }
        return Task.CompletedTask;
    }
}

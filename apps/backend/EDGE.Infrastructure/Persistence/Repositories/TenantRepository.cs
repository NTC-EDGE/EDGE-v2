using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly ApplicationDbContext _context;

    public TenantRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default)
    {
        await _context.Tenants.AddAsync(tenant, cancellationToken);
    }

    public async Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Tenant?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Code == code, cancellationToken);
    }

    public async Task<List<Tenant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Tenants
            .Include(t => t.Members)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<EDGE.Application.Tenants.DTOs.TenantClientDto> Items, int TotalCount)> GetTenantClientsAsync(
        Guid tenantId,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var applications = await _context.Applications
            .AsNoTracking()
            .Where(a => a.TenantId == tenantId)
            .Include(a => a.User)
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
            .ToListAsync(cancellationToken);

        var directApplicants = await _context.Applicants
            .AsNoTracking()
            .Where(a => a.TenantId == tenantId)
            .Include(a => a.User)
            .Include(a => a.ApplicantDetail)
                .ThenInclude(ad => ad!.CompanyDetail)
            .Include(a => a.CompanyDetail)
            .Include(a => a.Service)
            .ToListAsync(cancellationToken);

        var clientMap = new Dictionary<string, EDGE.Application.Tenants.DTOs.TenantClientDto>();

        foreach (var app in applications)
        {
            var user = app.User;
            var primaryApplicant = app.ApplicationApplicants?.FirstOrDefault()?.Applicant;
            var detail = primaryApplicant?.ApplicantDetail;
            var company = primaryApplicant?.CompanyDetail ?? detail?.CompanyDetail;

            var key = user?.Id.ToString() ?? primaryApplicant?.Id.ToString() ?? app.Id.ToString();
            
            var name = user != null ? $"{user.FirstName} {user.LastName}".Trim() :
                       detail != null ? $"{detail.FirstName} {detail.LastName}".Trim() :
                       company?.Name ?? "Client Entity";
            if (string.IsNullOrWhiteSpace(name) && user != null) name = user.Email;

            var email = user?.Email ?? detail?.EmailAddress ?? company?.Email ?? "";
            var organization = company?.Name ?? (primaryApplicant?.ApplicantType == Domain.Enums.ApplicantType.Company ? "Corporate Client" : "Individual Applicant");
            var licenseCategory = primaryApplicant?.Service?.Name ?? "Telecommunications Licensing";
            var status = app.Status switch
            {
                Domain.Enums.ApplicationStatus.Approved or Domain.Enums.ApplicationStatus.Completed => "Active License",
                Domain.Enums.ApplicationStatus.Evaluating or Domain.Enums.ApplicationStatus.Submitted => "Under Review",
                Domain.Enums.ApplicationStatus.Returned => "Returned for Correction",
                Domain.Enums.ApplicationStatus.Draft => "Draft",
                _ => "Under Review"
            };

            if (clientMap.TryGetValue(key, out var existing))
            {
                clientMap[key] = existing with
                {
                    ApplicationCount = existing.ApplicationCount + 1,
                    RegisteredDate = existing.RegisteredDate < app.CreatedAt ? existing.RegisteredDate : app.CreatedAt
                };
            }
            else
            {
                clientMap[key] = new EDGE.Application.Tenants.DTOs.TenantClientDto(
                    Id: user?.Id ?? primaryApplicant?.Id ?? app.Id,
                    UserId: user?.Id,
                    Name: name,
                    Email: email,
                    Organization: organization,
                    LicenseCategory: licenseCategory,
                    Status: status,
                    ApplicationCount: 1,
                    RegisteredDate: app.CreatedAt
                );
            }
        }

        foreach (var applicant in directApplicants)
        {
            var user = applicant.User;
            var detail = applicant.ApplicantDetail;
            var company = applicant.CompanyDetail ?? detail?.CompanyDetail;

            var key = user?.Id.ToString() ?? applicant.Id.ToString();

            if (!clientMap.ContainsKey(key))
            {
                var name = user != null ? $"{user.FirstName} {user.LastName}".Trim() :
                           detail != null ? $"{detail.FirstName} {detail.LastName}".Trim() :
                           company?.Name ?? "Client Entity";
                if (string.IsNullOrWhiteSpace(name) && user != null) name = user.Email;

                var email = user?.Email ?? detail?.EmailAddress ?? company?.Email ?? "";
                var organization = company?.Name ?? (applicant.ApplicantType == Domain.Enums.ApplicantType.Company ? "Corporate Client" : "Individual Applicant");
                var licenseCategory = applicant.Service?.Name ?? "Telecommunications Licensing";
                var status = applicant.Status == Domain.Enums.ApplicantStatus.Complete ? "Active License" : "Under Review";

                clientMap[key] = new EDGE.Application.Tenants.DTOs.TenantClientDto(
                    Id: user?.Id ?? applicant.Id,
                    UserId: user?.Id,
                    Name: name,
                    Email: email,
                    Organization: organization,
                    LicenseCategory: licenseCategory,
                    Status: status,
                    ApplicationCount: 1,
                    RegisteredDate: applicant.CreatedAt
                );
            }
        }

        var results = clientMap.Values.ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            results = results.Where(c =>
                c.Name.ToLower().Contains(s) ||
                c.Email.ToLower().Contains(s) ||
                c.Organization.ToLower().Contains(s)
            ).ToList();
        }

        var totalCount = results.Count;
        var pagedItems = results
            .OrderByDescending(c => c.RegisteredDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return (pagedItems, totalCount);
    }

    public async Task<(List<EDGE.Application.Tenants.DTOs.TenantTransactionDto> Items, int TotalCount)> GetTenantTransactionsAsync(
        Guid tenantId,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var soas = await _context.StatementsOfAccount
            .AsNoTracking()
            .Where(s => s.Application.TenantId == tenantId)
            .Include(s => s.Application)
                .ThenInclude(a => a.User)
            .Include(s => s.Application)
                .ThenInclude(a => a.ApplicationApplicants)
                    .ThenInclude(aa => aa.Applicant)
                        .ThenInclude(app => app!.Service)
            .Include(s => s.Applicant)
                .ThenInclude(app => app!.ApplicantDetail)
            .Include(s => s.Applicant)
                .ThenInclude(app => app!.Service)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);

        var soaIds = soas.Select(s => s.Id).ToList();

        var ops = await _context.OrdersOfPayment
            .AsNoTracking()
            .Where(op => op.Application.TenantId == tenantId || soaIds.Contains(op.StatementOfAccountId))
            .Include(op => op.Application)
                .ThenInclude(a => a.User)
            .Include(op => op.StatementOfAccount)
            .OrderByDescending(op => op.CreatedAt)
            .ToListAsync(cancellationToken);

        var txList = new List<EDGE.Application.Tenants.DTOs.TenantTransactionDto>();
        var coveredApplicationIds = new HashSet<Guid>();

        foreach (var op in ops)
        {
            var app = op.Application;
            if (app != null) coveredApplicationIds.Add(app.Id);

            var applicantName = !string.IsNullOrWhiteSpace(op.StatementOfAccount?.IssuedToName)
                ? op.StatementOfAccount.IssuedToName
                : app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Client Entity";

            var refNo = !string.IsNullOrWhiteSpace(op.OfficialReceiptNumber)
                ? op.OfficialReceiptNumber
                : !string.IsNullOrWhiteSpace(op.OpNumber)
                    ? op.OpNumber
                    : op.StatementOfAccount?.SoaNumber ?? $"OP-{op.Id.ToString()[..8].ToUpper()}";

            var serviceType = app?.ApplicationApplicants?.FirstOrDefault()?.Applicant?.Service?.Name ?? "Regulatory Permit Fee";
            var amount = op.AmountReceived > 0 ? op.AmountReceived : op.AmountDue;
            var paymentStatus = op.Status == Domain.Enums.OpStatus.Paid ? "Paid" : "Pending";
            var date = op.LastModifiedAt ?? op.PaidAt ?? op.CreatedAt;

            txList.Add(new EDGE.Application.Tenants.DTOs.TenantTransactionDto(
                Id: op.Id,
                RefNo: refNo,
                ApplicantName: applicantName,
                ServiceType: serviceType,
                Amount: amount,
                PaymentStatus: paymentStatus,
                Date: date
            ));
        }

        var coveredSoaIds = ops.Select(op => op.StatementOfAccountId).ToHashSet();
        foreach (var soa in soas.Where(s => !coveredSoaIds.Contains(s.Id)))
        {
            if (soa.Application != null) coveredApplicationIds.Add(soa.Application.Id);

            var applicantName = !string.IsNullOrWhiteSpace(soa.IssuedToName)
                ? soa.IssuedToName
                : soa.Application?.User != null ? $"{soa.Application.User.FirstName} {soa.Application.User.LastName}".Trim() : "Client Entity";

            var refNo = !string.IsNullOrWhiteSpace(soa.SoaNumber) ? soa.SoaNumber : $"SOA-{soa.Id.ToString()[..8].ToUpper()}";
            var serviceType = soa.Application?.ApplicationApplicants?.FirstOrDefault()?.Applicant?.Service?.Name
                              ?? soa.Applicant?.Service?.Name
                              ?? "Regulatory Permit & Fee Assessment";
            var amount = soa.TotalAmount;
            var paymentStatus = soa.Status == Domain.Enums.SoaStatus.Approved ? "Assessed" : "Pending";
            var date = soa.LastModifiedAt ?? soa.CreatedAt;

            txList.Add(new EDGE.Application.Tenants.DTOs.TenantTransactionDto(
                Id: soa.Id,
                RefNo: refNo,
                ApplicantName: applicantName,
                ServiceType: serviceType,
                Amount: amount,
                PaymentStatus: paymentStatus,
                Date: date
            ));
        }

        var applications = await _context.Applications
            .AsNoTracking()
            .Where(a => a.TenantId == tenantId && !coveredApplicationIds.Contains(a.Id))
            .Include(a => a.User)
            .Include(a => a.ApplicationApplicants)
                .ThenInclude(aa => aa.Applicant)
                    .ThenInclude(app => app!.Service)
            .OrderByDescending(a => a.LastModifiedAt ?? a.CreatedAt)
            .ToListAsync(cancellationToken);

        foreach (var app in applications)
        {
            var applicantName = app.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Client Entity";
            if (string.IsNullOrWhiteSpace(applicantName) && app.User != null) applicantName = app.User.Email;

            var refNo = !string.IsNullOrWhiteSpace(app.ReferenceNumber)
                ? app.ReferenceNumber
                : !string.IsNullOrWhiteSpace(app.ApplicationNumber)
                    ? app.ApplicationNumber
                    : $"APP-{app.Id.ToString()[..8].ToUpper()}";

            var serviceType = app.ApplicationApplicants?.FirstOrDefault()?.Applicant?.Service?.Name ?? "Radio Operator / Station Permit";
            var amount = 0m;
            var paymentStatus = app.Status == Domain.Enums.ApplicationStatus.Approved || app.Status == Domain.Enums.ApplicationStatus.Completed ? "Paid" : "Pending";
            var date = app.LastModifiedAt ?? app.CreatedAt;

            txList.Add(new EDGE.Application.Tenants.DTOs.TenantTransactionDto(
                Id: app.Id,
                RefNo: refNo,
                ApplicantName: applicantName,
                ServiceType: serviceType,
                Amount: amount,
                PaymentStatus: paymentStatus,
                Date: date
            ));
        }

        var filteredTx = txList;
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            filteredTx = filteredTx.Where(t =>
                t.RefNo.ToLower().Contains(s) ||
                t.ApplicantName.ToLower().Contains(s) ||
                t.ServiceType.ToLower().Contains(s) ||
                t.PaymentStatus.ToLower().Contains(s)
            ).ToList();
        }

        var totalCount = filteredTx.Count;
        var pagedItems = filteredTx
            .OrderByDescending(t => t.Date)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return (pagedItems, totalCount);
    }

    public async Task<EDGE.Application.Tenants.DTOs.TenantClientDetailsDto?> GetTenantClientDetailsAsync(
        Guid tenantId,
        Guid clientId,
        CancellationToken cancellationToken = default)
    {
        var applications = await _context.Applications
            .AsNoTracking()
            .Where(a => a.TenantId == tenantId && (a.Id == clientId || a.UserId == clientId || a.ApplicationApplicants.Any(aa => aa.ApplicantId == clientId || aa.Applicant!.UserId == clientId)))
            .Include(a => a.User)
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
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        var directApplicant = await _context.Applicants
            .AsNoTracking()
            .Where(app => app.TenantId == tenantId && (app.Id == clientId || app.UserId == clientId))
            .Include(app => app.User)
            .Include(app => app.ApplicantDetail)
                .ThenInclude(ad => ad!.CompanyDetail)
            .Include(app => app.CompanyDetail)
            .Include(app => app.Service)
            .FirstOrDefaultAsync(cancellationToken);

        if (!applications.Any() && directApplicant == null)
        {
            return null;
        }

        var primaryApp = applications.FirstOrDefault();
        var primaryApplicant = primaryApp?.ApplicationApplicants?.FirstOrDefault()?.Applicant ?? directApplicant;
        var user = primaryApp?.User ?? directApplicant?.User;
        var detail = primaryApplicant?.ApplicantDetail;
        var company = primaryApplicant?.CompanyDetail ?? detail?.CompanyDetail;

        var name = user != null ? $"{user.FirstName} {user.LastName}".Trim() :
                   detail != null ? $"{detail.FirstName} {detail.LastName}".Trim() :
                   company?.Name ?? "Client Entity";
        if (string.IsNullOrWhiteSpace(name) && user != null) name = user.Email;

        var email = user?.Email ?? detail?.EmailAddress ?? company?.Email ?? "";
        var contactNumber = detail?.ContactNumber ?? company?.ContactNumber ?? "";
        var address = detail?.Address ?? company?.Address ?? "";
        var nationality = detail?.Nationality ?? "Filipino";
        var sex = detail?.Sex;
        var birthDate = detail?.BirthDate.ToString("yyyy-MM-dd");

        var organization = company?.Name ?? (primaryApplicant?.ApplicantType == Domain.Enums.ApplicantType.Company ? "Corporate Client" : "Individual Applicant");
        var regNumber = company?.RegistrationNumber;
        var compAddress = company?.Address;
        var compEmail = company?.Email;
        var compContact = company?.ContactNumber;

        var serviceType = primaryApplicant?.Service?.Name ?? "Telecommunications & Spectrum Licensing";
        var serviceCode = primaryApplicant?.Service?.Code ?? "NTC-SVC";
        var appNumber = primaryApp?.ApplicationNumber ?? primaryApp?.ReferenceNumber ?? $"APP-{clientId.ToString()[..8].ToUpper()}";
        var refNumber = primaryApp?.ReferenceNumber ?? appNumber;
        var status = primaryApp != null ? primaryApp.Status.ToString() : (primaryApplicant?.Status.ToString() ?? "Active");
        var appMode = primaryApp?.SubmissionMode.ToString() ?? "Single";

        var appIds = applications.Select(a => a.Id).ToList();
        var soas = await _context.StatementsOfAccount
            .AsNoTracking()
            .Where(s => (s.Application != null && appIds.Contains(s.Application.Id)) || (s.ApplicantId != null && primaryApplicant != null && s.ApplicantId == primaryApplicant.Id))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);

        var soaIds = soas.Select(s => s.Id).ToList();
        var ops = await _context.OrdersOfPayment
            .AsNoTracking()
            .Where(op => (op.Application != null && appIds.Contains(op.Application.Id)) || soaIds.Contains(op.StatementOfAccountId))
            .OrderByDescending(op => op.CreatedAt)
            .ToListAsync(cancellationToken);

        var txs = new List<EDGE.Application.Tenants.DTOs.TenantClientTransactionDto>();
        foreach (var op in ops)
        {
            txs.Add(new EDGE.Application.Tenants.DTOs.TenantClientTransactionDto(
                Id: op.Id,
                RefNo: !string.IsNullOrWhiteSpace(op.OfficialReceiptNumber) ? op.OfficialReceiptNumber : (!string.IsNullOrWhiteSpace(op.OpNumber) ? op.OpNumber : $"OP-{op.Id.ToString()[..8].ToUpper()}"),
                Type: "Order of Payment",
                Amount: op.AmountReceived > 0 ? op.AmountReceived : op.AmountDue,
                Status: op.Status.ToString(),
                Date: op.LastModifiedAt ?? op.PaidAt ?? op.CreatedAt
            ));
        }

        var opSoaIds = ops.Select(op => op.StatementOfAccountId).ToHashSet();
        foreach (var soa in soas.Where(s => !opSoaIds.Contains(s.Id)))
        {
            txs.Add(new EDGE.Application.Tenants.DTOs.TenantClientTransactionDto(
                Id: soa.Id,
                RefNo: !string.IsNullOrWhiteSpace(soa.SoaNumber) ? soa.SoaNumber : $"SOA-{soa.Id.ToString()[..8].ToUpper()}",
                Type: "Statement of Account",
                Amount: soa.TotalAmount,
                Status: soa.Status.ToString(),
                Date: soa.LastModifiedAt ?? soa.CreatedAt
            ));
        }

        return new EDGE.Application.Tenants.DTOs.TenantClientDetailsDto(
            Id: clientId,
            UserId: user?.Id,
            Name: name,
            Email: email,
            ContactNumber: contactNumber,
            Address: address,
            Nationality: nationality,
            Sex: sex,
            BirthDate: birthDate,
            Organization: organization,
            CompanyRegistrationNumber: regNumber,
            CompanyAddress: compAddress,
            CompanyEmail: compEmail,
            CompanyContactNumber: compContact,
            ServiceType: serviceType,
            ServiceCode: serviceCode,
            ApplicationNumber: appNumber,
            ReferenceNumber: refNumber,
            Status: status,
            ApplicationMode: appMode,
            TotalApplications: applications.Count > 0 ? applications.Count : 1,
            RegisteredDate: primaryApp?.CreatedAt ?? directApplicant?.CreatedAt ?? DateTime.UtcNow,
            Transactions: txs.OrderByDescending(t => t.Date).ToList()
        );
    }

    public void Delete(Tenant tenant)
    {
        _context.Tenants.Remove(tenant);
    }
}

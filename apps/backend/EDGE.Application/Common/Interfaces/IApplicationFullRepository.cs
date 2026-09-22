using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Common.Interfaces;

public interface IApplicationFullRepository
{
    Task AddAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Application?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Application?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Application?> GetByIdWithDetailsAsync(Guid id, bool asNoTracking, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Application>> GetUserDraftsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Application>> GetUserDraftsAsync(List<Guid> userIds, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Application>> GetUserApplicationsAsync(Guid userId, ApplicationStatus? status = null, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Application>> GetAllApplicationsAsync(ApplicationStatus? status = null, string? queueTab = null, string? scope = null, CancellationToken cancellationToken = default);
    Task<List<EDGE.Application.Applications.Dtos.ApplicationSummaryDto>> GetApplicationSummaryDtosAsync(ApplicationStatus? status = null, string? queueTab = null, string? scope = null, Guid? userId = null, string? userEmail = null, CancellationToken cancellationToken = default);
    Task<EDGE.Application.Applications.Dtos.PagedApplicationListDto> GetPagedApplicationSummaryDtosAsync(ApplicationStatus? status = null, string? queueTab = null, string? scope = null, Guid? userId = null, string? userEmail = null, int pageNumber = 1, int pageSize = 10, string? searchTerm = null, string? mode = null, Guid? tenantId = null, List<Guid>? tenantIds = null, string? fieldOffice = null, string? assignedTo = null, CancellationToken cancellationToken = default);
    Task<List<EDGE.Application.Applicants.Dtos.ApplicantDto>> GetApplicationApplicantsAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Application>> GetByApplicantIdAsync(Guid applicantId, CancellationToken cancellationToken = default);


    Task UpdateAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default);
    Task DeleteAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default);

    Task AddApplicationApplicantAsync(ApplicationApplicant appApplicant, CancellationToken cancellationToken = default);
    Task AddApplicationRequirementAsync(ApplicationRequirement appRequirement, CancellationToken cancellationToken = default);
    Task UpdateApplicationRequirementAsync(ApplicationRequirement appRequirement, CancellationToken cancellationToken = default);
    Task<List<ApplicationRequirement>> GetApplicantRequirementsAsync(Guid applicationId, Guid applicantId, CancellationToken cancellationToken = default);
    Task AddApplicationStatusHistoryAsync(ApplicationStatusHistory statusHistory, CancellationToken cancellationToken = default);
    Task AddFormSubmissionAsync(FormSubmission formSubmission, CancellationToken cancellationToken = default);
    Task AddFormFieldValueAsync(FormFieldValue fieldValue, CancellationToken cancellationToken = default);

    Task<StatementOfAccount?> GetSoaByIdAsync(Guid soaId, CancellationToken cancellationToken = default);
    Task AddSoaAsync(StatementOfAccount soa, CancellationToken cancellationToken = default);
    Task AddSoaLineItemAsync(SoaLineItem lineItem, CancellationToken cancellationToken = default);
    void RemoveSoaLineItem(SoaLineItem lineItem);
    Task<OrderOfPayment?> GetOpByIdAsync(Guid opId, CancellationToken cancellationToken = default);
    Task AddOpAsync(OrderOfPayment op, CancellationToken cancellationToken = default);
    Task AddApplicationHistoryAsync(ApplicationHistory history, CancellationToken cancellationToken = default);
    Task AddSoaHistoryAsync(SoaHistory history, CancellationToken cancellationToken = default);
    Task AddCorrectionAuditTrailAsync(CorrectionAuditTrail trail, CancellationToken cancellationToken = default);
    Task AddCompanyDetailAsync(CompanyDetail companyDetail, CancellationToken cancellationToken = default);
    Task<bool> UserExistsAsync(Guid userId, CancellationToken cancellationToken = default);
}

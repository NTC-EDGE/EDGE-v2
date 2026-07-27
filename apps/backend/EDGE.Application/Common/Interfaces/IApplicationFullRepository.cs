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
    Task<List<Domain.Entities.Application>> GetUserDraftsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Application>> GetUserApplicationsAsync(Guid userId, ApplicationStatus? status = null, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Application>> GetAllApplicationsAsync(ApplicationStatus? status = null, CancellationToken cancellationToken = default);


    Task UpdateAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default);
    Task DeleteAsync(Domain.Entities.Application application, CancellationToken cancellationToken = default);

    Task AddApplicationServiceAsync(ApplicationService appService, CancellationToken cancellationToken = default);
    Task AddApplicationApplicantAsync(ApplicationApplicant appApplicant, CancellationToken cancellationToken = default);
    Task AddApplicationRequirementAsync(ApplicationRequirement appRequirement, CancellationToken cancellationToken = default);
    Task<List<ApplicationRequirement>> GetApplicantRequirementsAsync(Guid applicationId, Guid applicantId, CancellationToken cancellationToken = default);
    Task AddApplicationStatusHistoryAsync(ApplicationStatusHistory statusHistory, CancellationToken cancellationToken = default);
    Task AddFormSubmissionAsync(FormSubmission formSubmission, CancellationToken cancellationToken = default);
    Task AddFormFieldValueAsync(FormFieldValue fieldValue, CancellationToken cancellationToken = default);
}

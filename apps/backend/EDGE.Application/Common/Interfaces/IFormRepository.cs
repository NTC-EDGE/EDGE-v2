using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Common.Interfaces;

public interface IFormRepository
{
    Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<Form?> GetFormByServiceIdAsync(
        Guid serviceId,
        Guid? serviceVariantId,
        string? formKey = null,
        CancellationToken cancellationToken = default);
    Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Form>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<Field>> GetFieldsByIdsAsync(IEnumerable<Guid> fieldIds, CancellationToken cancellationToken = default);
    Task AddAsync(Form form, CancellationToken cancellationToken = default);
    void Update(Form form);
    void Delete(Form form);
    Task<Form> SaveFormStructureAsync(
        Guid formId,
        Guid serviceId,
        string version,
        bool categorySelectionRequired,
        List<FormSectionDto> incomingSections,
        string? name = null,
        bool? isActive = null,
        string? key = null,
        Guid? serviceVariantId = null,
        Guid? baseFormId = null,
        CancellationToken cancellationToken = default);
    Task<Form?> SetFormActiveAsync(Guid formId, CancellationToken cancellationToken = default);
    Task<List<Form>> GetVersionsByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<Form?> GetActiveVariantFormAsync(Guid variantId, CancellationToken cancellationToken = default);
    Task<bool> RevertVariantFormAsync(Guid variantId, CancellationToken cancellationToken = default);
    Task<bool> SetVariantFormActiveAsync(Guid variantId, bool isActive, CancellationToken cancellationToken = default);
    Guid ResolveCanonicalServiceId(Guid serviceId);
    IReadOnlyCollection<Guid> GetCanonicalServiceGroupIds(Guid serviceId);
    Task<List<Guid>> GetCustomizedVariantIdsForServiceGroupAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<int> GetLinkedVariantsCountForServiceGroupAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<string?> ValidateBaseFormDeletionsAsync(Guid baseFormId, Guid serviceId, List<FormSectionDto> incomingSections, CancellationToken cancellationToken = default);
    Task<string?> ValidateCanDeleteFormAsync(Form form, CancellationToken cancellationToken = default);
    Task SyncVariantFormToBaseFormAsync(Form variantForm, ServiceVariant variant, CancellationToken cancellationToken = default);
    Task PromoteVariantDraftOverridesAsync(Form variantForm, ServiceVariant variant, CancellationToken cancellationToken = default);
    Task SyncBaseFormToVariantFormsAsync(Form baseForm, bool overwriteCustomizedOverrides, CancellationToken cancellationToken = default);
    Task<(List<FormSummaryDto> Items, int TotalCount)> GetFormSummariesAsync(
        int pageNumber = 1,
        int pageSize = 50,
        string? searchTerm = null,
        Guid? serviceId = null,
        string? formKey = null,
        Guid? serviceCategoryId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);
    Task<FormFilterOptionsDto> GetFormFilterOptionsAsync(CancellationToken cancellationToken = default);
    Task<(Form? Form, List<FormVersionSummaryDto> Versions, List<Guid> CustomizedVariantIds, List<FormServiceOptionDto> LinkedServices, List<EDGE.Application.Services.Dtos.ServiceVariantDto> ServiceVariants)> GetFormWorkspaceDataAsync(
        Guid formId,
        CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, (int LinkedVariantsCount, List<Guid> CustomizedVariantIds)>> GetBatchVariantMetadataForServicesAsync(
        IEnumerable<Guid> serviceIds,
        CancellationToken cancellationToken = default);
}

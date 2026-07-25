using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UploadApplicantRequirement;

public class UploadApplicantRequirementCommandHandler
    : IRequestHandler<UploadApplicantRequirementCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IRequirementRepository _requirementRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ITenantContextService _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public UploadApplicantRequirementCommandHandler(
        IApplicationFullRepository applicationRepository,
        IRequirementRepository requirementRepository,
        IServiceRepository serviceRepository,
        ITenantContextService tenantContext,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _requirementRepository = requirementRepository;
        _serviceRepository = serviceRepository;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(
        UploadApplicantRequirementCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Resolve tenant securely from auth context — never from client payload
        var tenantId = _tenantContext.TenantId;
        if (tenantId == null)
            return ApiResponse<Guid>.Fail(
                "Tenant context could not be resolved for the current user.");

        // 2. Load application with full details (includes FormSubmissions → FieldValues → Field)
        var app = await _applicationRepository.GetByIdWithDetailsAsync(
            request.ApplicationId, cancellationToken);
        if (app == null)
            return ApiResponse<Guid>.Fail(
                $"Application '{request.ApplicationId}' was not found.");

        // 3. Verify this application belongs to the authenticated tenant
        if (app.TenantId != tenantId.Value)
            return ApiResponse<Guid>.Fail(
                "You do not have permission to upload requirements for this application.");

        // 4. Verify the applicant is a member of this application
        var isApplicantMember = app.ApplicationApplicants
            .Any(a => a.ApplicantId == request.ApplicantId);
        if (!isApplicantMember)
            return ApiResponse<Guid>.Fail(
                $"Applicant '{request.ApplicantId}' is not linked to application '{request.ApplicationId}'.");

        // 5. Resolve RequirementId — prefer ServiceVariantRequirementId (auto-derives RequirementId)
        Guid resolvedRequirementId;
        if (request.ServiceVariantRequirementId.HasValue)
        {
            var svr = await _requirementRepository.GetServiceVariantRequirementByIdAsync(
                request.ServiceVariantRequirementId.Value, cancellationToken);
            if (svr == null)
                return ApiResponse<Guid>.Fail(
                    $"ServiceVariantRequirement '{request.ServiceVariantRequirementId}' was not found.");

            resolvedRequirementId = svr.RequirementId;
        }
        else if (request.RequirementId.HasValue)
        {
            resolvedRequirementId = request.RequirementId.Value;
        }
        else
        {
            return ApiResponse<Guid>.Fail(
                "Either RequirementId or ServiceVariantRequirementId must be provided.");
        }

        // 6. Verify requirement exists in master catalog
        var reqMaster = await _requirementRepository.GetRequirementByIdAsync(
            resolvedRequirementId, cancellationToken);
        if (reqMaster == null)
            return ApiResponse<Guid>.Fail(
                $"Requirement '{resolvedRequirementId}' was not found in the master catalog.");

        // 7. Resolve per-applicant ContextKey from FormFieldValues + Service.Contract
        //    This replaces the old application-level ApplicationTypeKey lookup.
        var appService = app.ApplicationServices.FirstOrDefault();
        if (appService?.ServiceId != null)
        {
            // Load the service to access its Contract JSON
            var service = await _serviceRepository.GetByIdAsync(appService.ServiceId.Value, cancellationToken);

            string? contextKey = null;

            if (service != null && !string.IsNullOrWhiteSpace(service.Contract))
            {
                contextKey = ResolveContextKey(
                    service.Contract,
                    app.FormSubmissions,
                    request.ApplicantId);
            }

            // Query rules scoped to this applicant's specific context
            var validRules = await _requirementRepository.GetServiceVariantRequirementsAsync(
                appService.ServiceId.Value,
                appService.ServiceVariantId,
                contextKey,
                cancellationToken);

            // If rules are configured for this context, enforce them strictly.
            // If no rules exist yet, remain permissive (graceful degradation).
            if (validRules.Any() &&
                !validRules.Any(r => r.RequirementId == resolvedRequirementId))
            {
                return ApiResponse<Guid>.Fail(
                    $"Requirement '{reqMaster.Name}' is not permitted for this applicant's service context (ContextKey: '{contextKey ?? "none"}').");
            }
        }

        // 8. Auto-generate storage URL — never accepted from client
        var url = $"tenants/{tenantId.Value}/requirements/{request.StoredFileId}";

        var entity = new ApplicationRequirement
        {
            ApplicationId               = request.ApplicationId,
            ApplicantId                 = request.ApplicantId,
            RequirementId               = resolvedRequirementId,
            ServiceVariantRequirementId = request.ServiceVariantRequirementId,
            TenantId                    = tenantId.Value,
            Url                         = url,
            IsApproved                  = false
        };

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.AddApplicationRequirementAsync(
                entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(
                entity.Id, "Applicant requirement document uploaded successfully.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to upload requirement. Error: {ex.Message}");
        }
    }

    /// <summary>
    /// Resolves the per-applicant ContextKey by:
    /// 1. Reading requirementDiscriminatorFields from Service.Contract JSON (e.g. ["examCategory","examineeType"])
    /// 2. Finding the applicant's FormSubmission and reading those field values
    /// 3. Optionally normalizing raw values through requirementContextGroups (e.g. "1RTG" → "CommercialROC")
    /// 4. Joining resolved values with "|" → e.g. "Radiotelegraphy|Re-taker"
    /// Returns null when no discriminator fields are configured (service has uniform requirements per variant).
    /// </summary>
    private static string? ResolveContextKey(
        string contractJson,
        IEnumerable<FormSubmission> formSubmissions,
        Guid applicantId)
    {
        using var doc = JsonDocument.Parse(contractJson);
        var root = doc.RootElement;

        // Read requirementDiscriminatorFields — list of form field labels to read per applicant
        if (!root.TryGetProperty("requirementDiscriminatorFields", out var discriminatorsProp))
            return null;

        var discriminatorFields = new List<string>();
        foreach (var item in discriminatorsProp.EnumerateArray())
        {
            var fieldKey = item.GetString();
            if (!string.IsNullOrWhiteSpace(fieldKey))
                discriminatorFields.Add(fieldKey);
        }

        if (discriminatorFields.Count == 0)
            return null;

        // Read requirementContextGroups — optional value normalization map
        Dictionary<string, string?> contextGroups = new(StringComparer.OrdinalIgnoreCase);
        if (root.TryGetProperty("requirementContextGroups", out var groupsProp))
        {
            foreach (var group in groupsProp.EnumerateObject())
            {
                contextGroups[group.Name] = group.Value.ValueKind == JsonValueKind.Null
                    ? null
                    : group.Value.GetString();
            }
        }

        // Find this applicant's FormSubmission
        var submission = formSubmissions.FirstOrDefault(fs => fs.ApplicantId == applicantId);
        if (submission == null)
            return null;

        // For each discriminator field label, find the matching FormFieldValue
        var parts = new List<string>();
        foreach (var fieldLabel in discriminatorFields)
        {
            var fieldValue = submission.FieldValues
                .FirstOrDefault(fv =>
                    string.Equals(fv.Field?.Label, fieldLabel, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(fv.Field?.Label?.Replace(" ", ""), fieldLabel.Replace(" ", ""), StringComparison.OrdinalIgnoreCase));

            if (fieldValue == null || string.IsNullOrWhiteSpace(fieldValue.Value))
                return null; // Cannot compose a partial ContextKey — treat as no context

            var rawValue = fieldValue.Value.Trim();

            // Apply group normalization if defined
            if (contextGroups.TryGetValue(rawValue, out var normalizedValue))
            {
                if (normalizedValue == null)
                    return null; // Explicitly unmapped → no enforcement
                parts.Add(normalizedValue);
            }
            else
            {
                parts.Add(rawValue);
            }
        }

        return parts.Count > 0 ? string.Join("|", parts) : null;
    }
}
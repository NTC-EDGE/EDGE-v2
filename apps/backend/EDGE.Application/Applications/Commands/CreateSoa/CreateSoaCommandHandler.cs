using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Fees.Calculations;

namespace EDGE.Application.Applications.Commands.CreateSoa;

public class CreateSoaCommandHandler : IRequestHandler<CreateSoaCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly IFeeCalculationEngine _calculationEngine;
    private readonly IServiceFeeRepository? _serviceFeeRepository;
    private readonly IServiceVariantFeeRepository? _variantFeeRepository;
    private readonly IServiceVariantElementFeeRepository? _elementFeeRepository;
    private readonly IServiceVariantFormulaRepository? _formulaRepository;
    private readonly INumberingSeriesService? _numberingSeriesService;
    private readonly ISoaNoteRepository? _soaNoteRepository;
    private readonly IFormRepository? _formRepository;
    private readonly IRegionalConfigurationService? _regionalConfigService;

    public CreateSoaCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IFeeCalculationEngine calculationEngine,
        IServiceFeeRepository? serviceFeeRepository = null,
        IServiceVariantFeeRepository? variantFeeRepository = null,
        IServiceVariantElementFeeRepository? elementFeeRepository = null,
        IServiceVariantFormulaRepository? formulaRepository = null,
        INumberingSeriesService? numberingSeriesService = null,
        ISoaNoteRepository? soaNoteRepository = null,
        IFormRepository? formRepository = null,
        IRegionalConfigurationService? regionalConfigService = null)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _calculationEngine = calculationEngine;
        _serviceFeeRepository = serviceFeeRepository;
        _variantFeeRepository = variantFeeRepository;
        _elementFeeRepository = elementFeeRepository;
        _formulaRepository = formulaRepository;
        _numberingSeriesService = numberingSeriesService;
        _soaNoteRepository = soaNoteRepository;
        _formRepository = formRepository;
        _regionalConfigService = regionalConfigService;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateSoaCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null) return ApiResponse<Guid>.Fail("Application not found.");

        if (app.Status != ApplicationStatus.Evaluating && app.Status != ApplicationStatus.Returned)
        {
            return ApiResponse<Guid>.Fail("Statement of Account (SOA) can only be generated when the application is under active evaluation (Status: Evaluating or Returned). Please start or resume evaluation first.");
        }

        if (app.Status == ApplicationStatus.Returned)
        {
            app.Status = ApplicationStatus.Evaluating;
            app.Remarks = "Evaluation resumed. Statement of Account updated.";
            await _repository.UpdateAsync(app, cancellationToken);
        }

        var isPerApplicantMode = request.ApplicantId.HasValue && request.ApplicantId.Value != Guid.Empty;
        var isBulkApplication = app.SubmissionMode == SubmissionMode.Bulk || app.ApplicationApplicants.Count > 1;

        var targetApplicant = request.ApplicantId.HasValue
            ? app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId.Value)?.Applicant
            : app.ApplicationApplicants.FirstOrDefault()?.Applicant;

        static string? BuildFullAddress(ApplicantDetail? detail, CompanyDetail? comp)
        {
            var street = !string.IsNullOrWhiteSpace(detail?.Address) ? detail.Address : comp?.Address;
            var brgy = detail?.Barangay?.Name ?? comp?.Barangay?.Name;
            var muni = detail?.Barangay?.Municipality?.Name ?? comp?.Barangay?.Municipality?.Name;
            var prov = detail?.Barangay?.Municipality?.Province?.Name ?? comp?.Barangay?.Municipality?.Province?.Name;
            var reg = detail?.Barangay?.Municipality?.Province?.Region?.Name ?? comp?.Barangay?.Municipality?.Province?.Region?.Name;
            var zip = detail?.ZipCode;

            var parts = new[] { street, brgy, muni, prov, reg, zip }
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p!.Trim())
                .Distinct()
                .ToList();

            return parts.Count > 0 ? string.Join(", ", parts) : null;
        }

        var applicantFullName = targetApplicant?.ApplicantDetail != null
            ? string.Join(" ", new[]
            {
                targetApplicant.ApplicantDetail.FirstName,
                targetApplicant.ApplicantDetail.MiddleName,
                targetApplicant.ApplicantDetail.LastName,
                targetApplicant.ApplicantDetail.Suffix
            }.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s!.Trim()))
            : null;

        var userFullName = app.User != null
            ? $"{app.User.FirstName} {app.User.LastName}".Trim()
            : null;

        var companyDetail = app.User?.CompanyDetail
            ?? targetApplicant?.CompanyDetail
            ?? targetApplicant?.ApplicantDetail?.CompanyDetail
            ?? app.ApplicationApplicants
                .Select(aa => aa.Applicant?.CompanyDetail ?? aa.Applicant?.ApplicantDetail?.CompanyDetail)
                .FirstOrDefault(cd => cd != null && !string.IsNullOrWhiteSpace(cd.Name));

        string? formCompanyName = null;
        string? formCompanyAddress = null;
        if (companyDetail == null || string.IsNullOrWhiteSpace(companyDetail.Name))
        {
            var allFvs = (app.FormSubmissions ?? Enumerable.Empty<FormSubmission>())
                .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>())
                .Where(fv => fv != null && !string.IsNullOrWhiteSpace(fv.Value))
                .ToList();

            formCompanyName = allFvs.FirstOrDefault(fv =>
            {
                var lbl = (fv.Field?.Label ?? fv.CustomLabel ?? string.Empty).ToLowerInvariant();
                return lbl.Contains("company name") || lbl.Contains("organization name") || lbl.Contains("corporate name") || lbl.Contains("business name") || lbl.Contains("employer");
            })?.Value?.Trim();

            formCompanyAddress = allFvs.FirstOrDefault(fv =>
            {
                var lbl = (fv.Field?.Label ?? fv.CustomLabel ?? string.Empty).ToLowerInvariant();
                return lbl.Contains("company address") || lbl.Contains("business address") || lbl.Contains("office address");
            })?.Value?.Trim();
        }

        var resolvedCompanyName = !string.IsNullOrWhiteSpace(companyDetail?.Name)
            ? companyDetail!.Name.Trim()
            : formCompanyName;

        var resolvedCompanyAddress = BuildFullAddress(null, companyDetail)
            ?? (!string.IsNullOrWhiteSpace(companyDetail?.Address) ? companyDetail!.Address.Trim() : formCompanyAddress);

        var resolvedApplicantAddress = BuildFullAddress(targetApplicant?.ApplicantDetail, null)
            ?? (!string.IsNullOrWhiteSpace(targetApplicant?.ApplicantDetail?.Address) ? targetApplicant!.ApplicantDetail.Address.Trim() : null);

        IssuedToType issuedToType;
        string resolvedIssuedToName;
        string? resolvedIssuedToAddress;

        if (isBulkApplication && !isPerApplicantMode)
        {
            // Bulk Consolidated SOA MUST ALWAYS be issued to the Company (not the individual applicant or representative/recipient)
            issuedToType = IssuedToType.Company;

            var allApplicantPersonalNames = app.ApplicationApplicants
                .Select(aa => aa.Applicant?.ApplicantDetail)
                .Where(ad => ad != null)
                .SelectMany(ad => new[]
                {
                    $"{ad!.FirstName} {ad.LastName}".Trim(),
                    string.Join(" ", new[] { ad.FirstName, ad.MiddleName, ad.LastName, ad.Suffix }.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s!.Trim()))
                })
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var reqName = request.IssuedToName?.Trim();
            bool reqNameIsPersonalOrRepresentative = string.IsNullOrWhiteSpace(reqName)
                || (!string.IsNullOrWhiteSpace(resolvedCompanyName) &&
                    (allApplicantPersonalNames.Contains(reqName) ||
                     (!string.IsNullOrWhiteSpace(userFullName) && string.Equals(reqName, userFullName, StringComparison.OrdinalIgnoreCase) && !string.Equals(userFullName, resolvedCompanyName, StringComparison.OrdinalIgnoreCase))));

            resolvedIssuedToName = !reqNameIsPersonalOrRepresentative && !string.IsNullOrWhiteSpace(reqName)
                ? reqName!
                : (!string.IsNullOrWhiteSpace(resolvedCompanyName)
                    ? resolvedCompanyName!
                    : (!string.IsNullOrWhiteSpace(reqName)
                        ? reqName!
                        : (!string.IsNullOrWhiteSpace(userFullName)
                            ? userFullName!
                            : (app.ReferenceNumber ?? app.ApplicationNumber ?? "Company"))));

            resolvedIssuedToAddress = !string.IsNullOrWhiteSpace(resolvedCompanyAddress)
                ? resolvedCompanyAddress
                : (!string.IsNullOrWhiteSpace(request.IssuedToAddress)
                    ? request.IssuedToAddress.Trim()
                    : (resolvedApplicantAddress ?? "N/A"));
        }
        else if (isPerApplicantMode)
        {
            // By-Applicant SOA (even when parent application is Bulk) MUST ALWAYS be issued to the Individual Applicant (not the Company)
            issuedToType = IssuedToType.Individual;

            var reqName = request.IssuedToName?.Trim();
            bool reqNameIsCompany = !string.IsNullOrWhiteSpace(reqName) &&
                !string.IsNullOrWhiteSpace(resolvedCompanyName) &&
                string.Equals(reqName, resolvedCompanyName, StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrWhiteSpace(applicantFullName);

            resolvedIssuedToName = (!string.IsNullOrWhiteSpace(reqName) && !reqNameIsCompany)
                ? reqName!
                : (!string.IsNullOrWhiteSpace(applicantFullName)
                    ? applicantFullName!
                    : (!string.IsNullOrWhiteSpace(reqName)
                        ? reqName!
                        : (app.ReferenceNumber ?? app.ApplicationNumber ?? "Applicant")));

            var reqAddr = request.IssuedToAddress?.Trim();
            bool reqAddrIsCompany = !string.IsNullOrWhiteSpace(reqAddr) &&
                !string.IsNullOrWhiteSpace(resolvedCompanyAddress) &&
                string.Equals(reqAddr, resolvedCompanyAddress, StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrWhiteSpace(resolvedApplicantAddress);

            resolvedIssuedToAddress = (!string.IsNullOrWhiteSpace(reqAddr) && !reqAddrIsCompany)
                ? reqAddr
                : (!string.IsNullOrWhiteSpace(resolvedApplicantAddress)
                    ? resolvedApplicantAddress
                    : (reqAddr ?? resolvedCompanyAddress));
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(request.IssuedToType))
            {
                if (!Enum.TryParse<IssuedToType>(request.IssuedToType, true, out issuedToType))
                {
                    return ApiResponse<Guid>.Fail("Invalid IssuedToType.");
                }
            }
            else
            {
                issuedToType = targetApplicant?.ApplicantType == ApplicantType.Company ? IssuedToType.Company : IssuedToType.Individual;
            }

            resolvedIssuedToName = !string.IsNullOrWhiteSpace(request.IssuedToName)
                ? request.IssuedToName.Trim()
                : (issuedToType == IssuedToType.Company && !string.IsNullOrWhiteSpace(resolvedCompanyName)
                    ? resolvedCompanyName!
                    : (!string.IsNullOrWhiteSpace(applicantFullName)
                        ? applicantFullName!
                        : (!string.IsNullOrWhiteSpace(resolvedCompanyName)
                            ? resolvedCompanyName!
                            : (!string.IsNullOrWhiteSpace(userFullName)
                                ? userFullName!
                                : (app.ReferenceNumber ?? app.ApplicationNumber ?? "Applicant")))));

            resolvedIssuedToAddress = !string.IsNullOrWhiteSpace(request.IssuedToAddress)
                ? request.IssuedToAddress.Trim()
                : (issuedToType == IssuedToType.Company && !string.IsNullOrWhiteSpace(resolvedCompanyAddress)
                    ? resolvedCompanyAddress
                    : (resolvedApplicantAddress ?? resolvedCompanyAddress ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.ApplicantDetail?.Address ?? aa.Applicant?.CompanyDetail?.Address).FirstOrDefault(a => !string.IsNullOrEmpty(a))));
        }

        if (string.IsNullOrWhiteSpace(resolvedIssuedToName))
        {
            resolvedIssuedToName = issuedToType == IssuedToType.Company ? "Company" : "Applicant";
        }

        var rawDueDate = request.DueDate != default && request.DueDate > DateTime.MinValue
            ? request.DueDate
            : DateTime.UtcNow.AddDays(30);

        var resolvedDueDate = EnsureUtc(rawDueDate);

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Evaluator", cancellationToken);
        Guid? validUserId = null;
        if (userContext.UserId.HasValue && await _repository.UserExistsAsync(userContext.UserId.Value, cancellationToken))
        {
            validUserId = userContext.UserId.Value;
        }

        StatementOfAccount? existingSoa;
        Guid? resolvedApplicantId;

        if (isPerApplicantMode)
        {
            resolvedApplicantId = targetApplicant?.Id ?? request.ApplicantId!.Value;

            // Remove any unapproved bulk/consolidated SOA if switching to per-applicant SOA generation
            var staleBulkSoas = app.StatementsOfAccount
                .Where(s => !s.IsDeleted && s.ApplicantId == null && (s.Status == SoaStatus.Pending || s.Status == SoaStatus.Returned))
                .ToList();
            foreach (var stale in staleBulkSoas)
            {
                stale.IsDeleted = true;
            }

            existingSoa = app.StatementsOfAccount
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefault(s => !s.IsDeleted && s.ApplicantId == resolvedApplicantId && (s.Status == SoaStatus.Pending || s.Status == SoaStatus.Returned));
        }
        else if (isBulkApplication)
        {
            resolvedApplicantId = null;

            // Remove any unapproved per-applicant SOAs if switching to consolidated bulk SOA generation
            var staleIndividualSoas = app.StatementsOfAccount
                .Where(s => !s.IsDeleted && s.ApplicantId != null && (s.Status == SoaStatus.Pending || s.Status == SoaStatus.Returned))
                .ToList();
            foreach (var stale in staleIndividualSoas)
            {
                stale.IsDeleted = true;
            }

            existingSoa = app.StatementsOfAccount
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefault(s => !s.IsDeleted && s.ApplicantId == null && (s.Status == SoaStatus.Pending || s.Status == SoaStatus.Returned));
        }
        else
        {
            resolvedApplicantId = targetApplicant?.Id;
            existingSoa = app.StatementsOfAccount
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefault(s => !s.IsDeleted && (s.Status == SoaStatus.Pending || s.Status == SoaStatus.Returned));
        }

        var isExistingSoa = existingSoa != null;

        string? requestedManualSoaNumber = !string.IsNullOrWhiteSpace(request.SoaNumber)
            ? request.SoaNumber.Trim()
            : null;

        if (requestedManualSoaNumber != null)
        {
            var isDifferentFromExisting = existingSoa == null ||
                !string.Equals(existingSoa.SoaNumber, requestedManualSoaNumber, StringComparison.OrdinalIgnoreCase);

            if (isDifferentFromExisting)
            {
                if (_regionalConfigService != null)
                {
                    var regionalConfig = await _regionalConfigService.GetConfigurationAsync(app.TenantId, cancellationToken);
                    if (!regionalConfig.AllowManualSoaNumber)
                    {
                        return ApiResponse<Guid>.Fail("Manual SOA number entry is currently disabled for this regional office. Please ask your Regional Administrator to enable manual SOA numbering in Regional Configuration.");
                    }
                }

                var duplicateSoaExists = await _repository.SoaNumberExistsAsync(app.TenantId, requestedManualSoaNumber, existingSoa?.Id, cancellationToken);
                if (duplicateSoaExists)
                {
                    return ApiResponse<Guid>.Fail($"SOA number '{requestedManualSoaNumber}' is already in use within this regional office.");
                }
            }
        }

        var soa = existingSoa ?? new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = request.ApplicationId,
            ApplicantId = resolvedApplicantId,
            SoaNumber = requestedManualSoaNumber
                ?? (_numberingSeriesService != null
                    ? await _numberingSeriesService.GenerateSoaNumberAsync(app.TenantId, cancellationToken)
                    : $"SOA-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}"),
            Status = SoaStatus.Pending,
            PreparedByUserId = validUserId,
        };

        if (isExistingSoa && requestedManualSoaNumber != null)
        {
            soa.SoaNumber = requestedManualSoaNumber;
        }

        soa.ApplicantId = resolvedApplicantId;
        soa.IssuedToType = issuedToType;
        soa.IssuedToName = resolvedIssuedToName;
        soa.IssuedToAddress = resolvedIssuedToAddress;
        soa.DueDate = resolvedDueDate;
        soa.Remarks = request.Remarks;
        soa.SoaNoteId = request.SoaNoteId;

        if (_soaNoteRepository != null)
        {
            SoaNote? note = null;
            if (soa.SoaNoteId.HasValue && soa.SoaNoteId.Value != Guid.Empty)
            {
                note = await _soaNoteRepository.GetByIdAsync(soa.SoaNoteId.Value, cancellationToken);
            }
            else
            {
                var tenantNotes = await _soaNoteRepository.GetAllAsync(app.TenantId, cancellationToken);
                note = tenantNotes.FirstOrDefault(n => n.Code == "DEFAULT" || (n.Title != null && n.Title.Contains("Default", StringComparison.OrdinalIgnoreCase)))
                       ?? tenantNotes.FirstOrDefault();
                if (note != null)
                {
                    soa.SoaNoteId = note.Id;
                }
            }

            if (note != null && (!isExistingSoa || request.Remarks == null) && string.IsNullOrWhiteSpace(soa.Remarks))
            {
                soa.Remarks = note.Notes;
            }
        }

        var existingLineItems = soa.LineItems.ToList();
        var desiredLineItems = new System.Collections.Generic.List<SoaLineItem>();

        var primaryService = targetApplicant?.Service
            ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var primaryVariant = targetApplicant?.ServiceVariant
            ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

        var activeServiceForm = _formRepository != null && primaryService != null
            ? ((primaryVariant != null
                ? await _formRepository.GetFormByServiceIdAsync(primaryService.Id, primaryVariant.Id, null, cancellationToken)
                : null) ?? await _formRepository.GetFormByServiceIdAsync(primaryService.Id, cancellationToken))
            : null;

        var (asksForYears, resolvedFormYears) = FormBuilderYearsHelper.ResolveFormBuilderYears(
            app: app,
            targetApplicantId: targetApplicant?.Id ?? request.ApplicantId,
            requestedValidityYears: request.ValidityYears,
            category: primaryService?.ServiceCategory?.Type,
            activeServiceForm: activeServiceForm);

        if (request.LineItems != null && request.LineItems.Count > 0)
        {
            var seenParticularKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var item in request.LineItems)
            {
                var resolvedParticular = !string.IsNullOrWhiteSpace(item.Particular) ? item.Particular.Trim() : "Statutory Fee";
                var rawCode = !string.IsNullOrWhiteSpace(item.ItemCode) ? item.ItemCode.Trim() : "FEE";
                var canonicalCode = EDGE.Domain.Constants.FeeConstants.Codes.NormalizeCanonicalCode(rawCode, resolvedParticular);
                var isOthers = resolvedParticular.StartsWith("Others", StringComparison.OrdinalIgnoreCase);
                var dedupKey = !isOthers && canonicalCode != "FEE"
                    ? canonicalCode
                    : $"{canonicalCode}::{resolvedParticular}";

                if (!seenParticularKeys.Add(dedupKey))
                {
                    continue;
                }

                var isDst = canonicalCode.Equals(EDGE.Domain.Constants.FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase);
                var itemUsesYears = asksForYears &&
                                    !isDst &&
                                    item.ValidityYears > 0 &&
                                    EDGE.Domain.Constants.FeeConstants.FormulaTokens.FeeUsesYears(null, canonicalCode, resolvedParticular, formExplicitlyAsksForYears: true);
                var valYears = itemUsesYears ? item.ValidityYears : 0;
                var yearMultiplier = valYears > 0 ? valYears : 1;
                var units = item.NoOfUnits > 0 ? item.NoOfUnits : 1;
                var rate = item.FeeRate >= 0 ? item.FeeRate : 0m;
                var calculatedAmount = isDst ? rate : (yearMultiplier * units * rate);

                desiredLineItems.Add(new SoaLineItem
                {
                    Id = Guid.NewGuid(),
                    StatementOfAccountId = soa.Id,
                    Particular = resolvedParticular,
                    ItemCode = canonicalCode != "FEE" && !rawCode.Contains('-') ? canonicalCode : rawCode,
                    Description = item.Description,
                    PeriodOfCoverageStart = EnsureUtc(item.PeriodOfCoverageStart),
                    PeriodOfCoverageEnd = EnsureUtc(item.PeriodOfCoverageEnd),
                    ValidityYears = valYears,
                    NoOfUnits = units,
                    FeeRate = rate,
                    Amount = calculatedAmount
                });
            }
        }
        else
        {
            var activity = primaryService?.ServiceCategory?.Name ?? primaryService?.Name ?? "Radio Operator Certificates";
            var appType = primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? "New";
            var element = primaryVariant?.ServiceVariantElements?.FirstOrDefault()?.Code
                ?? primaryVariant?.ServiceVariantElements?.FirstOrDefault()?.Description;

            var completeApplicantsCount = app.ApplicationApplicants.Count(aa =>
                aa.Applicant == null ||
                aa.Applicant.Status != ApplicantStatus.Incomplete ||
                string.IsNullOrWhiteSpace(aa.Applicant.EvaluationRemarks));
            var applicantsCount = completeApplicantsCount > 0
                ? completeApplicantsCount
                : (app.ApplicationApplicants.Count > 0 ? app.ApplicationApplicants.Count : 1);
            var units = request.NoOfUnits ?? (isPerApplicantMode ? 1 : applicantsCount);
            var years = asksForYears ? resolvedFormYears : 0;
            var nowUtc = DateTime.UtcNow;

            var serviceFees = _serviceFeeRepository != null && primaryService != null
                ? await _serviceFeeRepository.GetAllAsync(serviceId: primaryService.Id, activeOnly: true, cancellationToken: cancellationToken)
                : null;

            var variantFees = _variantFeeRepository != null && primaryVariant != null
                ? await _variantFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
                : null;

            var elementFees = _elementFeeRepository != null && primaryVariant != null
                ? await _elementFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
                : null;

            string? formulaExpression = null;
            if (_formulaRepository != null)
            {
                if (primaryVariant != null)
                {
                    var primaryElement = !string.IsNullOrWhiteSpace(element)
                        ? (primaryVariant.ServiceVariantElements?.FirstOrDefault(sve =>
                              string.Equals(sve.Code, element, StringComparison.OrdinalIgnoreCase) ||
                              string.Equals(sve.Description, element, StringComparison.OrdinalIgnoreCase))
                           ?? primaryVariant.ServiceVariantElements?.FirstOrDefault())
                        : primaryVariant.ServiceVariantElements?.FirstOrDefault();

                    if (primaryElement != null)
                    {
                        var elemFormula = await _formulaRepository.GetElementFormulaAsync(primaryVariant.Id, primaryElement.Id, cancellationToken);
                        formulaExpression = elemFormula?.FormulaExpression;
                    }

                    if (string.IsNullOrWhiteSpace(formulaExpression))
                    {
                        var variantFormula = await _formulaRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken);
                        formulaExpression = variantFormula?.FormulaExpression;
                    }
                }

                if (string.IsNullOrWhiteSpace(formulaExpression) && primaryService != null)
                {
                    var serviceFormula = await _formulaRepository.GetServiceFormulaAsync(primaryService.Id, cancellationToken);
                    formulaExpression = serviceFormula?.FormulaExpression;
                }
            }

            var calculationResult = _calculationEngine.Calculate(new FeeCalculationRequest(
                Activity: activity,
                ApplicationType: appType,
                Element: element,
                ValidityYears: years,
                NoOfUnits: units,
                ExpirationDate: EnsureUtc(request.ExpirationDate),
                AdditionalServicesCount: request.AdditionalServicesCount ?? 0,
                NoOfCopies: request.NoOfCopies ?? 1,
                AsOfDate: nowUtc,
                Category: primaryService?.ServiceCategory?.Type,
                ServiceId: primaryService?.Id,
                ServiceVariantId: primaryVariant?.Id,
                ServiceFees: serviceFees,
                VariantFees: variantFees,
                ElementFees: elementFees,
                FormulaExpression: formulaExpression
            ));

            foreach (var calculatedItem in calculationResult.LineItems)
            {
                var valYears = calculatedItem.ValidityYears > 0 ? calculatedItem.ValidityYears : 0;
                desiredLineItems.Add(new SoaLineItem
                {
                    Id = Guid.NewGuid(),
                    StatementOfAccountId = soa.Id,
                    Particular = !string.IsNullOrWhiteSpace(calculatedItem.Particular) ? calculatedItem.Particular : "Statutory Fee",
                    ItemCode = !string.IsNullOrWhiteSpace(calculatedItem.ItemCode) ? calculatedItem.ItemCode : "FEE",
                    Description = calculatedItem.Description,
                    PeriodOfCoverageStart = valYears > 0 ? nowUtc : null,
                    PeriodOfCoverageEnd = valYears > 0 ? nowUtc.AddYears(valYears) : null,
                    ValidityYears = valYears,
                    NoOfUnits = calculatedItem.NoOfUnits > 0 ? calculatedItem.NoOfUnits : 1,
                    FeeRate = calculatedItem.FeeRate,
                    Amount = calculatedItem.Amount
                });
            }
        }

        if (isExistingSoa)
        {
            for (int i = 0; i < desiredLineItems.Count; i++)
            {
                var desired = desiredLineItems[i];
                if (i < existingLineItems.Count)
                {
                    var existingItem = existingLineItems[i];
                    existingItem.Particular = desired.Particular;
                    existingItem.ItemCode = desired.ItemCode;
                    existingItem.Description = desired.Description;
                    existingItem.PeriodOfCoverageStart = desired.PeriodOfCoverageStart;
                    existingItem.PeriodOfCoverageEnd = desired.PeriodOfCoverageEnd;
                    existingItem.ValidityYears = desired.ValidityYears;
                    existingItem.NoOfUnits = desired.NoOfUnits;
                    existingItem.FeeRate = desired.FeeRate;
                    existingItem.Amount = desired.Amount;
                }
                else
                {
                    desired.Id = Guid.NewGuid();
                    desired.StatementOfAccountId = soa.Id;
                    await _repository.AddSoaLineItemAsync(desired, cancellationToken);
                    soa.LineItems.Add(desired);
                }
            }

            for (int i = existingLineItems.Count - 1; i >= desiredLineItems.Count; i--)
            {
                soa.LineItems.Remove(existingLineItems[i]);
            }
        }
        else
        {
            foreach (var desired in desiredLineItems)
            {
                soa.LineItems.Add(desired);
            }
        }

        // Calculate total SOA amount on the server from validated line items
        soa.TotalAmount = soa.LineItems.Sum(li => li.Amount);

        var staffName = !string.IsNullOrWhiteSpace(userContext.StaffName) ? userContext.StaffName : "Evaluator";
        var staffRole = !string.IsNullOrWhiteSpace(userContext.StaffRole) ? userContext.StaffRole : "Evaluator";

        var historyAction = isExistingSoa ? "SOA updated by Evaluator" : "SOA created by Evaluator";

        var soaHistory = new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = historyAction,
            ToStatus = SoaStatus.Pending,
            PerformedByUserId = validUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Timestamp = DateTime.UtcNow
        };
        soa.Histories.Add(soaHistory);
        if (isExistingSoa)
        {
            await _repository.AddSoaHistoryAsync(soaHistory, cancellationToken);
        }

        if (app.Intent == ApplicationIntent.AssessmentOnly)
        {
            app.AssessedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(app, cancellationToken);
        }

        if (!isExistingSoa)
        {
            await _repository.AddSoaAsync(soa, cancellationToken);
        }

        // When Regional Configuration allows Manual / Edit OP Number, pre-populate a draft OrderOfPayment
        // with an actual OP number from the series immediately upon SOA generation / update so the user
        // can view and edit the OP number even on preview before Accountant approval.
        if (app.Intent != ApplicationIntent.AssessmentOnly && _regionalConfigService != null)
        {
            var regionalConfig = await _regionalConfigService.GetConfigurationAsync(app.TenantId, cancellationToken);
            if (regionalConfig.AllowManualOpNumber)
            {
                if (isPerApplicantMode && app.OrdersOfPayment != null)
                {
                    foreach (var staleBulkSoa in app.StatementsOfAccount.Where(s => s.IsDeleted && s.ApplicantId == null))
                    {
                        var staleOp = app.OrdersOfPayment.FirstOrDefault(o => o.StatementOfAccountId == staleBulkSoa.Id && o.Status != OpStatus.Paid);
                        if (staleOp != null) staleOp.IsDeleted = true;
                    }
                }
                else if (isBulkApplication && !isPerApplicantMode && app.OrdersOfPayment != null)
                {
                    foreach (var staleIndSoa in app.StatementsOfAccount.Where(s => s.IsDeleted && s.ApplicantId != null))
                    {
                        var staleOp = app.OrdersOfPayment.FirstOrDefault(o => o.StatementOfAccountId == staleIndSoa.Id && o.Status != OpStatus.Paid);
                        if (staleOp != null) staleOp.IsDeleted = true;
                    }
                }

                var existingOpForSoa = app.OrdersOfPayment?.FirstOrDefault(o => !o.IsDeleted && o.StatementOfAccountId == soa.Id);
                if (existingOpForSoa == null)
                {
                    var prefilledOpNumber = _numberingSeriesService != null
                        ? await _numberingSeriesService.GenerateOpNumberAsync(app.TenantId, cancellationToken)
                        : $"OP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

                    var draftOp = new OrderOfPayment
                    {
                        Id = Guid.NewGuid(),
                        ApplicationId = app.Id,
                        StatementOfAccountId = soa.Id,
                        OpNumber = prefilledOpNumber,
                        AmountDue = soa.TotalAmount,
                        AmountReceived = 0m,
                        Status = OpStatus.Billed,
                        Remarks = "Order of Payment number pre-assigned for manual editing and preview.",
                        CreatedAt = DateTime.UtcNow
                    };
                    await _repository.AddOpAsync(draftOp, cancellationToken);
                }
                else
                {
                    existingOpForSoa.AmountDue = soa.TotalAmount;
                    if (string.IsNullOrWhiteSpace(existingOpForSoa.OpNumber) ||
                        existingOpForSoa.OpNumber.StartsWith("PENDING", StringComparison.OrdinalIgnoreCase) ||
                        existingOpForSoa.OpNumber.StartsWith("OP-TEMP", StringComparison.OrdinalIgnoreCase))
                    {
                        existingOpForSoa.OpNumber = _numberingSeriesService != null
                            ? await _numberingSeriesService.GenerateOpNumberAsync(app.TenantId, cancellationToken)
                            : $"OP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
                    }
                }
            }
        }

        var actionName = isExistingSoa ? "Statement of Account (SOA) Updated" : "Statement of Account (SOA) Generated";
        var remarksText = isExistingSoa
            ? $"Statement of Account ({soa.SoaNumber}) updated with total amount PHP {soa.TotalAmount:N2}. Due date: {soa.DueDate:yyyy-MM-dd}."
            : $"Statement of Account ({soa.SoaNumber}) generated with total amount PHP {soa.TotalAmount:N2}. Due date: {soa.DueDate:yyyy-MM-dd}.";

        var appHistory = new ApplicationHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Action = actionName,
            FromStatus = app.Status,
            ToStatus = app.Status,
            PerformedByUserId = validUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = remarksText,
            Timestamp = DateTime.UtcNow
        };
        app.Histories.Add(appHistory);
        await _repository.AddApplicationHistoryAsync(appHistory, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(soa.Id);
    }

    private static DateTime EnsureUtc(DateTime dt) =>
        dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

    private static DateTime? EnsureUtc(DateTime? dt) =>
        dt.HasValue ? (dt.Value.Kind == DateTimeKind.Utc ? dt.Value : DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc)) : null;
}

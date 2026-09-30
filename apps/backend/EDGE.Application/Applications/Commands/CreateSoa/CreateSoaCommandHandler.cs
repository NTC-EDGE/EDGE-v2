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
    private readonly IServiceVariantFeeRepository? _variantFeeRepository;
    private readonly IServiceVariantElementFeeRepository? _elementFeeRepository;

    public CreateSoaCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IFeeCalculationEngine calculationEngine,
        IServiceVariantFeeRepository? variantFeeRepository = null,
        IServiceVariantElementFeeRepository? elementFeeRepository = null)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _calculationEngine = calculationEngine;
        _variantFeeRepository = variantFeeRepository;
        _elementFeeRepository = elementFeeRepository;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateSoaCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null) return ApiResponse<Guid>.Fail("Application not found.");

        if (app.Status != ApplicationStatus.Evaluating)
        {
            return ApiResponse<Guid>.Fail("Statement of Account (SOA) can only be generated when the application is under active evaluation (Status: Evaluating). Please start evaluation first.");
        }

        var targetApplicant = request.ApplicantId.HasValue
            ? app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId.Value)?.Applicant
            : app.ApplicationApplicants.FirstOrDefault()?.Applicant;

        IssuedToType issuedToType;
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

        var applicantFullName = targetApplicant?.ApplicantDetail != null
            ? $"{targetApplicant.ApplicantDetail.FirstName} {targetApplicant.ApplicantDetail.LastName}".Trim()
            : null;

        var userFullName = app.User != null
            ? $"{app.User.FirstName} {app.User.LastName}".Trim()
            : null;

        var resolvedIssuedToName = !string.IsNullOrWhiteSpace(request.IssuedToName)
            ? request.IssuedToName.Trim()
            : (!string.IsNullOrWhiteSpace(applicantFullName)
                ? applicantFullName
                : (!string.IsNullOrWhiteSpace(targetApplicant?.CompanyDetail?.Name)
                    ? targetApplicant.CompanyDetail.Name.Trim()
                    : (!string.IsNullOrWhiteSpace(userFullName)
                        ? userFullName
                        : (app.ReferenceNumber ?? app.ApplicationNumber ?? "Applicant"))));

        if (string.IsNullOrWhiteSpace(resolvedIssuedToName))
        {
            resolvedIssuedToName = "Applicant";
        }

        var resolvedIssuedToAddress = !string.IsNullOrWhiteSpace(request.IssuedToAddress)
            ? request.IssuedToAddress.Trim()
            : (targetApplicant?.ApplicantDetail?.Address ?? targetApplicant?.CompanyDetail?.Address ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.ApplicantDetail?.Address ?? aa.Applicant?.CompanyDetail?.Address).FirstOrDefault(a => !string.IsNullOrEmpty(a)));

        var rawDueDate = request.DueDate != default && request.DueDate > DateTime.MinValue
            ? request.DueDate
            : DateTime.UtcNow.AddDays(30);

        var resolvedDueDate = EnsureUtc(rawDueDate);

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Evaluator", cancellationToken);

        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = request.ApplicationId,
            ApplicantId = targetApplicant?.Id ?? (request.ApplicantId.HasValue && app.ApplicationApplicants.Any(aa => aa.ApplicantId == request.ApplicantId.Value) ? request.ApplicantId : null),
            SoaNumber = $"SOA-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            Status = SoaStatus.Pending,
            IssuedToType = issuedToType,
            IssuedToName = resolvedIssuedToName,
            IssuedToAddress = resolvedIssuedToAddress,
            DueDate = resolvedDueDate,
            PreparedByUserId = userContext.UserId
        };

        if (request.LineItems != null && request.LineItems.Count > 0)
        {
            foreach (var item in request.LineItems)
            {
                var units = item.NoOfUnits > 0 ? item.NoOfUnits : 1;
                var rate = item.FeeRate >= 0 ? item.FeeRate : 0m;
                var calculatedAmount = units * rate;

                soa.LineItems.Add(new SoaLineItem
                {
                    Id = Guid.NewGuid(),
                    StatementOfAccountId = soa.Id,
                    Particular = !string.IsNullOrWhiteSpace(item.Particular) ? item.Particular.Trim() : "Statutory Fee",
                    ItemCode = !string.IsNullOrWhiteSpace(item.ItemCode) ? item.ItemCode.Trim() : "FEE",
                    Description = item.Description,
                    PeriodOfCoverageStart = EnsureUtc(item.PeriodOfCoverageStart),
                    PeriodOfCoverageEnd = EnsureUtc(item.PeriodOfCoverageEnd),
                    ValidityYears = item.ValidityYears > 0 ? item.ValidityYears : 1,
                    NoOfUnits = units,
                    FeeRate = rate,
                    Amount = calculatedAmount
                });
            }
        }
        else
        {
            var primaryService = targetApplicant?.Service
                ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
            var primaryVariant = targetApplicant?.ServiceVariant
                ?? app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

            var activity = primaryService?.ServiceCategory?.Name ?? primaryService?.Name ?? "Radio Operator Certificates";
            var appType = primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? "New";
            var element = primaryVariant?.ServiceVariantElements?.FirstOrDefault()?.Code
                ?? primaryVariant?.ServiceVariantElements?.FirstOrDefault()?.Description;

            var applicantsCount = app.ApplicationApplicants.Count > 0 ? app.ApplicationApplicants.Count : 1;
            var units = request.NoOfUnits ?? applicantsCount;
            var years = request.ValidityYears ?? 1;
            var nowUtc = DateTime.UtcNow;

            var variantFees = _variantFeeRepository != null && primaryVariant != null
                ? await _variantFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
                : null;

            var elementFees = _elementFeeRepository != null && primaryVariant != null
                ? await _elementFeeRepository.GetByServiceVariantIdAsync(primaryVariant.Id, cancellationToken)
                : null;

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
                ServiceVariantId: primaryVariant?.Id,
                VariantFees: variantFees,
                ElementFees: elementFees
            ));

            foreach (var calculatedItem in calculationResult.LineItems)
            {
                var valYears = calculatedItem.ValidityYears > 0 ? calculatedItem.ValidityYears : 1;
                soa.LineItems.Add(new SoaLineItem
                {
                    Id = Guid.NewGuid(),
                    StatementOfAccountId = soa.Id,
                    Particular = !string.IsNullOrWhiteSpace(calculatedItem.Particular) ? calculatedItem.Particular : "Statutory Fee",
                    ItemCode = !string.IsNullOrWhiteSpace(calculatedItem.ItemCode) ? calculatedItem.ItemCode : "FEE",
                    Description = calculatedItem.Description,
                    PeriodOfCoverageStart = nowUtc,
                    PeriodOfCoverageEnd = nowUtc.AddYears(valYears),
                    ValidityYears = valYears,
                    NoOfUnits = calculatedItem.NoOfUnits > 0 ? calculatedItem.NoOfUnits : 1,
                    FeeRate = calculatedItem.FeeRate,
                    Amount = calculatedItem.Amount
                });
            }
        }

        // Calculate total SOA amount on the server from validated line items
        soa.TotalAmount = soa.LineItems.Sum(li => li.Amount);

        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = "SOA created by Evaluator",
            ToStatus = SoaStatus.Pending,
            PerformedByUserId = userContext.UserId,
            StaffName = userContext.StaffName,
            StaffRole = userContext.StaffRole,
            Timestamp = DateTime.UtcNow
        });

        await _repository.AddSoaAsync(soa, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(soa.Id);
    }

    private static DateTime EnsureUtc(DateTime dt) =>
        dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

    private static DateTime? EnsureUtc(DateTime? dt) =>
        dt.HasValue ? (dt.Value.Kind == DateTimeKind.Utc ? dt.Value : DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc)) : null;
}

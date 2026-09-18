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

    public CreateSoaCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IFeeCalculationEngine calculationEngine)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _calculationEngine = calculationEngine;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateSoaCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null) return ApiResponse<Guid>.Fail("Application not found.");

        if (!Enum.TryParse<IssuedToType>(request.IssuedToType, true, out var issuedToType))
        {
            return ApiResponse<Guid>.Fail("Invalid IssuedToType.");
        }

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Evaluator", cancellationToken);

        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = request.ApplicationId,
            ApplicantId = request.ApplicantId,
            SoaNumber = $"SOA-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            Status = SoaStatus.Pending,
            IssuedToType = issuedToType,
            IssuedToName = request.IssuedToName,
            IssuedToAddress = request.IssuedToAddress,
            DueDate = request.DueDate,
            PreparedByUserId = userContext.UserId
        };

        if (request.LineItems != null && request.LineItems.Count > 0)
        {
            foreach (var item in request.LineItems)
            {
                var calculatedAmount = item.NoOfUnits * item.FeeRate;

                soa.LineItems.Add(new SoaLineItem
                {
                    Id = Guid.NewGuid(),
                    StatementOfAccountId = soa.Id,
                    Particular = item.Particular,
                    ItemCode = item.ItemCode,
                    Description = item.Description,
                    PeriodOfCoverageStart = item.PeriodOfCoverageStart,
                    PeriodOfCoverageEnd = item.PeriodOfCoverageEnd,
                    ValidityYears = item.ValidityYears,
                    NoOfUnits = item.NoOfUnits,
                    FeeRate = item.FeeRate,
                    Amount = calculatedAmount
                });
            }
        }
        else
        {
            var targetApplicant = request.ApplicantId.HasValue
                ? app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId.Value)?.Applicant
                : null;

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

            var calculationResult = _calculationEngine.Calculate(new FeeCalculationRequest(
                Activity: activity,
                ApplicationType: appType,
                Element: element,
                ValidityYears: years,
                NoOfUnits: units,
                ExpirationDate: request.ExpirationDate,
                AdditionalServicesCount: request.AdditionalServicesCount ?? 0,
                NoOfCopies: request.NoOfCopies ?? 1,
                AsOfDate: DateTime.UtcNow,
                Category: primaryService?.ServiceCategory?.Type
            ));

            foreach (var calculatedItem in calculationResult.LineItems)
            {
                soa.LineItems.Add(new SoaLineItem
                {
                    Id = Guid.NewGuid(),
                    StatementOfAccountId = soa.Id,
                    Particular = calculatedItem.Particular,
                    ItemCode = calculatedItem.ItemCode,
                    Description = calculatedItem.Description,
                    PeriodOfCoverageStart = DateTime.UtcNow,
                    PeriodOfCoverageEnd = DateTime.UtcNow.AddYears(calculatedItem.ValidityYears),
                    ValidityYears = calculatedItem.ValidityYears,
                    NoOfUnits = calculatedItem.NoOfUnits,
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
}

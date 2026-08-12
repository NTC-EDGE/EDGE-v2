using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.CreateSoa;

public class CreateSoaCommandHandler : IRequestHandler<CreateSoaCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public CreateSoaCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateSoaCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (app == null) return ApiResponse<Guid>.Fail("Application not found.");

        if (!Enum.TryParse<IssuedToType>(request.IssuedToType, true, out var issuedToType))
        {
            return ApiResponse<Guid>.Fail("Invalid IssuedToType.");
        }

        Guid? actingUserId = null;
        string staffName = "Evaluator";
        string staffRole = "Evaluator";

        var currentUserIdStr = _currentUserService.UserId;
        if (!string.IsNullOrEmpty(currentUserIdStr) && Guid.TryParse(currentUserIdStr, out var parsedUserId))
        {
            var user = await _userRepository.GetByIdAsync(parsedUserId, cancellationToken);
            if (user != null)
            {
                actingUserId = user.Id;
                staffName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(staffName)) staffName = user.Email;

                var memberRole = user.TenantMemberships.FirstOrDefault()?.Role?.Name 
                              ?? user.TenantMemberships.FirstOrDefault()?.Position;
                if (!string.IsNullOrWhiteSpace(memberRole))
                {
                    staffRole = memberRole;
                }
            }
        }

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
            PreparedByUserId = actingUserId
        };

        foreach (var item in request.LineItems)
        {
            // Server-side calculation: Recalculate line item amount rather than trusting client-provided values
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

        // Calculate total SOA amount on the server from validated line items
        soa.TotalAmount = soa.LineItems.Sum(li => li.Amount);

        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = "SOA created by Evaluator",
            ToStatus = SoaStatus.Pending,
            PerformedByUserId = actingUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Timestamp = DateTime.UtcNow
        });

        await _repository.AddSoaAsync(soa, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(soa.Id);
    }
}

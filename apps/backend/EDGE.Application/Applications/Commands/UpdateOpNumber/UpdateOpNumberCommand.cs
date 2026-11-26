using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.Applications.Commands.UpdateOpNumber;

public record UpdateOpNumberCommand(
    Guid OpId,
    string OpNumber,
    string? Remarks = null,
    Guid? ApplicationId = null,
    Guid? StatementOfAccountId = null
) : IRequest<ApiResponse<string>>;

public class UpdateOpNumberCommandValidator : AbstractValidator<UpdateOpNumberCommand>
{
    public UpdateOpNumberCommandValidator()
    {
        RuleFor(x => x.OpId)
            .NotEmpty().WithMessage("OpId is required.")
            .When(x => !x.ApplicationId.HasValue && !x.StatementOfAccountId.HasValue);

        RuleFor(x => x.OpNumber)
            .NotEmpty().WithMessage("OP Number is required.")
            .MaximumLength(64).WithMessage("OP Number cannot exceed 64 characters.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500).WithMessage("Remarks cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
    }
}

public class UpdateOpNumberCommandHandler : IRequestHandler<UpdateOpNumberCommand, ApiResponse<string>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IRegionalConfigurationService _regionalConfigService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateOpNumberCommandHandler(
        IApplicationFullRepository repository,
        IRegionalConfigurationService regionalConfigService,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _regionalConfigService = regionalConfigService;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<string>> Handle(UpdateOpNumberCommand request, CancellationToken cancellationToken)
    {
        var op = request.OpId != Guid.Empty
            ? await _repository.GetOpByIdAsync(request.OpId, cancellationToken)
            : null;

        EDGE.Domain.Entities.Application? app = null;
        StatementOfAccount? soa = null;

        if (op == null || op.IsDeleted)
        {
            // Try resolving by StatementOfAccountId or ApplicationId (or when OpId was passed as SoaId / ApplicationId before OP creation)
            var candidateSoaId = request.StatementOfAccountId ?? (request.OpId != Guid.Empty ? request.OpId : (Guid?)null);
            if (candidateSoaId.HasValue && candidateSoaId.Value != Guid.Empty)
            {
                soa = await _repository.GetSoaByIdAsync(candidateSoaId.Value, cancellationToken);
            }

            var candidateAppId = request.ApplicationId ?? soa?.ApplicationId ?? (request.OpId != Guid.Empty ? request.OpId : (Guid?)null);
            if (candidateAppId.HasValue && candidateAppId.Value != Guid.Empty)
            {
                app = await _repository.GetByIdWithDetailsAsync(candidateAppId.Value, cancellationToken)
                      ?? await _repository.GetByIdAsync(candidateAppId.Value, cancellationToken);
            }

            if (app != null)
            {
                soa ??= (request.StatementOfAccountId.HasValue
                    ? app.StatementsOfAccount?.FirstOrDefault(s => !s.IsDeleted && s.Id == request.StatementOfAccountId.Value)
                    : null)
                    ?? app.StatementsOfAccount?.OrderByDescending(s => s.CreatedAt).FirstOrDefault(s => !s.IsDeleted);

                op = (soa != null
                    ? app.OrdersOfPayment?.FirstOrDefault(o => !o.IsDeleted && o.StatementOfAccountId == soa.Id)
                    : null)
                    ?? app.OrdersOfPayment?.OrderByDescending(o => o.CreatedAt).FirstOrDefault(o => !o.IsDeleted);
            }
        }

        app ??= (op != null ? (op.Application ?? await _repository.GetByIdAsync(op.ApplicationId, cancellationToken)) : null);
        var tenantId = app?.TenantId ?? Guid.Empty;

        var regionalConfig = await _regionalConfigService.GetConfigurationAsync(tenantId, cancellationToken);
        if (!regionalConfig.AllowManualOpNumber)
        {
            return ApiResponse<string>.Fail("Manual Order of Payment (OP) number editing is currently disabled for this regional office. Please ask your Regional Administrator to enable manual OP numbering in Regional Configuration.");
        }

        var cleanOpNumber = request.OpNumber.Trim();

        if (op == null || op.IsDeleted)
        {
            if (app == null || soa == null)
            {
                return ApiResponse<string>.Fail("Order of Payment (OP) or Statement of Account (SOA) not found.");
            }

            var duplicateForNew = await _repository.OpNumberExistsAsync(tenantId, cleanOpNumber, null, cancellationToken);
            if (duplicateForNew)
            {
                return ApiResponse<string>.Fail($"Order of Payment number '{cleanOpNumber}' is already in use within this regional office.");
            }

            op = new OrderOfPayment
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                StatementOfAccountId = soa.Id,
                OpNumber = cleanOpNumber,
                AmountDue = soa.TotalAmount,
                AmountReceived = 0m,
                Status = Domain.Enums.OpStatus.Billed,
                Remarks = !string.IsNullOrWhiteSpace(request.Remarks) ? request.Remarks.Trim() : "Order of Payment number manually set.",
                CreatedAt = DateTime.UtcNow
            };
            await _repository.AddOpAsync(op, cancellationToken);

            var newUserContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Accountant", cancellationToken);
            Guid? newValidUserId = null;
            if (newUserContext.UserId.HasValue && await _repository.UserExistsAsync(newUserContext.UserId.Value, cancellationToken))
            {
                newValidUserId = newUserContext.UserId.Value;
            }
            var newStaffName = !string.IsNullOrWhiteSpace(newUserContext.StaffName) ? newUserContext.StaffName : "Accountant";
            var newStaffRole = !string.IsNullOrWhiteSpace(newUserContext.StaffRole) ? newUserContext.StaffRole : "Accountant";

            await _repository.AddOpHistoryAsync(new OpHistory
            {
                Id = Guid.NewGuid(),
                OrderOfPaymentId = op.Id,
                Action = "OP Number Set",
                ToStatus = op.Status,
                PerformedByUserId = newValidUserId,
                StaffName = newStaffName,
                StaffRole = newStaffRole,
                Remarks = $"Order of Payment number manually set to '{cleanOpNumber}'.",
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return ApiResponse<string>.Success(op.OpNumber, "Order of Payment number saved successfully.");
        }
        if (string.Equals(op.OpNumber, cleanOpNumber, StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<string>.Success(op.OpNumber, "Order of Payment number is already set to this value.");
        }

        var duplicateExists = await _repository.OpNumberExistsAsync(tenantId, cleanOpNumber, op.Id, cancellationToken);
        if (duplicateExists)
        {
            return ApiResponse<string>.Fail($"Order of Payment number '{cleanOpNumber}' is already in use within this regional office.");
        }

        var previousOpNumber = op.OpNumber;
        op.OpNumber = cleanOpNumber;

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Accountant", cancellationToken);
        Guid? validUserId = null;
        if (userContext.UserId.HasValue && await _repository.UserExistsAsync(userContext.UserId.Value, cancellationToken))
        {
            validUserId = userContext.UserId.Value;
        }

        var staffName = !string.IsNullOrWhiteSpace(userContext.StaffName) ? userContext.StaffName : "Accountant";
        var staffRole = !string.IsNullOrWhiteSpace(userContext.StaffRole) ? userContext.StaffRole : "Accountant";
        var remarksText = !string.IsNullOrWhiteSpace(request.Remarks)
            ? $"Order of Payment number updated from '{previousOpNumber}' to '{cleanOpNumber}'. Remarks: {request.Remarks.Trim()}"
            : $"Order of Payment number manually updated from '{previousOpNumber}' to '{cleanOpNumber}'.";

        await _repository.AddOpHistoryAsync(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = "OP Number Updated",
            FromStatus = op.Status,
            ToStatus = op.Status,
            PerformedByUserId = validUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = remarksText,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);

        if (app != null)
        {
            await _repository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = "OP Number Updated",
                FromStatus = app.Status,
                ToStatus = app.Status,
                PerformedByUserId = validUserId,
                StaffName = staffName,
                StaffRole = staffRole,
                Remarks = remarksText,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success(op.OpNumber, "Order of Payment number updated successfully.");
    }
}

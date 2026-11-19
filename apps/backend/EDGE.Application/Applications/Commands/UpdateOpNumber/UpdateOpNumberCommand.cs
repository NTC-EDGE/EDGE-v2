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
    string? Remarks = null
) : IRequest<ApiResponse<string>>;

public class UpdateOpNumberCommandValidator : AbstractValidator<UpdateOpNumberCommand>
{
    public UpdateOpNumberCommandValidator()
    {
        RuleFor(x => x.OpId)
            .NotEmpty().WithMessage("OpId is required.");

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
        var op = await _repository.GetOpByIdAsync(request.OpId, cancellationToken);
        if (op == null || op.IsDeleted)
        {
            return ApiResponse<string>.Fail("Order of Payment (OP) not found.");
        }

        var app = op.Application ?? await _repository.GetByIdAsync(op.ApplicationId, cancellationToken);
        var tenantId = app?.TenantId ?? Guid.Empty;

        var regionalConfig = await _regionalConfigService.GetConfigurationAsync(tenantId, cancellationToken);
        if (!regionalConfig.AllowManualOpNumber)
        {
            return ApiResponse<string>.Fail("Manual Order of Payment (OP) number editing is currently disabled for this regional office. Please ask your Regional Administrator to enable manual OP numbering in Regional Configuration.");
        }

        var cleanOpNumber = request.OpNumber.Trim();
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

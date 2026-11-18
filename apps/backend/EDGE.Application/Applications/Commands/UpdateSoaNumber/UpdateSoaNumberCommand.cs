using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.Applications.Commands.UpdateSoaNumber;

public record UpdateSoaNumberCommand(
    Guid SoaId,
    string SoaNumber,
    string? Remarks = null
) : IRequest<ApiResponse<string>>;

public class UpdateSoaNumberCommandValidator : AbstractValidator<UpdateSoaNumberCommand>
{
    public UpdateSoaNumberCommandValidator()
    {
        RuleFor(x => x.SoaId)
            .NotEmpty().WithMessage("SoaId is required.");

        RuleFor(x => x.SoaNumber)
            .NotEmpty().WithMessage("SOA Number is required.")
            .MaximumLength(64).WithMessage("SOA Number cannot exceed 64 characters.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500).WithMessage("Remarks cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
    }
}

public class UpdateSoaNumberCommandHandler : IRequestHandler<UpdateSoaNumberCommand, ApiResponse<string>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IRegionalConfigurationService _regionalConfigService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSoaNumberCommandHandler(
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

    public async Task<ApiResponse<string>> Handle(UpdateSoaNumberCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);
        if (soa == null || soa.IsDeleted)
        {
            return ApiResponse<string>.Fail("Statement of Account (SOA) not found.");
        }

        var app = soa.Application ?? await _repository.GetByIdAsync(soa.ApplicationId, cancellationToken);
        var tenantId = app?.TenantId ?? Guid.Empty;

        var regionalConfig = await _regionalConfigService.GetConfigurationAsync(tenantId, cancellationToken);
        if (!regionalConfig.AllowManualSoaNumber)
        {
            return ApiResponse<string>.Fail("Manual SOA number editing is currently disabled for this regional office. Please ask your Regional Administrator to enable manual SOA numbering in Regional Configuration.");
        }

        var cleanSoaNumber = request.SoaNumber.Trim();
        if (string.Equals(soa.SoaNumber, cleanSoaNumber, StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<string>.Success(soa.SoaNumber, "SOA number is already set to this value.");
        }

        var duplicateExists = await _repository.SoaNumberExistsAsync(tenantId, cleanSoaNumber, soa.Id, cancellationToken);
        if (duplicateExists)
        {
            return ApiResponse<string>.Fail($"SOA number '{cleanSoaNumber}' is already in use within this regional office.");
        }

        var previousSoaNumber = soa.SoaNumber;
        soa.SoaNumber = cleanSoaNumber;

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Staff", cancellationToken);
        Guid? validUserId = null;
        if (userContext.UserId.HasValue && await _repository.UserExistsAsync(userContext.UserId.Value, cancellationToken))
        {
            validUserId = userContext.UserId.Value;
        }

        var staffName = !string.IsNullOrWhiteSpace(userContext.StaffName) ? userContext.StaffName : "Regional Staff";
        var staffRole = !string.IsNullOrWhiteSpace(userContext.StaffRole) ? userContext.StaffRole : "Regional Staff";
        var remarksText = !string.IsNullOrWhiteSpace(request.Remarks)
            ? $"SOA number updated from '{previousSoaNumber}' to '{cleanSoaNumber}'. Remarks: {request.Remarks.Trim()}"
            : $"SOA number manually updated from '{previousSoaNumber}' to '{cleanSoaNumber}'.";

        await _repository.AddSoaHistoryAsync(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = "SOA Number Updated",
            FromStatus = soa.Status,
            ToStatus = soa.Status,
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
                Action = "SOA Number Updated",
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

        return ApiResponse<string>.Success(soa.SoaNumber, "Statement of Account number updated successfully.");
    }
}

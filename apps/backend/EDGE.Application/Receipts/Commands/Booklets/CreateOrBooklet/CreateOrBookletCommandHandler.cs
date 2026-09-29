using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;
using EDGE.Application.Receipts.Services;

namespace EDGE.Application.Receipts.Commands.Booklets.CreateOrBooklet;

public record CreateOrBookletCommand(
    Guid TenantId,
    string BookletNumber,
    string? Prefix,
    long StartNumber,
    long? EndNumber = null,
    int TotalCount = 50,
    Guid? AssignedUserId = null,
    List<Guid>? AssignedUserIds = null,
    string? Remarks = null
) : IRequest<ApiResponse<OrBookletDto>>;

public class CreateOrBookletCommandValidator : AbstractValidator<CreateOrBookletCommand>
{
    public CreateOrBookletCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.BookletNumber).NotEmpty().MaximumLength(100).WithMessage("Booklet number is required.");
        RuleFor(x => x.StartNumber).GreaterThan(0).WithMessage("Start number must be greater than 0.");
        RuleFor(x => x.TotalCount).GreaterThan(0).WithMessage("Total count must be greater than 0.");
        RuleFor(x => x)
            .Must(cmd => (cmd.AssignedUserIds != null && cmd.AssignedUserIds.Any(id => id != Guid.Empty)) || (cmd.AssignedUserId.HasValue && cmd.AssignedUserId.Value != Guid.Empty))
            .WithMessage("Please select at least one authorized Cashier to assign this booklet series.");
    }
}

public class CreateOrBookletCommandHandler : IRequestHandler<CreateOrBookletCommand, ApiResponse<OrBookletDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICashierCustodianValidator _custodianValidator;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrBookletCommandHandler(
        IOrBookletRepository bookletRepository,
        ITenantRepository tenantRepository,
        ICashierCustodianValidator custodianValidator,
        IUnitOfWork unitOfWork)
    {
        _bookletRepository = bookletRepository;
        _tenantRepository = tenantRepository;
        _custodianValidator = custodianValidator;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrBookletDto>> Handle(CreateOrBookletCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<OrBookletDto>.Fail($"Tenant '{request.TenantId}' was not found.");
        }

        var exists = await _bookletRepository.ExistsBookletNumberAsync(request.TenantId, request.BookletNumber.Trim(), null, cancellationToken);
        if (exists)
        {
            return ApiResponse<OrBookletDto>.Fail($"An Official Receipt booklet with number '{request.BookletNumber}' already exists for this tenant.");
        }

        var totalCount = request.TotalCount > 0 ? request.TotalCount : 50;
        var endNumber = request.EndNumber ?? (request.StartNumber + totalCount - 1);

        if (endNumber < request.StartNumber)
        {
            return ApiResponse<OrBookletDto>.Fail("End number cannot be less than start number.");
        }

        // Collect all assigned cashier user IDs
        var userIdsToAssign = new List<Guid>();
        if (request.AssignedUserIds != null && request.AssignedUserIds.Count > 0)
        {
            userIdsToAssign.AddRange(request.AssignedUserIds.Where(id => id != Guid.Empty));
        }
        else if (request.AssignedUserId.HasValue && request.AssignedUserId.Value != Guid.Empty)
        {
            userIdsToAssign.Add(request.AssignedUserId.Value);
        }

        // Validate cashier custodians via shared domain validation service
        var validation = await _custodianValidator.ValidateCustodiansAsync(
            request.TenantId,
            userIdsToAssign,
            request.AssignedUserId,
            cancellationToken);

        if (!validation.Succeeded)
        {
            return ApiResponse<OrBookletDto>.Fail(validation.ErrorMessage!);
        }

        var assignedCashierEntities = validation.ValidatedCustodians.Select(c => new OrBookletCashier
        {
            CashierUserId = c.UserId,
            IsPrimary = c.IsPrimary,
            AssignedAt = DateTime.UtcNow
        }).ToList();

        var primaryCustodian = validation.ValidatedCustodians.FirstOrDefault(c => c.IsPrimary) ?? validation.ValidatedCustodians.FirstOrDefault();

        var booklet = new OrBooklet
        {
            TenantId = request.TenantId,
            BookletNumber = request.BookletNumber.Trim(),
            Prefix = string.IsNullOrWhiteSpace(request.Prefix) ? null : request.Prefix.Trim(),
            StartNumber = request.StartNumber,
            EndNumber = endNumber,
            CurrentNumber = request.StartNumber,
            TotalCount = totalCount,
            IssuedCount = 0,
            AssignedUserId = primaryCustodian?.UserId,
            Status = BookletStatus.Active,
            ReceivedDate = DateTime.UtcNow,
            Remarks = request.Remarks?.Trim(),
            AssignedCashiers = assignedCashierEntities
        };

        await _bookletRepository.AddAsync(booklet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var assignedCashierList = validation.ValidatedCustodians
            .Select(c => new BookletCashierDto(c.UserId, c.FullName, c.IsPrimary))
            .ToList();

        var primaryCashierName = primaryCustodian?.FullName;
        var cashierDisplayNames = validation.ValidatedCustodians.Select(c => c.FullName).ToList();
        var cashierIds = validation.ValidatedCustodians.Select(c => c.UserId).ToList();

        var dto = new OrBookletDto(
            booklet.Id,
            booklet.TenantId,
            booklet.BookletNumber,
            booklet.Prefix,
            booklet.StartNumber,
            booklet.EndNumber,
            booklet.CurrentNumber,
            booklet.TotalCount,
            booklet.IssuedCount,
            booklet.RemainingCount,
            booklet.FormatOrNumber(booklet.StartNumber),
            booklet.FormatOrNumber(booklet.EndNumber),
            booklet.CurrentFormattedOrNumber,
            booklet.AssignedUserId,
            primaryCashierName,
            booklet.Status,
            booklet.ReceivedDate,
            booklet.Remarks,
            cashierIds,
            cashierDisplayNames,
            assignedCashierList
        );

        var assignmentMessage = assignedCashierList.Count > 1
            ? $"Official Receipt booklet registered and shared with {assignedCashierList.Count} cashiers ({string.Join(", ", cashierDisplayNames)})."
            : assignedCashierList.Count == 1
            ? $"Official Receipt booklet registered and assigned to {primaryCashierName} successfully."
            : "Official Receipt booklet registered as unassigned/pooled booklet.";

        return ApiResponse<OrBookletDto>.Success(dto, assignmentMessage);
    }
}

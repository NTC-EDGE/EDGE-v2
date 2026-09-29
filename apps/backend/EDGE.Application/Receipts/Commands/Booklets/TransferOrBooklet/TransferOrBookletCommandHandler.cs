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

namespace EDGE.Application.Receipts.Commands.Booklets.TransferOrBooklet;

public record TransferOrBookletCommand(
    Guid Id,
    Guid TenantId,
    Guid NewAssignedUserId,
    List<Guid>? AdditionalUserIds = null,
    string? TransferReason = null
) : IRequest<ApiResponse<OrBookletDto>>;

public class TransferOrBookletCommandValidator : AbstractValidator<TransferOrBookletCommand>
{
    public TransferOrBookletCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Booklet Id is required.");
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.NewAssignedUserId).NotEmpty().WithMessage("New Assigned User Id is required.");
    }
}

public class TransferOrBookletCommandHandler : IRequestHandler<TransferOrBookletCommand, ApiResponse<OrBookletDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly ICashierCustodianValidator _custodianValidator;
    private readonly IUnitOfWork _unitOfWork;

    public TransferOrBookletCommandHandler(
        IOrBookletRepository bookletRepository,
        ICashierCustodianValidator custodianValidator,
        IUnitOfWork unitOfWork)
    {
        _bookletRepository = bookletRepository;
        _custodianValidator = custodianValidator;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrBookletDto>> Handle(TransferOrBookletCommand request, CancellationToken cancellationToken)
    {
        var booklet = await _bookletRepository.GetByIdAsync(request.Id, cancellationToken);
        if (booklet == null || booklet.TenantId != request.TenantId)
        {
            return ApiResponse<OrBookletDto>.Fail("OR Booklet was not found.");
        }

        // Collect all users to assign (Primary + Optional Co-Cashiers)
        var allUserIds = new List<Guid> { request.NewAssignedUserId };
        if (request.AdditionalUserIds != null)
        {
            allUserIds.AddRange(request.AdditionalUserIds.Where(id => id != Guid.Empty && id != request.NewAssignedUserId));
        }

        // Validate cashier custodians via shared domain validation service
        var validation = await _custodianValidator.ValidateCustodiansAsync(
            request.TenantId,
            allUserIds,
            request.NewAssignedUserId,
            cancellationToken);

        if (!validation.Succeeded)
        {
            return ApiResponse<OrBookletDto>.Fail(validation.ErrorMessage!);
        }

        var primaryCustodian = validation.ValidatedCustodians.First(c => c.IsPrimary);
        booklet.AssignedUserId = primaryCustodian.UserId;

        booklet.AssignedCashiers.Clear();
        foreach (var custodian in validation.ValidatedCustodians)
        {
            booklet.AssignedCashiers.Add(new OrBookletCashier
            {
                BookletId = booklet.Id,
                CashierUserId = custodian.UserId,
                IsPrimary = custodian.IsPrimary,
                AssignedAt = DateTime.UtcNow
            });
        }

        if (!string.IsNullOrWhiteSpace(request.TransferReason))
        {
            var auditLog = $"[Transferred to {primaryCustodian.FullName} on {DateTime.UtcNow:yyyy-MM-dd HH:mm}: {request.TransferReason.Trim()}]";
            booklet.Remarks = string.IsNullOrWhiteSpace(booklet.Remarks)
                ? auditLog
                : $"{booklet.Remarks}\n{auditLog}";
        }

        await _bookletRepository.UpdateAsync(booklet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var assignedCashiers = validation.ValidatedCustodians
            .Select(c => new BookletCashierDto(c.UserId, c.FullName, c.IsPrimary))
            .ToList();

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
            primaryCustodian.FullName,
            booklet.Status,
            booklet.ReceivedDate,
            booklet.Remarks,
            cashierIds,
            cashierDisplayNames,
            assignedCashiers
        );

        return ApiResponse<OrBookletDto>.Success(dto, $"Official Receipt booklet successfully transferred to {primaryCustodian.FullName}.");
    }
}

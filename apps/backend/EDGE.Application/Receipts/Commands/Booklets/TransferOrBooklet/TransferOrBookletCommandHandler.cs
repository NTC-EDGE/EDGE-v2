using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Commands.Booklets.TransferOrBooklet;

public record TransferOrBookletCommand(
    Guid Id,
    Guid TenantId,
    Guid NewAssignedUserId,
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
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TransferOrBookletCommandHandler(
        IOrBookletRepository bookletRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _bookletRepository = bookletRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrBookletDto>> Handle(TransferOrBookletCommand request, CancellationToken cancellationToken)
    {
        var booklet = await _bookletRepository.GetByIdAsync(request.Id, cancellationToken);
        if (booklet == null || booklet.TenantId != request.TenantId)
        {
            return ApiResponse<OrBookletDto>.Fail("OR Booklet was not found.");
        }

        var newUser = await _userRepository.GetByIdAsync(request.NewAssignedUserId, cancellationToken);
        if (newUser == null)
        {
            return ApiResponse<OrBookletDto>.Fail("Target cashier / staff user was not found.");
        }

        var newUserName = $"{newUser.FirstName} {newUser.LastName}".Trim();
        booklet.AssignedUserId = request.NewAssignedUserId;

        if (!string.IsNullOrWhiteSpace(request.TransferReason))
        {
            var auditLog = $"[Transferred to {newUserName} on {DateTime.UtcNow:yyyy-MM-dd HH:mm}: {request.TransferReason.Trim()}]";
            booklet.Remarks = string.IsNullOrWhiteSpace(booklet.Remarks)
                ? auditLog
                : $"{booklet.Remarks}\n{auditLog}";
        }

        await _bookletRepository.UpdateAsync(booklet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            newUserName,
            booklet.Status,
            booklet.ReceivedDate,
            booklet.Remarks
        );

        return ApiResponse<OrBookletDto>.Success(dto, $"Official Receipt booklet successfully transferred to {newUserName}.");
    }
}

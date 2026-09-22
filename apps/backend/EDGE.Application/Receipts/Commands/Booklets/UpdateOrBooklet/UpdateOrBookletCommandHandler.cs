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

namespace EDGE.Application.Receipts.Commands.Booklets.UpdateOrBooklet;

public record UpdateOrBookletCommand(
    Guid Id,
    Guid TenantId,
    string BookletNumber,
    string? Prefix,
    long StartNumber,
    long? EndNumber = null,
    int TotalCount = 50,
    string? Remarks = null
) : IRequest<ApiResponse<OrBookletDto>>;

public class UpdateOrBookletCommandValidator : AbstractValidator<UpdateOrBookletCommand>
{
    public UpdateOrBookletCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Booklet Id is required.");
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.BookletNumber).NotEmpty().MaximumLength(100).WithMessage("Booklet number is required.");
        RuleFor(x => x.StartNumber).GreaterThan(0).WithMessage("Start number must be greater than 0.");
        RuleFor(x => x.TotalCount).GreaterThan(0).WithMessage("Total count must be greater than 0.");
    }
}

public class UpdateOrBookletCommandHandler : IRequestHandler<UpdateOrBookletCommand, ApiResponse<OrBookletDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateOrBookletCommandHandler(
        IOrBookletRepository bookletRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _bookletRepository = bookletRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrBookletDto>> Handle(UpdateOrBookletCommand request, CancellationToken cancellationToken)
    {
        var booklet = await _bookletRepository.GetByIdAsync(request.Id, cancellationToken);
        if (booklet == null || booklet.TenantId != request.TenantId)
        {
            return ApiResponse<OrBookletDto>.Fail("OR Booklet was not found.");
        }

        // Only allow updating if no receipts have been issued from this booklet yet
        if (booklet.IssuedCount > 0 || booklet.CurrentNumber != booklet.StartNumber)
        {
            return ApiResponse<OrBookletDto>.Fail("Cannot edit booklet series because Official Receipts have already been issued from this booklet.");
        }

        var exists = await _bookletRepository.ExistsBookletNumberAsync(request.TenantId, request.BookletNumber.Trim(), booklet.Id, cancellationToken);
        if (exists)
        {
            return ApiResponse<OrBookletDto>.Fail($"Another Official Receipt booklet with number '{request.BookletNumber}' already exists.");
        }

        var totalCount = request.TotalCount > 0 ? request.TotalCount : 50;
        var endNumber = request.EndNumber ?? (request.StartNumber + totalCount - 1);

        if (endNumber < request.StartNumber)
        {
            return ApiResponse<OrBookletDto>.Fail("End number cannot be less than start number.");
        }

        booklet.BookletNumber = request.BookletNumber.Trim();
        booklet.Prefix = string.IsNullOrWhiteSpace(request.Prefix) ? null : request.Prefix.Trim();
        booklet.StartNumber = request.StartNumber;
        booklet.EndNumber = endNumber;
        booklet.CurrentNumber = request.StartNumber;
        booklet.TotalCount = totalCount;
        booklet.Remarks = request.Remarks?.Trim();

        await _bookletRepository.UpdateAsync(booklet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        string? assignedUserName = null;
        if (booklet.AssignedUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(booklet.AssignedUserId.Value, cancellationToken);
            assignedUserName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : null;
        }

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
            assignedUserName,
            booklet.Status,
            booklet.ReceivedDate,
            booklet.Remarks
        );

        return ApiResponse<OrBookletDto>.Success(dto, "Official Receipt booklet updated successfully.");
    }
}

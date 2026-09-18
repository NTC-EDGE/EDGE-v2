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

namespace EDGE.Application.Receipts.Commands.Booklets.CreateOrBooklet;

public record CreateOrBookletCommand(
    Guid TenantId,
    string BookletNumber,
    string? Prefix,
    long StartNumber,
    long? EndNumber = null,
    int TotalCount = 50,
    Guid? AssignedUserId = null,
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
        RuleFor(x => x.AssignedUserId).NotEmpty().WithMessage("Assigned custodian / cashier is required.");
    }
}

public class CreateOrBookletCommandHandler : IRequestHandler<CreateOrBookletCommand, ApiResponse<OrBookletDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrBookletCommandHandler(
        IOrBookletRepository bookletRepository,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _bookletRepository = bookletRepository;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrBookletDto>> Handle(CreateOrBookletCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<OrBookletDto>.Fail($"Tenant '{request.TenantId}' was not found.");
        }

        if (!request.AssignedUserId.HasValue || request.AssignedUserId.Value == Guid.Empty)
        {
            return ApiResponse<OrBookletDto>.Fail("An assigned custodian / cashier is required for every OR booklet.");
        }

        // Verify that the assigned user exists and belongs to this tenant
        var membership = await _tenantMemberRepository.GetByTenantAndUserAsync(request.TenantId, request.AssignedUserId.Value, cancellationToken);
        var user = await _userRepository.GetByIdAsync(request.AssignedUserId.Value, cancellationToken);

        if (user == null)
        {
            return ApiResponse<OrBookletDto>.Fail("The assigned custodian user was not found.");
        }

        if (membership == null && !user.IsSuperAdmin)
        {
            return ApiResponse<OrBookletDto>.Fail("The assigned custodian must belong to this regional office / tenant.");
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
            AssignedUserId = request.AssignedUserId.Value,
            Status = BookletStatus.Active,
            ReceivedDate = DateTime.UtcNow,
            Remarks = request.Remarks?.Trim()
        };

        await _bookletRepository.AddAsync(booklet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var assignedUserName = $"{user.FirstName} {user.LastName}".Trim();

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

        return ApiResponse<OrBookletDto>.Success(dto, $"Official Receipt booklet registered and assigned to {assignedUserName} successfully.");
    }
}

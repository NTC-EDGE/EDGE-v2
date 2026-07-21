using MediatR;
using EDGE.Application.TenantMembers.DTOs;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using FluentValidation;

namespace EDGE.Application.TenantMembers.Commands;

public record AddTenantMemberCommand(
    Guid TenantId,
    Guid UserId,
    Guid RoleId
) : IRequest<TenantMemberDto>;

public class AddTenantMemberCommandValidator : AbstractValidator<AddTenantMemberCommand>
{
    public AddTenantMemberCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Tenant ID is required.");
        RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required.");
        RuleFor(x => x.RoleId).NotEmpty().WithMessage("Role ID is required.");
    }
}

public class AddTenantMemberCommandHandler : IRequestHandler<AddTenantMemberCommand, TenantMemberDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddTenantMemberCommandHandler(
        ITenantRepository tenantRepository,
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        ITenantMemberRepository tenantMemberRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantMemberDto> Handle(AddTenantMemberCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken)
            ?? throw new InvalidOperationException("Tenant not found.");

        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");

        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken)
            ?? throw new InvalidOperationException("Role not found.");

        if (role.TenantId != null && role.TenantId != request.TenantId)
        {
            throw new InvalidOperationException("Role does not belong to specified Tenant.");
        }

        var existing = await _tenantMemberRepository.GetMemberAsync(request.UserId, request.TenantId, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException("User is already a member of this Tenant.");
        }

        var member = new TenantMember
        {
            TenantId = request.TenantId,
            UserId = request.UserId,
            RoleId = request.RoleId,
            IsActive = true,
            JoinedAt = DateTime.UtcNow
        };

        await _tenantMemberRepository.AddAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantMemberDto(
            user.Id,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email,
            tenant.Id,
            tenant.Name,
            role.Id,
            role.Name,
            role.Key,
            member.IsActive,
            member.JoinedAt
        );
    }
}

public record UpdateTenantMemberCommand(
    Guid TenantId,
    Guid UserId,
    Guid RoleId,
    bool IsActive = true
) : IRequest<TenantMemberDto?>;

public class UpdateTenantMemberCommandValidator : AbstractValidator<UpdateTenantMemberCommand>
{
    public UpdateTenantMemberCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Tenant ID is required.");
        RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required.");
        RuleFor(x => x.RoleId).NotEmpty().WithMessage("Role ID is required.");
    }
}

public class UpdateTenantMemberCommandHandler : IRequestHandler<UpdateTenantMemberCommand, TenantMemberDto?>
{
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantMemberCommandHandler(
        ITenantMemberRepository tenantMemberRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantMemberRepository = tenantMemberRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantMemberDto?> Handle(UpdateTenantMemberCommand request, CancellationToken cancellationToken)
    {
        var member = await _tenantMemberRepository.GetMemberAsync(request.UserId, request.TenantId, cancellationToken);
        if (member == null) return null;

        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null) throw new InvalidOperationException("Role not found.");

        if (role.TenantId != null && role.TenantId != request.TenantId)
        {
            throw new InvalidOperationException("Role does not belong to specified Tenant.");
        }

        member.RoleId = request.RoleId;
        member.Role = role;
        member.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantMemberDto(
            member.User.Id,
            $"{member.User.FirstName} {member.User.LastName}".Trim(),
            member.User.Email,
            member.Tenant.Id,
            member.Tenant.Name,
            role.Id,
            role.Name,
            role.Key,
            member.IsActive,
            member.JoinedAt
        );
    }
}

public record RemoveTenantMemberCommand(Guid TenantId, Guid UserId) : IRequest<bool>;

public class RemoveTenantMemberCommandHandler : IRequestHandler<RemoveTenantMemberCommand, bool>
{
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveTenantMemberCommandHandler(ITenantMemberRepository tenantMemberRepository, IUnitOfWork unitOfWork)
    {
        _tenantMemberRepository = tenantMemberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RemoveTenantMemberCommand request, CancellationToken cancellationToken)
    {
        var member = await _tenantMemberRepository.GetMemberAsync(request.UserId, request.TenantId, cancellationToken);
        if (member == null) return false;

        _tenantMemberRepository.Delete(member);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

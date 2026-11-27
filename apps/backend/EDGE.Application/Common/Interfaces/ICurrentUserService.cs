namespace EDGE.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    string? FullName => null;
    bool IsEmailVerified { get; }
    Guid? TenantId { get; }
    string? IpAddress { get; }
    bool IsSuperAdminClaim { get; }
    bool IsAdminClaim { get; }
}

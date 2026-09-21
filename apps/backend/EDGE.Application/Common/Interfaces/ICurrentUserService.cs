namespace EDGE.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    bool IsEmailVerified { get; }
    Guid? TenantId { get; }
    string? IpAddress { get; }
}

namespace EDGE.Domain.Authorization;

public interface ITenantContextService
{
    Guid? TenantId { get; }
}

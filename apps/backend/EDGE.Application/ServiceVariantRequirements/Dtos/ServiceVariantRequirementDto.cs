using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.ServiceVariantRequirements.Dtos;

public class ServiceVariantRequirementDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public Guid RequirementId { get; set; }
    public RequirementDto? Requirement { get; set; }
    public Guid ServiceVariantId { get; set; }
    public string? ServiceVariantType { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceCode { get; set; }

    public bool IsRequired { get; set; }
}

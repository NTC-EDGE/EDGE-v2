using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.ServiceVariantRequirements.Dtos;

public class ServiceVariantRequirementDto
{
    public Guid Id { get; set; }
    public Guid RequirementId { get; set; }
    public RequirementDto? Requirement { get; set; }
    public Guid ServiceVariantId { get; set; }
    public string? ApplicationTypeKey { get; set; }
    public bool IsRequired { get; set; }
}

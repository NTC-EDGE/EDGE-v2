using System;

namespace EDGE.Application.Requirements.Dtos;

public class RequirementDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ServiceRequirementItemDto
{
    public Guid RequirementId { get; set; }
    public Guid? ServiceVariantRequirementId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ContextKey { get; set; }
    public bool IsRequired { get; set; }
}

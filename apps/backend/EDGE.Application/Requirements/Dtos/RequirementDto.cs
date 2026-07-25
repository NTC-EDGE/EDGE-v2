namespace EDGE.Application.Requirements.Dtos;

public class RequirementDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

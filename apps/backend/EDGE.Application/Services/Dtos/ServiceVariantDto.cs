using System;

namespace EDGE.Application.Services.Dtos;

public class ServiceVariantDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
}

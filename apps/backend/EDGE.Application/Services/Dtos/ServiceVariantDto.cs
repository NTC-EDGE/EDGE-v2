using System;

namespace EDGE.Application.Services.Dtos;

public class ServiceVariantDto
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsIndividual { get; set; } = true;
}

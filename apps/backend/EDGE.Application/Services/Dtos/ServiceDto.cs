using System;
using System.Collections.Generic;

namespace EDGE.Application.Services.Dtos;

public class ServiceDto
{
    public Guid Id { get; set; }
    public Guid ServiceCategoryId { get; set; }
    public string ServiceCategoryCode { get; set; } = string.Empty;
    public string ServiceCategoryType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Group { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public string Contract { get; set; } = string.Empty;
    public List<ServiceVariantDto> Variants { get; set; } = new();
}

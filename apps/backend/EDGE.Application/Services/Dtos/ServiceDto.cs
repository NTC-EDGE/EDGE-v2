using System;

namespace EDGE.Application.Services.Dtos;

/// <summary>
/// Returned by GET /api/v2/services.
/// Per plan §3.1: Contract JSON is NOT included here — fetched via GET /services/:id/contract.
/// Variants are NOT included here — fetched via GET /services/:id/variants.
/// </summary>
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
    public Guid? TenantId { get; set; }
}

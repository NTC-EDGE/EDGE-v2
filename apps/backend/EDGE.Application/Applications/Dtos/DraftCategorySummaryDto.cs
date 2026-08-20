using System;

namespace EDGE.Application.Applications.Dtos;

public class DraftCategorySummaryDto
{
    public Guid ServiceCategoryId { get; set; }
    public string ServiceCategoryName { get; set; } = string.Empty;
    public string ServiceCategoryCode { get; set; } = string.Empty;
    public int DraftCount { get; set; }
}

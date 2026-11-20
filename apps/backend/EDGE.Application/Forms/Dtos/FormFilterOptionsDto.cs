using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

public class FormCategoryOptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class FormServiceOptionDto
{
    public Guid Id { get; set; }
    public Guid ServiceCategoryId { get; set; }
    public string ServiceCategoryCode { get; set; } = string.Empty;
    public string ServiceCategoryType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Group { get; set; }
    public string? Code { get; set; }
}

public class FormFilterOptionsDto
{
    public List<FormCategoryOptionDto> Categories { get; set; } = new();
    public List<FormServiceOptionDto> Services { get; set; } = new();
}

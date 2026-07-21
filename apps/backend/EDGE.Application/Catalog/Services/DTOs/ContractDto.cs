using System.Text.Json.Serialization;

namespace EDGE.Application.Catalog.Services.DTOs;

/// <summary>
/// Strict DTO representing the JSON Contract structure stored on a Service.
/// Validation rules:
///   - FormNo is always required.
///   - ExamineeTypes is required when the parent ServiceCategory.Type == Exams.
///   - Elements is required when the parent ServiceCategory.Type == TechnicalApplications.
/// </summary>
public class ContractDto
{
    /// <summary>The NTC form number, e.g. "NTC 1-03".</summary>
    [JsonPropertyName("formNo")]
    public string FormNo { get; set; } = string.Empty;

    /// <summary>Array of examinee type identifiers. Required for Exams category.</summary>
    [JsonPropertyName("examineeTypes")]
    public List<string>? ExamineeTypes { get; set; }

    /// <summary>Array of technical form element descriptors. Required for TechnicalApplications category.</summary>
    [JsonPropertyName("elements")]
    public List<ContractElementDto>? Elements { get; set; }
}

/// <summary>
/// A single element descriptor within the technical application contract.
/// </summary>
public class ContractElementDto
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("required")]
    public bool Required { get; set; }
}

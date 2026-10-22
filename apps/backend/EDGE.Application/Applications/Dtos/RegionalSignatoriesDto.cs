namespace EDGE.Application.Applications.Dtos;

/// <summary>
/// Regional executive and division signatories for official documents (SOA, etc.).
/// </summary>
public class RegionalSignatoriesDto
{
    public string? ChiefEodName { get; set; }
    public string? ChiefEodTitle { get; set; }
    public string? RegionalDirectorName { get; set; }
    public string? RegionalDirectorTitle { get; set; }
    public string? RegionName { get; set; }
    public string? RegionCode { get; set; }
    public string? OfficeName { get; set; }

    /// <summary>
    /// Resolves the Approver's name based on regional administrative rules:
    /// 1. Chief of EOD if designated in the region.
    /// 2. Regional Director if no Chief of EOD exists in the specified region.
    /// 3. Default fallback placeholder if neither is assigned.
    /// </summary>
    public string GetResolvedApproverName(string defaultFallback = "CHIEF, EOD")
    {
        if (!string.IsNullOrWhiteSpace(ChiefEodName))
            return ChiefEodName;

        if (!string.IsNullOrWhiteSpace(RegionalDirectorName))
            return RegionalDirectorName;

        return defaultFallback;
    }

    /// <summary>
    /// Resolves the Approver's position/title with appropriate regional qualification.
    /// </summary>
    public string GetResolvedApproverTitle()
    {
        var regionLabel = GetRegionLabel();

        if (!string.IsNullOrWhiteSpace(ChiefEodName))
        {
            return !string.IsNullOrWhiteSpace(ChiefEodTitle)
                ? ChiefEodTitle
                : $"Chief, Enforcement & Operations Division, {regionLabel}";
        }

        if (!string.IsNullOrWhiteSpace(RegionalDirectorName))
        {
            return !string.IsNullOrWhiteSpace(RegionalDirectorTitle)
                ? RegionalDirectorTitle
                : $"Regional Director, {regionLabel}";
        }

        return $"Chief, Enforcement & Operations Division, {regionLabel}";
    }

    /// <summary>
    /// Resolves the Evaluator's position/title with regional qualification.
    /// </summary>
    public string GetResolvedEvaluatorTitle(string? customPosition = null)
    {
        if (!string.IsNullOrWhiteSpace(customPosition))
            return customPosition;

        var regionLabel = GetRegionLabel();
        return $"Evaluator, {regionLabel}";
    }

    private string GetRegionLabel()
    {
        if (!string.IsNullOrWhiteSpace(RegionCode))
            return $"NTC {RegionCode}";

        if (!string.IsNullOrWhiteSpace(RegionName))
            return $"NTC {RegionName}";

        if (!string.IsNullOrWhiteSpace(OfficeName))
            return OfficeName;

        return "NTC";
    }
}

using System.Collections.Generic;

namespace EDGE.Application.Applications.Dtos;

public class CsvValidationResultDto
{
    public int TotalRows { get; set; }
    public int ValidCount { get; set; }
    public int InvalidCount { get; set; }
    public List<CsvRowPreviewDto> Rows { get; set; } = new();
}

public class CsvRowPreviewDto
{
    public int RowNumber { get; set; }
    public string Status { get; set; } = "Valid"; // Valid, Invalid
    public string ApplicantName { get; set; } = string.Empty;
    public string ApplicationType { get; set; } = string.Empty;
    public string ExamineeType { get; set; } = string.Empty;
    public string ValidationRemarks { get; set; } = "Ready for import";
    public Dictionary<string, string> RawRowData { get; set; } = new();
}

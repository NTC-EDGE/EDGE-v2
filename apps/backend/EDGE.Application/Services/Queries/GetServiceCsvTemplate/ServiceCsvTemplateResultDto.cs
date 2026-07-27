namespace EDGE.Application.Services.Queries.GetServiceCsvTemplate;

public record ServiceCsvTemplateResultDto
{
    public string FileName { get; init; } = "service_template.csv";
    public string CsvContent { get; init; } = string.Empty;
}

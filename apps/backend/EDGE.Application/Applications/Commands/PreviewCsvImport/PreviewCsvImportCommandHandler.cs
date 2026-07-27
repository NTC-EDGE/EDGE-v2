using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.PreviewCsvImport;

public class PreviewCsvImportCommandHandler : IRequestHandler<PreviewCsvImportCommand, ApiResponse<CsvValidationResultDto>>
{
    private readonly ICsvSchemaParserService _csvParser;

    public PreviewCsvImportCommandHandler(ICsvSchemaParserService csvParser)
    {
        _csvParser = csvParser;
    }

    public async Task<ApiResponse<CsvValidationResultDto>> Handle(PreviewCsvImportCommand request, CancellationToken cancellationToken)
    {
        if (request.CsvStream == null || request.CsvStream.Length == 0)
        {
            return ApiResponse<CsvValidationResultDto>.Fail("Uploaded CSV file is empty.");
        }

        var result = await _csvParser.ParseAndValidateCsvAsync(request.CsvStream, request.ServiceId, cancellationToken);
        return ApiResponse<CsvValidationResultDto>.Success(result, "CSV file parsed and validated successfully.");
    }
}

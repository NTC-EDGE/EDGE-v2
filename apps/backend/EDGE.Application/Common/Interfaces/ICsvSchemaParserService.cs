using System.IO;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Applications.Dtos;

namespace EDGE.Application.Common.Interfaces;

public interface ICsvSchemaParserService
{
    Task<CsvValidationResultDto> ParseAndValidateCsvAsync(Stream csvStream, CancellationToken cancellationToken = default);
}

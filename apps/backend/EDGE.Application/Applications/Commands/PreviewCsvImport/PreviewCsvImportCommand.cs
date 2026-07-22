using System.IO;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.PreviewCsvImport;

public record PreviewCsvImportCommand(Stream CsvStream) : IRequest<ApiResponse<CsvValidationResultDto>>;

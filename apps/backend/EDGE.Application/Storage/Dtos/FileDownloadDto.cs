using System.IO;

namespace EDGE.Application.Storage.Dtos;

public record FileDownloadDto(
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSizeBytes
);

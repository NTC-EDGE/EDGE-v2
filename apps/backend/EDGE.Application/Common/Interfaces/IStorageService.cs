using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Common.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(string storageKey, Stream contentStream, string contentType, CancellationToken cancellationToken = default);
    Task<Stream> DownloadFileAsync(string storageKey, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string storageKey, CancellationToken cancellationToken = default);
}

using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Common.Interfaces;

public record EncryptedFileResult(
    Stream EncryptedStream,
    byte[] Iv,
    byte[] Tag
);

public interface IFileEncryptionService
{
    Task<EncryptedFileResult> EncryptStreamAsync(Stream inputStream, CancellationToken cancellationToken = default);
    Task<Stream> DecryptStreamAsync(Stream cipherStream, byte[] iv, byte[] tag, CancellationToken cancellationToken = default);
}

using System;
using System.IO;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Options;

namespace EDGE.Infrastructure.Services;

public class AesGcmFileEncryptionService : IFileEncryptionService
{
    private readonly byte[] _key;

    public AesGcmFileEncryptionService(IOptions<StorageEncryptionOptions> options)
    {
        var rawKey = options.Value.MasterEncryptionKey;

        if (string.IsNullOrWhiteSpace(rawKey))
        {
            throw new InvalidOperationException("StorageEncryption:MasterEncryptionKey must be configured in settings/UserSecrets.");
        }

        _key = ParseKey(rawKey);

        if (_key.Length != 32)
        {
            throw new InvalidOperationException("StorageEncryption:MasterEncryptionKey must be a valid 256-bit (32-byte) key.");
        }
    }

    public async Task<EncryptedFileResult> EncryptStreamAsync(Stream inputStream, CancellationToken cancellationToken = default)
    {
        using var ms = new MemoryStream();
        await inputStream.CopyToAsync(ms, cancellationToken);
        var plainBytes = ms.ToArray();

        var iv = new byte[AesGcm.NonceByteSizes.MaxSize]; // 12 bytes
        RandomNumberGenerator.Fill(iv);

        var cipherBytes = new byte[plainBytes.Length];
        var tag = new byte[AesGcm.TagByteSizes.MaxSize]; // 16 bytes

        using (var aesGcm = new AesGcm(_key, AesGcm.TagByteSizes.MaxSize))
        {
            aesGcm.Encrypt(iv, plainBytes, cipherBytes, tag);
        }

        var cipherStream = new MemoryStream(cipherBytes);
        return new EncryptedFileResult(cipherStream, iv, tag);
    }

    public async Task<Stream> DecryptStreamAsync(Stream cipherStream, byte[] iv, byte[] tag, CancellationToken cancellationToken = default)
    {
        using var ms = new MemoryStream();
        await cipherStream.CopyToAsync(ms, cancellationToken);
        var cipherBytes = ms.ToArray();

        var plainBytes = new byte[cipherBytes.Length];

        using (var aesGcm = new AesGcm(_key, AesGcm.TagByteSizes.MaxSize))
        {
            aesGcm.Decrypt(iv, cipherBytes, tag, plainBytes);
        }

        return new MemoryStream(plainBytes);
    }

    private static byte[] ParseKey(string keyString)
    {
        try
        {
            if (keyString.Length == 64 && IsHexString(keyString))
            {
                return Convert.FromHexString(keyString);
            }

            return Convert.FromBase64String(keyString);
        }
        catch
        {
            throw new FormatException("StorageEncryption:MasterEncryptionKey must be a valid Base64 string or 64-character Hex string.");
        }
    }

    private static bool IsHexString(string input)
    {
        foreach (var c in input)
        {
            if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')))
            {
                return false;
            }
        }
        return true;
    }
}

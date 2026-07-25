using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Options;
using EDGE.Infrastructure.Options;
using EDGE.Infrastructure.Services;
using Xunit;

namespace EDGE.Application.UnitTests.Encryption;

public class AesGcmFileEncryptionServiceTests
{
    private readonly StorageEncryptionOptions _validOptions;

    public AesGcmFileEncryptionServiceTests()
    {
        // 32-byte (256-bit) test key in Base64
        var keyBytes = RandomNumberGenerator.GetBytes(32);
        _validOptions = new StorageEncryptionOptions
        {
            MasterEncryptionKey = Convert.ToBase64String(keyBytes)
        };
    }

    [Fact]
    public async Task EncryptAndDecrypt_ShouldRestoreOriginalContentIntact()
    {
        // Arrange
        var service = new AesGcmFileEncryptionService(Options.Create(_validOptions));
        var originalText = "NTC-EDGE Secure Applicant Document Content 12345!@#$%";
        var originalBytes = Encoding.UTF8.GetBytes(originalText);
        using var inputStream = new MemoryStream(originalBytes);

        // Act - Encrypt
        var encryptedResult = await service.EncryptStreamAsync(inputStream);
        using var cipherStream = encryptedResult.EncryptedStream;
        var cipherBytes = ((MemoryStream)cipherStream).ToArray();

        // Assert Encryption Payload
        cipherBytes.Should().NotBeNullOrEmpty();
        cipherBytes.Should().NotEqual(originalBytes);
        encryptedResult.Iv.Length.Should().Be(12);
        encryptedResult.Tag.Length.Should().Be(16);

        // Act - Decrypt
        cipherStream.Position = 0;
        using var decryptedStream = await service.DecryptStreamAsync(cipherStream, encryptedResult.Iv, encryptedResult.Tag);
        using var ms = new MemoryStream();
        await decryptedStream.CopyToAsync(ms);
        var decryptedText = Encoding.UTF8.GetString(ms.ToArray());

        // Assert Roundtrip
        decryptedText.Should().Be(originalText);
    }

    [Fact]
    public void Constructor_WithInvalidKeyLength_ShouldThrowInvalidOperationException()
    {
        var invalidOptions = new StorageEncryptionOptions
        {
            MasterEncryptionKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16)) // 128-bit key instead of 256-bit
        };

        Action act = () => _ = new AesGcmFileEncryptionService(Options.Create(invalidOptions));
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*256-bit*");
    }

    [Fact]
    public async Task DecryptStream_WithTamperedTag_ShouldThrowCryptographicException()
    {
        // Arrange
        var service = new AesGcmFileEncryptionService(Options.Create(_validOptions));
        var originalBytes = Encoding.UTF8.GetBytes("Tamper Test Content");
        using var inputStream = new MemoryStream(originalBytes);

        var encryptedResult = await service.EncryptStreamAsync(inputStream);
        var tamperedTag = (byte[])encryptedResult.Tag.Clone();
        tamperedTag[0] ^= 0xFF; // Flip bits in authentication tag

        // Act & Assert
        Func<Task> act = async () =>
        {
            encryptedResult.EncryptedStream.Position = 0;
            await service.DecryptStreamAsync(encryptedResult.EncryptedStream, encryptedResult.Iv, tamperedTag);
        };

        await act.Should().ThrowAsync<CryptographicException>();
    }
}

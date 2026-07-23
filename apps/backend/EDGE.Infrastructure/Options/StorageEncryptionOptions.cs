namespace EDGE.Infrastructure.Options;

public class StorageEncryptionOptions
{
    public const string SectionName = "StorageEncryption";

    /// <summary>
    /// Master encryption key in Base64 or 32-byte hex (256-bit AES key).
    /// </summary>
    public string MasterEncryptionKey { get; set; } = string.Empty;
}

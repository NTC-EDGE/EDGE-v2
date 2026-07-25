using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class StoredFile : AuditableEntity
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // e.g., Requirement, Signature, ProfilePhoto, Document
    public string EncryptionIv { get; set; } = string.Empty; // Base64 AES-GCM 12-byte IV
    public string EncryptionTag { get; set; } = string.Empty; // Base64 AES-GCM 16-byte Auth Tag
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public string UploadedByUserId { get; set; } = string.Empty;
}

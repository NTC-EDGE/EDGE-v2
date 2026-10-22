using System.Text.Json.Serialization;

namespace EDGE.Application.Common.Interfaces;

public interface IClerkUserService
{
    Task UpdateUserMetadataAsync(string userId, UserMetadataPayload payload);
    Task<ClerkUserResponse?> UpdateUserAsync(string userId, UpdateClerkUserPayload payload);
    Task UpdateUserPrimaryEmailAsync(string userId, string newEmail);
    Task<ClerkUserResponse> CreateUserAsync(CreateClerkUserPayload payload);
    Task<List<ClerkUserResponse>> GetUsersByEmailAsync(string email);
    Task<ClerkUserResponse?> GetUserByIdAsync(string userId);
    Task<ClerkInvitationResponse> CreateInvitationAsync(CreateClerkInvitationPayload payload);
    Task<List<ClerkUserResponse>> GetAllUsersAsync(int pageSize = 500, int? maxTotalUsers = null, CancellationToken cancellationToken = default);
}

public class CreateClerkInvitationPayload
{
    [JsonPropertyName("email_address")] public string EmailAddress { get; set; } = string.Empty;
    [JsonPropertyName("public_metadata")] public object? PublicMetadata { get; set; }
    [JsonPropertyName("redirect_url")] public string? RedirectUrl { get; set; }
    [JsonPropertyName("notify")] public bool Notify { get; set; } = true;
    [JsonPropertyName("ignore_existing")] public bool IgnoreExisting { get; set; } = true;
}

public class ClerkInvitationResponse
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("email_address")] public string EmailAddress { get; set; } = string.Empty;
    [JsonPropertyName("status")] public string Status { get; set; } = string.Empty;
}

public class UserMetadataPayload
{
    [JsonPropertyName("public_metadata")] public object? PublicMetadata { get; set; }
    [JsonPropertyName("private_metadata")] public object? PrivateMetadata { get; set; }
}

public class CreateClerkUserPayload
{
    [JsonPropertyName("email_address")] public string EmailAddress { get; set; } = string.Empty;
    [JsonPropertyName("username")] public string? Username { get; set; }
    [JsonPropertyName("first_name")] public string? FirstName { get; set; }
    [JsonPropertyName("last_name")] public string? LastName { get; set; }
    [JsonPropertyName("password")] public string? Password { get; set; }
    [JsonPropertyName("public_metadata")] public object? PublicMetadata { get; set; }
    [JsonPropertyName("private_metadata")] public object? PrivateMetadata { get; set; }
}

public class UpdateClerkUserPayload
{
    [JsonPropertyName("first_name")] public string? FirstName { get; set; }
    [JsonPropertyName("last_name")] public string? LastName { get; set; }
    [JsonPropertyName("username")] public string? Username { get; set; }
    [JsonPropertyName("public_metadata")] public object? PublicMetadata { get; set; }
    [JsonPropertyName("private_metadata")] public object? PrivateMetadata { get; set; }
}

public class ClerkEmailAddress
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("email_address")]
    public string EmailAddress { get; set; } = string.Empty;
}

public class ClerkUserResponse
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("email_addresses")] public List<ClerkEmailAddress> EmailAddresses { get; set; } = new();
    [JsonPropertyName("first_name")] public string? FirstName { get; set; }
    [JsonPropertyName("last_name")] public string? LastName { get; set; }
    [JsonPropertyName("public_metadata")] public System.Text.Json.JsonElement? PublicMetadata { get; set; }
    [JsonPropertyName("private_metadata")] public System.Text.Json.JsonElement? PrivateMetadata { get; set; }
}

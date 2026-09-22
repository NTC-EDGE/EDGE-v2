using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EDGE.Infrastructure.Services;

public class ClerkUserService : IClerkUserService
{
    private static readonly JsonSerializerOptions RequestSerializerOptions = new()
    {
        PropertyNamingPolicy = null,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private static readonly JsonSerializerOptions ResponseSerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly ILogger<ClerkUserService> _logger;

    public ClerkUserService(HttpClient httpClient, ILogger<ClerkUserService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    private sealed record ClerkApiErrorDetail([property: JsonPropertyName("message")] string Message,
                                               [property: JsonPropertyName("long_message")] string? LongMessage,
                                               [property: JsonPropertyName("code")] string? Code);

    private sealed record ClerkApiErrorResponse([property: JsonPropertyName("errors")] List<ClerkApiErrorDetail>? Errors,
                                                [property: JsonPropertyName("clerk_trace_id")] string? TraceId);

    public async Task<ClerkUserResponse> CreateUserAsync(CreateClerkUserPayload payload)
    {
        var effectiveUsername = !string.IsNullOrWhiteSpace(payload.Username)
            ? payload.Username.Trim()
            : GenerateSafeFallbackUsername(payload.FirstName, payload.LastName, payload.EmailAddress);

        var requestObject = new
        {
            email_address = new[] { payload.EmailAddress },
            username = effectiveUsername,
            password = payload.Password,
            first_name = payload.FirstName,
            last_name = payload.LastName,
            public_metadata = payload.PublicMetadata,
            private_metadata = payload.PrivateMetadata,
            skip_password_checks = true
        };

        string jsonPayload = JsonSerializer.Serialize(requestObject, RequestSerializerOptions);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        HttpResponseMessage response = await _httpClient.PostAsync("users", content);
        string responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            string errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);

            // If Clerk rejected username (e.g. username is disabled on this Clerk instance), retry without username
            if (IsClerkUnknownParameterError(errorDetails, responseBody))
            {
                var fallbackRequestObject = new
                {
                    email_address = new[] { payload.EmailAddress },
                    password = payload.Password,
                    first_name = payload.FirstName,
                    last_name = payload.LastName,
                    public_metadata = payload.PublicMetadata,
                    private_metadata = payload.PrivateMetadata,
                    skip_password_checks = true
                };

                string fallbackJson = JsonSerializer.Serialize(fallbackRequestObject, RequestSerializerOptions);
                var fallbackContent = new StringContent(fallbackJson, Encoding.UTF8, "application/json");
                response = await _httpClient.PostAsync("users", fallbackContent);
                responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);
                    _logger.LogError("Clerk create user retry failed for {Email}. Status: {Status} Error: {Error} RawBody: {Body}",
                        payload.EmailAddress, response.StatusCode, errorDetails, responseBody);

                    throw new InvalidOperationException($"Clerk create user failed: {errorDetails}");
                }
            }
            else
            {
                _logger.LogError("Clerk create user failed for {Email}. Status: {Status} Error: {Error} RawBody: {Body}",
                    payload.EmailAddress, response.StatusCode, errorDetails, responseBody);

                throw new InvalidOperationException($"Clerk create user failed: {errorDetails}");
            }
        }

        var userResponse = JsonSerializer.Deserialize<ClerkUserResponse>(responseBody, ResponseSerializerOptions);
        if (userResponse == null)
        {
            throw new InvalidOperationException(
                $"Failed to deserialize Clerk user response. Status: {(int)response.StatusCode} {response.StatusCode}.");
        }

        _logger.LogInformation("Clerk user creation successful for user Id: {UserId}", userResponse.Id);
        return userResponse;
    }

    /// <summary>
    /// Evaluates whether a Clerk API error indicates that an optional parameter (such as username)
    /// was rejected because it is not configured, unknown, or not allowed on the target Clerk instance.
    /// Inspects both standardized Clerk error codes (e.g. form_param_unknown) and descriptive substrings.
    /// </summary>
    private static bool IsClerkUnknownParameterError(string errorDetails, string responseBody)
    {
        var combined = $"{errorDetails} {responseBody}";
        if (string.IsNullOrWhiteSpace(combined))
        {
            return false;
        }

        var hasCode = combined.Contains("form_param_unknown", StringComparison.OrdinalIgnoreCase) ||
                      combined.Contains("form_param_not_allowed", StringComparison.OrdinalIgnoreCase) ||
                      combined.Contains("param_unknown", StringComparison.OrdinalIgnoreCase) ||
                      combined.Contains("param_not_allowed", StringComparison.OrdinalIgnoreCase);

        var hasMessagePattern = combined.Contains("unrecognized", StringComparison.OrdinalIgnoreCase) ||
                                combined.Contains("unknown parameter", StringComparison.OrdinalIgnoreCase) ||
                                combined.Contains("unexpected parameter", StringComparison.OrdinalIgnoreCase) ||
                                combined.Contains("not allowed", StringComparison.OrdinalIgnoreCase) ||
                                combined.Contains("unknown attribute", StringComparison.OrdinalIgnoreCase);

        var mentionsUsername = combined.Contains("username", StringComparison.OrdinalIgnoreCase);

        return hasCode || (mentionsUsername && hasMessagePattern);
    }

    /// <summary>
    /// Generates a safe, Clerk-compliant, collision-resistant username derived from user names or email.
    /// Ensures username length is between 4 and 64 characters, containing only alphanumeric characters and underscores.
    /// <para>
    /// <strong>Parity Requirement:</strong> Any modifications to this logic (sanitization, boundary constraints,
    /// suffix format) MUST be mirrored in the TypeScript implementation at:
    /// <c>packages/api/src/utils/usernameUtils.ts</c> (<c>generateSafeUsername</c>).
    /// </para>
    /// </summary>
    public static string GenerateSafeFallbackUsername(string? firstName, string? lastName, string? email)
    {
        var cleanFirst = new string((firstName ?? "").Where(char.IsAsciiLetterOrDigit).ToArray()).ToLowerInvariant();
        var cleanLast = new string((lastName ?? "").Where(char.IsAsciiLetterOrDigit).ToArray()).ToLowerInvariant();

        string baseName;
        if (!string.IsNullOrWhiteSpace(cleanFirst) && !string.IsNullOrWhiteSpace(cleanLast))
        {
            baseName = $"{cleanFirst}_{cleanLast}";
        }
        else if (!string.IsNullOrWhiteSpace(cleanFirst))
        {
            baseName = cleanFirst;
        }
        else if (!string.IsNullOrWhiteSpace(cleanLast))
        {
            baseName = cleanLast;
        }
        else if (!string.IsNullOrWhiteSpace(email))
        {
            var emailPrefix = email.Split('@')[0];
            baseName = new string(emailPrefix.Where(char.IsAsciiLetterOrDigit).ToArray()).ToLowerInvariant();
        }
        else
        {
            baseName = "user";
        }

        if (string.IsNullOrWhiteSpace(baseName))
        {
            baseName = "user";
        }
        else if (baseName.Length < 3)
        {
            baseName = $"{baseName}user";
        }

        var randomSuffix = Guid.NewGuid().ToString("N")[..6];
        var username = $"{baseName}_{randomSuffix}";

        if (username.Length < 4)
        {
            username = $"user_{randomSuffix}";
        }
        else if (username.Length > 64)
        {
            username = username[..64];
        }

        return username;
    }

    public async Task<List<ClerkUserResponse>> GetUsersByEmailAsync(string email)
    {
        var escapedEmail = Uri.EscapeDataString(email.Trim());
        HttpResponseMessage response = await _httpClient.GetAsync($"users?email_address={escapedEmail}");
        string responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            response = await _httpClient.GetAsync($"users?query={escapedEmail}");
            responseBody = await response.Content.ReadAsStringAsync();
        }

        if (!response.IsSuccessStatusCode)
        {
            string errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);
            _logger.LogError("Clerk get users by email failed for {Email}. Status: {Status} Error: {Error} RawBody: {Body}",
                email, response.StatusCode, errorDetails, responseBody);

            throw new InvalidOperationException($"Clerk get users by email failed: {errorDetails}");
        }

        _logger.LogInformation("Clerk get users by email successful. Email: {Email} Response: {Response}", email, responseBody);
        var usersResponse = JsonSerializer.Deserialize<List<ClerkUserResponse>>(responseBody, ResponseSerializerOptions);
        var allUsers = usersResponse ?? new List<ClerkUserResponse>();

        // Strict in-memory verification to ensure returned Clerk users actually possess this specific email address
        return allUsers.Where(u => u.EmailAddresses != null &&
            u.EmailAddresses.Any(e => e.EmailAddress.Trim().Equals(email.Trim(), StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }

    public async Task<ClerkUserResponse?> GetUserByIdAsync(string userId)
    {
        HttpResponseMessage response = await _httpClient.GetAsync($"users/{userId}");
        string responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogInformation("Clerk user not found. UserId: {UserId}", userId);
                return null;
            }

            var parsed = TryParseError(responseBody);
            if (parsed != null)
            {
                foreach (var err in parsed.Errors ?? new())
                {
                    _logger.LogError("Clerk get user by id error user={UserId} code={Code} msg={Msg} detail={Detail} trace={Trace} status={Status}",
                        userId, err.Code, err.Message, err.LongMessage, parsed.TraceId, response.StatusCode);
                }
            }
            else
            {
                _logger.LogError("Clerk get user by id failed. UserId: {UserId} Status: {Status} RawBody: {Body}", userId, response.StatusCode, responseBody);
            }

            throw new InvalidOperationException($"Clerk get user by id failed: {(int)response.StatusCode} {response.StatusCode}");
        }

        _logger.LogInformation("Clerk get user by id successful. UserId: {UserId} Response: {Response}", userId, responseBody);
        var userResponse = JsonSerializer.Deserialize<ClerkUserResponse>(responseBody, ResponseSerializerOptions);
        return userResponse;
    }

    private string ExtractErrorDetails(string responseBody, System.Net.HttpStatusCode statusCode)
    {
        var parsed = TryParseError(responseBody);
        if (parsed != null && parsed.Errors != null && parsed.Errors.Count > 0)
        {
            return string.Join("; ", parsed.Errors.Select(e => !string.IsNullOrWhiteSpace(e.LongMessage) ? e.LongMessage : e.Message));
        }

        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (doc.RootElement.TryGetProperty("message", out var msgElem) && msgElem.ValueKind == JsonValueKind.String)
            {
                return msgElem.GetString() ?? $"{(int)statusCode} {statusCode}";
            }
            if (doc.RootElement.TryGetProperty("errors", out var errorsElem) && errorsElem.ValueKind == JsonValueKind.Array)
            {
                var messages = new List<string>();
                foreach (var item in errorsElem.EnumerateArray())
                {
                    if (item.TryGetProperty("long_message", out var lm) && lm.ValueKind == JsonValueKind.String)
                        messages.Add(lm.GetString()!);
                    else if (item.TryGetProperty("message", out var m) && m.ValueKind == JsonValueKind.String)
                        messages.Add(m.GetString()!);
                }
                if (messages.Count > 0) return string.Join("; ", messages);
            }
        }
        catch
        {
            // fallback
        }

        return $"{(int)statusCode} {statusCode}";
    }

    private ClerkApiErrorResponse? TryParseError(string body)
    {
        try
        {
            return JsonSerializer.Deserialize<ClerkApiErrorResponse>(body, ResponseSerializerOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize Clerk API error response. Body: {Body}", body);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Clerk API error response deserialization. Body: {Body}", body);
            return null;
        }
    }

    public async Task UpdateUserMetadataAsync(string userId, UserMetadataPayload payload)
    {
        string jsonPayload = JsonSerializer.Serialize(payload, RequestSerializerOptions);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        HttpResponseMessage response = await _httpClient.PatchAsync($"users/{userId}/metadata", content);
        string responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            string errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);
            _logger.LogError("Clerk metadata update failed for {UserId}. Status: {Status} Error: {Error} Body: {Body}",
                userId, response.StatusCode, errorDetails, responseBody);

            throw new InvalidOperationException($"Clerk update metadata failed for {userId}: {errorDetails}");
        }

        _logger.LogInformation("Clerk metadata update successful for user {UserId}. Response: {Response}", userId, responseBody);
    }

    public async Task<ClerkUserResponse?> UpdateUserAsync(string userId, UpdateClerkUserPayload payload)
    {
        string jsonPayload = JsonSerializer.Serialize(payload, RequestSerializerOptions);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        HttpResponseMessage response = await _httpClient.PatchAsync($"users/{userId}", content);
        string responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            string errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);
            _logger.LogWarning("Clerk update user failed for {UserId}. Status: {Status} Error: {Error} Body: {Body}",
                userId, response.StatusCode, errorDetails, responseBody);
            return null;
        }

        _logger.LogInformation("Clerk update user successful for user {UserId}. Response: {Response}", userId, responseBody);
        var userResponse = JsonSerializer.Deserialize<ClerkUserResponse>(responseBody, ResponseSerializerOptions);
        return userResponse;
    }

    public async Task UpdateUserPrimaryEmailAsync(string userId, string newEmail)
    {
        var normalizedEmail = newEmail.Trim().ToLowerInvariant();

        // 1. Fetch the user's current Clerk details to get existing email addresses
        var existingUser = await GetUserByIdAsync(userId);
        if (existingUser == null)
        {
            throw new InvalidOperationException($"Clerk user with ID '{userId}' was not found.");
        }

        var oldEmailIds = existingUser.EmailAddresses
            .Where(e => !e.EmailAddress.Trim().Equals(normalizedEmail, StringComparison.OrdinalIgnoreCase))
            .Select(e => e.Id)
            .ToList();

        var existingTargetEmail = existingUser.EmailAddresses
            .FirstOrDefault(e => e.EmailAddress.Trim().Equals(normalizedEmail, StringComparison.OrdinalIgnoreCase));

        string targetEmailId;

        if (existingTargetEmail != null)
        {
            targetEmailId = existingTargetEmail.Id;
        }
        else
        {
            // 2. Create the new email address for the user in Clerk
            var createEmailPayload = new
            {
                user_id = userId,
                email_address = normalizedEmail,
                verified = true,
                primary = true
            };

            string jsonPayload = JsonSerializer.Serialize(createEmailPayload, RequestSerializerOptions);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PostAsync("email_addresses", content);
            string responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                string errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);
                _logger.LogError("Clerk create email address failed for {Email}. Status: {Status} Error: {Error} Body: {Body}",
                    normalizedEmail, response.StatusCode, errorDetails, responseBody);

                throw new InvalidOperationException($"Clerk change email failed: {errorDetails}");
            }

            var createdEmail = JsonSerializer.Deserialize<ClerkEmailAddress>(responseBody, ResponseSerializerOptions);
            if (createdEmail == null || string.IsNullOrWhiteSpace(createdEmail.Id))
            {
                throw new InvalidOperationException("Failed to parse newly created Clerk email address.");
            }

            targetEmailId = createdEmail.Id;
        }

        // 3. Set the new email address as primary
        var patchUserPayload = new
        {
            primary_email_address_id = targetEmailId
        };
        string patchJson = JsonSerializer.Serialize(patchUserPayload, RequestSerializerOptions);
        var patchContent = new StringContent(patchJson, Encoding.UTF8, "application/json");
        var patchResponse = await _httpClient.PatchAsync($"users/{userId}", patchContent);
        if (!patchResponse.IsSuccessStatusCode)
        {
            string patchError = ExtractErrorDetails(await patchResponse.Content.ReadAsStringAsync(), patchResponse.StatusCode);
            _logger.LogWarning("Failed to set primary_email_address_id on Clerk user {UserId}: {Error}", userId, patchError);
        }

        // 4. Delete old email addresses so only the new email remains active
        foreach (var oldId in oldEmailIds)
        {
            try
            {
                var delResponse = await _httpClient.DeleteAsync($"email_addresses/{oldId}");
                if (!delResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Could not delete old Clerk email address {OldId} for user {UserId}. Status: {Status}", oldId, userId, delResponse.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Exception deleting old Clerk email address {OldId} for user {UserId}", oldId, userId);
            }
        }

        _logger.LogInformation("Clerk primary email successfully updated to {Email} for user {UserId}", normalizedEmail, userId);
    }

    public async Task<ClerkInvitationResponse> CreateInvitationAsync(CreateClerkInvitationPayload payload)
    {
        string jsonPayload = JsonSerializer.Serialize(payload, RequestSerializerOptions);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        HttpResponseMessage response = await _httpClient.PostAsync("invitations", content);
        string responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            string errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);
            _logger.LogError("Clerk create invitation failed for {Email}. Status: {Status} Error: {Error} Body: {Body}",
                payload.EmailAddress, response.StatusCode, errorDetails, responseBody);

            throw new InvalidOperationException($"Clerk create invitation failed: {errorDetails}");
        }

        _logger.LogInformation("Clerk invitation created and delivered successfully for email: {Email}", payload.EmailAddress);
        var invitationResponse = JsonSerializer.Deserialize<ClerkInvitationResponse>(responseBody, ResponseSerializerOptions);
        return invitationResponse ?? new ClerkInvitationResponse { EmailAddress = payload.EmailAddress, Status = "pending" };
    }

    public async Task<List<ClerkUserResponse>> GetAllUsersAsync(int pageSize = 500, int? maxTotalUsers = null, CancellationToken cancellationToken = default)
    {
        var allUsers = new List<ClerkUserResponse>();
        var currentOffset = 0;
        var batchSize = Math.Clamp(pageSize, 1, 500);

        while (!cancellationToken.IsCancellationRequested)
        {
            var requestUri = $"users?limit={batchSize}&offset={currentOffset}&order_by=-created_at";
            HttpResponseMessage response = await _httpClient.GetAsync(requestUri, cancellationToken);
            string responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                string errorDetails = ExtractErrorDetails(responseBody, response.StatusCode);
                _logger.LogError("Clerk get all users failed. Status: {Status} Error: {Error} Body: {Body}",
                    response.StatusCode, errorDetails, responseBody);

                throw new InvalidOperationException($"Clerk get all users failed: {errorDetails}");
            }

            var batch = JsonSerializer.Deserialize<List<ClerkUserResponse>>(responseBody, ResponseSerializerOptions) ?? new List<ClerkUserResponse>();
            if (batch.Count == 0)
            {
                break;
            }

            allUsers.AddRange(batch);

            if (batch.Count < batchSize || (maxTotalUsers.HasValue && allUsers.Count >= maxTotalUsers.Value))
            {
                break;
            }

            currentOffset += batch.Count;
        }

        _logger.LogInformation("Clerk GetAllUsersAsync retrieved {Count} users total.", allUsers.Count);
        return allUsers;
    }
}


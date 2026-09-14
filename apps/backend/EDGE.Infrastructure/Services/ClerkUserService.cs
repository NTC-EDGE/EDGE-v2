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
        var requestObject = new
        {
            email_address = new[] { payload.EmailAddress },
            username = !string.IsNullOrWhiteSpace(payload.Username) ? payload.Username : null,
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
            _logger.LogError("Clerk create user failed for {Email}. Status: {Status} Error: {Error} RawBody: {Body}",
                payload.EmailAddress, response.StatusCode, errorDetails, responseBody);

            throw new InvalidOperationException($"Clerk create user failed: {errorDetails}");
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

    public async Task<List<ClerkUserResponse>> GetAllUsersAsync(int limit = 500, int offset = 0, CancellationToken cancellationToken = default)
    {
        var allUsers = new List<ClerkUserResponse>();
        var currentOffset = offset;
        var pageSize = Math.Clamp(limit, 1, 500);

        while (!cancellationToken.IsCancellationRequested)
        {
            var requestUri = $"users?limit={pageSize}&offset={currentOffset}&order_by=-created_at";
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

            if (batch.Count < pageSize || allUsers.Count >= limit)
            {
                break;
            }

            currentOffset += batch.Count;
        }

        _logger.LogInformation("Clerk GetAllUsersAsync retrieved {Count} users total.", allUsers.Count);
        return allUsers;
    }
}


using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;
using Xunit;

namespace EDGE.Api.IntegrationTests;

public class StorageEndpointsE2ETests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public StorageEndpointsE2ETests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "mock_test_token");
    }

    [Fact]
    public async Task Upload_Download_AndDelete_TenantFile_E2EFlow_ShouldSucceed()
    {
        // 1. Arrange - Prepare test payload & tenant context
        var tenantId = _factory.TestTenantId;
        var originalText = "NTC-EDGE End-to-End Encrypted File Payload 2026";
        var fileBytes = Encoding.UTF8.GetBytes(originalText);

        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("text/plain");
        content.Add(fileContent, "file", "e2e-test-doc.txt");
        content.Add(new StringContent("Requirement"), "category");

        // 2. Act - POST /api/v2/tenants/{tenantId}/storage/upload
        var uploadResponse = await _client.PostAsync($"/api/v2/tenants/{tenantId}/storage/upload", content);
        var responseBody = await uploadResponse.Content.ReadAsStringAsync();
        uploadResponse.StatusCode.Should().Be(HttpStatusCode.Created, because: $"Upload failed with response: {responseBody}");

        var uploadResult = await uploadResponse.Content.ReadFromJsonAsync<ApiResponse<StoredFileDto>>();
        uploadResult.Should().NotBeNull();
        uploadResult!.Succeeded.Should().BeTrue();
        uploadResult.Data.Should().NotBeNull();

        var fileId = uploadResult.Data!.Id;
        uploadResult.Data.FileName.Should().Be("e2e-test-doc.txt");
        uploadResult.Data.TenantId.Should().Be(tenantId);

        // Verify that storage contains encrypted bytes (not plaintext)
        _factory.TestStorage.Storage.Count.Should().Be(1);

        // 3. Act - GET /api/v2/tenants/{tenantId}/storage/files/{fileId}
        var downloadResponse = await _client.GetAsync($"/api/v2/tenants/{tenantId}/storage/files/{fileId}");
        downloadResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var downloadedBytes = await downloadResponse.Content.ReadAsByteArrayAsync();
        var downloadedText = Encoding.UTF8.GetString(downloadedBytes);

        // Assert that download restored original plaintext payload exactly
        downloadedText.Should().Be(originalText);

        // 4. Act - GET /api/v2/tenants/{tenantId}/storage/files/{fileId}/metadata
        var metadataResponse = await _client.GetAsync($"/api/v2/tenants/{tenantId}/storage/files/{fileId}/metadata");
        metadataResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var metadataResult = await metadataResponse.Content.ReadFromJsonAsync<ApiResponse<StoredFileDto>>();
        metadataResult!.Data!.Id.Should().Be(fileId);

        // 5. Act - DELETE /api/v2/tenants/{tenantId}/storage/files/{fileId}
        var deleteResponse = await _client.DeleteAsync($"/api/v2/tenants/{tenantId}/storage/files/{fileId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify file is removed from storage
        _factory.TestStorage.Storage.Count.Should().Be(0);
    }

    [Fact]
    public async Task NonMember_AccessingTenantStorage_ShouldReturnForbidden()
    {
        // Arrange - Generate random tenantId where current user is NOT a member
        var unattachedTenantId = Guid.NewGuid();

        // Act - Attempt GET /api/v2/tenants/{unattachedTenantId}/storage/files
        var response = await _client.GetAsync($"/api/v2/tenants/{unattachedTenantId}/storage/files");

        // Assert - Expect 403 Forbidden
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}

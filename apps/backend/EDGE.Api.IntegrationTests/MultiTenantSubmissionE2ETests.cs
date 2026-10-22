using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;
using Xunit;

namespace EDGE.Api.IntegrationTests;

public class MultiTenantSubmissionE2ETests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public MultiTenantSubmissionE2ETests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "mock_test_token");
    }

    [Fact]
    public async Task Applicant_FilingApplicationAcrossRegionalTenants_E2EFlow_ShouldSucceed()
    {
        // 1. Arrange - Seed an additional regional tenant office where the test applicant is NOT an internal staff member
        var targetRegionalTenantId = Guid.NewGuid();
        var targetServiceId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var region = new Region
            {
                Id = Guid.NewGuid(),
                Code = "R07",
                Name = "Region 7 (Central Visayas)",
                IsActive = true
            };

            var regionalTenant = new Tenant
            {
                Id = targetRegionalTenantId,
                Code = "TNT-R07",
                Name = "NTC Region 7 Office",
                IsActive = true,
                RegionId = region.Id
            };

            var serviceCategory = new ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = "Examination Services",
                Code = "EXAM",
                Type = ServiceCategoryType.Exam
            };

            var service = new Service
            {
                Id = targetServiceId,
                TenantId = targetRegionalTenantId,
                ServiceCategoryId = serviceCategory.Id,
                ServiceCategory = serviceCategory,
                Name = "Radio Operator Examination",
                Code = "RO-EXAM-R07",
                Description = "Examination filing for Radio Operators in Region 7"
            };

            db.Regions.Add(region);
            db.Tenants.Add(regionalTenant);
            db.ServiceCategories.Add(serviceCategory);
            db.Services.Add(service);
            await db.SaveChangesAsync();
        }

        // 2. Act - Applicant uploads requirement file to target regional tenant's storage endpoint
        var filePayload = "NTC Examination Application Requirement Form Content 2026";
        var fileBytes = Encoding.UTF8.GetBytes(filePayload);

        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("text/plain");
        content.Add(fileContent, "file", "applicant-requirement-doc.txt");
        content.Add(new StringContent("Requirement"), "category");

        var uploadResponse = await _client.PostAsync($"/api/v2/tenants/{targetRegionalTenantId}/storage/upload", content);
        var uploadResponseBody = await uploadResponse.Content.ReadAsStringAsync();
        uploadResponse.StatusCode.Should().Be(HttpStatusCode.Created, because: $"File upload failed: {uploadResponseBody}");

        var uploadResult = await uploadResponse.Content.ReadFromJsonAsync<ApiResponse<StoredFileDto>>();
        uploadResult.Should().NotBeNull();
        uploadResult!.Succeeded.Should().BeTrue();
        uploadResult.Data.Should().NotBeNull();

        var uploadedFileId = uploadResult.Data!.Id;
        uploadResult.Data.TenantId.Should().Be(targetRegionalTenantId);
    }
}

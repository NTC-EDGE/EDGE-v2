using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Infrastructure.Printing.Services.Templates;

namespace EDGE.Api.Endpoints;

public static class TemplateEndpoints
{
    public static RouteGroupBuilder MapTemplateEndpoints(this RouteGroupBuilder group)
    {
        var templateGroup = group.MapGroup("templates")
            .WithTags("PDF Templates");

        templateGroup.MapGet("/", ListTemplates)
            .WithName("ListTemplates")
            .WithSummary("List all available PDF templates")
            .WithDescription("Retrieves the list of PDF accountable form template identifiers stored in Cloudflare R2 and memory cache.")
            .Produces<ApiResponse<IReadOnlyList<string>>>(StatusCodes.Status200OK);

        templateGroup.MapGet("/{templateId}", GetTemplateFile)
            .WithName("GetTemplateFile")
            .WithSummary("Download or view a PDF template")
            .WithDescription("Retrieves the binary PDF stream of the requested accountable form template.")
            .Produces(StatusCodes.Status200OK, contentType: "application/pdf")
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        templateGroup.MapPost("/{templateId}", UploadTemplate)
            .DisableAntiforgery()
            .RequireAuthorization()
            .WithName("UploadTemplate")
            .WithSummary("Upload or update a PDF template")
            .WithDescription("Uploads an accountable form PDF template to Cloudflare R2 cloud storage and updates the in-memory cache.")
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        templateGroup.MapDelete("/{templateId}", DeleteTemplate)
            .RequireAuthorization()
            .WithName("DeleteTemplate")
            .WithSummary("Delete a PDF template")
            .WithDescription("Deletes an accountable form PDF template from Cloudflare R2 cloud storage and evicts it from memory cache.")
            .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        templateGroup.MapPost("/cache/invalidate", InvalidateCache)
            .RequireAuthorization()
            .WithName("InvalidateTemplateCache")
            .WithSummary("Invalidate PDF template cache")
            .WithDescription("Evicts cached PDF templates from memory to force re-fetching from Cloudflare R2 on next print request.")
            .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    public static async Task<IResult> ListTemplates(
        IPdfTemplateProvider templateProvider,
        CancellationToken cancellationToken)
    {
        var templates = await templateProvider.ListTemplatesAsync(cancellationToken);
        return Results.Ok(ApiResponse<IReadOnlyList<string>>.Success(templates, "Templates retrieved successfully."));
    }

    public static async Task<IResult> GetTemplateFile(
        string templateId,
        IPdfTemplateProvider templateProvider,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Template ID is required."));
        }

        var resource = await templateProvider.GetTemplateResourceAsync(templateId, cancellationToken);
        if (resource == null)
        {
            return Results.NotFound(ApiResponse<object>.NotFound($"Template '{templateId}' was not found."));
        }

        var ms = new MemoryStream();
        await resource.Stream.CopyToAsync(ms, cancellationToken);
        ms.Position = 0;

        var downloadName = templateId.EndsWith(".pdf", System.StringComparison.OrdinalIgnoreCase)
            ? templateId
            : $"{templateId}.pdf";

        return Results.File(ms, "application/pdf", downloadName);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UploadTemplate(
        string templateId,
        [FromForm] IFormFile file,
        IPdfTemplateProvider templateProvider,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Template ID is required."));
        }

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("A non-empty PDF file must be provided."));
        }

        if (!file.ContentType.Equals("application/pdf", System.StringComparison.OrdinalIgnoreCase) &&
            !file.FileName.EndsWith(".pdf", System.StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Only PDF documents (.pdf) are accepted for template uploads."));
        }

        using var stream = file.OpenReadStream();
        var key = await templateProvider.UploadTemplateAsync(templateId, stream, file.ContentType, cancellationToken);

        return Results.Ok(ApiResponse<string>.Success(key, $"Template '{templateId}' uploaded successfully to cloud storage."));
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> DeleteTemplate(
        string templateId,
        IPdfTemplateProvider templateProvider,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            return Results.BadRequest(ApiResponse<object>.Fail("Template ID is required."));
        }

        var success = await templateProvider.DeleteTemplateAsync(templateId, cancellationToken);
        if (!success)
        {
            return Results.BadRequest(ApiResponse<object>.Fail($"Failed to delete template '{templateId}'."));
        }

        return Results.Ok(ApiResponse<bool>.Success(true, $"Template '{templateId}' deleted successfully."));
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static IResult InvalidateCache(
        [FromQuery] string? templateId,
        IPdfTemplateProvider templateProvider)
    {
        templateProvider.InvalidateCache(templateId);
        var message = string.IsNullOrWhiteSpace(templateId)
            ? "All template caches invalidated successfully."
            : $"Cache for template '{templateId}' invalidated successfully.";

        return Results.Ok(ApiResponse<bool>.Success(true, message));
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Api.Filters;
using EDGE.Application.Storage.Commands.DeleteFile;
using EDGE.Application.Storage.Commands.UploadFile;
using EDGE.Application.Storage.Queries.GetFileDownload;
using EDGE.Application.Storage.Queries.GetStoredFileById;
using EDGE.Application.Storage.Queries.GetStoredFilesByTenant;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Api.Endpoints;

public static class StorageEndpoints
{
    public static RouteGroupBuilder MapStorageEndpoints(this RouteGroupBuilder group)
    {
        // Tenant-scoped storage endpoints: /api/v2/tenants/{tenantId}/storage/...
        var tenantStorageGroup = group.MapGroup("tenants/{tenantId:guid}/storage")
            .RequireAuthorization()
            .WithTags("Tenant Storage");

        tenantStorageGroup.MapPost("/upload", UploadTenantFile)
            .DisableAntiforgery()
            .WithName("UploadTenantFile")
            .WithTags("Tenant Storage")
            .WithSummary("Upload and encrypt a file for a specific tenant")
            .WithDescription("Encrypts the file payload on the backend using AES-256-GCM authenticated encryption and streams the ciphertext to Cloudflare R2 under the target tenant directory.")
            .Produces<ApiResponse<StoredFileDto>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        tenantStorageGroup.MapGet("/files", GetTenantFiles)
            .RequireTenantMembership()
            .WithName("GetTenantFiles")
            .WithTags("Tenant Storage")
            .WithSummary("Get all stored files metadata for a specific tenant")
            .WithDescription("Retrieves file metadata records for all files belonging to the target tenant.")
            .Produces<ApiResponse<List<StoredFileDto>>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        tenantStorageGroup.MapGet("/files/{fileId:guid}/metadata", GetTenantFileMetadata)
            .WithName("GetTenantFileMetadata")
            .WithTags("Tenant Storage")
            .WithSummary("Get metadata for a specific tenant file")
            .WithDescription("Retrieves metadata details of a specific stored file without decrypting or streaming binary content.")
            .Produces<ApiResponse<StoredFileDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        tenantStorageGroup.MapGet("/files/{fileId:guid}", GetTenantFileDownload)
            .WithName("GetTenantFileDownload")
            .WithTags("Tenant Storage")
            .WithSummary("Decrypt and download a tenant scoped file")
            .WithDescription("Fetches ciphertext from Cloudflare R2, verifies tenant authorization, decrypts with AES-256-GCM, and streams plaintext back to the client.")
            .Produces(StatusCodes.Status200OK, contentType: "application/octet-stream")
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        tenantStorageGroup.MapDelete("/files/{fileId:guid}", DeleteTenantFile)
            .WithName("DeleteTenantFile")
            .WithTags("Tenant Storage")
            .WithSummary("Delete a file from tenant storage")
            .WithDescription("Deletes the encrypted object from Cloudflare R2 and removes file metadata from PostgreSQL within the target tenant context.")
            .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    [HasPermission(Permissions.UploadStorage)]
    public static async Task<IResult> UploadTenantFile(
        Guid tenantId,
        [FromForm] IFormFile file,
        [FromForm] string category,
        IMediator mediator,
        ICurrentUserService currentUserService)
    {
        if (string.IsNullOrWhiteSpace(currentUserService.UserId))
        {
            return Results.Unauthorized();
        }

        using var stream = file?.OpenReadStream() ?? Stream.Null;
        var command = new UploadFileCommand(
            FileStream: stream,
            FileName: file?.FileName ?? string.Empty,
            ContentType: file?.ContentType ?? string.Empty,
            FileSizeBytes: file?.Length ?? 0,
            Category: category ?? string.Empty,
            TenantId: tenantId,
            UploadedByUserId: currentUserService.UserId
        );

        var result = await mediator.Send(command);
        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }

        return Results.Created($"/api/v2/tenants/{tenantId}/storage/files/{result.Data!.Id}", result);
    }

    [HasPermission(Permissions.ReadStorage)]
    public static async Task<IResult> GetTenantFiles(Guid tenantId, IMediator mediator)
    {
        var query = new GetStoredFilesByTenantQuery(tenantId);
        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadStorage)]
    public static async Task<IResult> GetTenantFileMetadata(Guid tenantId, Guid fileId, IMediator mediator)
    {
        var query = new GetStoredFileByIdQuery(fileId, tenantId);
        var result = await mediator.Send(query);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.DownloadStorage)]
    public static async Task<IResult> GetTenantFileDownload(Guid tenantId, Guid fileId, IMediator mediator)
    {
        var query = new GetFileDownloadQuery(fileId, tenantId);
        var result = await mediator.Send(query);

        if (!result.Succeeded)
        {
            return Results.NotFound(result);
        }

        var fileData = result.Data!;
        return Results.File(
            fileStream: fileData.FileStream,
            contentType: fileData.ContentType,
            fileDownloadName: fileData.FileName,
            enableRangeProcessing: true
        );
    }

    [HasPermission(Permissions.DeleteStorage)]
    public static async Task<IResult> DeleteTenantFile(Guid tenantId, Guid fileId, IMediator mediator)
    {
        var command = new DeleteFileCommand(fileId, tenantId);
        var result = await mediator.Send(command);

        if (!result.Succeeded)
        {
            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }
}

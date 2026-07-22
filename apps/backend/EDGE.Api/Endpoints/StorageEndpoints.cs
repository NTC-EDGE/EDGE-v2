using System;
using System.Collections.Generic;
using System.IO;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;
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
        // Enforce Authentication & Authorization globally across all storage endpoints
        var authorizedStorageGroup = group.RequireAuthorization();

        // 1. Tenant-scoped storage endpoints: /api/v2/tenants/{tenantId}/storage/...
        var tenantStorageGroup = authorizedStorageGroup.MapGroup("tenants/{tenantId:guid}/storage")
            .WithTags("Tenant Storage");

        tenantStorageGroup.MapPost("/upload", async (
            Guid tenantId,
            [FromForm] IFormFile file,
            [FromForm] string category,
            IMediator mediator,
            ICurrentUserService currentUserService) =>
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
        })
        .DisableAntiforgery()
        .WithName("UploadTenantFile")
        .WithTags("Tenant Storage")
        .WithSummary("Upload and encrypt a file for a specific tenant/region")
        .WithDescription("Encrypts the file payload on the backend using AES-256-GCM authenticated encryption and streams the ciphertext to Cloudflare R2, isolated under the target tenant/region ID.")
        .Produces<ApiResponse<StoredFileDto>>(StatusCodes.Status201Created)
        .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        tenantStorageGroup.MapGet("/files", async (
            Guid tenantId,
            IMediator mediator) =>
        {
            var query = new GetStoredFilesByTenantQuery(tenantId);
            var result = await mediator.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetTenantFiles")
        .WithTags("Tenant Storage")
        .WithSummary("Get all stored files metadata for a specific tenant/region")
        .WithDescription("Retrieves file metadata records for all files belonging to the target tenant/region.")
        .Produces<ApiResponse<List<StoredFileDto>>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        tenantStorageGroup.MapGet("/files/{fileId:guid}/metadata", async (
            Guid tenantId,
            Guid fileId,
            IMediator mediator) =>
        {
            var query = new GetStoredFileByIdQuery(fileId, tenantId);
            var result = await mediator.Send(query);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetTenantFileMetadata")
        .WithTags("Tenant Storage")
        .WithSummary("Get metadata for a specific tenant/region file")
        .WithDescription("Retrieves metadata details of a specific stored file without decrypting or streaming binary content.")
        .Produces<ApiResponse<StoredFileDto>>(StatusCodes.Status200OK)
        .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        tenantStorageGroup.MapGet("/files/{fileId:guid}", async (
            Guid tenantId,
            Guid fileId,
            IMediator mediator) =>
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
        })
        .WithName("GetTenantFileDownload")
        .WithTags("Tenant Storage")
        .WithSummary("Decrypt and download a tenant/region scoped file")
        .WithDescription("Fetches ciphertext from Cloudflare R2, verifies tenant/region authorization, decrypts with AES-256-GCM, and streams plaintext back to the client.")
        .Produces(StatusCodes.Status200OK, contentType: "application/octet-stream")
        .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        tenantStorageGroup.MapDelete("/files/{fileId:guid}", async (
            Guid tenantId,
            Guid fileId,
            IMediator mediator) =>
        {
            var command = new DeleteFileCommand(fileId, tenantId);
            var result = await mediator.Send(command);

            if (!result.Succeeded)
            {
                return Results.BadRequest(result);
            }

            return Results.Ok(result);
        })
        .WithName("DeleteTenantFile")
        .WithTags("Tenant Storage")
        .WithSummary("Delete a file from tenant/region storage")
        .WithDescription("Deletes the encrypted object from Cloudflare R2 and removes file metadata from PostgreSQL within the target tenant/region context.")
        .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
        .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        // 2. Global storage endpoints: /api/v2/storage/...
        var globalStorageGroup = authorizedStorageGroup.MapGroup("storage")
            .WithTags("Storage");

        globalStorageGroup.MapPost("/upload", async (
            [FromForm] IFormFile file,
            [FromForm] string category,
            IMediator mediator,
            ICurrentUserService currentUserService,
            ITenantContextService tenantContextService) =>
        {
            if (string.IsNullOrWhiteSpace(currentUserService.UserId))
            {
                return Results.Unauthorized();
            }

            var effectiveTenantId = tenantContextService.TenantId ?? Guid.Empty;

            using var stream = file?.OpenReadStream() ?? Stream.Null;
            var command = new UploadFileCommand(
                FileStream: stream,
                FileName: file?.FileName ?? string.Empty,
                ContentType: file?.ContentType ?? string.Empty,
                FileSizeBytes: file?.Length ?? 0,
                Category: category ?? string.Empty,
                TenantId: effectiveTenantId,
                UploadedByUserId: currentUserService.UserId
            );

            var result = await mediator.Send(command);
            if (!result.Succeeded)
            {
                return Results.BadRequest(result);
            }

            return Results.Created($"/api/v2/tenants/{effectiveTenantId}/storage/files/{result.Data!.Id}", result);
        })
        .DisableAntiforgery()
        .WithName("UploadFile")
        .WithTags("Storage")
        .WithSummary("Upload and encrypt a file using context tenant")
        .WithDescription("Encrypts the uploaded file with AES-256-GCM and streams to Cloudflare R2, resolving tenant ID automatically from context.")
        .Produces<ApiResponse<StoredFileDto>>(StatusCodes.Status201Created)
        .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        globalStorageGroup.MapGet("/files/{fileId:guid}", async (
            Guid fileId,
            IMediator mediator,
            ITenantContextService tenantContextService) =>
        {
            var effectiveTenantId = tenantContextService.TenantId ?? Guid.Empty;
            var query = new GetFileDownloadQuery(fileId, effectiveTenantId);
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
        })
        .WithName("GetFileDownload")
        .WithTags("Storage")
        .WithSummary("Decrypt and download a file using context tenant")
        .WithDescription("Retrieves ciphertext from Cloudflare R2 and decrypts using AES-256-GCM, resolving tenant ID automatically from context.")
        .Produces(StatusCodes.Status200OK, contentType: "application/octet-stream")
        .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        globalStorageGroup.MapDelete("/files/{fileId:guid}", async (
            Guid fileId,
            IMediator mediator,
            ITenantContextService tenantContextService) =>
        {
            var effectiveTenantId = tenantContextService.TenantId ?? Guid.Empty;
            var command = new DeleteFileCommand(fileId, effectiveTenantId);
            var result = await mediator.Send(command);

            if (!result.Succeeded)
            {
                return Results.BadRequest(result);
            }

            return Results.Ok(result);
        })
        .WithName("DeleteFile")
        .WithTags("Storage")
        .WithSummary("Delete a file from global storage")
        .WithDescription("Deletes the encrypted object from Cloudflare R2 and removes stored metadata from PostgreSQL.")
        .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
        .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        return group;
    }
}

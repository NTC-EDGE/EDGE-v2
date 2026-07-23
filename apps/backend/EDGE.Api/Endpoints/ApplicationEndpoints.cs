using System;
using System.IO;
using MediatR;
using Microsoft.AspNetCore.Http;
using FluentValidation;
using EDGE.Application.Applications.Commands.DeleteDraftApplication;
using EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;
using EDGE.Application.Applications.Commands.PreviewCsvImport;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Applications.Commands.UpdateApplication;
using EDGE.Application.Applications.Commands.UpdateApplicationStatus;
using EDGE.Application.Applications.Commands.UploadApplicantRequirement;
using EDGE.Application.Applications.Queries.GetApplicationById;
using EDGE.Application.Applications.Queries.GetDraftApplications;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class ApplicationEndpoints
{
    public static IEndpointRouteBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/applications").WithTags("Application");

        group.MapPost("/csv-preview", async (IFormFile file, IMediator mediator) =>
        {
            if (file == null || file.Length == 0)
            {
                return Results.BadRequest(ApiResponse<object>.Fail("No CSV file uploaded."));
            }

            using var stream = file.OpenReadStream();
            var result = await mediator.Send(new PreviewCsvImportCommand(stream));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .DisableAntiforgery()
        .WithName("PreviewCsvImport");

        group.MapPost("/", async (SubmitApplicationCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            if (!result.Succeeded)
            {
                if (result.Message != null && result.Message.StartsWith("403"))
                {
                    return Results.Json(result, statusCode: StatusCodes.Status403Forbidden);
                }
                return Results.BadRequest(result);
            }

            return Results.Created($"/api/v2/applications/{result.Data}", result);
        })
        .WithName("SubmitApplication");

        group.MapGet("/drafts", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetDraftApplicationsQuery());
            if (!result.Succeeded && result.Message != null && result.Message.StartsWith("401"))
            {
                return Results.Unauthorized();
            }

            return Results.Ok(result);
        })
        .WithName("GetDraftApplications");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetApplicationByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetApplicationById");

        group.MapPut("/{id:guid}", async (Guid id, UpdateApplicationCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command with { Id = id });
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UpdateApplicationDraft");

        group.MapPatch("/{id:guid}/status", async (Guid id, UpdateApplicationStatusCommand command, IValidator<UpdateApplicationStatusCommand> validator, IMediator mediator) =>
        {
            var fullCommand = command with { Id = id };
            var validationResult = await validator.ValidateAsync(fullCommand);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(fullCommand);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UpdateApplicationStatus");

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteDraftApplicationCommand(id));
            if (!result.Succeeded)
            {
                if (result.Message != null && result.Message.StartsWith("403"))
                {
                    return Results.Json(result, statusCode: StatusCodes.Status403Forbidden);
                }
                return Results.BadRequest(result);
            }

            return Results.Ok(result);
        })
        .WithName("DeleteDraftApplication");

        group.MapPost("/{id:guid}/submit", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new FinalizeApplicationSubmissionCommand(id));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("FinalizeApplicationSubmission");

        group.MapPost("/{id:guid}/applicants/{applicantId:guid}/requirements", async (Guid id, Guid applicantId, UploadApplicantRequirementCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command with { ApplicationId = id, ApplicantId = applicantId });
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UploadApplicantRequirement");

        // V2 tenant-specific mappings
        app.MapPost("/tenants/{id:guid}/applications", async (Guid id, SubmitApplicationCommand command, IMediator mediator) =>
        {
            var updatedCommand = command with { TenantId = id };
            var result = await mediator.Send(updatedCommand);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("SubmitTenantApplication")
        .WithTags("Application")
        .WithSummary("Submit tenant-scoped application")
        .WithDescription("Creates and validates a single application submission linked to a tenant.");

        app.MapPatch("/tenants/{id:guid}/applications/{appId:guid}/status", async (Guid id, Guid appId, UpdateApplicationStatusCommand command, IValidator<UpdateApplicationStatusCommand> validator, IMediator mediator) =>
        {
            var fullCommand = command with { TenantId = id, Id = appId };
            var validationResult = await validator.ValidateAsync(fullCommand);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(fullCommand);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UpdateTenantApplicationStatus")
        .WithTags("Application")
        .WithSummary("Update tenant application status")
        .WithDescription("Updates application status and logs status history for a tenant application.");

        app.MapPatch("/tenants/{id:guid}/applications/{appId:guid}", async (Guid id, Guid appId, UploadApplicantRequirementCommand command, IMediator mediator) =>
        {
            var updatedCommand = command with { TenantId = id, ApplicationId = appId };
            var result = await mediator.Send(updatedCommand);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UploadTenantApplicationRequirement")
        .WithTags("Application")
        .WithSummary("Upload requirement document for application")
        .WithDescription("Updates or uploads a requirement file for a tenant-scoped application.");

        return app;
    }
}

using System;
using System.IO;
using MediatR;
using Microsoft.AspNetCore.Http;
using EDGE.Application.Applications.Commands.DeleteDraftApplication;
using EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;
using EDGE.Application.Applications.Commands.PreviewCsvImport;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Applications.Commands.UpdateApplication;
using EDGE.Application.Applications.Commands.UploadApplicantRequirement;
using EDGE.Application.Applications.Queries.GetApplicationById;
using EDGE.Application.Applications.Queries.GetDraftApplications;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class ApplicationEndpoints
{
    public static IEndpointRouteBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/applications").WithTags("Application");

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

        return app;
    }
}

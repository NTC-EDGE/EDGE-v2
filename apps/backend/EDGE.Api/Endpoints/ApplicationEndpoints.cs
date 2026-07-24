using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Applications.Commands.AddApplicantToApplication;
using EDGE.Application.Applications.Commands.DeleteDraftApplication;
using EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;
using EDGE.Application.Applications.Commands.PreviewCsvImport;
using EDGE.Application.Applications.Commands.RemoveApplicantFromApplication;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Applications.Commands.UpdateApplication;
using EDGE.Application.Applications.Commands.UpdateApplicationApplicant;
using EDGE.Application.Applications.Commands.UpdateApplicationStatus;
using EDGE.Application.Applications.Commands.UploadApplicantRequirement;
using EDGE.Application.Applications.Queries.GetApplicationById;
using EDGE.Application.Applications.Queries.GetDraftApplications;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Queries.GetServiceCsvTemplate;

namespace EDGE.Api.Endpoints;

public static class ApplicationEndpoints
{
    public static IEndpointRouteBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/applications").WithTags("Application");

        group.MapPost("/csv-preview", PreviewCsvImport)
            .DisableAntiforgery()
            .WithName("PreviewCsvImport");

        group.MapPost("/", SubmitApplication)
            .WithName("SubmitApplication");

        group.MapGet("/drafts", GetDraftApplications)
            .WithName("GetDraftApplications");

        group.MapGet("/{id:guid}", GetApplicationById)
            .WithName("GetApplicationById");

        group.MapPut("/{id:guid}", UpdateApplicationDraft)
            .WithName("UpdateApplicationDraft");

        group.MapPatch("/{id:guid}/status", UpdateApplicationStatus)
            .WithName("UpdateApplicationStatus");

        group.MapDelete("/{id:guid}", DeleteDraftApplication)
            .WithName("DeleteDraftApplication");

        group.MapPost("/{id:guid}/submit", FinalizeApplicationSubmission)
            .WithName("FinalizeApplicationSubmission");

        group.MapPost("/{id:guid}/applicants/{applicantId:guid}/requirements", UploadApplicantRequirement)
            .WithName("UploadApplicantRequirement");

        group.MapPatch("/{id:guid}/applicants/{applicantId:guid}", UpdateApplicationApplicant)
            .WithName("UpdateApplicationApplicant")
            .WithSummary("Update individual applicant details")
            .WithDescription("Updates personal details and form values for a single applicant within an application.");

        group.MapDelete("/{id:guid}/applicants/{applicantId:guid}", RemoveApplicationApplicant)
            .WithName("RemoveApplicationApplicant")
            .WithSummary("Remove applicant from draft application")
            .WithDescription("Removes a single applicant from an existing draft bulk application.");

        group.MapPost("/{id:guid}/applicants", AddApplicationApplicant)
            .WithName("AddApplicationApplicant")
            .WithSummary("Add applicant to draft application")
            .WithDescription("Adds a new applicant to an existing draft bulk application.");

        // V2 tenant-specific mappings
        app.MapPost("/tenants/{id:guid}/applications", SubmitTenantApplication)
            .WithName("SubmitTenantApplication")
            .WithTags("Application")
            .WithSummary("Submit tenant-scoped application")
            .WithDescription("Creates and validates a single application submission linked to a tenant.");

        app.MapPatch("/tenants/{id:guid}/applications/{appId:guid}/status", UpdateTenantApplicationStatus)
            .WithName("UpdateTenantApplicationStatus")
            .WithTags("Application")
            .WithSummary("Update tenant application status")
            .WithDescription("Updates application status and logs status history for a tenant application.");

        app.MapPatch("/tenants/{id:guid}/applications/{appId:guid}", UploadTenantApplicationRequirement)
            .WithName("UploadTenantApplicationRequirement")
            .WithTags("Application")
            .WithSummary("Upload requirement document for application")
            .WithDescription("Updates or uploads a requirement file for a tenant-scoped application.");

        app.MapGet("/services/{id:guid}/csv-template", GetServiceCsvTemplate)
            .WithTags("Services")
            .WithName("GetServiceCsvTemplate")
            .WithSummary("Download CSV template for service bulk upload");

        return app;
    }

    [HasPermission(Permissions.ImportCsvApplications)]
    public static async Task<IResult> PreviewCsvImport(IFormFile file, Guid? serviceId, IMediator mediator)
    {
        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(ApiResponse<object>.Fail("No CSV file uploaded."));
        }

        using var stream = file.OpenReadStream();
        var result = await mediator.Send(new PreviewCsvImportCommand(stream, serviceId));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> SubmitApplication(SubmitApplicationCommand command, IMediator mediator)
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
    }

    [HasPermission(Permissions.ViewOwnApplications)]
    public static async Task<IResult> GetDraftApplications(IMediator mediator)
    {
        var result = await mediator.Send(new GetDraftApplicationsQuery());
        if (!result.Succeeded && result.Message != null && result.Message.StartsWith("401"))
        {
            return Results.Unauthorized();
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadApplication)]
    public static async Task<IResult> GetApplicationById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetApplicationByIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> UpdateApplicationDraft(Guid id, UpdateApplicationCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command with { Id = id });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> UpdateApplicationStatus(Guid id, UpdateApplicationStatusCommand command, IValidator<UpdateApplicationStatusCommand> validator, IMediator mediator)
    {
        var fullCommand = command with { Id = id };
        var validationResult = await validator.ValidateAsync(fullCommand);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(fullCommand);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.DeleteApplication)]
    public static async Task<IResult> DeleteDraftApplication(Guid id, IMediator mediator)
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
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> FinalizeApplicationSubmission(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new FinalizeApplicationSubmissionCommand(id));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> UploadApplicantRequirement(Guid id, Guid applicantId, UploadApplicantRequirementCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command with { ApplicationId = id, ApplicantId = applicantId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> UpdateApplicationApplicant(Guid id, Guid applicantId, UpdateApplicationApplicantCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command with { ApplicationId = id, ApplicantId = applicantId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> RemoveApplicationApplicant(Guid id, Guid applicantId, IMediator mediator)
    {
        var result = await mediator.Send(new RemoveApplicantFromApplicationCommand { ApplicationId = id, ApplicantId = applicantId });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> AddApplicationApplicant(Guid id, AddApplicantToApplicationCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command with { ApplicationId = id });
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> SubmitTenantApplication(Guid id, SubmitApplicationCommand command, IMediator mediator)
    {
        var updatedCommand = command with { TenantId = id };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> UpdateTenantApplicationStatus(Guid id, Guid appId, UpdateApplicationStatusCommand command, IValidator<UpdateApplicationStatusCommand> validator, IMediator mediator)
    {
        var fullCommand = command with { TenantId = id, Id = appId };
        var validationResult = await validator.ValidateAsync(fullCommand);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(fullCommand);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> UploadTenantApplicationRequirement(Guid id, Guid appId, UploadApplicantRequirementCommand command, IMediator mediator)
    {
        var updatedCommand = command with { TenantId = id, ApplicationId = appId };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.ImportCsvApplications)]
    public static async Task<IResult> GetServiceCsvTemplate(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceCsvTemplateQuery(id));
        if (!result.Succeeded || result.Data == null)
        {
            return Results.BadRequest(result);
        }
        byte[] bytes = Encoding.UTF8.GetBytes(result.Data.CsvContent);
        return Results.File(bytes, "text/csv", result.Data.FileName);
    }
}

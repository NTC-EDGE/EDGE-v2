using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Applications.Commands.AddApplicantToApplication;
using EDGE.Application.Applications.Commands.AdminUpdateApplication;
using EDGE.Application.Applications.Commands.AdminUpdateApplicantProfile;
using EDGE.Application.Applications.Commands.AdminUpdateFormValues;
using EDGE.Application.Applications.Commands.DeleteDraftApplication;
using EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;
using EDGE.Application.Applications.Commands.PreviewCsvImport;
using EDGE.Application.Applications.Commands.RemoveApplicantFromApplication;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Applications.Commands.UpdateApplication;
using EDGE.Application.Applications.Commands.UpdateApplicationApplicant;
using EDGE.Application.Applications.Commands.UpdateApplicationStatus;
using EDGE.Application.Applications.Commands.UploadApplicantRequirement;
using EDGE.Application.Applications.Queries.GetAllApplications;
using EDGE.Application.Applications.Queries.GetMyApplications;
using EDGE.Application.Applications.Queries.GetApplicationById;
using EDGE.Application.Applications.Queries.GetApplicationsByApplicant;
using EDGE.Application.Applications.Queries.GetDraftApplications;
using EDGE.Application.Applications.Queries.GetApplicantServiceFormSubmission;
using EDGE.Application.Applications.Queries.GetApplicantRequirements;
using EDGE.Application.Applications.Commands.CreateSoa;
using EDGE.Application.Applications.Commands.ApproveSoa;
using EDGE.Application.Applications.Commands.ReturnSoa;
using EDGE.Application.Applications.Commands.VerifyPayment;
using EDGE.Application.Applications.Commands.ReturnOp;
using EDGE.Application.Applications.Commands.TogglePinApplication;
using EDGE.Application.Applications.Commands.ToggleArchiveApplication;
using EDGE.Application.Applications.Commands.CreateFormSubmission;
using EDGE.Application.Applications.Commands.UpdateFormSubmissionValues;
using EDGE.Application.Applications.Commands.IssueApplication;
using EDGE.Application.Applications.Commands.SubmitPayment;
using EDGE.Application.Applications.Queries.GenerateNextDocumentNumber;

using EDGE.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

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
            .WithName("PreviewCsvImport")
            .WithSummary("Preview CSV bulk application import")
            .WithDescription("Validates and previews application details imported from a CSV file before finalized submission.");

        group.MapPost("/", SubmitApplication)
            .WithName("SubmitApplication")
            .WithSummary("Create draft bulk application")
            .WithDescription("Initiates a draft bulk application under the selected service catalog, establishing the application shell.");

        group.MapGet("/", GetAllApplications)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ViewOwnApplications))
            .WithName("GetAllApplications")
            .WithSummary("Retrieve all applications")
            .WithDescription("Retrieves all applications for the current user, optionally filtered by status.");

        group.MapGet("/me", GetMyApplications)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ViewOwnApplications))
            .WithName("GetMyApplications")
            .WithSummary("Retrieve user applications and statistics")
            .WithDescription("Retrieves all applications and status statistics for the authenticated user.");

        group.MapGet("/me/drafts", GetDraftApplications)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ViewOwnApplications))
            .WithName("GetMyDraftApplications")
            .WithSummary("Retrieve user draft applications summary or category specific drafts")
            .WithDescription("Fetches draft applications summary or category-specific drafts owned by the authenticated caller.");

        group.MapGet("/me/drafts/{categoryParam}", (
            string categoryParam,
            [FromQuery] int? page,
            [FromQuery] int? pageNumber,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            IMediator mediator) =>
            GetDraftApplications(categoryParam, page, pageNumber, pageSize, search, mediator))
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ViewOwnApplications))
            .WithName("GetMyDraftApplicationsByParam")
            .WithSummary("Retrieve user draft applications by category parameter");

        group.MapGet("/drafts", GetDraftApplications)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ViewOwnApplications))
            .WithName("GetDraftApplications")
            .WithSummary("Retrieve draft applications")
            .WithDescription("Fetches all draft/unsubmitted applications owned by the authenticated caller.");

        group.MapGet("/drafts/{categoryParam}", (
            string categoryParam,
            [FromQuery] int? page,
            [FromQuery] int? pageNumber,
            [FromQuery] int? pageSize,
            [FromQuery] string? search,
            IMediator mediator) =>
            GetDraftApplications(categoryParam, page, pageNumber, pageSize, search, mediator))
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ViewOwnApplications))
            .WithName("GetDraftApplicationsByParam")
            .WithSummary("Retrieve draft applications by category parameter");

        group.MapGet("/{id:guid}", GetApplicationById)
            .WithName("GetApplicationById")
            .WithSummary("Retrieve application by ID")
            .WithDescription("Retrieves detailed profile, status history, and applicant records for a specific application.");

        group.MapGet("/{id:guid}/applicants/{applicantId:guid}/form-submission", GetApplicantServiceFormSubmissionEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ReadApplication))
            .WithName("GetApplicantServiceFormSubmission")
            .WithSummary("Retrieve form submission for an applicant and specific application service applied")
            .WithDescription("Fetches the form layout schema populated with field values submitted by a specific applicant for a specific application service.");

        group.MapPost("/{id:guid}/form-submissions", CreateFormSubmissionEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.SubmitApplication))
            .WithName("CreateFormSubmission")
            .WithSummary("Client form submission")
            .WithDescription("Creates a new form submission with applicant field values.");

        group.MapPut("/{id:guid}/form-submissions/{submissionId:guid}", UpdateFormSubmissionValuesEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.UpdateApplication))
            .WithName("UpdateFormSubmissionValues")
            .WithSummary("Client update for submitted form values")
            .WithDescription("Updates submitted field values on an existing form submission.");

        group.MapPut("/{id:guid}", UpdateApplicationDraft)
            .WithName("UpdateApplicationDraft")
            .WithSummary("Update application draft details")
            .WithDescription("Modifies core properties or metadata of a draft bulk application.");

        group.MapPatch("/{id:guid}/status", UpdateApplicationStatus)
            .WithName("UpdateApplicationStatus")
            .WithSummary("Update application status")
            .WithDescription("Updates status of the application (e.g. UnderEvaluation, Approved) and logs history.");

        group.MapPatch("/{id:guid}/admin-update", AdminUpdateApplicationEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.EvaluateApplication))
            .WithName("AdminUpdateApplication")
            .WithSummary("Agency administrative correction update")
            .WithDescription("Updates application fields during review and records CorrectionAuditTrail entries.");

        group.MapPatch("/{id:guid}/applicants/{applicantId:guid}/admin-update", AdminUpdateApplicantProfileEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.EvaluateApplication))
            .WithName("AdminUpdateApplicantProfile")
            .WithSummary("Agency administrative update for applicant profile")
            .WithDescription("Updates applicant profile details during review and records CorrectionAuditTrail entries.");

        group.MapPatch("/{id:guid}/applicants/{applicantId:guid}/form-values/admin-update", AdminUpdateFormValuesEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.EvaluateApplication))
            .WithName("AdminUpdateFormValues")
            .WithSummary("Agency administrative update for form field values")
            .WithDescription("Updates form field values during review and records CorrectionAuditTrail entries.");

        group.MapPatch("/{id:guid}/evaluate", EvaluateApplicationEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.EvaluateApplication))
            .WithName("EvaluateApplication")
            .WithSummary("Evaluate application")
            .WithDescription("Transitions application status to Evaluating and logs status history.");

        group.MapPatch("/{id:guid}/pin", TogglePinApplicationEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.EvaluateApplication))
            .WithName("TogglePinApplication")
            .WithSummary("Toggle pin status")
            .WithDescription("Pins or unpins an application for top-of-feed display.");

        group.MapPatch("/{id:guid}/archive", ToggleArchiveApplicationEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.EvaluateApplication))
            .WithName("ToggleArchiveApplication")
            .WithSummary("Toggle archive status")
            .WithDescription("Archives or unarchives an application.");

        group.MapPatch("/{id:guid}/approve-accountant", ApproveAccountantEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ApproveSoa))
            .WithName("ApproveAccountant")
            .WithSummary("Accountant approves application and SOA")
            .WithDescription("Approves Statement of Account, generates Order of Payment, and advances application to PendingPayment.");

        group.MapPost("/{id:guid}/issue", IssueApplicationEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.IssueApplication))
            .WithName("IssueApplication")
            .WithSummary("Issue document and license")
            .WithDescription("Issues statutory license, certificate, or permit, assigns form/license control numbers, and marks application completed.");

        group.MapGet("/{id:guid}/next-document-numbers", GetNextDocumentNumbersEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.IssueApplication))
            .WithName("GetNextDocumentNumbers")
            .WithSummary("Generate recommended document and license numbers")
            .WithDescription("Generates next sequential form and license numbers based on regional office prefix and service type.");

        group.MapDelete("/me/drafts/{id:guid}", DeleteDraftApplication)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ViewOwnApplications))
            .WithName("DeleteMyDraftApplication")
            .WithSummary("Delete user draft application")
            .WithDescription("Permanently removes a user's draft application and its associated entries.");

        group.MapDelete("/{id:guid}", DeleteDraftApplication)
            .WithName("DeleteDraftApplication")
            .WithSummary("Delete draft application")
            .WithDescription("Permanently removes a draft application and its associated applicant entries.");

        group.MapPost("/{id:guid}/submit", FinalizeApplicationSubmission)
            .WithName("FinalizeApplicationSubmission")
            .WithSummary("Finalize and submit application")
            .WithDescription("Transitions a draft application to submitted state, locking files and triggering workflows.");

        group.MapPost("/{id:guid}/submit-payment", SubmitPaymentEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.SubmitApplication))
            .WithName("SubmitPayment")
            .WithSummary("Client payment submission")
            .WithDescription("Submits client payment reference and details, advancing Order of Payment to Processing for Cashier collection verification.");

        group.MapPost("/{id:guid}/applicants/{applicantId:guid}/requirements", UploadApplicantRequirement)
            .WithName("UploadApplicantRequirement")
            .WithSummary("Upload applicant requirement attachment")
            .WithDescription("Uploads a specific file attachment satisfying a document requirement for a single applicant.");

        group.MapGet("/{id:guid}/applicants/{applicantId:guid}/requirements", GetApplicantRequirementsEndpoint)
            .RequireAuthorization(new HasPermissionAttribute(Permissions.ReadApplication))
            .WithName("GetApplicantRequirements")
            .WithSummary("Retrieve applicant service variant requirements and submitted documents")
            .WithDescription("Fetches the required and optional requirements for a specific applicant service variant context alongside submitted file metadata.");

        group.MapPatch("/{id:guid}/applicants/{applicantId:guid}", UpdateApplicationApplicant)
            .WithName("UpdateApplicationApplicant")
            .WithSummary("Update application applicant details")
            .WithDescription("Updates personal details and form values for a single applicant within an application.");

        group.MapDelete("/{id:guid}/applicants/{applicantId:guid}", RemoveApplicationApplicant)
            .WithName("RemoveApplicationApplicant")
            .WithSummary("Remove applicant from application")
            .WithDescription("Removes a single applicant from an existing draft bulk application.");

        group.MapPost("/{id:guid}/applicants", AddApplicationApplicant)
            .WithName("AddApplicationApplicant")
            .WithSummary("Add new applicant to application")
            .WithDescription("Adds a new applicant to an existing draft bulk application.");

        app.MapGet("/applicants/{applicantId:guid}/applications", GetApplicationsByApplicant)
            .WithName("GetApplicationsByApplicant")
            .WithTags("Application")
            .WithSummary("Get applications by applicant ID")
            .WithDescription("Retrieves all parent bulk applications associated with a specific applicant ID.");

        // V2 tenant-specific mappings

        app.MapPost("/tenants/{id:guid}/applications", SubmitTenantApplication)
            .WithName("SubmitTenantApplication")
            .WithTags("Application")
            .WithSummary("Submit tenant-scoped application")
            .WithDescription("Creates and validates a single application submission linked to a specific tenant.");

        app.MapPatch("/tenants/{id:guid}/applications/{appId:guid}/status", UpdateTenantApplicationStatus)
            .WithName("UpdateTenantApplicationStatus")
            .WithTags("Application")
            .WithSummary("Update tenant application status")
            .WithDescription("Updates application status and logs status history for a tenant-scoped application.");

        app.MapPatch("/tenants/{id:guid}/applications/{appId:guid}", UploadTenantApplicationRequirement)
            .WithName("UploadTenantApplicationRequirement")
            .WithTags("Application")
            .WithSummary("Upload tenant application requirement")
            .WithDescription("Updates or uploads a requirement file for a tenant-scoped application.");

        app.MapGet("/services/{id:guid}/csv-template", GetServiceCsvTemplate)
            .WithTags("Services")
            .WithName("GetServiceCsvTemplate")
            .WithSummary("Get service CSV import template")
            .WithDescription("Downloads the CSV file template format matching the required input schema for the specified service.");

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
    public static async Task<IResult> GetAllApplications(
        [FromQuery] ApplicationStatus? status,
        [FromQuery] string? queueTab,
        [FromQuery] string? scope,
        [FromQuery] int? pageNumber,
        [FromQuery] int? pageSize,
        [FromQuery] string? searchTerm,
        [FromQuery] string? mode,
        [FromQuery] Guid? tenantId,
        [FromQuery] string? role,
        [FromQuery] string? assignedTo,
        [FromQuery] string? fieldOffice,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetAllApplicationsQuery(
            Status: status,
            QueueTab: queueTab,
            Scope: scope,
            PageNumber: pageNumber,
            PageSize: pageSize,
            SearchTerm: searchTerm,
            Mode: mode,
            TenantId: tenantId,
            FieldOffice: fieldOffice,
            AssignedTo: assignedTo,
            Role: role));
        if (!result.Succeeded && result.Message != null && result.Message.StartsWith("401"))
        {
            return Results.Unauthorized();
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.ViewOwnApplications)]
    public static async Task<IResult> GetMyApplications(
        [FromQuery] ApplicationStatus? status,
        [FromQuery] int? pageNumber,
        [FromQuery] int? pageSize,
        [FromQuery] string? searchTerm,
        [FromQuery] string? mode,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetMyApplicationsQuery(status, pageNumber, pageSize, searchTerm, mode));
        if (!result.Succeeded && result.Message != null && result.Message.StartsWith("401"))
        {
            return Results.Unauthorized();
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.ViewOwnApplications)]
    public static async Task<IResult> GetDraftApplications(
        [FromQuery] string? categoryId,
        [FromQuery] int? page,
        [FromQuery] int? pageNumber,
        [FromQuery] int? pageSize,
        [FromQuery] string? search,
        IMediator mediator)
    {
        var effectivePageNumber = pageNumber ?? page ?? 1;
        var effectivePageSize = pageSize ?? 10;

        var result = await mediator.Send(new GetDraftApplicationsQuery(
            CategoryParam: categoryId,
            PageNumber: effectivePageNumber,
            PageSize: effectivePageSize,
            SearchTerm: search
        ));

        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.ReadApplication)]
    public static async Task<IResult> GetApplicationById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetApplicationByIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.ReadApplication)]
    public static async Task<IResult> GetApplicantServiceFormSubmissionEndpoint(
        Guid id,
        Guid applicantId,
        [FromQuery] Guid? variantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetApplicantServiceFormSubmissionQuery(id, applicantId, variantId));
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
    public static async Task<IResult> UploadApplicantRequirement(
        Guid id,
        Guid applicantId,
        UploadApplicantRequirementCommand command,
        IValidator<UploadApplicantRequirementCommand> validator,
        IMediator mediator)
    {
        var fullCommand = command with { ApplicationId = id, ApplicantId = applicantId };
        var validationResult = await validator.ValidateAsync(fullCommand);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(fullCommand);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.ReadApplication)]
    public static async Task<IResult> GetApplicantRequirementsEndpoint(Guid id, Guid applicantId, IMediator mediator)
    {
        var result = await mediator.Send(new GetApplicantRequirementsQuery(id, applicantId));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
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
    public static async Task<IResult> UploadTenantApplicationRequirement(
        Guid id,
        Guid appId,
        UploadApplicantRequirementCommand command,
        IValidator<UploadApplicantRequirementCommand> validator,
        IMediator mediator)
    {
        // TenantId is resolved securely from auth context inside the handler (ITenantContextService).
        // ApplicationId is injected from the route param {appId}.
        var updatedCommand = command with { ApplicationId = appId };
        var validationResult = await validator.ValidateAsync(updatedCommand);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

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

    [HasPermission(Permissions.ViewOwnApplications)]
    public static async Task<IResult> GetApplicationsByApplicant(Guid applicantId, IMediator mediator)
    {
        var result = await mediator.Send(new GetApplicationsByApplicantQuery(applicantId));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> TogglePinApplicationEndpoint(
        Guid id,
        [FromBody] TogglePinRequest? request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new TogglePinApplicationCommand(id, request?.IsPinned);
        var result = await mediator.Send(command, cancellationToken);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> ToggleArchiveApplicationEndpoint(
        Guid id,
        [FromBody] ToggleArchiveRequest? request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new ToggleArchiveApplicationCommand(id, request?.IsArchived);
        var result = await mediator.Send(command, cancellationToken);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> EvaluateApplicationEndpoint(
        Guid id,
        [FromBody] EvaluateApplicationRequest? request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new UpdateApplicationStatusCommand
        {
            Id = id,
            Status = ApplicationStatus.Evaluating.ToString(),
            Remarks = request?.Remarks ?? "Started evaluation process."
        };
        var result = await mediator.Send(command, cancellationToken);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> AdminUpdateApplicationEndpoint(
        Guid id,
        [FromBody] AdminUpdateApplicationCommand command,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command with { Id = id }, cancellationToken);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> AdminUpdateApplicantProfileEndpoint(
        Guid id,
        Guid applicantId,
        [FromBody] AdminUpdateApplicantProfileCommand command,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command with { ApplicationId = id, ApplicantId = applicantId }, cancellationToken);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> AdminUpdateFormValuesEndpoint(
        Guid id,
        Guid applicantId,
        [FromBody] AdminUpdateFormValuesCommand command,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command with { ApplicationId = id, ApplicantId = applicantId }, cancellationToken);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> CreateFormSubmissionEndpoint(
        Guid id,
        [FromBody] CreateFormSubmissionCommand command,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command with { ApplicationId = id }, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> UpdateFormSubmissionValuesEndpoint(
        Guid id,
        Guid submissionId,
        [FromBody] UpdateFormSubmissionValuesCommand command,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command with { ApplicationId = id, SubmissionId = submissionId }, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.IssueApplication)]
    public static async Task<IResult> IssueApplicationEndpoint(
        Guid id,
        [FromBody] IssueApplicationCommand command,
        IValidator<IssueApplicationCommand> validator,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var finalCommand = command with { ApplicationId = id };
        var validationResult = await validator.ValidateAsync(finalCommand, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(finalCommand, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.IssueApplication)]
    public static async Task<IResult> GetNextDocumentNumbersEndpoint(
        Guid id,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var query = new GenerateNextDocumentNumberQuery { ApplicationId = id };
        var result = await mediator.Send(query, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> SubmitPaymentEndpoint(
        Guid id,
        [FromBody] SubmitPaymentRequest request,
        IValidator<SubmitPaymentCommand> validator,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new SubmitPaymentCommand(
            id,
            request.OrderOfPaymentId,
            request.PaymentMethod,
            request.ReferenceNumber,
            request.PayorName,
            request.AmountPaid,
            request.Remarks,
            request.ProofOfPaymentFileId);

        var validationResult = await validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.ApproveSoa)]
    public static async Task<IResult> ApproveAccountantEndpoint(
        Guid id,
        [FromBody] EDGE.Api.Endpoints.Soas.DTOs.ApproveSoaRequest? request,
        FluentValidation.IValidator<ApproveSoaCommand> validator,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new ApproveSoaCommand(
            ApplicationId: id,
            Remarks: request?.Remarks);
        var validationResult = await validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}

public record TogglePinRequest(bool? IsPinned);
public record ToggleArchiveRequest(bool? IsArchived);
public record EvaluateApplicationRequest(string? Remarks);
public record SubmitPaymentRequest(
    Guid? OrderOfPaymentId,
    PaymentMethod PaymentMethod,
    string? ReferenceNumber,
    string? PayorName,
    decimal? AmountPaid,
    string? Remarks,
    Guid? ProofOfPaymentFileId
);


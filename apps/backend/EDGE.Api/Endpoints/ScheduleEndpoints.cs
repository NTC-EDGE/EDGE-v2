using MediatR;
using FluentValidation;
using EDGE.Application.Schedules.DTOs;
using EDGE.Application.Schedules.Commands.CreateSchedule;
using EDGE.Application.Schedules.Commands.UpdateSchedule;
using EDGE.Application.Schedules.Commands.DeleteSchedule;
using EDGE.Application.Schedules.Queries.GetSchedules;
using EDGE.Application.Schedules.Queries.GetScheduleById;
using EDGE.Application.Schedules.Queries.GetAvailableSchedules;
using EDGE.Application.Schedules.Commands.SetSchedulePublishStatus;
using Microsoft.AspNetCore.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class ScheduleEndpoints
{
    public static RouteGroupBuilder MapScheduleEndpoints(this RouteGroupBuilder group)
    {
        var schedules = group.MapGroup("schedules")
            .WithTags("Schedules");

        // Client View Endpoint - Visible for client when applying for application
        schedules.MapGet("/client-view", GetClientSchedules)
            .WithName("GetClientSchedules")
            .WithSummary("Get client available appointment schedules")
            .WithDescription("Retrieves available appointment and inspection schedule slots for clients. Both serviceId and tenantId query parameters are required.")
            .Produces<PaginatedApiResponse<ClientScheduleDto>>(StatusCodes.Status200OK)
            .Produces<string>(StatusCodes.Status400BadRequest);

        // GET all schedules (optional filters by tenantId or serviceId)
        schedules.MapGet("/", GetSchedules)
            .WithName("GetSchedules")
            .WithSummary("Get list of schedules")
            .WithDescription("Fetches list of schedule configurations with optional tenant or service filters.")
            .Produces<PaginatedApiResponse<ScheduleDto>>(StatusCodes.Status200OK);

        // GET schedule by Id
        schedules.MapGet("/{id:guid}", GetScheduleById)
            .WithName("GetScheduleById")
            .WithSummary("Get schedule details by ID")
            .WithDescription("Fetches single schedule configuration by ID.")
            .Produces<ScheduleDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        // POST create schedule
        schedules.MapPost("/", CreateSchedule)
            .WithName("CreateSchedule")
            .WithSummary("Create appointment schedule")
            .WithDescription("Creates a new application processing or inspection schedule.");

        // PUT update schedule
        schedules.MapPut("/{id:guid}", UpdateSchedule)
            .WithName("UpdateSchedule")
            .WithSummary("Update schedule definition")
            .WithDescription("Updates schedule details, time slots, or capacity.");

        // PATCH toggle or set publish status
        schedules.MapPatch("/{id:guid}/publish", TogglePublishSchedule)
            .WithName("TogglePublishSchedule")
            .WithSummary("Publish or unpublish schedule")
            .WithDescription("Sets the public visibility status of an appointment schedule.");

        // DELETE schedule
        schedules.MapDelete("/{id:guid}", DeleteSchedule)
            .WithName("DeleteSchedule")
            .WithSummary("Delete schedule")
            .WithDescription("Removes a schedule configuration.");

        return group;
    }

    [Authorize]
    public static async Task<IResult> GetClientSchedules(
        string serviceId,
        string tenantId,
        IMediator mediator,
        DateTime? date = null,
        int pageNumber = 1,
        int pageSize = 10)
    {
        if (string.IsNullOrWhiteSpace(serviceId) || string.IsNullOrWhiteSpace(tenantId))
        {
            return Results.BadRequest("Both 'serviceId' and 'tenantId' query parameters are required.");
        }

        var cleanedService = serviceId.Trim().TrimStart('+');
        var cleanedTenant = tenantId.Trim().TrimStart('+');

        if (!Guid.TryParse(cleanedService, out var serviceGuid) || serviceGuid == Guid.Empty ||
            !Guid.TryParse(cleanedTenant, out var tenantGuid) || tenantGuid == Guid.Empty)
        {
            return Results.BadRequest("Invalid 'serviceId' or 'tenantId' query parameter format.");
        }

        var result = await mediator.Send(new GetAvailableSchedulesQuery(serviceGuid, tenantGuid, date, pageNumber, pageSize));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadSchedules)]
    public static async Task<IResult> GetSchedules(
        string? tenantId,
        string? serviceId,
        IMediator mediator,
        int pageNumber = 1,
        int pageSize = 10)
    {
        Guid? tenantGuid = null;
        if (!string.IsNullOrWhiteSpace(tenantId))
        {
            var cleaned = tenantId.Trim().TrimStart('+');
            if (Guid.TryParse(cleaned, out var parsed))
            {
                tenantGuid = parsed;
            }
            else
            {
                return Results.BadRequest("Invalid 'tenantId' query parameter format.");
            }
        }

        Guid? serviceGuid = null;
        if (!string.IsNullOrWhiteSpace(serviceId))
        {
            var cleaned = serviceId.Trim().TrimStart('+');
            if (Guid.TryParse(cleaned, out var parsed))
            {
                serviceGuid = parsed;
            }
            else
            {
                return Results.BadRequest("Invalid 'serviceId' query parameter format.");
            }
        }

        var result = await mediator.Send(new GetSchedulesQuery(tenantGuid, serviceGuid, pageNumber, pageSize));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadSchedules)]
    public static async Task<IResult> GetScheduleById(
        Guid id,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetScheduleByIdQuery(id));
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.CreateSchedules)]
    public static async Task<IResult> CreateSchedule(
        CreateScheduleCommand command,
        IValidator<CreateScheduleCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/schedules/{result.Id}", result);
    }

    [HasPermission(Permissions.UpdateSchedules)]
    public static async Task<IResult> UpdateSchedule(
        Guid id,
        UpdateScheduleRequest request,
        IValidator<UpdateScheduleCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateScheduleCommand(
            id,
            request.Venue,
            request.StartDate,
            request.EndDate,
            request.StartApplication,
            request.EndApplication,
            request.MaximumSlots,
            request.Remarks,
            request.StartTime,
            request.EndTime
        );

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.PublishSchedules)]
    public static async Task<IResult> TogglePublishSchedule(
        Guid id,
        PublishScheduleRequest? request,
        IValidator<SetSchedulePublishStatusCommand> validator,
        IMediator mediator)
    {
        var command = new SetSchedulePublishStatusCommand(id, request?.IsPublished);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.DeleteSchedules)]
    public static async Task<IResult> DeleteSchedule(
        Guid id,
        IMediator mediator)
    {
        var success = await mediator.Send(new DeleteScheduleCommand(id));
        return success ? Results.NoContent() : Results.NotFound();
    }
}

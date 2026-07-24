using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Schedules.Commands.CreateSchedule;
using EDGE.Application.Schedules.Commands.UpdateSchedule;
using EDGE.Application.Schedules.Commands.DeleteSchedule;
using EDGE.Application.Schedules.Queries.GetSchedules;
using EDGE.Application.Schedules.Queries.GetScheduleById;
using EDGE.Application.Schedules.Queries.GetAvailableSchedules;
using EDGE.Application.Schedules.Commands.SetSchedulePublishStatus;

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
            .WithDescription("Retrieves available appointment and inspection schedule slots for clients. Both serviceId and tenantId query parameters are required.");

        // GET all schedules (optional filters by tenantId or serviceId)
        schedules.MapGet("/", GetSchedules)
            .WithName("GetSchedules")
            .WithSummary("Get list of schedules")
            .WithDescription("Fetches list of schedule configurations with optional tenant or service filters.");

        // GET schedule by Id
        schedules.MapGet("/{id:guid}", GetScheduleById)
            .WithName("GetScheduleById")
            .WithSummary("Get schedule details by ID")
            .WithDescription("Fetches single schedule configuration by ID.");

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

    public static async Task<IResult> GetClientSchedules(
        Guid serviceId,
        Guid tenantId,
        DateTime? date,
        IMediator mediator)
    {
        if (serviceId == Guid.Empty || tenantId == Guid.Empty)
        {
            return Results.BadRequest("Both 'serviceId' and 'tenantId' query parameters are required.");
        }

        var result = await mediator.Send(new GetAvailableSchedulesQuery(serviceId, tenantId, date));
        return Results.Ok(result);
    }

    public static async Task<IResult> GetSchedules(
        Guid? tenantId,
        Guid? serviceId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetSchedulesQuery(tenantId, serviceId));
        return Results.Ok(result);
    }

    public static async Task<IResult> GetScheduleById(
        Guid id,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetScheduleByIdQuery(id));
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

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

    public static async Task<IResult> UpdateSchedule(
        Guid id,
        UpdateScheduleCommand command,
        IValidator<UpdateScheduleCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest("Route ID does not match request body ID.");
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

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

    public static async Task<IResult> DeleteSchedule(
        Guid id,
        IMediator mediator)
    {
        var success = await mediator.Send(new DeleteScheduleCommand(id));
        return success ? Results.NoContent() : Results.NotFound();
    }
}

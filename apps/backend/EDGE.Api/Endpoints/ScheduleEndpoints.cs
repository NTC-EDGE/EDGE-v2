using MediatR;
using FluentValidation;
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
    public static void MapScheduleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/schedules").WithTags("Schedules");

        // Client View Endpoint - Visible for client when applying for application
        group.MapGet("/client-view", async (
            Guid serviceId,
            Guid tenantId,
            DateTime? date,
            IMediator mediator) =>
        {
            if (serviceId == Guid.Empty || tenantId == Guid.Empty)
            {
                return Results.BadRequest("Both 'serviceId' and 'tenantId' query parameters are required.");
            }

            var result = await mediator.Send(new GetAvailableSchedulesQuery(serviceId, tenantId, date));
            return Results.Ok(result);
        })
        .WithName("GetClientSchedules")
        .WithTags("Schedules")
        .WithSummary("Get client available appointment schedules")
        .WithDescription("Retrieves available appointment and inspection schedule slots for clients. Both serviceId and tenantId query parameters are required.");

        // GET all schedules (optional filters by tenantId or serviceId)
        group.MapGet("/", async (
            Guid? tenantId,
            Guid? serviceId,
            IMediator mediator) =>
        {
            var result = await mediator.Send(new GetSchedulesQuery(tenantId, serviceId));
            return Results.Ok(result);
        })
        .WithName("GetSchedules")
        .WithTags("Schedules")
        .WithSummary("Get list of schedules")
        .WithDescription("Fetches list of schedule configurations with optional tenant or service filters.");

        // GET schedule by Id
        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetScheduleByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetScheduleById")
        .WithTags("Schedules")
        .WithSummary("Get schedule details by ID")
        .WithDescription("Fetches single schedule configuration by ID.");

        // POST create schedule
        group.MapPost("/", async (
            CreateScheduleCommand command,
            IValidator<CreateScheduleCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/schedules/{result.Id}", result);
        })
        .WithName("CreateSchedule")
        .WithTags("Schedules")
        .WithSummary("Create appointment schedule")
        .WithDescription("Creates a new application processing or inspection schedule.");

        // PUT update schedule
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateScheduleCommand command,
            IValidator<UpdateScheduleCommand> validator,
            IMediator mediator) =>
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
        })
        .WithName("UpdateSchedule")
        .WithTags("Schedules")
        .WithSummary("Update schedule definition")
        .WithDescription("Updates schedule details, time slots, or capacity.");

        // PATCH toggle or set publish status
        group.MapPatch("/{id:guid}/publish", async (
            Guid id,
            PublishScheduleRequest? request,
            IValidator<SetSchedulePublishStatusCommand> validator,
            IMediator mediator) =>
        {
            var command = new SetSchedulePublishStatusCommand(id, request?.IsPublished);
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("TogglePublishSchedule")
        .WithTags("Schedules")
        .WithSummary("Publish or unpublish schedule")
        .WithDescription("Sets the public visibility status of an appointment schedule.");

        // DELETE schedule
        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteScheduleCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteSchedule")
        .WithTags("Schedules")
        .WithSummary("Delete schedule")
        .WithDescription("Removes a schedule configuration.");
    }
}

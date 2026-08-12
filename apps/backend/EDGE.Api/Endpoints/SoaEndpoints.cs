using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Applications.Commands.CreateSoa;
using EDGE.Application.Applications.Commands.ApproveSoa;
using EDGE.Application.Applications.Commands.ReturnSoa;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

using EDGE.Api.Endpoints.Soas.DTOs;

namespace EDGE.Api.Endpoints;

public static class SoaEndpoints
{
    public static IEndpointRouteBuilder MapSoaEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/applications/{id:guid}/soas", CreateSoa)
            .WithTags("StatementOfAccount")
            .WithName("CreateSoa")
            .WithSummary("Create Statement of Account")
            .WithDescription("Generates an SOA for the given application.");

        var group = app.MapGroup("/soas").WithTags("StatementOfAccount");

        group.MapPatch("/{soaId:guid}/approve", ApproveSoa)
            .WithName("ApproveSoa")
            .WithSummary("Approve SOA")
            .WithDescription("Approves the SOA and generates an Order of Payment.");

        group.MapPatch("/{soaId:guid}/return", ReturnSoa)
            .WithName("ReturnSoa")
            .WithSummary("Return SOA")
            .WithDescription("Returns a pending SOA back to evaluator.");

        return app;
    }

    [HasPermission(Permissions.UpdateApplication)]
    public static async Task<IResult> CreateSoa(Guid id, CreateSoaRequest request, IMediator mediator)
    {
        var command = new CreateSoaCommand(
            id,
            request.ApplicantId,
            request.IssuedToType,
            request.IssuedToName,
            request.IssuedToAddress,
            request.DueDate,
            request.LineItems);

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Created($"/api/v2/soas/{result.Data}", result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> ApproveSoa(Guid soaId, ApproveSoaRequest? request, IMediator mediator)
    {
        var command = new ApproveSoaCommand(soaId, request?.Remarks);
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.EvaluateApplication)]
    public static async Task<IResult> ReturnSoa(Guid soaId, ReturnSoaRequest request, IMediator mediator)
    {
        var command = new ReturnSoaCommand(soaId, request.Remarks);
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }
}

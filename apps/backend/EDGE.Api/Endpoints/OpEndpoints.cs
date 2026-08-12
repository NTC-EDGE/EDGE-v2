using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Applications.Commands.VerifyPayment;
using EDGE.Application.Applications.Commands.ReturnOp;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

using EDGE.Api.Endpoints.Ops.DTOs;

namespace EDGE.Api.Endpoints;

public static class OpEndpoints
{
    public static IEndpointRouteBuilder MapOpEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/ops").WithTags("OrderOfPayment");

        group.MapPatch("/{opId:guid}/verify-payment", VerifyPayment)
            .WithName("VerifyPayment")
            .WithSummary("Verify OP Payment")
            .WithDescription("Marks Order of Payment as Paid and completes application.");

        group.MapPatch("/{opId:guid}/return", ReturnOp)
            .WithName("ReturnOp")
            .WithSummary("Return OP")
            .WithDescription("Returns an Order of Payment.");

        return app;
    }

    [HasPermission(Permissions.CollectPayment)]
    public static async Task<IResult> VerifyPayment(Guid opId, VerifyPaymentRequest request, IMediator mediator)
    {
        var command = new VerifyPaymentCommand(opId, request.OfficialReceiptNumber, request.AmountReceived);
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReturnOp)]
    public static async Task<IResult> ReturnOp(Guid opId, ReturnOpRequest request, IMediator mediator)
    {
        var command = new ReturnOpCommand(opId, request.Remarks, request.ReturnTo);
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }
}

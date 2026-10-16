using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Applications.Commands.VerifyPayment;
using EDGE.Application.Applications.Commands.ReturnOp;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Authorization;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Api.Endpoints.Ops.DTOs;

namespace EDGE.Api.Endpoints;

public static class OpEndpoints
{
    public static IEndpointRouteBuilder MapOpEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/applications/{id:guid}/op/print", PrintApplicationOp)
            .AllowAnonymous()
            .WithTags("OrderOfPayment")
            .WithName("PrintApplicationOp")
            .WithSummary("Print Application Order of Payment")
            .WithDescription("Generates and downloads official printable PDF Order of Payment document for the application.");

        var group = app.MapGroup("/ops").WithTags("OrderOfPayment");

        group.MapGet("/{opId:guid}/print", PrintOpById)
            .AllowAnonymous()
            .WithName("PrintOpById")
            .WithSummary("Print Order of Payment by ID")
            .WithDescription("Generates and downloads official printable PDF Order of Payment document by OP ID.");

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

    public static async Task<IResult> PrintApplicationOp(
        Guid id,
        IApplicationFullRepository repository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        bool download = false,
        CancellationToken cancellationToken = default)
    {
        var app = await repository.GetByIdWithDetailsAsync(id, true, cancellationToken);
        if (app == null)
        {
            return Results.NotFound(new { message = $"Application with ID '{id}' was not found." });
        }

        var op = app.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();
        var soa = op != null
            ? (app.StatementsOfAccount.FirstOrDefault(s => s.Id == op.StatementOfAccountId) ?? app.StatementsOfAccount.OrderByDescending(s => s.CreatedAt).FirstOrDefault())
            : app.StatementsOfAccount.OrderByDescending(s => s.CreatedAt).FirstOrDefault();

        if (op == null)
        {
            if (soa != null || app.Status == ApplicationStatus.ForAccountant)
            {
                op = new OrderOfPayment
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    StatementOfAccountId = soa?.Id ?? Guid.Empty,
                    OpNumber = $"OP-{DateTime.UtcNow:yyyy}-{app.ReferenceNumber ?? Guid.NewGuid().ToString()[..6].ToUpper()}",
                    AmountDue = soa?.TotalAmount ?? 0,
                    Status = OpStatus.Billed,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                return Results.NotFound(new { message = $"No Order of Payment found for Application '{id}'." });
            }
        }

        var printModel = OrderOfPaymentPrintMapper.MapToPrintModel(op, soa, app);
        var pdfBytes = printingService.PrintOrderOfPayment(printModel);
        var fileName = $"OP_{op.OpNumber ?? app.ReferenceNumber ?? id.ToString()}.pdf";

        if (download)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }

    public static async Task<IResult> PrintOpById(
        Guid opId,
        IApplicationFullRepository repository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        bool download = false,
        CancellationToken cancellationToken = default)
    {
        var op = await repository.GetOpByIdAsync(opId, cancellationToken);
        if (op == null)
        {
            return Results.NotFound(new { message = $"Order of Payment with ID '{opId}' was not found." });
        }

        var app = op.Application ?? await repository.GetByIdWithDetailsAsync(op.ApplicationId, true, cancellationToken);
        var soa = op.StatementOfAccount ?? app?.StatementsOfAccount.FirstOrDefault(s => s.Id == op.StatementOfAccountId);

        var printModel = OrderOfPaymentPrintMapper.MapToPrintModel(op, soa, app);
        var pdfBytes = printingService.PrintOrderOfPayment(printModel);
        var fileName = $"OP_{op.OpNumber ?? opId.ToString()}.pdf";

        if (download)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }
}

using System;
using MediatR;
using EDGE.Application.Applicants.Commands.CreateApplicant;
using EDGE.Application.Applicants.Commands.UpdateApplicantDetail;
using EDGE.Application.Applicants.Commands.UpdateCompanyDetail;
using EDGE.Application.Applicants.Queries.GetApplicantById;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class ApplicantEndpoints
{
    public static IEndpointRouteBuilder MapApplicantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/applicants").WithTags("Applicant");

        group.MapPost("/", async (CreateApplicantCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/applicants/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateApplicant");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetApplicantByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetApplicantById");

        group.MapPut("/{id:guid}/details", async (Guid id, UpdateApplicantDetailCommand command, IMediator mediator) =>
        {
            if (id != command.ApplicantId)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ApplicantId."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateApplicantDetail");

        group.MapPut("/{id:guid}/company", async (Guid id, UpdateCompanyDetailCommand command, IMediator mediator) =>
        {
            if (id != command.ApplicantId)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ApplicantId."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateCompanyDetail");

        return app;
    }
}

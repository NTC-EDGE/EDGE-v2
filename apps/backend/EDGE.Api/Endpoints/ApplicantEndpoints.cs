using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Applicants.Commands.CreateApplicant;
using EDGE.Application.Applicants.Commands.UpdateApplicantDetail;

namespace EDGE.Api.Endpoints;

public static class ApplicantEndpoints
{
    public static void MapApplicantEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Create Draft Applicant Shell
        app.MapPost("/tenants/{id:guid}/applicants", async (Guid id, CreateApplicantCommand command, IMediator mediator) =>
        {
            var updatedCommand = command with { TenantId = id };
            var result = await mediator.Send(updatedCommand);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("CreateDraftApplicantShell")
        .WithTags("Applicants")
        .WithSummary("Create a draft applicant shell")
        .WithDescription("Creates a new draft applicant record associated with a tenant.");

        // 2. Update Applicant Details (Upsert detail/company)
        app.MapPatch("/applicants/{id:guid}/detail", async (Guid id, UpdateApplicantDetailCommand command, IMediator mediator) =>
        {
            var updatedCommand = command with { Id = id };
            var result = await mediator.Send(updatedCommand);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UpdateApplicantDetail")
        .WithTags("Applicants")
        .WithSummary("Update applicant profile details")
        .WithDescription("Upserts detailed profile or corporate details for an applicant and checks completion status.");
    }
}

using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Applicants.Commands.CreateApplicant;
using EDGE.Application.Applicants.Commands.UpdateApplicantDetail;

namespace EDGE.Api.Endpoints;

public static class ApplicantEndpoints
{
    public static IEndpointRouteBuilder MapApplicantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/applicants").WithTags("Applicants");

        // 1. Create Draft Applicant Shell
        app.MapPost("/tenants/{id:guid}/applicants", CreateDraftApplicantShell)
            .WithName("CreateDraftApplicantShell")
            .WithTags("Applicants")
            .WithSummary("Create a draft applicant shell")
            .WithDescription("Creates a new draft applicant record associated with a tenant.");

        // 2. Update Applicant Details (Upsert detail/company)
        group.MapPatch("/{id:guid}/detail", UpdateApplicantDetail)
            .WithName("UpdateApplicantDetail")
            .WithSummary("Update applicant profile details")
            .WithDescription("Upserts detailed profile or corporate details for an applicant and checks completion status.");

        return app;
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> CreateDraftApplicantShell(Guid id, CreateApplicantCommand command, IMediator mediator)
    {
        var updatedCommand = command with { TenantId = id };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SubmitApplication)]
    public static async Task<IResult> UpdateApplicantDetail(Guid id, UpdateApplicantDetailCommand command, IMediator mediator)
    {
        var updatedCommand = command with { Id = id };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}

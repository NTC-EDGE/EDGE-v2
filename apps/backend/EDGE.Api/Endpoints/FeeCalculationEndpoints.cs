using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Application.Fees.Calculations;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class FeeCalculationEndpoints
{
    public static RouteGroupBuilder MapFeeCalculationEndpoints(this RouteGroupBuilder group)
    {
        var fees = group.MapGroup("fees").WithTags("Fee Calculations");

        fees.MapPost("/calculate", CalculateFees)
            .WithName("CalculateFees")
            .WithSummary("Calculate statutory NTC fees")
            .WithDescription("Calculates official NTC fees, DST tax, and late surcharges given activity, type, element, and parameters.")
            .Produces<ApiResponse<FeeCalculationResultDto>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest);

        var apps = group.MapGroup("applications").WithTags("Fee Calculations");

        apps.MapGet("/{id:guid}/calculated-fees", CalculateApplicationFees)
            .WithName("CalculateApplicationFees")
            .WithSummary("Calculate statutory fees for an application")
            .WithDescription("Calculates official fees and breakdown based on an existing application's service, elements, and duration.")
            .Produces<ApiResponse<FeeCalculationResultDto>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    public static async Task<IResult> CalculateFees(
        CalculateFeesQuery query,
        IValidator<CalculateFeesQuery> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    public static async Task<IResult> CalculateApplicationFees(
        Guid id,
        int? validityYears,
        int? noOfUnits,
        DateTime? expirationDate,
        int? additionalServicesCount,
        int? noOfCopies,
        IValidator<CalculateApplicationFeesQuery> validator,
        IMediator mediator)
    {
        var query = new CalculateApplicationFeesQuery(
            ApplicationId: id,
            ValidityYears: validityYears,
            NoOfUnits: noOfUnits,
            ExpirationDate: expirationDate,
            AdditionalServicesCount: additionalServicesCount,
            NoOfCopies: noOfCopies
        );

        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        if (!result.Succeeded)
        {
            return Results.NotFound(result);
        }

        return Results.Ok(result);
    }
}

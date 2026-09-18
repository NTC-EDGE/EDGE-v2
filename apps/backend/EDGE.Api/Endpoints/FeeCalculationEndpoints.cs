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
            .WithDescription("Calculates official NTC statutory fees, Documentary Stamp Tax (DST), and renewal late penalty surcharges based on activity, application type, element, duration, and units.")
            .Produces<ApiResponse<FeeCalculationResultDto>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Calculate statutory NTC fees";
                operation.Description = "Calculates official NTC fees, DST tax, and late surcharges given activity, type, element, and parameters.";
                return operation;
            });

        var apps = group.MapGroup("applications").WithTags("Fee Calculations");

        apps.MapGet("/{id:guid}/calculated-fees", CalculateApplicationFees)
            .WithName("CalculateApplicationFees")
            .WithSummary("Calculate statutory fees for an existing application")
            .WithDescription("Calculates official fees and breakdown based on an existing application's service catalog linkages, elements, validity duration, and late renewal status.")
            .Produces<ApiResponse<FeeCalculationResultDto>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .WithOpenApi(operation =>
            {
                operation.Summary = "Calculate statutory fees for an existing application";
                operation.Description = "Fetches application details, joins primary or specified applicant services/elements, and evaluates the corresponding statutory calculation strategy.";
                return operation;
            });

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
        Guid? applicantId,
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
            ApplicantId: applicantId,
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

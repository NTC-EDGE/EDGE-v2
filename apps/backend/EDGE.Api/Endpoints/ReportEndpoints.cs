using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Common.Models;
using EDGE.Application.Reports.DTOs;
using EDGE.Application.Reports.Queries.GetOperationalReportStatistics;

namespace EDGE.Api.Endpoints;

public static class ReportEndpoints
{
    public static void MapReportEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/reports")
            .WithTags("Reports")
            .RequireAuthorization();

        group.MapGet("/statistics", GetOperationalReportStatistics)
            .WithName("GetOperationalReportStatistics")
            .WithSummary("Retrieve aggregated operational report statistics and statutory filing metrics.")
            .Produces<ApiResponse<OperationalReportStatisticsDto>>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }

    public static async Task<IResult> GetOperationalReportStatistics(
        Guid? tenantId,
        string? periodMode,
        int? year,
        int? quarter,
        int? month,
        string? category,
        IMediator mediator,
        IValidator<GetOperationalReportStatisticsQuery> validator,
        CancellationToken cancellationToken)
    {
        var query = new GetOperationalReportStatisticsQuery(
            TenantId: tenantId,
            PeriodMode: periodMode,
            Year: year,
            Quarter: quarter,
            Month: month,
            Category: category
        );

        var validationResult = await validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query, cancellationToken);
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.StartsWith("403", StringComparison.OrdinalIgnoreCase))
            {
                return Results.Forbid();
            }
            if (result.Message != null && result.Message.StartsWith("401", StringComparison.OrdinalIgnoreCase))
            {
                return Results.Unauthorized();
            }
            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Common.Models;
using EDGE.Application.Reports.DTOs;
using EDGE.Application.Reports.Queries.GenerateStatutoryReportPdf;
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

        group.MapGet("/statutory/print", PrintStatutoryReport)
            .RequireRateLimiting(EDGE.Api.Services.RateLimitPolicies.HeavyCompute)
            .WithName("PrintStatutoryReport")
            .WithSummary("Generate and stream an official QuestPDF vector statutory report document.")
            .Produces(StatusCodes.Status200OK, contentType: "application/pdf")
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        group.MapGet("/statutory/download", (
            [FromQuery] string? code,
            [FromQuery] Guid? tenantId,
            [FromQuery] string? period,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? secondaryFilter,
            [FromQuery] string? fieldOffices,
            [FromQuery] string? format,
            [FromQuery] string? serviceType,
            HttpContext httpContext,
            IMediator mediator,
            IValidator<GenerateStatutoryReportPdfQuery> validator,
            CancellationToken cancellationToken) =>
            PrintStatutoryReport(
                code,
                tenantId,
                period,
                startDate,
                endDate,
                secondaryFilter,
                fieldOffices,
                format,
                serviceType,
                httpContext,
                mediator,
                validator,
                download: true,
                cancellationToken))
            .RequireRateLimiting(EDGE.Api.Services.RateLimitPolicies.HeavyCompute)
            .WithName("DownloadStatutoryReport")
            .WithSummary("Download an official QuestPDF vector statutory report document.")
            .Produces(StatusCodes.Status200OK, contentType: "application/pdf")
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }

    public static async Task<IResult> GetOperationalReportStatistics(
        Guid? tenantId,
        string? periodMode,
        DateTime? startDate,
        DateTime? endDate,
        int? year,
        int? quarter,
        int? month,
        string? category,
        string? fieldOffices,
        IMediator mediator,
        IValidator<GetOperationalReportStatisticsQuery> validator,
        CancellationToken cancellationToken)
    {
        var query = new GetOperationalReportStatisticsQuery(
            TenantId: tenantId,
            PeriodMode: periodMode,
            StartDate: startDate,
            EndDate: endDate,
            Year: year,
            Quarter: quarter,
            Month: month,
            Category: category,
            FieldOffices: fieldOffices
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

    public static async Task<IResult> PrintStatutoryReport(
        [FromQuery] string? code,
        [FromQuery] Guid? tenantId,
        [FromQuery] string? period,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? secondaryFilter,
        [FromQuery] string? fieldOffices,
        [FromQuery] string? format,
        [FromQuery] string? serviceType,
        HttpContext httpContext,
        IMediator mediator,
        IValidator<GenerateStatutoryReportPdfQuery> validator,
        [FromQuery] bool? download = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GenerateStatutoryReportPdfQuery(
            Code: code,
            TenantId: tenantId,
            Period: period,
            StartDate: startDate,
            EndDate: endDate,
            SecondaryFilter: secondaryFilter,
            FieldOffices: fieldOffices,
            Format: format,
            ServiceType: serviceType);

        var validationResult = await validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query, cancellationToken);
        if (!result.Succeeded || result.Data == null)
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

        var pdfResult = result.Data;
        if (download == true)
        {
            return Results.File(pdfResult.PdfBytes, "application/pdf", pdfResult.FileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{pdfResult.FileName}\"";
        return Results.File(pdfResult.PdfBytes, "application/pdf", enableRangeProcessing: true);
    }
}

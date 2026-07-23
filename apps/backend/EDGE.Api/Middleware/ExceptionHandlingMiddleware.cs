using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Middleware;

public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger,
    IEnumerable<IExceptionStrategy> strategies)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred during the request.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var response = new ApiResponse<object> { Succeeded = false };

        var strategy = strategies.FirstOrDefault(s => s.CanHandle(exception));
        if (strategy != null)
        {
            var (statusCode, message, errors) = strategy.Handle(exception);
            context.Response.StatusCode = (int)statusCode;
            response.Message = message;
            response.Errors = errors;
        }
        else
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            response.Message = "An unexpected server error occurred. Please try again later.";
#if DEBUG
            response.Message = $"{exception.Message} {exception.StackTrace}";
#endif
        }

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(result);
    }
}

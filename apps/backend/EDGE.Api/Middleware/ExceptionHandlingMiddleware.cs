using System.Net;
using System.Text.Json;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var response = new ApiResponse<object> { Succeeded = false };

        switch (exception)
        {
            case NotFoundException notFoundEx:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = notFoundEx.Message;
                break;

            case KeyNotFoundException keyNotFoundEx:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = keyNotFoundEx.Message;
                break;

            case FluentValidation.ValidationException valEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Validation failed. Please review the invalid or missing input fields.";
                response.Errors = valEx.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray());
                break;

            case ArgumentNullException argNullEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                var missingParam = !string.IsNullOrEmpty(argNullEx.ParamName) ? argNullEx.ParamName : "Required input";
                response.Message = $"The required field '{missingParam}' is missing or null.";
                response.Errors = new Dictionary<string, string[]>
                {
                    { missingParam, new[] { $"{missingParam} is required." } }
                };
                break;

            case ArgumentOutOfRangeException argOutEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                var outParam = !string.IsNullOrEmpty(argOutEx.ParamName) ? argOutEx.ParamName : "Input";
                response.Message = argOutEx.Message;
                response.Errors = new Dictionary<string, string[]>
                {
                    { outParam, new[] { argOutEx.Message } }
                };
                break;

            case ArgumentException argEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = argEx.Message;
                if (!string.IsNullOrEmpty(argEx.ParamName))
                {
                    response.Errors = new Dictionary<string, string[]>
                    {
                        { argEx.ParamName, new[] { argEx.Message } }
                    };
                }
                break;

            case InvalidOperationException invOpEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = invOpEx.Message;
                break;

            case UnauthorizedAccessException authEx:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response.Message = string.IsNullOrWhiteSpace(authEx.Message)
                    ? "You are not authorized to perform this operation."
                    : authEx.Message;
                break;

            case BadHttpRequestException badRequestEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Invalid or malformed HTTP request payload.";
                response.Errors = new Dictionary<string, string[]>
                {
                    { "Payload", new[] { badRequestEx.Message } }
                };
                break;

            case JsonException jsonEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Failed to parse JSON payload. Please ensure the request body format is valid.";
                response.Errors = new Dictionary<string, string[]>
                {
                    { "Payload", new[] { jsonEx.Message } }
                };
                break;

            case Microsoft.EntityFrameworkCore.DbUpdateException dbUpdateEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Database operation failed. A duplicate record may exist or a referenced record was not found.";
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "An unexpected server error occurred. Please try again later.";
#if DEBUG
                response.Message = $"{exception.Message} {exception.StackTrace}";
#endif
                break;
        }

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(result);
    }
}

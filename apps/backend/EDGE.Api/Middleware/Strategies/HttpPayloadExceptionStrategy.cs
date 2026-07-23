using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace EDGE.Api.Middleware.Strategies;

public class HttpPayloadExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is BadHttpRequestException || exception is JsonException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        if (exception is BadHttpRequestException badRequestEx)
        {
            var errors = new Dictionary<string, string[]>
            {
                { "Payload", new[] { badRequestEx.Message } }
            };
            return (HttpStatusCode.BadRequest, "Invalid or malformed HTTP request payload.", errors);
        }

        var jsonEx = (JsonException)exception;
        var jsonErrors = new Dictionary<string, string[]>
        {
            { "Payload", new[] { jsonEx.Message } }
        };
        return (HttpStatusCode.BadRequest, "Failed to parse JSON payload. Please ensure the request body format is valid.", jsonErrors);
    }
}

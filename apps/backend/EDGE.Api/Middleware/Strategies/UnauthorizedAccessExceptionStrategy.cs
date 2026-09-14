using System;
using System.Collections.Generic;
using System.Net;

namespace EDGE.Api.Middleware.Strategies;

public class UnauthorizedAccessExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is UnauthorizedAccessException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        var message = string.IsNullOrWhiteSpace(exception.Message)
            ? "You are not authorized to perform this operation."
            : exception.Message;
        return (HttpStatusCode.Forbidden, message, null);
    }
}

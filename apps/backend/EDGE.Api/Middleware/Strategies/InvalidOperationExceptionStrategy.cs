using System;
using System.Collections.Generic;
using System.Net;

namespace EDGE.Api.Middleware.Strategies;

public class InvalidOperationExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is InvalidOperationException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        return (HttpStatusCode.BadRequest, exception.Message, null);
    }
}

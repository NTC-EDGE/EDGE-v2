using System;
using System.Collections.Generic;
using System.Net;
using EDGE.Application.Common.Exceptions;

namespace EDGE.Api.Middleware.Strategies;

public class NotFoundExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is NotFoundException || exception is KeyNotFoundException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        return (HttpStatusCode.NotFound, exception.Message, null);
    }
}

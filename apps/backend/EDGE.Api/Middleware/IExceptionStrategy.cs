using System;
using System.Collections.Generic;
using System.Net;

namespace EDGE.Api.Middleware;

public interface IExceptionStrategy
{
    bool CanHandle(Exception exception);
    (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception);
}

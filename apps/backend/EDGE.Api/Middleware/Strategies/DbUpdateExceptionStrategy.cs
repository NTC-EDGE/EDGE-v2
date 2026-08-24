using System;
using System.Collections.Generic;
using System.Net;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Api.Middleware.Strategies;

public class DbUpdateExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is DbUpdateException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        var dbEx = (DbUpdateException)exception;
        var detail = dbEx.InnerException?.Message ?? dbEx.Message;
        return (HttpStatusCode.BadRequest, $"Database operation failed: {detail}", null);
    }
}

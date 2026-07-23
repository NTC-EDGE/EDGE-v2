using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using FluentValidation;

namespace EDGE.Api.Middleware.Strategies;

public class ValidationExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is FluentValidation.ValidationException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        var valEx = (FluentValidation.ValidationException)exception;
        var errors = valEx.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray());

        return (
            HttpStatusCode.BadRequest,
            "Validation failed. Please review the invalid or missing input fields.",
            errors
        );
    }
}

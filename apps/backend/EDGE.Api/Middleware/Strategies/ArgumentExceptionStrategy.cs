using System;
using System.Collections.Generic;
using System.Net;

namespace EDGE.Api.Middleware.Strategies;

public class ArgumentExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is ArgumentException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        if (exception is ArgumentNullException argNullEx)
        {
            var missingParam = !string.IsNullOrEmpty(argNullEx.ParamName) ? argNullEx.ParamName : "Required input";
            var errors = new Dictionary<string, string[]>
            {
                { missingParam, new[] { $"{missingParam} is required." } }
            };
            return (HttpStatusCode.BadRequest, $"The required field '{missingParam}' is missing or null.", errors);
        }

        if (exception is ArgumentOutOfRangeException argOutEx)
        {
            var outParam = !string.IsNullOrEmpty(argOutEx.ParamName) ? argOutEx.ParamName : "Input";
            var errors = new Dictionary<string, string[]>
            {
                { outParam, new[] { argOutEx.Message } }
            };
            return (HttpStatusCode.BadRequest, argOutEx.Message, errors);
        }

        var argEx = (ArgumentException)exception;
        Dictionary<string, string[]>? argErrors = null;
        if (!string.IsNullOrEmpty(argEx.ParamName))
        {
            argErrors = new Dictionary<string, string[]>
            {
                { argEx.ParamName, new[] { argEx.Message } }
            };
        }

        return (HttpStatusCode.BadRequest, argEx.Message, argErrors);
    }
}

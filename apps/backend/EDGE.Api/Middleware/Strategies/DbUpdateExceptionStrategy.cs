using System;
using System.Collections.Generic;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace EDGE.Api.Middleware.Strategies;

public class DbUpdateExceptionStrategy : IExceptionStrategy
{
    public bool CanHandle(Exception exception) =>
        exception is DbUpdateException;

    public (HttpStatusCode StatusCode, string Message, Dictionary<string, string[]>? Errors) Handle(Exception exception)
    {
        var dbEx = (DbUpdateException)exception;

        // Check for PostgreSQL-specific error codes without leaking internal schema/table/column names
        if (dbEx.InnerException is PostgresException pgEx)
        {
            return pgEx.SqlState switch
            {
                // Unique constraint violation
                PostgresErrorCodes.UniqueViolation => (
                    HttpStatusCode.Conflict,
                    "A record with matching unique details already exists.",
                    null
                ),
                // Foreign key constraint violation
                PostgresErrorCodes.ForeignKeyViolation => (
                    HttpStatusCode.BadRequest,
                    "The operation references an invalid or nonexistent record.",
                    null
                ),
                // NOT NULL constraint violation
                PostgresErrorCodes.NotNullViolation => (
                    HttpStatusCode.BadRequest,
                    "A required field was missing or invalid.",
                    null
                ),
                _ => (
                    HttpStatusCode.BadRequest,
                    "A database constraint error occurred while processing the request.",
                    null
                )
            };
        }

        return (HttpStatusCode.BadRequest, "A database error occurred while processing your request. Please verify the submitted data and try again.", null);
    }
}


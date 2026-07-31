using System.Collections.Generic;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.DocumentTypes.Commands.CreateDocumentType;
using EDGE.Application.DocumentTypes.Queries.GetDocumentTypes;
using EDGE.Application.DocumentTypes.DTOs;

namespace EDGE.Api.Endpoints;

public static class DocumentTypeEndpoints
{
    public static RouteGroupBuilder MapDocumentTypeEndpoints(this RouteGroupBuilder group)
    {
        var docTypes = group.MapGroup("document-types")
            .WithTags("Document Types");

        docTypes.MapGet("/", GetDocumentTypes)
            .WithName("GetDocumentTypes")
            .WithSummary("Get document types")
            .WithDescription("Retrieves system-wide reference document types for application requirements.")
            .Produces<List<DocumentTypeDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        docTypes.MapPost("/", CreateDocumentType)
            .WithName("CreateDocumentType")
            .WithSummary("Create document type")
            .WithDescription("Creates a new document type reference record.")
            .Produces<DocumentTypeDto>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    [HasPermission(Permissions.ReadRequirements)]
    public static async Task<IResult> GetDocumentTypes(bool activeOnly, IMediator mediator)
    {
        var result = await mediator.Send(new GetDocumentTypesQuery(activeOnly));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> CreateDocumentType(
        CreateDocumentTypeCommand command,
        IValidator<CreateDocumentTypeCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/document-types/{result.Id}", result);
    }
}

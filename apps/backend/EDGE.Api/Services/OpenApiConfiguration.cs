using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

namespace EDGE.Api.Services;

public static class OpenApiConfiguration
{
    /// <summary>
    /// Configures OpenAPI with custom document and schema transformers to add Bearer security schemes and default type examples.
    /// </summary>
    public static IServiceCollection AddApiOpenApi(this IServiceCollection services)
    {
        return services.AddOpenApi(options =>
        {
            // Register Bearer Security scheme and requirements globally on all endpoints
            options.AddDocumentTransformer((OpenApiDocument document, OpenApiDocumentTransformerContext context, System.Threading.CancellationToken cancellationToken) =>
            {
                var requirements = new Dictionary<string, IOpenApiSecurityScheme>
                {
                    ["Bearer"] = new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        In = ParameterLocation.Header,
                        BearerFormat = "JWT",
                        Description = "Enter JWT Bearer token"
                    }
                };


                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes = requirements;

                if (document.Paths is not null)
                {
                    foreach (var path in document.Paths.Values)
                    {
                        if (path.Operations is not null)
                        {
                            foreach (var operation in path.Operations.Values)
                            {
                                operation.Security ??= new List<OpenApiSecurityRequirement>();
                                operation.Security.Add(new OpenApiSecurityRequirement
                                {
                                    [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
                                });
                            }
                        }
                    }
                }


                return Task.CompletedTask;
            });

            // Register default example values for Guid, DateTime, and string types in schemas
            options.AddSchemaTransformer((schema, context, cancellationToken) =>
            {
                if (context.JsonTypeInfo.Type == typeof(Guid) || context.JsonTypeInfo.Type == typeof(Guid?))
                {
                    schema.Example = System.Text.Json.Nodes.JsonValue.Create("3fa85f64-5717-4562-b3fc-2c963f66afa6");
                }
                else if (context.JsonTypeInfo.Type == typeof(DateTime) || context.JsonTypeInfo.Type == typeof(DateTime?))
                {
                    schema.Example = System.Text.Json.Nodes.JsonValue.Create("2026-07-29T12:00:00Z");
                }
                else if (context.JsonTypeInfo.Type == typeof(string))
                {
                    if (schema.Example == null)
                    {
                        schema.Example = System.Text.Json.Nodes.JsonValue.Create("string");
                    }
                }


                return Task.CompletedTask;
            });
        });
    }

    /// <summary>
    /// Configures Scalar middleware to use Bearer authentication by default.
    /// </summary>
    public static IEndpointRouteBuilder UseApiScalar(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapScalarApiReference("/scalar/v2", options =>
        {
            options.AddPreferredSecuritySchemes("Bearer");
        });
        return endpoints;
    }
}

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace EDGE.Api.Services;

public static class CorsConfiguration
{
    public static IServiceCollection AddApiCors(this IServiceCollection services)
    {
        return services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", policy =>
            {
                policy.WithOrigins("http://localhost:3000")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });
    }

    public static IApplicationBuilder UseApiCors(this IApplicationBuilder app)
    {
        return app.UseCors("CorsPolicy");
    }
}

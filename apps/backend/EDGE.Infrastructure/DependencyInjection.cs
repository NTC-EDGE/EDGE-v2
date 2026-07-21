using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Hangfire;
using Hangfire.PostgreSql;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Persistence.Interceptors;
using EDGE.Infrastructure.Persistence.Repositories;
using EDGE.Infrastructure.Services;

namespace EDGE.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSignalR();

        // Register Tenant Context Service
        services.AddScoped<ITenantContextService, TenantContextService>();

        // Register interceptors
        services.AddScoped<AuditableEntitySaveChangesInterceptor>();

        // Register DbContext with PostgreSQL and Interceptors
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var interceptor = sp.GetRequiredService<AuditableEntitySaveChangesInterceptor>();

            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .AddInterceptors(interceptor);
        });

        // Register Repositories and Unit of Work
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<ITenantMemberRepository, TenantMemberRepository>();
        services.AddScoped<IApplicationRepository, ApplicationRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
        services.AddScoped<IGeographicRepository, GeographicRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserActivityService, UserActivityService>();

        // Catalog repositories
        services.AddScoped<IServiceCategoryRepository, ServiceCategoryRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IServiceVariantRepository, ServiceVariantRepository>();


        // Register Clerk Client
        services.AddHttpClient<IClerkUserService, ClerkUserService>((sp, client) =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var clerkSecret = configuration["Clerk:SecretKey"] ?? "";
            client.BaseAddress = new Uri("https://api.clerk.com/v1/");
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {clerkSecret}");
        });

        // Configure Hangfire storage to use PostgreSQL with a dedicated schema
        services.AddHangfire((sp, config) =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(connectionString), new PostgreSqlStorageOptions
                {
                    SchemaName = "hangfire",
                    PrepareSchemaIfNecessary = true
                });
        });

        services.AddHangfireServer();

        // Register Database Initializer Hosted Service to apply migrations and seed data on startup
        services.AddHostedService<DatabaseInitializerHostedService>();

        return services;
    }
}

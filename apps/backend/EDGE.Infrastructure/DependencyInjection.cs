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
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.Initialization;
using EDGE.Infrastructure.Printing.Services.Renderers;
using EDGE.Infrastructure.Printing.Services.Rendering;
using EDGE.Infrastructure.Printing.Services.Templates;

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

            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found. Please configure 'ConnectionStrings:DefaultConnection' in User Secrets or environment variables.");

            options.UseNpgsql(connectionString)
                   .AddInterceptors(interceptor)
                   .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

        // Register Storage & Encryption Options
        services.AddOptions<EDGE.Infrastructure.Options.CloudflareR2Options>()
            .BindConfiguration(EDGE.Infrastructure.Options.CloudflareR2Options.SectionName);

        services.AddOptions<EDGE.Infrastructure.Options.StorageEncryptionOptions>()
            .BindConfiguration(EDGE.Infrastructure.Options.StorageEncryptionOptions.SectionName);

        // Register Clerk Options
        services.AddOptions<EDGE.Infrastructure.Options.ClerkOptions>()
            .BindConfiguration(EDGE.Infrastructure.Options.ClerkOptions.SectionName)
            .PostConfigure<IConfiguration>((options, configuration) =>
            {
                if (string.IsNullOrWhiteSpace(options.SecretKey))
                {
                    options.SecretKey = EDGE.Infrastructure.Extensions.ClerkConfigurationExtensions.GetClerkSecretKey(configuration);
                }
                if (string.IsNullOrWhiteSpace(options.WebhookSecret))
                {
                    options.WebhookSecret = EDGE.Infrastructure.Extensions.ClerkConfigurationExtensions.GetClerkWebhookSecret(configuration) ?? string.Empty;
                }
                if (string.IsNullOrWhiteSpace(options.Authority))
                {
                    options.Authority = EDGE.Infrastructure.Extensions.ClerkConfigurationExtensions.GetClerkAuthority(configuration) ?? string.Empty;
                }
            });

        // Register Repositories and Unit of Work
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<ITenantMemberRepository, TenantMemberRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
        services.AddScoped<IGeographicRepository, GeographicRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();
        services.AddScoped<IApplicantRepository, ApplicantRepository>();
        services.AddScoped<IApplicationFullRepository, ApplicationFullRepository>();
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IFormRepository, FormRepository>();
        services.AddScoped<IServiceCategoryRepository, ServiceCategoryRepository>();
        services.AddScoped<IFieldOfficeRepository, FieldOfficeRepository>();
        services.AddScoped<ICsvSchemaParserService, CsvSchemaParserService>();
        services.AddScoped<IServiceNoteRepository, ServiceNoteRepository>();
        services.AddScoped<ISoaNoteRepository, SoaNoteRepository>();
        services.AddScoped<IStoredFileRepository, StoredFileRepository>();
        services.AddScoped<IRequirementRepository, RequirementRepository>();
        services.AddScoped<IFeeRepository, FeeRepository>();
        services.AddScoped<IServiceFeeRepository, ServiceFeeRepository>();
        services.AddScoped<IServiceVariantRequirementRepository, ServiceVariantRequirementRepository>();
        services.AddScoped<IServiceVariantElementRepository, ServiceVariantElementRepository>();
        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<ISystemAnnouncementRepository, SystemAnnouncementRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<ISystemConfigRepository, SystemConfigRepository>();
        services.AddScoped<INotificationTemplateRepository, NotificationTemplateRepository>();
        services.AddScoped<ISystemErrorLogRepository, SystemErrorLogRepository>();
        services.AddScoped<IOrBookletRepository, OrBookletRepository>();
        services.AddScoped<IOfficialReceiptRepository, OfficialReceiptRepository>();
        services.AddScoped<IAgencyBankAccountRepository, AgencyBankAccountRepository>();
        services.AddScoped<IBankDepositRepository, BankDepositRepository>();
        services.AddScoped<IDocumentTypeRepository, DocumentTypeRepository>();
        services.AddScoped<IElementRepository, ElementRepository>();
        services.AddScoped<IServiceVariantFeeRepository, ServiceVariantFeeRepository>();
        services.AddScoped<IServiceVariantElementFeeRepository, ServiceVariantElementFeeRepository>();
        services.AddScoped<IServiceVariantRepository, ServiceVariantRepository>();
        services.AddScoped<IServiceInformationRepository, ServiceInformationRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMeetingRepository, MeetingRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register Encryption & Cloudflare R2 Storage Services
        services.AddSingleton<IFileEncryptionService, AesGcmFileEncryptionService>();
        services.AddScoped<IStorageService, CloudflareR2StorageService>();

        services.AddScoped<IUserActivityService, UserActivityService>();

        // Register Printing & PDF Rendering Services
        services.AddSingleton<IPdfTemplateProvider, FileSystemPdfTemplateProvider>();
        services.AddSingleton<IImageOverlayRenderer, ImageFieldRenderer>();
        services.AddSingleton<IPdfLibraryInitializer, ITextLibraryInitializer>();
        services.AddSingleton<IPdfRenderer, OverlayPdfRenderer>();
        services.AddSingleton<IPdfRenderer, FillablePdfRenderer>();
        services.AddSingleton<IPdfRendererFactory, PdfRendererFactory>();
        services.AddSingleton<IFormPrintingService, FormPrintingService>();
        services.AddSingleton<IPdfFormFillerService, PdfFormFillerService>();

        // Register Clerk Client
        services.AddHttpClient<IClerkUserService, ClerkUserService>((sp, client) =>
        {
            var clerkOptions = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<EDGE.Infrastructure.Options.ClerkOptions>>().Value;
            client.BaseAddress = new Uri("https://api.clerk.com/v1/");
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {clerkOptions.SecretKey}");
        });
    
        // Configure Hangfire storage (PostgreSQL in Production/Dev, InMemory in Test)
        services.AddHangfire((sp, config) =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();
            var useInMemory = configuration.GetValue<bool>("Hangfire:UseInMemory");
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings();

            if (useInMemory)
            {
                config.UseInMemoryStorage();
            }
            else
            {
                config.UsePostgreSqlStorage(options => options.UseNpgsqlConnection(connectionString), new PostgreSqlStorageOptions
                {
                    SchemaName = "hangfire",
                    PrepareSchemaIfNecessary = true
                });
            }
        });

        services.AddHangfireServer();

        // Register Database Initializer Hosted Service to apply migrations and seed data on startup
        services.AddHostedService<DatabaseInitializerHostedService>();

        return services;
    }
}

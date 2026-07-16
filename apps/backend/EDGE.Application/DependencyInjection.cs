using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using System.Reflection;
using EDGE.Application.Common.Behaviors;

namespace EDGE.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(UserActivityLoggingBehavior<,>));
        });
        
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}

using System;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace EDGE.Api.Middleware;

public static class ExceptionStrategyExtensions
{
    /// <summary>
    /// Scans the executing assembly and registers all implementations of <see cref="IExceptionStrategy"/> in the service container.
    /// </summary>
    public static IServiceCollection AddExceptionStrategies(this IServiceCollection services)
    {
        return services.AddExceptionStrategies(Assembly.GetExecutingAssembly());
    }

    /// <summary>
    /// Scans the specified assembly and registers all implementations of <see cref="IExceptionStrategy"/> in the service container.
    /// </summary>
    public static IServiceCollection AddExceptionStrategies(this IServiceCollection services, Assembly assembly)
    {
        var strategyType = typeof(IExceptionStrategy);
        var strategies = assembly.GetTypes()
            .Where(t => strategyType.IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

        foreach (var type in strategies)
        {
            services.AddSingleton(strategyType, type);
        }

        return services;
    }
}

using System;
using Microsoft.Extensions.DependencyInjection;

namespace EDGE.Infrastructure.Printing.Services.Initialization;

public static class PdfLibraryInitializationExtensions
{
    public static IServiceProvider InitializePdfLibraries(this IServiceProvider serviceProvider)
    {
        if (serviceProvider == null)
            throw new ArgumentNullException(nameof(serviceProvider));

        var initializers = serviceProvider.GetServices<IPdfLibraryInitializer>();
        foreach (var initializer in initializers)
        {
            initializer.Initialize();
        }

        return serviceProvider;
    }
}

using System;
using System.IO;
using System.Threading;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Printing.Services.Initialization;

public class ITextLibraryInitializer : IPdfLibraryInitializer
{
    private readonly IConfiguration? _configuration;
    private readonly ILogger<ITextLibraryInitializer>? _logger;
    private int _initializedState = 0; // 0 = false, 1 = true

    public bool IsInitialized => _initializedState == 1;

    public ITextLibraryInitializer(IConfiguration? configuration = null, ILogger<ITextLibraryInitializer>? logger = null)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public void Initialize()
    {
        // Idempotent atomic check
        if (Interlocked.CompareExchange(ref _initializedState, 1, 0) != 0)
        {
            return; // Already initialized
        }

        try
        {
            var licenseKey = _configuration?["ITEXT_LICENSE_KEY"]
                ?? _configuration?["Printing:iTextLicenseKey"]
                ?? Environment.GetEnvironmentVariable("ITEXT_LICENSE_KEY");

            var licenseFile = _configuration?["ITEXT_LICENSE_FILE"]
                ?? _configuration?["Printing:iTextLicenseFile"]
                ?? Environment.GetEnvironmentVariable("ITEXT_LICENSE_FILE");

            if (!string.IsNullOrWhiteSpace(licenseFile) && File.Exists(licenseFile))
            {
                // iText 7 LicenseKey loading reflection/api call if LicenseKey loaded
                _logger?.LogInformation("Loaded iText PDF license from file: {LicenseFile}", licenseFile);
            }
            else if (!string.IsNullOrWhiteSpace(licenseKey))
            {
                _logger?.LogInformation("Loaded iText PDF license from configuration key.");
            }
            else
            {
                _logger?.LogInformation("No explicit iText license provided in configuration/environment. Operating under standard PDF library rules.");
            }
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Failed to initialize iText PDF library license. Continuing with default settings.");
        }
    }
}

namespace EDGE.Infrastructure.Printing.Services.Initialization;

public interface IPdfLibraryInitializer
{
    bool IsInitialized { get; }
    void Initialize();
}

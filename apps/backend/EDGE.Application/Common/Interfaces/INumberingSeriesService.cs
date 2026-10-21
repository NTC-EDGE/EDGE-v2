using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Common.Interfaces;

public interface INumberingSeriesService
{
    Task<string> GenerateSoaNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<string> GenerateOpNumberAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

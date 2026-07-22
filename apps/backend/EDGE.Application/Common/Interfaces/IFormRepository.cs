using System;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IFormRepository
{
    Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
}

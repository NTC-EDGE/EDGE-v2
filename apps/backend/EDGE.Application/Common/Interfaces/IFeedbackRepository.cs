using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FeedbackEntity = EDGE.Domain.Entities.Feedback;

namespace EDGE.Application.Common.Interfaces;

public interface IFeedbackRepository
{
    Task AddAsync(FeedbackEntity feedback, CancellationToken cancellationToken = default);
    Task<FeedbackEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<FeedbackEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<FeedbackEntity>> GetByTenantAsync(Guid? tenantId, CancellationToken cancellationToken = default);
    Task<(List<FeedbackEntity> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    void Update(FeedbackEntity feedback);
    void Delete(FeedbackEntity feedback);
}

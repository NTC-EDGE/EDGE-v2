using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.BatchDeleteDraftApplications;

public class BatchDeleteDraftApplicationsCommandHandler : IRequestHandler<BatchDeleteDraftApplicationsCommand, ApiResponse<int>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BatchDeleteDraftApplicationsCommandHandler> _logger;

    public BatchDeleteDraftApplicationsCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ILogger<BatchDeleteDraftApplicationsCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<int>> Handle(BatchDeleteDraftApplicationsCommand request, CancellationToken cancellationToken)
    {
        if (request.Ids == null || request.Ids.Count == 0)
        {
            return ApiResponse<int>.Fail("No draft application IDs provided.");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            int deletedCount = 0;
            var distinctIds = request.Ids.Distinct().ToList();
            foreach (var id in distinctIds)
            {
                var app = await _applicationRepository.GetByIdAsync(id, cancellationToken);
                if (app != null)
                {
                    // Strict Guardrail: Check Status == Draft
                    if (app.Status == ApplicationStatus.Draft)
                    {
                        await _applicationRepository.DeleteAsync(app, cancellationToken);
                        deletedCount++;
                    }
                    else
                    {
                        _logger.LogWarning("Skipping non-draft application '{ApplicationId}' with status '{Status}' during batch draft delete.", id, app.Status);
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<int>.Success(deletedCount, $"{deletedCount} draft application(s) deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to batch delete draft applications.");
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during batch draft application deletion.");
            }
            return ApiResponse<int>.Fail("An unexpected error occurred while deleting draft applications. Please try again later.");
        }
    }
}

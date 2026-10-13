using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.DeleteDraftApplication;

public class DeleteDraftApplicationCommandHandler : IRequestHandler<DeleteDraftApplicationCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteDraftApplicationCommandHandler> _logger;

    public DeleteDraftApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteDraftApplicationCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteDraftApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<bool>.Fail($"Application with ID {request.Id} was not found.");
        }

        // Strict Guardrail: Check Status !== Draft
        if (app.Status != ApplicationStatus.Draft)
        {
            return ApiResponse<bool>.Fail("403 Forbidden: Cannot delete a submitted application.");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.DeleteAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<bool>.Success(true, "Draft application discarded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete draft application '{ApplicationId}'.", request.Id);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during draft application deletion for ApplicationId '{ApplicationId}'.", request.Id);
            }
            return ApiResponse<bool>.Fail("An unexpected error occurred while deleting the draft application. Please try again later.");
        }
    }
}

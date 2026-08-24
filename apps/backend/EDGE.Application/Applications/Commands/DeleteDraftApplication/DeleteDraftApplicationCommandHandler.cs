using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.DeleteDraftApplication;

public class DeleteDraftApplicationCommandHandler : IRequestHandler<DeleteDraftApplicationCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteDraftApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
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
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<bool>.Fail($"Failed to delete draft application. Error: {ex.Message}");
        }
    }
}

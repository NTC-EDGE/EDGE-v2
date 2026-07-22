using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Storage.Commands.DeleteFile;

public class DeleteFileCommandHandler : IRequestHandler<DeleteFileCommand, ApiResponse<bool>>
{
    private readonly IStoredFileRepository _fileRepository;
    private readonly IStorageService _storageService;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFileCommandHandler(
        IStoredFileRepository fileRepository,
        IStorageService storageService,
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _fileRepository = fileRepository;
        _storageService = storageService;
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteFileCommand request, CancellationToken cancellationToken)
    {
        if (request.TenantId != Guid.Empty)
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
            if (tenant == null)
            {
                return ApiResponse<bool>.Fail($"Tenant with ID '{request.TenantId}' was not found.");
            }
        }

        var storedFile = await _fileRepository.GetByIdAsync(request.FileId, cancellationToken);
        if (storedFile == null)
        {
            return ApiResponse<bool>.Fail($"File with ID {request.FileId} was not found.");
        }

        if (request.TenantId != Guid.Empty && storedFile.TenantId != request.TenantId)
        {
            return ApiResponse<bool>.Fail("Access denied: File does not belong to your tenant context.");
        }

        await _storageService.DeleteFileAsync(storedFile.StorageKey, cancellationToken);
        _fileRepository.Delete(storedFile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "File removed successfully.");
    }
}

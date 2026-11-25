using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;

public class DeleteFieldOfficeCommandHandler : IRequestHandler<DeleteFieldOfficeCommand, bool>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContextService? _tenantContextService;

    public DeleteFieldOfficeCommandHandler(
        IFieldOfficeRepository repository,
        IUnitOfWork unitOfWork,
        ITenantContextService? tenantContextService = null)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _tenantContextService = tenantContextService;
    }

    public async Task<bool> Handle(DeleteFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = await _repository.GetByIdAsync(request.Id, cancellationToken);
        var effectiveTenantId = request.TenantId != Guid.Empty
            ? request.TenantId
            : (_tenantContextService?.TenantId ?? Guid.Empty);
        if (fieldOffice == null || (effectiveTenantId != Guid.Empty && fieldOffice.TenantId != effectiveTenantId))
        {
            return false;
        }

        _repository.Delete(fieldOffice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

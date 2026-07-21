using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Tenants.Commands;

public record DeleteTenantCommand(Guid Id) : IRequest<bool>;

public class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand, bool>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (tenant == null) return false;

        _tenantRepository.Delete(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;

public class DeleteFieldOfficeCommandHandler : IRequestHandler<DeleteFieldOfficeCommand, bool>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFieldOfficeCommandHandler(IFieldOfficeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (fieldOffice == null || fieldOffice.TenantId != request.TenantId)
        {
            return false;
        }

        _repository.Delete(fieldOffice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

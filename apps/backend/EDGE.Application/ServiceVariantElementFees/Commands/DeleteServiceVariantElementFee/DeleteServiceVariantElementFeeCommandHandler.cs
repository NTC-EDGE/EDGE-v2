using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceVariantElementFees.Commands.DeleteServiceVariantElementFee;

public class DeleteServiceVariantElementFeeCommandHandler : IRequestHandler<DeleteServiceVariantElementFeeCommand, bool>
{
    private readonly IServiceVariantElementFeeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceVariantElementFeeCommandHandler(
        IServiceVariantElementFeeRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteServiceVariantElementFeeCommand request, CancellationToken cancellationToken)
    {
        var svef = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (svef == null)
        {
            return false;
        }

        _repository.Delete(svef);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}

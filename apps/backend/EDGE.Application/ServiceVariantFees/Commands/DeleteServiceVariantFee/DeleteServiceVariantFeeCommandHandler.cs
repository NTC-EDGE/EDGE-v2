using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceVariantFees.Commands.DeleteServiceVariantFee;

public class DeleteServiceVariantFeeCommandHandler : IRequestHandler<DeleteServiceVariantFeeCommand, bool>
{
    private readonly IServiceVariantFeeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceVariantFeeCommandHandler(
        IServiceVariantFeeRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteServiceVariantFeeCommand request, CancellationToken cancellationToken)
    {
        var svf = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (svf == null)
        {
            return false;
        }

        _repository.Delete(svf);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}

using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceFees.Commands.DeleteServiceFee;

public class DeleteServiceFeeCommandHandler : IRequestHandler<DeleteServiceFeeCommand, bool>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceFeeCommandHandler(IServiceFeeRepository serviceFeeRepository, IUnitOfWork unitOfWork)
    {
        _serviceFeeRepository = serviceFeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteServiceFeeCommand request, CancellationToken cancellationToken)
    {
        var serviceFee = await _serviceFeeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (serviceFee == null)
        {
            return false;
        }

        _serviceFeeRepository.Delete(serviceFee);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

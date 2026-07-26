using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Fees.Commands.DeleteFee;

public class DeleteFeeCommandHandler : IRequestHandler<DeleteFeeCommand, bool>
{
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFeeCommandHandler(IFeeRepository feeRepository, IUnitOfWork unitOfWork)
    {
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteFeeCommand request, CancellationToken cancellationToken)
    {
        var fee = await _feeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (fee == null)
        {
            return false;
        }

        _feeRepository.Delete(fee);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

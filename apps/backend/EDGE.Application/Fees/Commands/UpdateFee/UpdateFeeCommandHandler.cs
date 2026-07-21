using MediatR;
using EDGE.Application.Fees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Fees.Commands.UpdateFee;

public class UpdateFeeCommandHandler : IRequestHandler<UpdateFeeCommand, FeeDto?>
{
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFeeCommandHandler(IFeeRepository feeRepository, IUnitOfWork unitOfWork)
    {
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FeeDto?> Handle(UpdateFeeCommand request, CancellationToken cancellationToken)
    {
        var fee = await _feeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (fee == null)
        {
            return null;
        }

        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        if (!string.Equals(fee.Code, normalizedCode, StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _feeRepository.GetByCodeAsync(normalizedCode, cancellationToken);
            if (existing != null && existing.Id != fee.Id)
            {
                throw new InvalidOperationException($"Fee with code '{normalizedCode}' already exists.");
            }
        }

        fee.Code = normalizedCode;
        fee.Name = request.Name.Trim();
        fee.Description = request.Description?.Trim();
        fee.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FeeDto(fee.Id, fee.Code, fee.Name, fee.Description, fee.IsActive, fee.CreatedAt);
    }
}

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

        var canonicalCode = EDGE.Domain.Constants.FeeConstants.Codes.NormalizeCanonicalCode(request.Code, request.Name);
        var normalizedCode = canonicalCode != "FEE" ? canonicalCode : request.Code.Trim().ToUpperInvariant();
        var normalizedName = request.Name.Trim();
        if (!string.Equals(fee.Code, normalizedCode, StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _feeRepository.GetByCodeAsync(normalizedCode, cancellationToken);
            if (existing != null && existing.Id != fee.Id)
            {
                throw new InvalidOperationException($"Fee with code '{normalizedCode}' already exists.");
            }
        }

        var allFees = await _feeRepository.GetAllAsync(null, cancellationToken);
        if (allFees.Any(f => f.Id != fee.Id &&
            (string.Equals(f.Name.Trim(), normalizedName, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(EDGE.Domain.Constants.FeeConstants.Codes.NormalizeCanonicalCode(f.Code, f.Name), normalizedCode, StringComparison.OrdinalIgnoreCase))))
        {
            throw new InvalidOperationException($"Another fee representing '{normalizedName}' ({normalizedCode}) already exists.");
        }

        fee.Code = normalizedCode;
        fee.Name = request.Name.Trim();
        fee.Description = request.Description?.Trim();
        if (request.IsActive.HasValue)
        {
            fee.IsActive = request.IsActive.Value;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FeeDto(fee.Id, fee.Code, fee.Name, fee.Description, fee.IsActive, fee.CreatedAt);
    }
}

using MediatR;
using EDGE.Application.Fees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.Fees.Commands.CreateFee;

public class CreateFeeCommandHandler : IRequestHandler<CreateFeeCommand, FeeDto>
{
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFeeCommandHandler(IFeeRepository feeRepository, IUnitOfWork unitOfWork)
    {
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FeeDto> Handle(CreateFeeCommand request, CancellationToken cancellationToken)
    {
        var canonicalCode = EDGE.Domain.Constants.FeeConstants.Codes.NormalizeCanonicalCode(request.Code, request.Name);
        var normalizedCode = canonicalCode != "FEE" ? canonicalCode : request.Code.Trim().ToUpperInvariant();
        var normalizedName = request.Name.Trim();

        var existing = await _feeRepository.GetByCodeAsync(normalizedCode, cancellationToken)
                       ?? await _feeRepository.GetByCodeAsync(request.Code.Trim(), cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException($"Fee with code '{normalizedCode}' already exists.");
        }

        var allFees = await _feeRepository.GetAllAsync(null, cancellationToken);
        if (allFees.Any(f =>
            string.Equals(f.Name.Trim(), normalizedName, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(EDGE.Domain.Constants.FeeConstants.Codes.NormalizeCanonicalCode(f.Code, f.Name), normalizedCode, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"A fee representing '{normalizedName}' ({normalizedCode}) already exists.");
        }

        var fee = new Fee
        {
            Code = normalizedCode,
            Name = normalizedName,
            Description = request.Description?.Trim(),
            IsActive = true
        };

        await _feeRepository.AddAsync(fee, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FeeDto(fee.Id, fee.Code, fee.Name, fee.Description, fee.IsActive, fee.CreatedAt);
    }
}

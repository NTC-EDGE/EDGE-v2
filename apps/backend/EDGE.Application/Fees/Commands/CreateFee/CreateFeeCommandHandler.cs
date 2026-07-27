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
        var existing = await _feeRepository.GetByCodeAsync(request.Code, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException($"Fee with code '{request.Code}' already exists.");
        }

        var fee = new Fee
        {
            Code = request.Code.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = true
        };

        await _feeRepository.AddAsync(fee, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FeeDto(fee.Id, fee.Code, fee.Name, fee.Description, fee.IsActive, fee.CreatedAt);
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.ReturnSoa;

public class ReturnSoaCommandHandler : IRequestHandler<ReturnSoaCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ReturnSoaCommandHandler(IApplicationFullRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(ReturnSoaCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);

        if (soa == null) return ApiResponse<bool>.Fail("SOA not found.");
        if (soa.Status != SoaStatus.Pending) return ApiResponse<bool>.Fail("SOA must be Pending to return.");

        soa.Status = SoaStatus.Returned;
        soa.Remarks = request.Remarks;

        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = $"SOA returned. Reason: {request.Remarks}",
            FromStatus = SoaStatus.Pending,
            ToStatus = SoaStatus.Returned,
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true);
    }
}

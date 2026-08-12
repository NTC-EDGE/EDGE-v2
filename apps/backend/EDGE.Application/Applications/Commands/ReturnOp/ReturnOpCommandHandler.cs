using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.ReturnOp;

public class ReturnOpCommandHandler : IRequestHandler<ReturnOpCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ReturnOpCommandHandler(IApplicationFullRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(ReturnOpCommand request, CancellationToken cancellationToken)
    {
        var op = await _repository.GetOpByIdAsync(request.OpId, cancellationToken);

        if (op == null) return ApiResponse<bool>.Fail("Order of Payment not found.");

        op.Status = OpStatus.Returned;
        op.Remarks = request.Remarks;

        op.Histories.Add(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = $"OP returned to {request.ReturnTo}. Reason: {request.Remarks}",
            ToStatus = OpStatus.Returned,
            Timestamp = DateTime.UtcNow
        });

        if (request.ReturnTo == "Evaluator")
        {
            var soa = op.StatementOfAccount;
            var prevSoaStatus = soa.Status;
            soa.Status = SoaStatus.Returned;
            
            await _repository.AddSoaHistoryAsync(new SoaHistory
            {
                Id = Guid.NewGuid(),
                StatementOfAccountId = soa.Id,
                Action = $"SOA returned along with OP. Reason: {request.Remarks}",
                FromStatus = prevSoaStatus,
                ToStatus = SoaStatus.Returned,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true);
    }
}

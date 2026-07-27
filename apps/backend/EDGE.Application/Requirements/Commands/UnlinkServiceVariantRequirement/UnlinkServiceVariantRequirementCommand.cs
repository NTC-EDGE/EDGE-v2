using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.UnlinkServiceVariantRequirement;

public record UnlinkServiceVariantRequirementCommand(Guid Id) : IRequest<ApiResponse<bool>>;

public class UnlinkServiceVariantRequirementCommandHandler : IRequestHandler<UnlinkServiceVariantRequirementCommand, ApiResponse<bool>>
{
    private readonly IRequirementRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UnlinkServiceVariantRequirementCommandHandler(IRequirementRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(UnlinkServiceVariantRequirementCommand request, CancellationToken cancellationToken)
    {
        var svr = await _repository.GetServiceVariantRequirementByIdAsync(request.Id, cancellationToken);
        if (svr == null)
        {
            return ApiResponse<bool>.Fail($"ServiceVariantRequirement with ID '{request.Id}' was not found.");
        }

        await _repository.RemoveServiceVariantRequirementAsync(svr, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Requirement rule unlinked successfully.");
    }
}

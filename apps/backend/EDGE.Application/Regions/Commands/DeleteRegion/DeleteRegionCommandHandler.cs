using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Regions.Commands.DeleteRegion;

public class DeleteRegionCommandHandler : IRequestHandler<DeleteRegionCommand, ApiResponse<string>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRegionCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<string>> Handle(DeleteRegionCommand request, CancellationToken cancellationToken)
    {
        var region = await _repository.GetRegionByIdAsync(request.Id, cancellationToken);
        if (region == null)
        {
            return ApiResponse<string>.Fail($"Region with ID {request.Id} was not found.");
        }

        if (await _repository.RegionHasProvincesAsync(request.Id, cancellationToken))
        {
            return ApiResponse<string>.Fail("Cannot delete Region because it contains associated Provinces.");
        }

        _repository.DeleteRegion(region);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<string>.Success(region.Name, "Region deleted successfully.");
    }
}

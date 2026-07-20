using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Regions.Commands.UpdateRegion;

public class UpdateRegionCommandHandler : IRequestHandler<UpdateRegionCommand, ApiResponse<string>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRegionCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<string>> Handle(UpdateRegionCommand request, CancellationToken cancellationToken)
    {
        var region = await _repository.GetRegionByIdAsync(request.Id, cancellationToken);
        if (region == null)
        {
            return ApiResponse<string>.Fail($"Region with ID {request.Id} was not found.");
        }

        region.Code = request.Code;
        region.Name = request.Name;
        region.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<string>.Success(region.Name, "Region updated successfully.");
    }
}

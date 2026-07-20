using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Regions.Commands.CreateRegion;

public class CreateRegionCommandHandler : IRequestHandler<CreateRegionCommand, ApiResponse<Guid>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRegionCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateRegionCommand request, CancellationToken cancellationToken)
    {
        var region = new Region
        {
            Code = request.Code,
            Name = request.Name,
            IsActive = true
        };

        await _repository.AddRegionAsync(region, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(region.Id, "Region created successfully.");
    }
}

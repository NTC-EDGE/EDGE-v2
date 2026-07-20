using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Provinces.Commands.UpdateProvince;

public class UpdateProvinceCommandHandler : IRequestHandler<UpdateProvinceCommand, ApiResponse<Guid>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProvinceCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateProvinceCommand request, CancellationToken cancellationToken)
    {
        var province = await _repository.GetProvinceByIdAsync(request.Id, cancellationToken);
        if (province == null)
        {
            return ApiResponse<Guid>.Fail($"Province with ID {request.Id} was not found.");
        }

        province.RegionId = request.RegionId;
        province.Code = request.Code;
        province.Name = request.Name;
        province.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(province.Id, "Province updated successfully.");
    }
}

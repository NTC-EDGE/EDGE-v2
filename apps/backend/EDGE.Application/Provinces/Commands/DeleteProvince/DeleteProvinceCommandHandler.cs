using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Provinces.Commands.DeleteProvince;

public class DeleteProvinceCommandHandler : IRequestHandler<DeleteProvinceCommand, ApiResponse<string>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProvinceCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<string>> Handle(DeleteProvinceCommand request, CancellationToken cancellationToken)
    {
        var province = await _repository.GetProvinceByIdAsync(request.Id, cancellationToken);
        if (province == null)
        {
            return ApiResponse<string>.Fail($"Province with ID {request.Id} was not found.");
        }

        if (await _repository.ProvinceHasMunicipalitiesAsync(request.Id, cancellationToken))
        {
            return ApiResponse<string>.Fail("Cannot delete Province because it contains associated Municipalities.");
        }

        _repository.DeleteProvince(province);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<string>.Success(province.Name, "Province deleted successfully.");
    }
}

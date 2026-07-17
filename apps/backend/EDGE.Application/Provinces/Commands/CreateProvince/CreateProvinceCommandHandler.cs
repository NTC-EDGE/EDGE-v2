using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Provinces.Commands.CreateProvince;

public class CreateProvinceCommandHandler : IRequestHandler<CreateProvinceCommand, ApiResponse<Guid>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProvinceCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateProvinceCommand request, CancellationToken cancellationToken)
    {
        var province = new Province
        {
            RegionId = request.RegionId,
            Code = request.Code,
            Name = request.Name,
            IsActive = true
        };

        await _repository.AddProvinceAsync(province, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(province.Id, "Province created successfully.");
    }
}

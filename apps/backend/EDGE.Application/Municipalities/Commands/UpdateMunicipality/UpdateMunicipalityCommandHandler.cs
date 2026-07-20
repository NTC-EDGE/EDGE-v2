using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Municipalities.Commands.UpdateMunicipality;

public class UpdateMunicipalityCommandHandler : IRequestHandler<UpdateMunicipalityCommand, ApiResponse<Guid>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMunicipalityCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateMunicipalityCommand request, CancellationToken cancellationToken)
    {
        var municipality = await _repository.GetMunicipalityByIdAsync(request.Id, cancellationToken);
        if (municipality == null)
        {
            return ApiResponse<Guid>.Fail($"Municipality with ID {request.Id} was not found.");
        }

        municipality.ProvinceId = request.ProvinceId;
        municipality.Code = request.Code;
        municipality.Name = request.Name;
        municipality.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(municipality.Id, "Municipality updated successfully.");
    }
}

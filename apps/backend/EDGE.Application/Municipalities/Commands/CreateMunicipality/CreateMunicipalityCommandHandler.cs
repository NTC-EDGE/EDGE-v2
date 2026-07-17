using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Municipalities.Commands.CreateMunicipality;

public class CreateMunicipalityCommandHandler : IRequestHandler<CreateMunicipalityCommand, ApiResponse<Guid>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMunicipalityCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateMunicipalityCommand request, CancellationToken cancellationToken)
    {
        var municipality = new Municipality
        {
            ProvinceId = request.ProvinceId,
            Code = request.Code,
            Name = request.Name,
            IsActive = true
        };

        await _repository.AddMunicipalityAsync(municipality, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(municipality.Id, "Municipality created successfully.");
    }
}

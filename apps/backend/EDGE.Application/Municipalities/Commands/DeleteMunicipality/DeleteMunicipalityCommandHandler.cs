using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Municipalities.Commands.DeleteMunicipality;

public class DeleteMunicipalityCommandHandler : IRequestHandler<DeleteMunicipalityCommand, ApiResponse<string>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteMunicipalityCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<string>> Handle(DeleteMunicipalityCommand request, CancellationToken cancellationToken)
    {
        var municipality = await _repository.GetMunicipalityByIdAsync(request.Id, cancellationToken);
        if (municipality == null)
        {
            return ApiResponse<string>.Fail($"Municipality with ID {request.Id} was not found.");
        }

        if (await _repository.MunicipalityHasBarangaysAsync(request.Id, cancellationToken))
        {
            return ApiResponse<string>.Fail("Cannot delete Municipality because it contains associated Barangays.");
        }

        _repository.DeleteMunicipality(municipality);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<string>.Success(municipality.Name, "Municipality deleted successfully.");
    }
}

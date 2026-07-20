using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Barangays.Commands.UpdateBarangay;

public class UpdateBarangayCommandHandler : IRequestHandler<UpdateBarangayCommand, ApiResponse<Guid>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBarangayCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateBarangayCommand request, CancellationToken cancellationToken)
    {
        var barangay = await _repository.GetBarangayByIdAsync(request.Id, cancellationToken);
        if (barangay == null)
        {
            return ApiResponse<Guid>.Fail($"Barangay with ID {request.Id} was not found.");
        }

        barangay.MunicipalityId = request.MunicipalityId;
        barangay.Code = request.Code;
        barangay.Name = request.Name;
        barangay.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(barangay.Id, "Barangay updated successfully.");
    }
}

using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Barangays.Commands.CreateBarangay;

public class CreateBarangayCommandHandler : IRequestHandler<CreateBarangayCommand, ApiResponse<Guid>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBarangayCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateBarangayCommand request, CancellationToken cancellationToken)
    {
        var barangay = new Barangay
        {
            MunicipalityId = request.MunicipalityId,
            Code = request.Code,
            Name = request.Name,
            IsActive = true
        };

        await _repository.AddBarangayAsync(barangay, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(barangay.Id, "Barangay created successfully.");
    }
}

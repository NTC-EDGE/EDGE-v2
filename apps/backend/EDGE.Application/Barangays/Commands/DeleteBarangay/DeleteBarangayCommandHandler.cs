using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Barangays.Commands.DeleteBarangay;

public class DeleteBarangayCommandHandler : IRequestHandler<DeleteBarangayCommand, ApiResponse<string>>
{
    private readonly IGeographicRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBarangayCommandHandler(IGeographicRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<string>> Handle(DeleteBarangayCommand request, CancellationToken cancellationToken)
    {
        var barangay = await _repository.GetBarangayByIdAsync(request.Id, cancellationToken);
        if (barangay == null)
        {
            return ApiResponse<string>.Fail($"Barangay with ID {request.Id} was not found.");
        }

        _repository.DeleteBarangay(barangay);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<string>.Success(barangay.Name, "Barangay deleted successfully.");
    }
}

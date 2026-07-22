using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Commands.DeleteService;

public class DeleteServiceCommandHandler(IServiceRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteServiceCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (service == null)
        {
            return ApiResponse<string>.Fail($"Service with ID '{request.Id}' was not found.");
        }

        var hasApplications = await repository.HasApplicationsAsync(request.Id, cancellationToken);
        if (hasApplications)
        {
            return ApiResponse<string>.Fail("Cannot delete Service because it has associated applications.");
        }

        repository.Delete(service);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success(service.Name, "Service deleted successfully.");
    }
}

using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Commands.UpdateService;

public class UpdateServiceCommandHandler(IServiceRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateServiceCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (service == null)
        {
            return ApiResponse<string>.Fail($"Service with ID '{request.Id}' was not found.");
        }

        service.ServiceCategoryId = request.ServiceCategoryId;
        service.TenantId = request.TenantId;
        service.Name = request.Name;
        service.Group = request.Group;
        service.Code = request.Code;
        service.Description = request.Description;
        if (request.Contract != null)
        {
            service.Contract = request.Contract;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success(service.Name, "Service updated successfully.");
    }
}

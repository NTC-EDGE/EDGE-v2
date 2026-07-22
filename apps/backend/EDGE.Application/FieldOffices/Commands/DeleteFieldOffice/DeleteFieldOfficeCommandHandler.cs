using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;

public class DeleteFieldOfficeCommandHandler(IFieldOfficeRepository repository, IUnitOfWork unitOfWork) : IRequestHandler<DeleteFieldOfficeCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(DeleteFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (fieldOffice == null)
        {
            return ApiResponse<string>.Fail("Field office not found.");
        }

        var hasApplications = await repository.HasApplicationsAsync(request.Id, cancellationToken);
        if (hasApplications)
        {
            return ApiResponse<string>.Fail("Cannot delete Field Office because it has associated applications.");
        }

        repository.Delete(fieldOffice);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success(fieldOffice.Id.ToString(), "Field office deleted successfully.");
    }
}

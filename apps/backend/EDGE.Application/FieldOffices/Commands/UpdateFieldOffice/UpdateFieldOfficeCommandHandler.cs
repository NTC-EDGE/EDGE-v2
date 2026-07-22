using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public class UpdateFieldOfficeCommandHandler(IFieldOfficeRepository repository, IUnitOfWork unitOfWork) : IRequestHandler<UpdateFieldOfficeCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(UpdateFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (fieldOffice == null)
        {
            return ApiResponse<string>.Fail("Field office not found.");
        }

        fieldOffice.Name = request.Name;
        fieldOffice.RegionId = request.RegionId;
        fieldOffice.Code = request.Code;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success(fieldOffice.Name, "Field office updated successfully.");
    }
}

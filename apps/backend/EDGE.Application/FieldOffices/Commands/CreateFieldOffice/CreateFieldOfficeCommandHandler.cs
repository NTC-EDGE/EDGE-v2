using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public class CreateFieldOfficeCommandHandler(IFieldOfficeRepository repository, IUnitOfWork unitOfWork) : IRequestHandler<CreateFieldOfficeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = new FieldOffice
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            RegionId = request.RegionId,
            Code = request.Code,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(fieldOffice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(fieldOffice.Id, "Field office created successfully.");
    }
}

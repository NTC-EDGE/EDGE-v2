using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.ServiceVariantRequirements.Commands.CreateServiceVariantRequirement;

public class CreateServiceVariantRequirementCommandHandler(
    IServiceVariantRequirementRepository repository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateServiceVariantRequirementCommand, ApiResponse<List<Guid>>>
{
    public async Task<ApiResponse<List<Guid>>> Handle(CreateServiceVariantRequirementCommand request, CancellationToken cancellationToken)
    {
        var createdIds = new List<Guid>();

        foreach (var item in request.Requirements)
        {
            var svr = new ServiceVariantRequirement
            {
                RequirementId = item.RequirementId,
                ServiceVariantId = request.ServiceVariantId,
                ApplicationTypeKey = item.ApplicationTypeKey,
                IsRequired = item.IsRequired
            };

            await repository.AddAsync(svr, cancellationToken);
            createdIds.Add(svr.Id);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<List<Guid>>.Success(createdIds, $"{createdIds.Count} Service Variant Requirements created successfully.");
    }
}

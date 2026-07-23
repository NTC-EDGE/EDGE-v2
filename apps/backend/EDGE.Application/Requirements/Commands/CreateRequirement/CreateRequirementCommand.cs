using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.CreateRequirement;

public record CreateRequirementCommand(string Name, string? Description) : IRequest<ApiResponse<Guid>>;

public class CreateRequirementCommandHandler : IRequestHandler<CreateRequirementCommand, ApiResponse<Guid>>
{
    private readonly IRequirementRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRequirementCommandHandler(IRequirementRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateRequirementCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return ApiResponse<Guid>.Fail("Requirement name cannot be empty.");
        }

        var req = new Requirement
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim()
        };

        await _repository.AddRequirementAsync(req, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(req.Id, "Master requirement created successfully.");
    }
}

using System;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.AttachServiceVariantRequirement;

public record AttachServiceVariantRequirementCommand : IRequest<ApiResponse<Guid>>
{
    // Injected from route params by endpoint — not from request body
    [JsonIgnore]
    public Guid ServiceId { get; init; }
    [JsonIgnore]
    public Guid ServiceVariantId { get; init; }

    // Public request body — only these fields
    public required Guid RequirementId { get; init; }
    public string? ContextKey { get; init; }
    public bool IsRequired { get; init; } = true;
}

public class AttachServiceVariantRequirementCommandHandler : IRequestHandler<AttachServiceVariantRequirementCommand, ApiResponse<Guid>>
{
    private readonly IRequirementRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public AttachServiceVariantRequirementCommandHandler(IRequirementRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(AttachServiceVariantRequirementCommand request, CancellationToken cancellationToken)
    {
        var req = await _repository.GetRequirementByIdAsync(request.RequirementId, cancellationToken);
        if (req == null)
        {
            return ApiResponse<Guid>.Fail($"Requirement with ID '{request.RequirementId}' was not found.");
        }

        var svr = new ServiceVariantRequirement
        {
            ServiceVariantId = request.ServiceVariantId,
            RequirementId = request.RequirementId,
            ContextKey = string.IsNullOrWhiteSpace(request.ContextKey) ? null : request.ContextKey.Trim(),
            IsRequired = request.IsRequired
        };

        await _repository.AddServiceVariantRequirementAsync(svr, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(svr.Id, "Requirement successfully attached to ServiceVariant.");
    }
}

using MediatR;
using EDGE.Application.Elements.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.Elements.Commands.CreateElement;

public class CreateElementCommandHandler : IRequestHandler<CreateElementCommand, ElementDto>
{
    private readonly IElementRepository _elementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateElementCommandHandler(IElementRepository elementRepository, IUnitOfWork unitOfWork)
    {
        _elementRepository = elementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ElementDto> Handle(CreateElementCommand request, CancellationToken cancellationToken)
    {
        var existing = await _elementRepository.GetByCodeAsync(request.Code, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException($"Element with code '{request.Code}' already exists.");
        }

        var element = new Element
        {
            Name = request.Name.Trim(),
            Code = request.Code.Trim().ToUpperInvariant(),
            Description = request.Description?.Trim()
        };

        await _elementRepository.AddAsync(element, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ElementDto(element.Id, element.Name, element.Code, element.Description, element.CreatedAt);
    }
}

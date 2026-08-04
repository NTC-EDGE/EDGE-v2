using MediatR;
using EDGE.Application.Elements.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Elements.Commands.UpdateElement;

public class UpdateElementCommandHandler : IRequestHandler<UpdateElementCommand, ElementDto?>
{
    private readonly IElementRepository _elementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateElementCommandHandler(IElementRepository elementRepository, IUnitOfWork unitOfWork)
    {
        _elementRepository = elementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ElementDto?> Handle(UpdateElementCommand request, CancellationToken cancellationToken)
    {
        var element = await _elementRepository.GetByIdAsync(request.Id, cancellationToken);
        if (element == null)
        {
            return null;
        }

        var existingWithCode = await _elementRepository.GetByCodeAsync(request.Code, cancellationToken);
        if (existingWithCode != null && existingWithCode.Id != element.Id)
        {
            throw new InvalidOperationException($"Another element with code '{request.Code}' already exists.");
        }

        element.Name = request.Name.Trim();
        element.Code = request.Code.Trim().ToUpperInvariant();
        element.Description = request.Description?.Trim();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ElementDto(element.Id, element.Name, element.Code, element.Description, element.CreatedAt);
    }
}

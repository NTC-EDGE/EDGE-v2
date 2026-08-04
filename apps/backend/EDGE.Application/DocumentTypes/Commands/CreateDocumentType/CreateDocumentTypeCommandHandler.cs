using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.DocumentTypes.DTOs;
using EDGE.Domain.Entities;

namespace EDGE.Application.DocumentTypes.Commands.CreateDocumentType;

public class CreateDocumentTypeCommandHandler : IRequestHandler<CreateDocumentTypeCommand, DocumentTypeDto>
{
    private readonly IDocumentTypeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDocumentTypeCommandHandler(IDocumentTypeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DocumentTypeDto> Handle(CreateDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        var docType = new DocumentType
        {
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            IsActive = true
        };

        await _repository.AddAsync(docType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DocumentTypeDto
        {
            Id = docType.Id,
            Code = docType.Code,
            Name = docType.Name,
            Description = docType.Description,
            Category = docType.Category,
            IsActive = docType.IsActive
        };
    }
}

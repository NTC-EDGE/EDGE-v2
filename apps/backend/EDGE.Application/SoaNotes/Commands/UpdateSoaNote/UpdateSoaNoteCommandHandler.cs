using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Commands.UpdateSoaNote;

public class UpdateSoaNoteCommandHandler : IRequestHandler<UpdateSoaNoteCommand, SoaNoteDto>
{
    private readonly ISoaNoteRepository _soaNoteRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService? _currentUserService;

    public UpdateSoaNoteCommandHandler(
        ISoaNoteRepository soaNoteRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService? currentUserService = null)
    {
        _soaNoteRepository = soaNoteRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<SoaNoteDto> Handle(UpdateSoaNoteCommand request, CancellationToken cancellationToken)
    {
        var soaNote = await _soaNoteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (soaNote == null)
        {
            throw new KeyNotFoundException($"SOA note template with ID '{request.Id}' was not found.");
        }

        soaNote.Notes = request.Notes;
        soaNote.Code = request.Code;
        soaNote.Title = request.Title;

        if (request.TenantId.HasValue)
        {
            soaNote.TenantId = request.TenantId.Value;
        }
        else if (soaNote.TenantId == null && _currentUserService?.TenantId.HasValue == true && _currentUserService.TenantId.Value != Guid.Empty)
        {
            soaNote.TenantId = _currentUserService.TenantId.Value;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SoaNoteDto
        {
            Id = soaNote.Id,
            TenantId = soaNote.TenantId,
            TenantName = soaNote.Tenant?.Name,
            Code = soaNote.Code,
            Title = soaNote.Title,
            Notes = soaNote.Notes,
            CreatedAt = soaNote.CreatedAt,
            CreatedBy = soaNote.CreatedBy,
            LastModifiedAt = soaNote.LastModifiedAt,
            LastModifiedBy = soaNote.LastModifiedBy
        };
    }
}

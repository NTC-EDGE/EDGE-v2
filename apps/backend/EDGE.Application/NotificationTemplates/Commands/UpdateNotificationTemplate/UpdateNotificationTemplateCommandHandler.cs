using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.NotificationTemplates.DTOs;

namespace EDGE.Application.NotificationTemplates.Commands.UpdateNotificationTemplate;

public class UpdateNotificationTemplateCommandHandler : IRequestHandler<UpdateNotificationTemplateCommand, NotificationTemplateDto>
{
    private readonly INotificationTemplateRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateNotificationTemplateCommandHandler(INotificationTemplateRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<NotificationTemplateDto> Handle(UpdateNotificationTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (template == null)
        {
            throw new KeyNotFoundException($"Notification template with ID '{request.Id}' was not found.");
        }

        template.Subject = request.Subject;
        template.BodyHtml = request.BodyHtml;
        template.IsActive = request.IsActive;

        _repository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new NotificationTemplateDto
        {
            Id = template.Id,
            EventKey = template.EventKey,
            Name = template.Name,
            Subject = template.Subject,
            BodyHtml = template.BodyHtml,
            AvailablePlaceholders = template.AvailablePlaceholders,
            IsActive = template.IsActive,
            LastModifiedAt = template.LastModifiedAt
        };
    }
}

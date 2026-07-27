using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Helpers;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Feedback.DTOs;

namespace EDGE.Application.Feedback.Commands.SubmitFeedback;

public class SubmitFeedbackCommandHandler : IRequestHandler<SubmitFeedbackCommand, FeedbackDto>
{
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitFeedbackCommandHandler(IFeedbackRepository feedbackRepository, IUnitOfWork unitOfWork)
    {
        _feedbackRepository = feedbackRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FeedbackDto> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var rawName = (request.SenderName ?? string.Empty).Trim();
        var rawEmail = (request.SenderEmail ?? string.Empty).Trim();

        var feedback = new EDGE.Domain.Entities.Feedback
        {
            SenderName = string.IsNullOrWhiteSpace(rawName) ? "Anonymous User" : rawName,
            SenderEmail = string.IsNullOrWhiteSpace(rawEmail) ? "anonymous@hidden.local" : rawEmail,
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
            Rating = request.Rating,
            Status = "Pending",
            IsAnonymous = request.IsAnonymous
        };

        await _feedbackRepository.AddAsync(feedback, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FeedbackDto
        {
            Id = feedback.Id,
            SenderName = feedback.IsAnonymous ? IdentityMasker.MaskName(feedback.SenderName) : feedback.SenderName,
            SenderEmail = feedback.IsAnonymous ? IdentityMasker.MaskEmail(feedback.SenderEmail) : feedback.SenderEmail,
            Subject = feedback.Subject,
            Message = feedback.Message,
            Rating = feedback.Rating,
            Status = feedback.Status,
            IsAnonymous = feedback.IsAnonymous,
            CreatedAt = feedback.CreatedAt
        };
    }
}

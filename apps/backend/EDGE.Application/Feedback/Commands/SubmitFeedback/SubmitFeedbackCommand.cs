using MediatR;
using EDGE.Application.Feedback.DTOs;

namespace EDGE.Application.Feedback.Commands.SubmitFeedback;

public record SubmitFeedbackCommand(
    string SenderName,
    string SenderEmail,
    string Subject,
    string Message,
    int Rating,
    bool IsAnonymous = false
) : IRequest<FeedbackDto>;

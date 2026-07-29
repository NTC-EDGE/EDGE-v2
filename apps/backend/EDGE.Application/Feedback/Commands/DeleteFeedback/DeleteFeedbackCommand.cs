using System;
using MediatR;

namespace EDGE.Application.Feedback.Commands.DeleteFeedback;

public record DeleteFeedbackCommand(Guid Id) : IRequest<bool>;

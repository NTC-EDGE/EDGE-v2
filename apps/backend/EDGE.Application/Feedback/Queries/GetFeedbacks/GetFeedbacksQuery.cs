using System.Collections.Generic;
using MediatR;
using EDGE.Application.Feedback.DTOs;

namespace EDGE.Application.Feedback.Queries.GetFeedbacks;

public record GetFeedbacksQuery : IRequest<List<FeedbackDto>>;

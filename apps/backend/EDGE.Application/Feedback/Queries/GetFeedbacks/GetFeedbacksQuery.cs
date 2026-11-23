using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Feedback.DTOs;

namespace EDGE.Application.Feedback.Queries.GetFeedbacks;

public record GetFeedbacksQuery(Guid? TenantId = null) : IRequest<List<FeedbackDto>>;


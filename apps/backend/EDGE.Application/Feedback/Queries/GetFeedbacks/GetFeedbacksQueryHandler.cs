using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Helpers;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Feedback.DTOs;

namespace EDGE.Application.Feedback.Queries.GetFeedbacks;

public class GetFeedbacksQueryHandler : IRequestHandler<GetFeedbacksQuery, List<FeedbackDto>>
{
    private readonly IFeedbackRepository _feedbackRepository;

    public GetFeedbacksQueryHandler(IFeedbackRepository feedbackRepository)
    {
        _feedbackRepository = feedbackRepository;
    }

    public async Task<List<FeedbackDto>> Handle(GetFeedbacksQuery request, CancellationToken cancellationToken)
    {
        var items = await _feedbackRepository.GetAllAsync(cancellationToken);
        return items
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FeedbackDto
            {
                Id = f.Id,
                SenderName = f.IsAnonymous ? IdentityMasker.MaskName(f.SenderName) : f.SenderName,
                SenderEmail = f.IsAnonymous ? IdentityMasker.MaskEmail(f.SenderEmail) : f.SenderEmail,
                Subject = f.Subject,
                Message = f.Message,
                Rating = f.Rating,
                Status = f.Status,
                IsAnonymous = f.IsAnonymous,
                CreatedAt = f.CreatedAt
            }).ToList();
    }
}

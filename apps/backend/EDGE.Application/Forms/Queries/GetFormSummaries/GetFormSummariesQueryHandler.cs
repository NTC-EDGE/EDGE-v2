using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormSummaries;

public class GetFormSummariesQueryHandler : IRequestHandler<GetFormSummariesQuery, PaginatedApiResponse<FormSummaryDto>>
{
    private readonly IFormRepository _formRepository;

    public GetFormSummariesQueryHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<PaginatedApiResponse<FormSummaryDto>> Handle(GetFormSummariesQuery request, CancellationToken cancellationToken)
    {
        int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        int pageSize = request.PageSize <= 0 ? 50 : request.PageSize;

        var (items, totalCount) = await _formRepository.GetFormSummariesAsync(
            pageNumber,
            pageSize,
            request.SearchTerm,
            request.ServiceId,
            request.FormKey,
            request.ServiceCategoryId,
            request.IsActive,
            cancellationToken);

        return new PaginatedApiResponse<FormSummaryDto>(
            items,
            pageNumber,
            pageSize,
            totalCount,
            "Form summaries retrieved successfully.");
    }
}

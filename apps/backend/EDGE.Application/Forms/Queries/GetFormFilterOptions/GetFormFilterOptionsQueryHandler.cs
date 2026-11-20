using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormFilterOptions;

public class GetFormFilterOptionsQueryHandler : IRequestHandler<GetFormFilterOptionsQuery, ApiResponse<FormFilterOptionsDto>>
{
    private readonly IFormRepository _formRepository;

    public GetFormFilterOptionsQueryHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<FormFilterOptionsDto>> Handle(GetFormFilterOptionsQuery request, CancellationToken cancellationToken)
    {
        var data = await _formRepository.GetFormFilterOptionsAsync(cancellationToken);
        return ApiResponse<FormFilterOptionsDto>.Success(data, "Form filter options retrieved successfully.");
    }
}

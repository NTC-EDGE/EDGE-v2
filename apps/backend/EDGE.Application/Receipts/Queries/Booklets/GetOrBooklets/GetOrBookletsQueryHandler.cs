using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.Booklets.GetOrBooklets;

public record GetOrBookletsQuery(
    Guid TenantId,
    BookletStatus? Status = null
) : IRequest<ApiResponse<List<OrBookletDto>>>;

public class GetOrBookletsQueryHandler : IRequestHandler<GetOrBookletsQuery, ApiResponse<List<OrBookletDto>>>
{
    private readonly IOrBookletRepository _bookletRepository;

    public GetOrBookletsQueryHandler(IOrBookletRepository bookletRepository)
    {
        _bookletRepository = bookletRepository;
    }

    public async Task<ApiResponse<List<OrBookletDto>>> Handle(GetOrBookletsQuery request, CancellationToken cancellationToken)
    {
        var booklets = await _bookletRepository.GetByTenantAsync(request.TenantId, request.Status, cancellationToken);

        var dtos = booklets.Select(b => new OrBookletDto(
            b.Id,
            b.TenantId,
            b.BookletNumber,
            b.Prefix,
            b.StartNumber,
            b.EndNumber,
            b.CurrentNumber,
            b.TotalCount,
            b.IssuedCount,
            b.RemainingCount,
            b.FormatOrNumber(b.StartNumber),
            b.FormatOrNumber(b.EndNumber),
            b.CurrentFormattedOrNumber,
            b.AssignedUserId,
            b.AssignedUser != null ? $"{b.AssignedUser.FirstName} {b.AssignedUser.LastName}".Trim() : null,
            b.Status,
            b.ReceivedDate,
            b.Remarks
        )).ToList();

        return ApiResponse<List<OrBookletDto>>.Success(dtos);
    }
}

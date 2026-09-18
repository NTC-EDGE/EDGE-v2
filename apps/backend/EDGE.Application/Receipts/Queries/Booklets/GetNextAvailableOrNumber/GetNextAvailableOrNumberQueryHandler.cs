using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.Booklets.GetNextAvailableOrNumber;

public record NextAvailableOrDto(
    Guid? BookletId,
    string? BookletNumber,
    string? FormattedOrNumber,
    long? RawNumber,
    int RemainingCount,
    bool HasActiveBooklet
);

public record GetNextAvailableOrNumberQuery(
    Guid TenantId,
    Guid? CashierUserId = null
) : IRequest<ApiResponse<NextAvailableOrDto>>;

public class GetNextAvailableOrNumberQueryHandler : IRequestHandler<GetNextAvailableOrNumberQuery, ApiResponse<NextAvailableOrDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetNextAvailableOrNumberQueryHandler(
        IOrBookletRepository bookletRepository,
        ICurrentUserService currentUserService)
    {
        _bookletRepository = bookletRepository;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<NextAvailableOrDto>> Handle(GetNextAvailableOrNumberQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = Guid.TryParse(_currentUserService.UserId, out var uid) ? uid : (Guid?)null;
        var targetUserId = request.CashierUserId ?? currentUserId;

        var booklet = await _bookletRepository.GetActiveBookletAsync(request.TenantId, targetUserId, cancellationToken)
                      ?? await _bookletRepository.GetActiveBookletAsync(request.TenantId, null, cancellationToken);

        if (booklet == null || booklet.RemainingCount <= 0)
        {
            return ApiResponse<NextAvailableOrDto>.Success(new NextAvailableOrDto(
                null,
                null,
                null,
                null,
                0,
                false
            ), "No active OR booklet available.");
        }

        return ApiResponse<NextAvailableOrDto>.Success(new NextAvailableOrDto(
            booklet.Id,
            booklet.BookletNumber,
            booklet.CurrentFormattedOrNumber,
            booklet.CurrentNumber,
            booklet.RemainingCount,
            true
        ));
    }
}

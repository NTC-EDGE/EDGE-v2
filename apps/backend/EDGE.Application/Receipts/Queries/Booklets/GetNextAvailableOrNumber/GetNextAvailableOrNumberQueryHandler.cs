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
    string? Prefix,
    string? FormattedOrNumber,
    long? RawNumber,
    long? StartNumber,
    long? EndNumber,
    string? FormattedStartNumber,
    string? FormattedEndNumber,
    int TotalCount,
    int IssuedCount,
    int RemainingCount,
    bool HasActiveBooklet
);

public record GetNextAvailableOrNumberQuery(
    Guid TenantId,
    string? CashierUserId = null
) : IRequest<ApiResponse<NextAvailableOrDto>>;

public class GetNextAvailableOrNumberQueryHandler : IRequestHandler<GetNextAvailableOrNumberQuery, ApiResponse<NextAvailableOrDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetNextAvailableOrNumberQueryHandler(
        IOrBookletRepository bookletRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _bookletRepository = bookletRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<NextAvailableOrDto>> Handle(GetNextAvailableOrNumberQuery request, CancellationToken cancellationToken)
    {
        Guid? targetUserId = null;
        var userIdToResolve = !string.IsNullOrWhiteSpace(request.CashierUserId)
            ? request.CashierUserId
            : _currentUserService.UserId;

        if (!string.IsNullOrWhiteSpace(userIdToResolve))
        {
            var userContext = await _userRepository.GetStaffUserContextAsync(userIdToResolve, "Cashier", cancellationToken);
            targetUserId = userContext.UserId;
        }

        var booklet = (targetUserId.HasValue ? await _bookletRepository.GetActiveBookletAsync(request.TenantId, targetUserId.Value, cancellationToken) : null)
                      ?? await _bookletRepository.GetActiveBookletAsync(request.TenantId, null, cancellationToken);

        if (booklet == null || booklet.RemainingCount <= 0)
        {
            return ApiResponse<NextAvailableOrDto>.Success(new NextAvailableOrDto(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                0,
                false
            ), "No active OR booklet available.");
        }

        return ApiResponse<NextAvailableOrDto>.Success(new NextAvailableOrDto(
            booklet.Id,
            booklet.BookletNumber,
            booklet.Prefix,
            booklet.CurrentFormattedOrNumber,
            booklet.CurrentNumber,
            booklet.StartNumber,
            booklet.EndNumber,
            booklet.FormatOrNumber(booklet.StartNumber),
            booklet.FormatOrNumber(booklet.EndNumber),
            booklet.TotalCount,
            booklet.IssuedCount,
            booklet.RemainingCount,
            true
        ));
    }
}

using Microsoft.AspNetCore.Http;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Services;

public class UserActivityService : IUserActivityService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserActivityService(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _currentUserService = currentUserService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogActivityAsync(string activityType, string description, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId ?? "System";
        var ip = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown";

        var log = new ActivityLog
        {
            ActivityType = activityType,
            Description = description,
            UserId = userId,
            IpAddress = ip
        };

        _context.ActivityLogs.Add(log);
        // Save using direct DbContext so we don't depend on UnitOfWork for tracking audits separately
        await _context.SaveChangesAsync(cancellationToken);
    }
}

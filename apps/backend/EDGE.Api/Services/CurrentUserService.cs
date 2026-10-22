using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace EDGE.Api.Services;

/// <summary>
/// Backward-compatible adapter for <see cref="EDGE.Infrastructure.Services.CurrentUserService"/>.
/// </summary>
public class CurrentUserService : EDGE.Infrastructure.Services.CurrentUserService
{
    public CurrentUserService(IHttpContextAccessor httpContextAccessor, IConfiguration? configuration = null)
        : base(httpContextAccessor, configuration)
    {
    }
}

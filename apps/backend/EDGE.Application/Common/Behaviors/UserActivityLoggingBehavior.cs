using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Common.Behaviors;

public class UserActivityLoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IUserActivityService _activityService;

    public UserActivityLoggingBehavior(IUserActivityService activityService)
    {
        _activityService = activityService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        var response = await next();

        // Automatically log write actions (Commands)
        if (requestName.EndsWith("Command"))
        {
            await _activityService.LogActivityAsync(
                requestName,
                $"Executed business command: {requestName}",
                cancellationToken);
        }

        return response;
    }
}

namespace EDGE.Application.Common.Interfaces;

public interface IUserActivityService
{
    Task LogActivityAsync(string activityType, string description, CancellationToken cancellationToken = default);
}

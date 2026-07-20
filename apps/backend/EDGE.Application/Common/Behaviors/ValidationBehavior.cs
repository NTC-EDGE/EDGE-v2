using FluentValidation;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : class
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var failures = (await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(context, cancellationToken))))
            .SelectMany(result => result.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count == 0)
            return await next();

        // If TResponse is an ApiResponse<T>, return the failure via the ApiResponse pattern
        var errors = failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(f => f.ErrorMessage).ToArray());

        var responseType = typeof(TResponse);

        if (responseType.IsGenericType && responseType.GetGenericTypeDefinition() == typeof(ApiResponse<>))
        {
            var innerType = responseType.GetGenericArguments()[0];
            var failMethod = responseType.GetMethod(nameof(ApiResponse<object>.Fail), [typeof(IDictionary<string, string[]>), typeof(string)]);

            if (failMethod != null)
            {
                var failResponse = failMethod.Invoke(null, [errors, "Validation failed."]);
                if (failResponse is TResponse typedResponse)
                    return typedResponse;
            }
        }

        // Fallback: throw a validation exception for non-ApiResponse responses
        throw new ValidationException(failures);
    }
}

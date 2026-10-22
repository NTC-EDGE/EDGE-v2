using System.Text.Json.Serialization;
using Errors = System.Collections.Generic.IDictionary<string, string[]>;

namespace EDGE.Application.Common.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ApiErrorCode
{
    None = 0,
    NotFound = 1,
    Validation = 2,
    Conflict = 3,
    Unauthorized = 4,
    Forbidden = 5,
    BadRequest = 6,
    InternalError = 7
}

public class ApiResponse<T>
{
    public bool Succeeded { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public Errors? Errors { get; set; }
    public ApiErrorCode ErrorCode { get; set; } = ApiErrorCode.None;

    public bool IsNotFound => ErrorCode == ApiErrorCode.NotFound;

    public static ApiResponse<T> Success(T data, string? message = null)
    {
        return new ApiResponse<T> { Succeeded = true, Data = data, Message = message };
    }

    public static ApiResponse<T> Fail(string message, ApiErrorCode errorCode = ApiErrorCode.BadRequest)
    {
        return new ApiResponse<T> { Succeeded = false, Message = message, ErrorCode = errorCode };
    }

    public static ApiResponse<T> NotFound(string message)
    {
        return new ApiResponse<T> { Succeeded = false, Message = message, ErrorCode = ApiErrorCode.NotFound };
    }

    public static ApiResponse<T> Fail(Errors errors, string message, ApiErrorCode errorCode = ApiErrorCode.Validation)
    {
        return new ApiResponse<T> { Succeeded = false, Errors = errors, Message = message, ErrorCode = errorCode };
    }
}

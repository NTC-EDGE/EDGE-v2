namespace EDGE.Application.ServiceFees.DTOs;

public record ServiceFeeDto(
    Guid Id,
    Guid ServiceId,
    string? ServiceName,
    string? ServiceCode,
    Guid FeeId,
    string? FeeCode,
    string? FeeName,
    decimal Amount,
    bool IsActive,
    DateTime CreatedAt
);

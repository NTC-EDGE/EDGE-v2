namespace EDGE.Application.ServiceFees.DTOs;

public record ServiceFeeDto(
    Guid Id,
    Guid ServiceId,
    Guid FeeId,
    string? FeeCode,
    string? FeeName,
    decimal Amount,
    bool IsActive,
    DateTime CreatedAt
);

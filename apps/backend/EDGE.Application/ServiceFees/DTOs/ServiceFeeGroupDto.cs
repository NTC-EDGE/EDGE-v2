using System;
using System.Collections.Generic;

namespace EDGE.Application.ServiceFees.DTOs;

public record ServiceFeeGroupDto(
    Guid ServiceId,
    string? ServiceName,
    string? ServiceCode,
    decimal TotalAmount,
    IReadOnlyList<ServiceFeeDto> Fees
);

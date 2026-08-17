using System;

namespace EDGE.Application.Tenants.DTOs;

public record TenantTransactionDto(
    Guid Id,
    string RefNo,
    string ApplicantName,
    string ServiceType,
    decimal Amount,
    string PaymentStatus,
    string Date
);

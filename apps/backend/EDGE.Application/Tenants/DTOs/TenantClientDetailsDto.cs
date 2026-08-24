using System;
using System.Collections.Generic;

namespace EDGE.Application.Tenants.DTOs;

public record TenantClientDetailsDto(
    Guid Id,
    Guid? UserId,
    string Name,
    string Email,
    string ContactNumber,
    string Address,
    string Nationality,
    string? Sex,
    string? BirthDate,
    string? Organization,
    string? CompanyRegistrationNumber,
    string? CompanyAddress,
    string? CompanyEmail,
    string? CompanyContactNumber,
    string ServiceType,
    string ServiceCode,
    string ApplicationNumber,
    string ReferenceNumber,
    string Status,
    string ApplicationMode,
    int TotalApplications,
    DateTime RegisteredDate,
    List<TenantClientTransactionDto> Transactions
);

public record TenantClientTransactionDto(
    Guid Id,
    string RefNo,
    string Type,
    decimal Amount,
    string Status,
    DateTime Date
);

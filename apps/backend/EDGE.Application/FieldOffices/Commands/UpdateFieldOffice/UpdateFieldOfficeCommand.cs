using System;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public record UpdateFieldOfficeCommand(
    Guid Id,
    Guid? TenantId = null,
    string? Name = null,
    string? Code = null,
    FieldOfficeCategory? Category = null,
    string? Description = null,
    Guid? RegionId = null,
    Guid? ProvinceId = null,
    string? Address = null,
    string? ContactPhone = null,
    string? ContactEmail = null,
    Guid? OfficerInChargeId = null,
    bool IsActive = true,
    bool AllowSpectrumInspection = true,
    bool AllowPermitIssuance = true,
    bool AllowComplaintReception = true
) : IRequest<FieldOfficeDto?>;

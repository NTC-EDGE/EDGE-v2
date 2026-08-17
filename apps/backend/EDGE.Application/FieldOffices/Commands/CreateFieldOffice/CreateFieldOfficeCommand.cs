using System;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public record CreateFieldOfficeCommand(
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
    bool IsActive = false,
    bool AllowSpectrumInspection = true,
    bool AllowPermitIssuance = true,
    bool AllowComplaintReception = true
) : IRequest<FieldOfficeDto>;

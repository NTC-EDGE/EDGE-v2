using MediatR;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public record CreateFieldOfficeCommand(
    Guid TenantId,
    string Name,
    string Code,
    string? Description,
    Guid RegionId,
    Guid? ProvinceId,
    string Address,
    string ContactPhone,
    string ContactEmail,
    string OfficerInCharge,
    bool IsActive = true,
    bool AllowSpectrumInspection = true,
    bool AllowPermitIssuance = true,
    bool AllowComplaintReception = true
) : IRequest<FieldOfficeDto>;

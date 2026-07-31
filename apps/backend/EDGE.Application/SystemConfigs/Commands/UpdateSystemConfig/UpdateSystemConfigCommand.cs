using MediatR;
using EDGE.Application.SystemConfigs.DTOs;

namespace EDGE.Application.SystemConfigs.Commands.UpdateSystemConfig;

public record UpdateSystemConfigCommand(
    string Key,
    string Value,
    string? Description = null,
    string? Category = null
) : IRequest<SystemConfigDto>;

using System.Collections.Generic;
using MediatR;
using EDGE.Application.SystemConfigs.DTOs;

namespace EDGE.Application.SystemConfigs.Queries.GetSystemConfigs;

public record GetSystemConfigsQuery(string? Category = null, bool PublicOnly = false) : IRequest<List<SystemConfigDto>>;

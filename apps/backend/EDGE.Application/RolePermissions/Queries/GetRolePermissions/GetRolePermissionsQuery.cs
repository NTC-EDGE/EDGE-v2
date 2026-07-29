using System;
using System.Collections.Generic;
using MediatR;

namespace EDGE.Application.RolePermissions.Queries.GetRolePermissions;

public record GetRolePermissionsQuery(Guid RoleId) : IRequest<List<string>>;

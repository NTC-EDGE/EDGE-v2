using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Queries;

public record GetMyTenantMembershipsQuery : IRequest<ApiResponse<List<TenantRegionMembershipDto>>>;

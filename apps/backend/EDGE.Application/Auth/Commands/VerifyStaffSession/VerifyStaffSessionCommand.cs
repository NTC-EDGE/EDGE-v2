using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Auth.Commands.VerifyStaffSession;

public record VerifyStaffSessionCommand(
    string SelectedRegion
) : IRequest<ApiResponse<VerifyStaffSessionDto>>;

using System;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applicants.Commands.CreateApplicant;

public record CreateApplicantCommand(
    Guid TenantId,
    Guid? UserId,
    bool IsGuest,
    string ApplicantType
) : IRequest<ApiResponse<ApplicantDto>>;

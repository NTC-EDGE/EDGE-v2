using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.VerifyExamAdmissionQr;

public record VerifyExamAdmissionQrQuery(
    string Code,
    Guid? ScheduleId = null,
    Guid? TenantId = null
) : IRequest<ApiResponse<ExamAdmissionVerificationDto>>;

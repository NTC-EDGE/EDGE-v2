using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetScheduleExaminees;

public record GetScheduleExamineesQuery(
    Guid? ScheduleId = null,
    Guid? TenantId = null
) : IRequest<ApiResponse<List<ExamAdmissionVerificationDto>>>;

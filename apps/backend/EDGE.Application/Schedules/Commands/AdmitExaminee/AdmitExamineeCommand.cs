using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.AdmitExaminee;

public record AdmitExamineeCommand(
    string? Code,
    Guid? IssuedDocumentId = null,
    Guid? ApplicationId = null,
    Guid? ApplicantId = null,
    Guid? ScheduleId = null,
    Guid? TenantId = null,
    string? Remarks = null
) : IRequest<ApiResponse<ExamAdmissionVerificationDto>>;

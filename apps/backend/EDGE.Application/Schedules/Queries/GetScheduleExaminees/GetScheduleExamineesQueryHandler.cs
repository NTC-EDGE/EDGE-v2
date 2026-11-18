using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetScheduleExaminees;

public class GetScheduleExamineesQueryHandler
    : IRequestHandler<GetScheduleExamineesQuery, ApiResponse<List<ExamAdmissionVerificationDto>>>
{
    private readonly IApplicationFullRepository _repository;

    public GetScheduleExamineesQueryHandler(IApplicationFullRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<List<ExamAdmissionVerificationDto>>> Handle(
        GetScheduleExamineesQuery request,
        CancellationToken cancellationToken)
    {
        var apps = await _repository.GetExamApplicationsForAdmissionAsync(
            request.ScheduleId,
            request.TenantId,
            cancellationToken);

        var examinees = apps
            .SelectMany(ExamAdmissionMapper.MapApplicationToExamineeDtos)
            .OrderByDescending(e => e.IsAdmitted)
            .ThenByDescending(e => e.AdmittedAt)
            .ThenBy(e => e.ExamineeName)
            .ToList();

        return ApiResponse<List<ExamAdmissionVerificationDto>>.Success(
            examinees,
            $"Retrieved {examinees.Count} examinee record(s).");
    }
}

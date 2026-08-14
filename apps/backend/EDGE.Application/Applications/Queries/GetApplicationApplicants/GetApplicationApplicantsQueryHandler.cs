using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicationApplicants;

public class GetApplicationApplicantsQueryHandler : IRequestHandler<GetApplicationApplicantsQuery, ApiResponse<List<ApplicantDto>>>
{
    private readonly IApplicationFullRepository _repository;

    public GetApplicationApplicantsQueryHandler(IApplicationFullRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<List<ApplicantDto>>> Handle(GetApplicationApplicantsQuery request, CancellationToken cancellationToken)
    {
        var applicants = await _repository.GetApplicationApplicantsAsync(request.ApplicationId, cancellationToken);
        return ApiResponse<List<ApplicantDto>>.Success(applicants, "Application applicants retrieved successfully.");
    }
}

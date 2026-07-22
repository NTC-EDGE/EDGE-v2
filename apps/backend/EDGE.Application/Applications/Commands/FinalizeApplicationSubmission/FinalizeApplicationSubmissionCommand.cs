using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;

public record FinalizeApplicationSubmissionCommand(Guid Id) : IRequest<ApiResponse<Guid>>;

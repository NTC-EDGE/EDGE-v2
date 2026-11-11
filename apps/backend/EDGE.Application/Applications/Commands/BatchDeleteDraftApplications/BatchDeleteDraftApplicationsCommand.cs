using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.BatchDeleteDraftApplications;

public record BatchDeleteDraftApplicationsCommand(List<Guid> Ids) : IRequest<ApiResponse<int>>;

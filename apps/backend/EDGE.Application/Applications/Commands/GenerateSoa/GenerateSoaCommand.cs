using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.GenerateSoa;

public record GenerateSoaCommand(Guid ApplicationId) : IRequest<ApiResponse<List<Guid>>>;

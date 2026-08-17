using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Forms.Commands.DeleteForm;

public record DeleteFormCommand(Guid Id) : IRequest<ApiResponse<bool>>;

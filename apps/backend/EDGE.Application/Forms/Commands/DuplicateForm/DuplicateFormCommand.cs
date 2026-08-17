using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.DuplicateForm;

public record DuplicateFormCommand(Guid Id, string? Version = null) : IRequest<ApiResponse<FormDto>>;

using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.ActivateForm;

public record ActivateFormCommand(Guid Id) : IRequest<ApiResponse<FormDto>>;

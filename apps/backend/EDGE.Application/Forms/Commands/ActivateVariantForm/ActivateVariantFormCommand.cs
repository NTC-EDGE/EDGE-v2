using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Forms.Commands.ActivateVariantForm;

public record ActivateVariantFormCommand(Guid VariantId, bool IsActive) : IRequest<ApiResponse<bool>>;

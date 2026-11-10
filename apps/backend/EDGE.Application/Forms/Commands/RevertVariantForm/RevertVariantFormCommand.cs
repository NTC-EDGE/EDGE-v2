using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Forms.Commands.RevertVariantForm;

public record RevertVariantFormCommand(Guid VariantId) : IRequest<ApiResponse<bool>>;

using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Forms.Commands.ActivateVariantForm;

public class ActivateVariantFormCommandHandler : IRequestHandler<ActivateVariantFormCommand, ApiResponse<bool>>
{
    private readonly IFormRepository _formRepository;

    public ActivateVariantFormCommandHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<bool>> Handle(ActivateVariantFormCommand request, CancellationToken cancellationToken)
    {
        var succeeded = await _formRepository.SetVariantFormActiveAsync(request.VariantId, request.IsActive, cancellationToken);
        if (!succeeded)
        {
            return ApiResponse<bool>.Fail("No customized form exists for this variant to toggle activation.");
        }

        var statusWord = request.IsActive ? "activated" : "deactivated";
        return ApiResponse<bool>.Success(true, $"Variant form successfully {statusWord}.");
    }
}

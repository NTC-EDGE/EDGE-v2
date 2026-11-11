using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Forms.Commands.RevertVariantForm;

public class RevertVariantFormCommandHandler : IRequestHandler<RevertVariantFormCommand, ApiResponse<bool>>
{
    private readonly IFormRepository _formRepository;

    public RevertVariantFormCommandHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<bool>> Handle(RevertVariantFormCommand request, CancellationToken cancellationToken)
    {
        var succeeded = await _formRepository.RevertVariantFormAsync(request.VariantId, cancellationToken);
        return succeeded
            ? ApiResponse<bool>.Success(true, "Variant form customizations removed; restored inheritance from base form template.")
            : ApiResponse<bool>.Fail("Failed to revert variant form.");
    }
}

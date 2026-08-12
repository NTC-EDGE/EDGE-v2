using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ToggleArchiveApplication;

public class ToggleArchiveApplicationCommandHandler : IRequestHandler<ToggleArchiveApplicationCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;

    public ToggleArchiveApplicationCommandHandler(IApplicationFullRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<bool>> Handle(ToggleArchiveApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<bool>.Fail("Application not found.");
        }

        app.IsArchived = request.IsArchived ?? !app.IsArchived;
        await _repository.UpdateAsync(app, cancellationToken);

        return ApiResponse<bool>.Success(app.IsArchived, $"Application archive status set to {app.IsArchived}.");
    }
}

using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.TogglePinApplication;

public class TogglePinApplicationCommandHandler : IRequestHandler<TogglePinApplicationCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public TogglePinApplicationCommandHandler(IApplicationFullRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(TogglePinApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<bool>.Fail("Application not found.");
        }

        app.IsPinned = request.IsPinned ?? !app.IsPinned;
        await _repository.UpdateAsync(app, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(app.IsPinned, $"Application pin status set to {app.IsPinned}.");
    }
}

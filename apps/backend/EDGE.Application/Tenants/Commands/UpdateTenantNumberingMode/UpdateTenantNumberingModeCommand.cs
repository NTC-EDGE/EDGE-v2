using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;

namespace EDGE.Application.Tenants.Commands.UpdateTenantNumberingMode;

public record UpdateTenantNumberingModeCommand(
    Guid TenantId,
    bool AllowManualSoaNumber,
    bool AllowManualOpNumber,
    string? RcCodeSoa = null,
    string? RcCodeOp = null
) : IRequest<ApiResponse<RegionalConfigurationDto>>;

public class UpdateTenantNumberingModeCommandValidator : AbstractValidator<UpdateTenantNumberingModeCommand>
{
    public UpdateTenantNumberingModeCommandValidator()
    {
        RuleFor(x => x.RcCodeSoa)
            .MaximumLength(20)
            .WithMessage("RC Code (SOA) cannot exceed 20 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.RcCodeSoa));

        RuleFor(x => x.RcCodeOp)
            .MaximumLength(20)
            .WithMessage("RC Code (OP) cannot exceed 20 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.RcCodeOp));
    }
}

public class UpdateTenantNumberingModeCommandHandler : IRequestHandler<UpdateTenantNumberingModeCommand, ApiResponse<RegionalConfigurationDto>>
{
    private readonly IRegionalConfigurationService _regionalConfigService;
    private readonly ITenantContextService _tenantContextService;

    public UpdateTenantNumberingModeCommandHandler(
        IRegionalConfigurationService regionalConfigService,
        ITenantContextService tenantContextService)
    {
        _regionalConfigService = regionalConfigService;
        _tenantContextService = tenantContextService;
    }

    public async Task<ApiResponse<RegionalConfigurationDto>> Handle(UpdateTenantNumberingModeCommand request, CancellationToken cancellationToken)
    {
        var targetTenantId = request.TenantId != Guid.Empty
            ? request.TenantId
            : (_tenantContextService.TenantId ?? Guid.Empty);

        var updated = await _regionalConfigService.UpdateNumberingModeAsync(
            targetTenantId,
            request.AllowManualSoaNumber,
            request.AllowManualOpNumber,
            request.RcCodeSoa,
            request.RcCodeOp,
            cancellationToken);

        return ApiResponse<RegionalConfigurationDto>.Success(
            updated,
            "Regional SOA and OP numbering configuration updated successfully.");
    }
}

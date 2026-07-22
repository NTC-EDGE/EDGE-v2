using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Forms.Queries.GetFormByServiceId;

public class GetFormByServiceIdQueryHandler : IRequestHandler<GetFormByServiceIdQuery, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ContractFormValidator _contractValidator;

    public GetFormByServiceIdQueryHandler(
        IFormRepository formRepository,
        IServiceRepository serviceRepository,
        ContractFormValidator contractValidator)
    {
        _formRepository = formRepository;
        _serviceRepository = serviceRepository;
        _contractValidator = contractValidator;
    }

    public async Task<ApiResponse<FormDto>> Handle(GetFormByServiceIdQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            return ApiResponse<FormDto>.Fail($"Service with ID {request.ServiceId} was not found.");
        }

        var form = await _formRepository.GetFormByServiceIdAsync(request.ServiceId, cancellationToken);
        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form layout for Service ID {request.ServiceId} was not found.");
        }

        // Step 4 — Run ContractFormValidator before returning.
        // Surfaces seeding mistakes immediately (e.g. a required section key in the
        // contract that has no matching FormSection) rather than serving a broken form.
        if (!string.IsNullOrWhiteSpace(service.Contract))
        {
            var validationResult = _contractValidator.Validate(service.Contract, form);
            if (!validationResult.IsValid)
            {
                return ApiResponse<FormDto>.Fail(
                    $"Form layout validation failed: {string.Join("; ", validationResult.Errors)}");
            }
        }

        // Build the set of required section keys from the contract to populate
        // the `required` flag on each section DTO — used by the frontend.
        var requiredSectionKeys = !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new System.Collections.Generic.HashSet<string>();

        var dto = new FormDto
        {
            FormId = form.Id,
            ServiceId = form.ServiceId,
            Version = form.Version,
            Sections = form.Sections
                .OrderBy(s => s.OrderIndex)
                .Select(fs => new FormSectionDto
                {
                    Key = fs.Key,
                    Title = fs.Title,
                    Required = requiredSectionKeys.Contains(fs.Key),
                    OrderIndex = fs.OrderIndex,
                    Fields = fs.SectionFields
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => new FormFieldDto
                        {
                            FieldId = sf.FieldId,
                            Label = sf.Field?.Label ?? string.Empty,
                            Type = sf.Field?.FieldType ?? string.Empty,
                            IsRequired = sf.IsRequired,
                            OrderIndex = sf.OrderIndex,
                            ValidationRules = sf.Field?.ValidationRules,
                            VisibilityCondition = sf.VisibilityCondition
                        }).ToList()
                }).ToList()
        };

        return ApiResponse<FormDto>.Success(dto);
    }
}

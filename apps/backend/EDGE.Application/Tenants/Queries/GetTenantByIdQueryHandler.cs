using System.Linq;
using System.Collections.Generic;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries;

public class GetTenantByIdQueryHandler : IRequestHandler<GetTenantByIdQuery, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IFieldOfficeRepository _fieldOfficeRepository;
    private readonly IUserRepository _userRepository;
    private readonly IGeographicRepository _geographicRepository;

    public GetTenantByIdQueryHandler(
        ITenantRepository tenantRepository,
        ITenantMemberRepository tenantMemberRepository,
        IFieldOfficeRepository fieldOfficeRepository,
        IUserRepository userRepository,
        IGeographicRepository geographicRepository)
    {
        _tenantRepository = tenantRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _fieldOfficeRepository = fieldOfficeRepository;
        _userRepository = userRepository;
        _geographicRepository = geographicRepository;
    }

    public async Task<TenantDto> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (t == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.Id}' was not found.");
        }

        var members = await _tenantMemberRepository.GetMembersByTenantAsync(t.Id, cancellationToken);
        var tenantMembersTotal = members.Count;
        var memberUserIds = members.Select(m => m.UserId).ToHashSet();

        var offices = await _fieldOfficeRepository.GetByTenantIdAsync(t.Id, cancellationToken);
        var fieldOfficesCount = offices.Count;

        var provinces = await _geographicRepository.GetProvincesAsync(t.RegionId, activeOnly: null, cancellationToken);
        var municipalities = new List<Municipality>();
        foreach (var prov in provinces)
        {
            municipalities.AddRange(await _geographicRepository.GetMunicipalitiesAsync(prov.Id, activeOnly: null, cancellationToken));
        }

        var barangays = new List<Barangay>();
        foreach (var muni in municipalities)
        {
            barangays.AddRange(await _geographicRepository.GetBarangaysAsync(muni.Id, activeOnly: null, cancellationToken));
        }
        var barangayIds = barangays.Select(b => b.Id).ToHashSet();

        var allUsers = await _userRepository.GetAllAsync(cancellationToken);
        var clientTotal = allUsers.Count(u => u.BarangayId.HasValue && barangayIds.Contains(u.BarangayId.Value) && !memberUserIds.Contains(u.Id));

        return new TenantDto
        {
            Id = t.Id,
            Name = t.Name,
            Code = t.Code,
            Description = t.Description,
            IsActive = t.IsActive,
            RegionId = t.RegionId,
            CreatedAt = t.CreatedAt,
            CreatedBy = t.CreatedBy,
            LastModifiedAt = t.LastModifiedAt,
            LastModifiedBy = t.LastModifiedBy,
            TenantMembersTotal = tenantMembersTotal,
            ClientTotal = clientTotal,
            FieldOfficesCount = fieldOfficesCount
        };
    }
}

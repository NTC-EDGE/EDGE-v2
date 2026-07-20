using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IGeographicRepository
{
    // Regions
    Task<List<Region>> GetRegionsAsync(bool? activeOnly, CancellationToken cancellationToken = default);
    Task<Region?> GetRegionByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddRegionAsync(Region region, CancellationToken cancellationToken = default);
    void DeleteRegion(Region region);

    // Provinces
    Task<List<Province>> GetProvincesAsync(Guid? regionId, bool? activeOnly, CancellationToken cancellationToken = default);
    Task<Province?> GetProvinceByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddProvinceAsync(Province province, CancellationToken cancellationToken = default);
    void DeleteProvince(Province province);

    // Municipalities
    Task<List<Municipality>> GetMunicipalitiesAsync(Guid? provinceId, bool? activeOnly, CancellationToken cancellationToken = default);
    Task<Municipality?> GetMunicipalityByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddMunicipalityAsync(Municipality municipality, CancellationToken cancellationToken = default);
    void DeleteMunicipality(Municipality municipality);

    // Barangays
    Task<List<Barangay>> GetBarangaysAsync(Guid? municipalityId, bool? activeOnly, CancellationToken cancellationToken = default);
    Task<Barangay?> GetBarangayByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddBarangayAsync(Barangay barangay, CancellationToken cancellationToken = default);
    void DeleteBarangay(Barangay barangay);
    
    // Existence/Code checks
    Task<bool> IsRegionCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> IsProvinceCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> IsMunicipalityCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> IsBarangayCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);

    // Check for child relations before deletion (Constraint Handling)
    Task<bool> RegionHasProvincesAsync(Guid regionId, CancellationToken cancellationToken = default);
    Task<bool> ProvinceHasMunicipalitiesAsync(Guid provinceId, CancellationToken cancellationToken = default);
    Task<bool> MunicipalityHasBarangaysAsync(Guid municipalityId, CancellationToken cancellationToken = default);
}

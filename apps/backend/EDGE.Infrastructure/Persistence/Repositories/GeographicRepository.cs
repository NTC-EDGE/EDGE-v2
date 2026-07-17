using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class GeographicRepository : IGeographicRepository
{
    private readonly ApplicationDbContext _context;

    public GeographicRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Regions
    public async Task<List<Region>> GetRegionsAsync(bool? activeOnly, CancellationToken cancellationToken = default)
    {
        var query = _context.Regions.AsQueryable();
        if (activeOnly.HasValue)
        {
            query = query.Where(r => r.IsActive == activeOnly.Value);
        }
        return await query.OrderBy(r => r.Name).ToListAsync(cancellationToken);
    }

    public async Task<Region?> GetRegionByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Regions.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task AddRegionAsync(Region region, CancellationToken cancellationToken = default)
    {
        await _context.Regions.AddAsync(region, cancellationToken);
    }

    public void DeleteRegion(Region region)
    {
        _context.Regions.Remove(region);
    }

    // Provinces
    public async Task<List<Province>> GetProvincesAsync(Guid? regionId, bool? activeOnly, CancellationToken cancellationToken = default)
    {
        var query = _context.Provinces.Include(p => p.Region).AsQueryable();
        if (regionId.HasValue)
        {
            query = query.Where(p => p.RegionId == regionId.Value);
        }
        if (activeOnly.HasValue)
        {
            query = query.Where(p => p.IsActive == activeOnly.Value);
        }
        return await query.OrderBy(p => p.Name).ToListAsync(cancellationToken);
    }

    public async Task<Province?> GetProvinceByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Provinces.Include(p => p.Region).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task AddProvinceAsync(Province province, CancellationToken cancellationToken = default)
    {
        await _context.Provinces.AddAsync(province, cancellationToken);
    }

    public void DeleteProvince(Province province)
    {
        _context.Provinces.Remove(province);
    }

    // Municipalities
    public async Task<List<Municipality>> GetMunicipalitiesAsync(Guid? provinceId, bool? activeOnly, CancellationToken cancellationToken = default)
    {
        var query = _context.Municipalities.Include(m => m.Province).ThenInclude(p => p.Region).AsQueryable();
        if (provinceId.HasValue)
        {
            query = query.Where(m => m.ProvinceId == provinceId.Value);
        }
        if (activeOnly.HasValue)
        {
            query = query.Where(m => m.IsActive == activeOnly.Value);
        }
        return await query.OrderBy(m => m.Name).ToListAsync(cancellationToken);
    }

    public async Task<Municipality?> GetMunicipalityByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Municipalities.Include(m => m.Province).ThenInclude(p => p.Region).FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task AddMunicipalityAsync(Municipality municipality, CancellationToken cancellationToken = default)
    {
        await _context.Municipalities.AddAsync(municipality, cancellationToken);
    }

    public void DeleteMunicipality(Municipality municipality)
    {
        _context.Municipalities.Remove(municipality);
    }

    // Barangays
    public async Task<List<Barangay>> GetBarangaysAsync(Guid? municipalityId, bool? activeOnly, CancellationToken cancellationToken = default)
    {
        var query = _context.Barangays.Include(b => b.Municipality).ThenInclude(m => m.Province).ThenInclude(p => p.Region).AsQueryable();
        if (municipalityId.HasValue)
        {
            query = query.Where(b => b.MunicipalityId == municipalityId.Value);
        }
        if (activeOnly.HasValue)
        {
            query = query.Where(b => b.IsActive == activeOnly.Value);
        }
        return await query.OrderBy(b => b.Name).ToListAsync(cancellationToken);
    }

    public async Task<Barangay?> GetBarangayByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Barangays.Include(b => b.Municipality).ThenInclude(m => m.Province).ThenInclude(p => p.Region).FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task AddBarangayAsync(Barangay barangay, CancellationToken cancellationToken = default)
    {
        await _context.Barangays.AddAsync(barangay, cancellationToken);
    }

    public void DeleteBarangay(Barangay barangay)
    {
        _context.Barangays.Remove(barangay);
    }

    // Existence / Unique Code Checks
    public async Task<bool> IsRegionCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Regions.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(r => r.Id != excludeId.Value);
        }
        return !await query.AnyAsync(r => r.Code.ToLower() == code.ToLower(), cancellationToken);
    }

    public async Task<bool> IsProvinceCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Provinces.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }
        return !await query.AnyAsync(p => p.Code.ToLower() == code.ToLower(), cancellationToken);
    }

    public async Task<bool> IsMunicipalityCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Municipalities.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(m => m.Id != excludeId.Value);
        }
        return !await query.AnyAsync(m => m.Code.ToLower() == code.ToLower(), cancellationToken);
    }

    public async Task<bool> IsBarangayCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Barangays.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }
        return !await query.AnyAsync(b => b.Code.ToLower() == code.ToLower(), cancellationToken);
    }

    // Check for child relations before deletion
    public async Task<bool> RegionHasProvincesAsync(Guid regionId, CancellationToken cancellationToken = default)
    {
        return await _context.Provinces.AnyAsync(p => p.RegionId == regionId, cancellationToken);
    }

    public async Task<bool> ProvinceHasMunicipalitiesAsync(Guid provinceId, CancellationToken cancellationToken = default)
    {
        return await _context.Municipalities.AnyAsync(m => m.ProvinceId == provinceId, cancellationToken);
    }

    public async Task<bool> MunicipalityHasBarangaysAsync(Guid municipalityId, CancellationToken cancellationToken = default)
    {
        return await _context.Barangays.AnyAsync(b => b.MunicipalityId == municipalityId, cancellationToken);
    }
}

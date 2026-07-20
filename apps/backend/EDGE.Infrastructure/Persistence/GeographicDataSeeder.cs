using System.Reflection;
using System.Text.Json;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class GeographicDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Only seed if no regions exist
        if (await context.Regions.AnyAsync())
        {
            return;
        }

        var assembly = Assembly.GetExecutingAssembly();

        // geographic-data.json was generated from the OCHA Philippine admin boundary GeoJSON files
        // (Regionbdry, Provincebdry, Municipalitybdry, Barangaybdry) using a one-time .NET converter tool.
        // It contains 17 regions, 88 provinces, 1,642 municipalities, and 42,048 barangays — no geometry included.
        var resourceName = "EDGE.Infrastructure.Persistence.SeedData.geographic-data.json";

        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            throw new FileNotFoundException($"Embedded resource '{resourceName}' not found.");
        }

        using var reader = new StreamReader(stream);
        var json = await reader.ReadToEndAsync();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var regionsData = JsonSerializer.Deserialize<List<RegionSeedModel>>(json, options);
        if (regionsData == null) return;

        foreach (var rData in regionsData)
        {
            var region = new Region
            {
                Id = rData.Id,
                Code = rData.Code,
                Name = rData.Name,
                IsActive = rData.IsActive
            };

            await context.Regions.AddAsync(region);

            if (rData.Provinces != null)
            {
                foreach (var pData in rData.Provinces)
                {
                    var province = new Province
                    {
                        Id = pData.Id,
                        RegionId = region.Id,
                        Code = pData.Code,
                        Name = pData.Name,
                        IsActive = pData.IsActive
                    };

                    await context.Provinces.AddAsync(province);

                    if (pData.Municipalities != null)
                    {
                        foreach (var mData in pData.Municipalities)
                        {
                            var municipality = new Municipality
                            {
                                Id = mData.Id,
                                ProvinceId = province.Id,
                                Code = mData.Code,
                                Name = mData.Name,
                                IsActive = mData.IsActive
                            };

                            await context.Municipalities.AddAsync(municipality);

                            if (mData.Barangays != null)
                            {
                                foreach (var bData in mData.Barangays)
                                {
                                    var barangay = new Barangay
                                    {
                                        Id = bData.Id,
                                        MunicipalityId = municipality.Id,
                                        Code = bData.Code,
                                        Name = bData.Name,
                                        IsActive = bData.IsActive
                                    };

                                    await context.Barangays.AddAsync(barangay);
                                }
                            }
                        }
                    }
                }
            }
        }

        await context.SaveChangesAsync();
    }

    private class RegionSeedModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<ProvinceSeedModel>? Provinces { get; set; }
    }

    private class ProvinceSeedModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<MunicipalitySeedModel>? Municipalities { get; set; }
    }

    private class MunicipalitySeedModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<BarangaySeedModel>? Barangays { get; set; }
    }

    private class BarangaySeedModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}

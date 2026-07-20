using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Provinces.Dtos;

public record ProvinceDto(Guid Id, Guid RegionId, string Code, string Name, bool IsActive, RegionDto? Region = null);

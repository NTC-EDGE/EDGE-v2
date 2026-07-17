namespace EDGE.Application.Provinces.Dtos;

public record ProvinceDto(Guid Id, Guid RegionId, string Code, string Name, bool IsActive);

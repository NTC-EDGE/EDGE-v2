using EDGE.Application.Provinces.Dtos;

namespace EDGE.Application.Municipalities.Dtos;

public record MunicipalityDto(Guid Id, Guid ProvinceId, string Code, string Name, bool IsActive, ProvinceDto? Province = null);

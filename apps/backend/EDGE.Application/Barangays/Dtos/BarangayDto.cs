namespace EDGE.Application.Barangays.Dtos;

public record BarangayDto(Guid Id, Guid MunicipalityId, string Code, string Name, bool IsActive);

using System;

namespace EDGE.Application.FieldOffices.Dtos;

public record FieldOfficeDto(Guid Id, string Name, string? Code, Guid RegionId, string? RegionName);

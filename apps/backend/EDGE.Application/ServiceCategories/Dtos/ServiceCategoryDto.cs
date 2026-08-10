using System;

namespace EDGE.Application.ServiceCategories.Dtos;

public record ServiceCategoryDto(Guid Id, string Name, string? Code, string Type, int TotalServices = 0);

using System;

namespace EDGE.Application.ServiceInformations.Dtos;

public record ServiceInformationDto(
    Guid Id,
    Guid ServiceId,
    string CategoryName,
    string ServiceTitle,
    string Information,
    string WhoMayAvail
);

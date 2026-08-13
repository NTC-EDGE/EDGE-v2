using System.Collections.Generic;
using System.Text.Json.Serialization;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateApplication;

public record UpdateApplicationCommand : IRequest<ApiResponse<Guid>>
{
    [JsonIgnore]
    public Guid Id { get; init; }

    public string? Office { get; init; }
    public Guid? RegionId { get; init; }
    public Guid? ScheduleId { get; init; }

    public Guid? ServiceVariantId { get; init; }
    public List<Guid>? ServiceVariantElementIds { get; init; }
}

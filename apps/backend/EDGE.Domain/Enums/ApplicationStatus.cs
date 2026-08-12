using System.Text.Json.Serialization;

namespace EDGE.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ApplicationStatus
{
    Draft,
    Submitted,
    Evaluating,
    Returned,
    Approved,
    Completed
}

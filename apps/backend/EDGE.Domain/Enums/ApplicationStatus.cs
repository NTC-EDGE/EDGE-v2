using System.Text.Json.Serialization;

namespace EDGE.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ApplicationStatus
{
    Draft = 0,
    Submitted = 1,
    Evaluating = 2,
    Returned = 3,
    Approved = 4,
    Completed = 5
}

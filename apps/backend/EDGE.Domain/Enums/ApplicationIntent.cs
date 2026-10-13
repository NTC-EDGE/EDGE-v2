using System.Text.Json.Serialization;

namespace EDGE.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ApplicationIntent
{
    Regular = 0,
    AssessmentOnly = 1
}

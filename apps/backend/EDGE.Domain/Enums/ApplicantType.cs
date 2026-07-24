using System.Text.Json.Serialization;

namespace EDGE.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ApplicantType
{
    Individual,
    Company
}

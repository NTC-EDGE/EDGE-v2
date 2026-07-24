using System.Text.Json.Serialization;

namespace EDGE.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ApplicationStatus
{
    Draft,
    Submitted,
    ForApproval,
    Approved,
    Endorsed,
    Declined,
    ForVerification,
    Returned,
    Completed
}

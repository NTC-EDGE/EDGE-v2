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
    Completed = 5,
    /// <summary>Evaluation approved — forwarded to Accountant for SOA review and approval.</summary>
    ForAccountant = 6,
    /// <summary>SOA approved by Accountant — awaiting Cashier payment verification.</summary>
    PendingPayment = 7,
    /// <summary>Payment verified by Cashier — forwarded to Regional Evaluator / Issuance Officer for Form and License configuration.</summary>
    ForIssuance = 8
}

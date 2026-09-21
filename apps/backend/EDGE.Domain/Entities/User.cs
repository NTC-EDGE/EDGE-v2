using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class User : AuditableEntity
{
    public string AuthUserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public ApplicantType AccountType { get; set; } = ApplicantType.Individual;
    public Guid? CompanyDetailId { get; set; }
    public CompanyDetail? CompanyDetail { get; set; }

    public bool IsSuperAdmin { get; set; } = false;
    public virtual List<TenantMember> TenantMemberships { get; set; } = [];

    public Guid? BarangayId { get; set; }
    public string? MiddleName { get; set; }
    public string? Suffix { get; set; }
    public string? Unit { get; set; }
    public string? Street { get; set; }
    public string? ZipCode { get; set; }
    public string? ContactNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Sex { get; set; }
    public string? Nationality { get; set; }
    public float? Height { get; set; }
    public float? Weight { get; set; }
    public string? SchoolAttended { get; set; }
    public string? CourseTaken { get; set; }
    public string? ProfilePicture { get; set; }
    public bool? IsOnline { get; set; }
    public DateTime? LastOnline { get; set; }
    public string? ESignature { get; set; }

    private static readonly HashSet<string> KnownSeedPlaceholderIds = new(StringComparer.OrdinalIgnoreCase)
    {
        "user_client123",
        "user_liaison123",
        "user_evaluator123",
        "user_chiefeod123",
        "user_accountant123",
        "user_cashier123",
        "user_superadmin123",
        "user_director123",
        "user_legal123",
        "user_admin123",
        "user_higherups123"
    };

    /// <summary>
    /// Determines whether this user record holds an unlinked or dummy seed auth ID 
    /// that is eligible to be safely bound to an external authentication identity.
    /// </summary>
    public bool IsEligibleForAutoLink()
    {
        if (string.IsNullOrWhiteSpace(AuthUserId)) return true;
        if (KnownSeedPlaceholderIds.Contains(AuthUserId.Trim())) return true;

        return AuthUserId.StartsWith("seed_", StringComparison.OrdinalIgnoreCase) ||
               AuthUserId.StartsWith("temp_", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Attempts to bind an incoming external auth subject ID to this account.
    /// Returns true if linking succeeded or was already matching; returns false if rejected due to collision.
    /// </summary>
    public bool TryLinkExternalAuthUserId(string incomingAuthUserId)
    {
        if (string.IsNullOrWhiteSpace(incomingAuthUserId)) return false;
        if (string.Equals(AuthUserId, incomingAuthUserId, StringComparison.Ordinal)) return true;

        if (IsEligibleForAutoLink())
        {
            AuthUserId = incomingAuthUserId;
            return true;
        }

        return false;
    }
}

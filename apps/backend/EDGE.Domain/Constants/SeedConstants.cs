using System;

namespace EDGE.Domain.Constants;

/// <summary>
/// Centralized deterministic GUID constants for database initialization, seeding, and integration tests.
/// Guarantees non-overlapping, well-documented GUID ranges across services, roles, tenants, users, and communication features.
/// </summary>
public static class SeedConstants
{
    // ── Tenant Identifiers (00000000-...) ─────────────────────────────────────
    public static readonly Guid DefaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static readonly Guid CentralRegionId = Guid.Parse("1e66819d-583c-4852-83bd-a4195bd126a8");

    // ── Role Identifiers (10000000-...) ───────────────────────────────────────
    public static class Roles
    {
        public static readonly Guid SuperAdminRoleId       = Guid.Parse("10000000-0000-0000-0000-000000000000");
        public static readonly Guid ClientRoleId           = Guid.Parse("10000000-0000-0000-0000-000000000001");
        public static readonly Guid EvaluatorRoleId        = Guid.Parse("10000000-0000-0000-0000-000000000002");
        public static readonly Guid ChiefEodRoleId         = Guid.Parse("10000000-0000-0000-0000-000000000003");
        public static readonly Guid AccountantRoleId       = Guid.Parse("10000000-0000-0000-0000-000000000004");
        public static readonly Guid CashierRoleId          = Guid.Parse("10000000-0000-0000-0000-000000000005");
        public static readonly Guid AdminRoleId            = Guid.Parse("10000000-0000-0000-0000-000000000006");
        public static readonly Guid RegionalDirectorRoleId = Guid.Parse("10000000-0000-0000-0000-000000000007");
        public static readonly Guid LegalRoleId            = Guid.Parse("10000000-0000-0000-0000-000000000008");
    }

    // ── Seed User Identifiers (Repeated hex patterns) ─────────────────────────
    public static class Users
    {
        public static readonly Guid ClientUserId           = Guid.Parse("11111111-1111-1111-1111-111111111111");
        public static readonly Guid LiaisonUserId          = Guid.Parse("11111111-1111-1111-1111-222222222222");
        public static readonly Guid EvaluatorUserId        = Guid.Parse("22222222-2222-2222-2222-222222222222");
        public static readonly Guid ChiefEodUserId         = Guid.Parse("33333333-3333-3333-3333-333333333333");
        public static readonly Guid LegacyHigherUpsUserId  = Guid.Parse("33333333-3333-3333-3333-333333333334");
        public static readonly Guid AccountantUserId       = Guid.Parse("44444444-4444-4444-4444-444444444444");
        public static readonly Guid CashierUserId          = Guid.Parse("55555555-5555-5555-5555-555555555555");
        public static readonly Guid SuperAdminUserId       = Guid.Parse("66666666-6666-6666-6666-666666666666");
        public static readonly Guid RegionalDirectorUserId = Guid.Parse("77777777-7777-7777-7777-777777777777");
        public static readonly Guid LegalUserId            = Guid.Parse("88888888-8888-8888-8888-888888888888");
        public static readonly Guid AdminUserId            = Guid.Parse("99999999-9999-9999-9999-999999999999");
    }

    // ── Tenant Member Identifiers (40000000-...) ─────────────────────────────
    public static class TenantMembers
    {
        public static readonly Guid ClientMemberId           = Guid.Parse("40000000-0000-0000-0000-000000000001");
        public static readonly Guid EvaluatorMemberId        = Guid.Parse("40000000-0000-0000-0000-000000000002");
        public static readonly Guid ChiefEodMemberId         = Guid.Parse("40000000-0000-0000-0000-000000000003");
        public static readonly Guid AccountantMemberId       = Guid.Parse("40000000-0000-0000-0000-000000000004");
        public static readonly Guid CashierMemberId          = Guid.Parse("40000000-0000-0000-0000-000000000005");
        public static readonly Guid SuperAdminMemberId       = Guid.Parse("40000000-0000-0000-0000-000000000006");
        public static readonly Guid RegionalDirectorMemberId = Guid.Parse("40000000-0000-0000-0000-000000000007");
        public static readonly Guid LegalMemberId            = Guid.Parse("40000000-0000-0000-0000-000000000008");
        public static readonly Guid AdminMemberId            = Guid.Parse("40000000-0000-0000-0000-000000000009");
        public static readonly Guid LegacyHigherUpsMemberId  = Guid.Parse("40000000-0000-0000-0000-000000000034");
    }

    // ── Communication & Meetings (cc000000-... and ee000000-... collision-free ranges) ──
    public static class Communication
    {
        public static readonly Guid GeneralConversationId = Guid.Parse("cc000000-0000-0000-0000-000000000001");
        public static readonly Guid WelcomeMessageId      = Guid.Parse("cc000000-0000-0000-0000-000000000002");
        public static readonly Guid DefaultMeetingId      = Guid.Parse("ee000000-0000-0000-0000-000000000001");
    }
}

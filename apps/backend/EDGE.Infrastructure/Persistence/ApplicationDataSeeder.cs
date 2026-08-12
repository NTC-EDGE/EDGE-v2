using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using DomainApplication = EDGE.Domain.Entities.Application;

namespace EDGE.Infrastructure.Persistence;

/// <summary>
/// Seeds realistic Application records across all queue statuses so the queue
/// feature has representative dev data. Safe to re-run — skips if any
/// applications already exist.
/// </summary>
public static class ApplicationDataSeeder
{
    // ─── Fixed GUIDs anchored to the IAM seeder ──────────────────────────────
    private static readonly Guid TenantId         = Guid.Parse("00000000-0000-0000-0000-000000000001");
    private static readonly Guid ClientUserId     = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid EvaluatorUserId  = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid AccountantUserId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    private static readonly Guid CashierUserId    = Guid.Parse("55555555-5555-5555-5555-555555555555");

    // Service IDs from FastTrackSeeder
    private static readonly Guid ServicePermitId  = Guid.Parse("50000000-0000-0000-0000-000000000003"); // NTC_1_03
    private static readonly Guid ServiceLicenseId = Guid.Parse("50000000-0000-0000-0000-000000000002"); // NTC_1_02
    private static readonly Guid ServiceCertId    = Guid.Parse("50000000-0000-0000-0000-000000000004"); // NTC_1_04
    private static readonly Guid PermitCategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000004");

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var now = DateTime.UtcNow;
        var defaultBarangay = await context.Barangays.FirstOrDefaultAsync();

        // ── Ensure Liaison User & Company Detail are linked ─────────────────
        var liaisonUserId = Guid.Parse("11111111-1111-1111-1111-222222222222");
        var liaisonUser = await context.Users.Include(u => u.CompanyDetail).FirstOrDefaultAsync(u => u.Id == liaisonUserId);
        if (liaisonUser != null && liaisonUser.CompanyDetail == null)
        {
            var liaisonCompany = new CompanyDetail
            {
                Id = Guid.NewGuid(),
                BarangayId = defaultBarangay?.Id,
                Name = "Apex Regulatory Consulting Services, Inc.",
                Address = "Suite 1204, Ortigas Center, Pasig City",
                RegistrationNumber = "SEC-REG-2018-091124",
                ContactNumber = "09189998877",
                Email = "contact@apexconsulting.ph",
                CreatedAt = now.AddDays(-90),
            };
            context.CompanyDetails.Add(liaisonCompany);
            liaisonUser.AccountType = ApplicantType.Company;
            liaisonUser.CompanyDetail = liaisonCompany;
            await context.SaveChangesAsync();
        }

        // Update existing app16 and app17 to assign Liaison User if already seeded
        var app16Id = Guid.Parse("a1600000-0000-0000-0000-000000000016");
        var app17Id = Guid.Parse("a1700000-0000-0000-0000-000000000017");
        var app16Existing = await context.Applications.FirstOrDefaultAsync(a => a.Id == app16Id);
        var app17Existing = await context.Applications.FirstOrDefaultAsync(a => a.Id == app17Id);

        if (app16Existing != null) app16Existing.UserId = liaisonUserId;
        if (app17Existing != null) app17Existing.UserId = liaisonUserId;
        await context.SaveChangesAsync();

        if (await context.Applications.CountAsync() >= 17)
            return;

        // ─── Applicant pool ───────────────────────────────────────────────────
        var applicants = new List<Applicant>
        {
            MakeApplicant("Juan",     "Santos",     "Cruz",     "09171234567", "juan.santos@email.com",     new DateOnly(1990, 3, 15)),
            MakeApplicant("Maria",    "Dela Cruz",  "Reyes",    "09281234568", "maria.delacruz@email.com",  new DateOnly(1985, 7, 22)),
            MakeApplicant("Roberto",  "Mendoza",    "Garcia",   "09391234569", "roberto.mendoza@email.com", new DateOnly(1992, 11, 8)),
            MakeApplicant("Liza",     "Villanueva", "Torres",   "09451234570", "liza.villanueva@email.com", new DateOnly(1988, 5, 30)),
            MakeApplicant("Carlo",    "Reyes",      "Bautista", "09561234571", "carlo.reyes@email.com",     new DateOnly(1995, 1, 17)),
            MakeApplicant("Ana",      "Bautista",   "Lopez",    "09671234572", "ana.bautista@email.com",    new DateOnly(1993, 9, 4)),
            MakeApplicant("Miguel",   "Lopez",      "Ramos",    "09781234573", "miguel.lopez@email.com",    new DateOnly(1987, 12, 19)),
            MakeApplicant("Sofia",    "Ramos",      "Flores",   "09891234574", "sofia.ramos@email.com",     new DateOnly(1991, 6, 11)),
            MakeApplicant("Andres",   "Flores",     "Castro",   "09121234575", "andres.flores@email.com",   new DateOnly(1989, 4, 28)),
            MakeApplicant("Gabriela", "Castro",     "Rivera",   "09231234576", "gabriela.castro@email.com", new DateOnly(1994, 8, 3)),
        };
        context.Applicants.AddRange(applicants);
        await context.SaveChangesAsync();

        var applications = new List<DomainApplication>();

        // ── 1. Submitted — fresh, waiting for Evaluator ───────────────────────
        var app1 = MakeApp(Guid.Parse("a1000000-0000-0000-0000-000000000001"),
            "REF-2026-00001", "APP-2026-00001",
            ApplicationStatus.Submitted, SubmissionMode.Single,
            ServicePermitId, applicants[0], now.AddDays(-5), "Cebu Field Office");

        AddHistory(app1, "Application submitted by client.", null, ApplicationStatus.Submitted,
            ClientUserId, "Juan Santos", "Client", now.AddDays(-5));

        AddFormSubmission(app1, applicants[0], new()
        {
            ("Call Sign / Station Name", "DX-101 Manila Relay"),
            ("Equipment Manufacturer", "Motorola Solutions"),
            ("Equipment Model", "XPR 7550e"),
            ("Transmitter Power (Watts)", "50W"),
            ("Frequency Band", "VHF 136-174 MHz"),
            ("Station Installation Address", "Building 4, Port Area, Manila"),
            ("Intended Usage", "Commercial Fleet Operations"),
        });

        applications.Add(app1);

        // ── 2. ForApproval — Evaluator is reviewing ───────────────────────────
        var app2 = MakeApp(Guid.Parse("a2000000-0000-0000-0000-000000000002"),
            "REF-2026-00002", "APP-2026-00002",
            ApplicationStatus.Evaluating, SubmissionMode.Single,
            ServiceLicenseId, applicants[1], now.AddDays(-8), "Davao Field Office");

        AddHistory(app2, "Application submitted by client.", null, ApplicationStatus.Submitted,
            ClientUserId, "Maria Dela Cruz", "Client", now.AddDays(-8));
        AddHistory(app2, "Application received and under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-7));

        AddFormSubmission(app2, applicants[1], new()
        {
            ("License Number", "NTC-LIC-2023-88219"),
            ("Radio Station Category", "Land Mobile Base Station"),
            ("Antenna Height (Meters)", "24.5m"),
            ("Antenna Type", "Omni-directional Fiber Dipole"),
            ("Operating Hours", "24/7 Continuous Operation"),
        });

        applications.Add(app2);

        // ── 3. Returned — returned by Evaluator ───────────────────────────────
        var app3 = MakeApp(Guid.Parse("a3000000-0000-0000-0000-000000000003"),
            "REF-2026-00003", "APP-2026-00003",
            ApplicationStatus.Returned, SubmissionMode.Single,
            ServiceCertId, applicants[2], now.AddDays(-12), "Manila Main Office");

        AddHistory(app3, "Application submitted by client.", null, ApplicationStatus.Submitted,
            ClientUserId, "Roberto Mendoza", "Client", now.AddDays(-12));
        AddHistory(app3, "Application returned. Reason: Incomplete NTC Form 103 — missing ship station call sign.",
            ApplicationStatus.Submitted, ApplicationStatus.Returned,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-10),
            "Incomplete NTC Form 103 — missing ship station call sign.");

        AddCorrection(app3, "Requirements", "NTC Form 103", "Not submitted", "Submitted",
            "Jane Evaluator", now.AddDays(-10));

        AddFormSubmission(app3, applicants[2], new()
        {
            ("Certificate Applied For", "General Radio Operator Certificate (GROC)"),
            ("NTC Examination Rating", "88.5%"),
            ("Examination Date", "2025-11-14"),
            ("School / Training Center", "Philippine Maritime & Radio Academy"),
            ("Highest Educational Attainment", "BS Electronics Engineering"),
        });

        applications.Add(app3);

        // ── 4. ForVerification — SOA created, pending Accountant approval ─────
        var app4 = MakeApp(Guid.Parse("a4000000-0000-0000-0000-000000000004"),
            "REF-2026-00004", "APP-2026-00004",
            ApplicationStatus.Approved, SubmissionMode.Single,
            ServicePermitId, applicants[3], now.AddDays(-15), "Cebu Field Office");

        AddHistory(app4, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Liza Villanueva", "Client", now.AddDays(-15));
        AddHistory(app4, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-14));
        AddHistory(app4, "SOA prepared. Forwarded to Accountant for review.",
            ApplicationStatus.Evaluating, ApplicationStatus.Approved,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-13));

        var soa4 = MakeSoa(Guid.Parse("b4000000-0000-0000-0000-000000000001"), app4,
            applicants[3].Id, IssuedToType.Individual,
            FullName(applicants[3]), now.AddDays(15), EvaluatorUserId);
        AddSoaLine(soa4, "Amateur Radio Station Permit", "PRM-AMAT-001", "Class A Amateur Radio Station", 1, 1, 480.00m);
        AddSoaLine(soa4, "Filing & Processing Fee", "FILING_FEE", "Standard mandatory filing fee", 1, 1, 100.00m);
        AddSoaHistory(soa4, "SOA created by Evaluator.", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-13));

        app4.StatementsOfAccount.Add(soa4);
        applications.Add(app4);

        // ── 5. Approved — OP issued, awaiting Cashier payment verification ────
        var app5 = MakeApp(Guid.Parse("a5000000-0000-0000-0000-000000000005"),
            "REF-2026-00005", "APP-2026-00005",
            ApplicationStatus.Approved, SubmissionMode.Single,
            ServiceLicenseId, applicants[4], now.AddDays(-20), "Davao Field Office");

        AddHistory(app5, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Carlo Reyes", "Client", now.AddDays(-20));
        AddHistory(app5, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-19));
        AddHistory(app5, "Application approved. SOA issued.", ApplicationStatus.Evaluating, ApplicationStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-17));

        var soa5 = MakeSoa(Guid.Parse("b5000000-0000-0000-0000-000000000001"), app5,
            applicants[4].Id, IssuedToType.Individual, FullName(applicants[4]),
            now.AddDays(10), EvaluatorUserId,
            SoaStatus.Approved, AccountantUserId, now.AddDays(-17));
        AddSoaLine(soa5, "Radiotelephone Operator Certificate (GMDSS GOC)", "CERT-RADIO-001", null, 3, 1, 750.00m);
        AddSoaLine(soa5, "Permit & Certificate Issuance Fee", "PERMIT_ISSUE_FEE", "Official document printing charge", 1, 1, 75.00m);
        AddSoaHistory(soa5, "SOA created by Evaluator.", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-18));
        AddSoaHistory(soa5, "SOA approved by Accountant. Order of Payment generated.",
            SoaStatus.Pending, SoaStatus.Approved, AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-17));

        var op5 = MakeOp(Guid.Parse("e5000000-0000-0000-0000-000000000001"), app5, soa5, 825.00m);
        AddOpHistory(op5, "Order of Payment issued.", null, OpStatus.Billed,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-17));

        app5.StatementsOfAccount.Add(soa5);
        app5.OrdersOfPayment.Add(op5);
        applications.Add(app5);

        // ── 6. Completed — Paid ───────────────────────────────────────────────
        var app6 = MakeApp(Guid.Parse("a6000000-0000-0000-0000-000000000006"),
            "REF-2026-00006", "APP-2026-00006",
            ApplicationStatus.Completed, SubmissionMode.Single,
            ServicePermitId, applicants[5], now.AddDays(-30), "Manila Main Office");

        AddHistory(app6, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Ana Bautista", "Client", now.AddDays(-30));
        AddHistory(app6, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-29));
        AddHistory(app6, "Application approved. SOA/OP issued.", ApplicationStatus.Evaluating, ApplicationStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-27));
        AddHistory(app6, "Application completed. Payment received.", ApplicationStatus.Approved, ApplicationStatus.Completed,
            CashierUserId, "Bob Cashier", "Cashier", now.AddDays(-25));

        var soa6 = MakeSoa(Guid.Parse("b6000000-0000-0000-0000-000000000001"), app6,
            applicants[5].Id, IssuedToType.Individual, FullName(applicants[5]),
            now.AddDays(-25), EvaluatorUserId,
            SoaStatus.Approved, AccountantUserId, now.AddDays(-27));
        AddSoaLine(soa6, "Amateur Radio Station Permit", "PRM-AMAT-001", "Class B Amateur Radio Station", 1, 1, 320.00m);
        AddSoaLine(soa6, "Filing & Processing Fee", "FILING_FEE", null, 1, 1, 100.00m);
        AddSoaHistory(soa6, "SOA created.", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-28));
        AddSoaHistory(soa6, "SOA approved. OP generated.", SoaStatus.Pending, SoaStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-27));

        var op6 = MakeOp(Guid.Parse("e6000000-0000-0000-0000-000000000001"), app6, soa6, 420.00m,
            OpStatus.Paid, PaymentMethod.Cash, "OR-2026-00001", 420.00m, CashierUserId, now.AddDays(-25));
        AddOpHistory(op6, "Order of Payment issued.", null, OpStatus.Billed,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-27));
        AddOpHistory(op6, "Payment verified. OR: OR-2026-00001", OpStatus.Billed, OpStatus.Paid,
            CashierUserId, "Bob Cashier", "Cashier", now.AddDays(-25), "OR-2026-00001");

        app6.StatementsOfAccount.Add(soa6);
        app6.OrdersOfPayment.Add(op6);
        applications.Add(app6);

        // ── 7. Bulk — 2 applicants, individual SOAs ───────────────────────────
        var app7 = new DomainApplication
        {
            Id = Guid.Parse("a7000000-0000-0000-0000-000000000007"),
            TenantId = TenantId,
            ApplicationNumber = "APP-2026-00007",
            ReferenceNumber = "REF-2026-00007",
            Status = ApplicationStatus.Evaluating,
            SubmissionMode = SubmissionMode.Bulk,
            Office = "Cebu Field Office",
            UserId = ClientUserId,
            IsGuest = false,
            Remarks = "Company bulk permit renewal for 2 radio operators.",
            CreatedAt = now.AddDays(-10),
        };
        app7.ApplicationApplicants.Add(new ApplicationApplicant
        {
            Id = Guid.NewGuid(),
            ApplicationId = app7.Id,
            ApplicantId = applicants[6].Id,
            SequenceOrder = 1,
        });
        app7.ApplicationApplicants.Add(new ApplicationApplicant
        {
            Id = Guid.NewGuid(),
            ApplicationId = app7.Id,
            ApplicantId = applicants[7].Id,
            SequenceOrder = 2,
        });
        app7.ApplicationServices.Add(new ApplicationService
        {
            Id = Guid.NewGuid(),
            ApplicationId = app7.Id,
            ServiceCategoryId = PermitCategoryId,
            ServiceId = ServicePermitId,
            ApplicationTypeKey = "RENEWAL",
        });

        AddHistory(app7, "Bulk application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Miguel Lopez", "Client", now.AddDays(-10));
        AddHistory(app7, "Bulk application under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-9));

        // Each applicant gets their own SOA
        var soaBulk1 = MakeSoa(Guid.Parse("b7000000-0000-0000-0000-000000000001"), app7,
            applicants[6].Id, IssuedToType.Individual, FullName(applicants[6]),
            now.AddDays(20), EvaluatorUserId);
        AddSoaLine(soaBulk1, "Amateur Radio Station Permit (Renewal)", "PRM-AMAT-REN", "Individual renewal", 1, 1, 320.00m);
        AddSoaHistory(soaBulk1, "SOA created for applicant 1 (Miguel Lopez).", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-8));

        var soaBulk2 = MakeSoa(Guid.Parse("b7000000-0000-0000-0000-000000000002"), app7,
            applicants[7].Id, IssuedToType.Individual, FullName(applicants[7]),
            now.AddDays(20), EvaluatorUserId);
        AddSoaLine(soaBulk2, "Amateur Radio Station Permit (Renewal)", "PRM-AMAT-REN", "Individual renewal", 1, 1, 320.00m);
        AddSoaHistory(soaBulk2, "SOA created for applicant 2 (Sofia Ramos).", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-8));

        var formSub7_1 = new FormSubmission
        {
            Id = Guid.NewGuid(),
            ApplicationId = app7.Id,
            FormId = Guid.Parse("f0100000-0000-0000-0000-000000000001"),
            ApplicantId = applicants[6].Id,
            CreatedAt = now.AddDays(-10),
            FieldValues = new List<FormFieldValue>
            {
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Examinee Class", Value = "Class B (General)" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Exam Type", Value = "First Time Examinee" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Preferred Exam Language", Value = "English" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "PRC License Status", Value = "None" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Station Call Sign", Value = "DU7MLP" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Vessel Name", Value = "M/V Ocean Sentinel" },
            }
        };
        var formSub7_2 = new FormSubmission
        {
            Id = Guid.NewGuid(),
            ApplicationId = app7.Id,
            FormId = Guid.Parse("f0100000-0000-0000-0000-000000000001"),
            ApplicantId = applicants[7].Id,
            CreatedAt = now.AddDays(-10),
            FieldValues = new List<FormFieldValue>
            {
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Examinee Class", Value = "Class A (Advanced)" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Exam Type", Value = "Renewal Examinee" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Preferred Exam Language", Value = "English" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "PRC License Status", Value = "Licensed Engineer" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Station Call Sign", Value = "DU7SFR" },
                new FormFieldValue { Id = Guid.NewGuid(), FieldId = Guid.NewGuid(), CustomLabel = "Vessel Name", Value = "M/V Visayas Trader" },
            }
        };
        app7.FormSubmissions.Add(formSub7_1);
        app7.FormSubmissions.Add(formSub7_2);

        app7.StatementsOfAccount.Add(soaBulk1);
        app7.StatementsOfAccount.Add(soaBulk2);
        applications.Add(app7);

        // ── 8. SOA returned by Accountant for correction ──────────────────────
        var app8 = MakeApp(Guid.Parse("a8000000-0000-0000-0000-000000000008"),
            "REF-2026-00008", "APP-2026-00008",
            ApplicationStatus.Approved, SubmissionMode.Single,
            ServiceCertId, applicants[8], now.AddDays(-18), "Davao Field Office");

        AddHistory(app8, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Andres Flores", "Client", now.AddDays(-18));
        AddHistory(app8, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-17));
        AddHistory(app8, "SOA forwarded to Accountant.", ApplicationStatus.Evaluating, ApplicationStatus.Approved,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-16));

        var soa8 = MakeSoa(Guid.Parse("b8000000-0000-0000-0000-000000000001"), app8,
            applicants[8].Id, IssuedToType.Individual, FullName(applicants[8]),
            now.AddDays(5), EvaluatorUserId,
            SoaStatus.Returned);
        soa8.Remarks = "Incorrect fee rate applied. Please revise.";
        AddSoaLine(soa8, "Ship Station Permit", "PERMIT_SHIP_001", "Vessel radio permit", 1, 1, 550.00m);
        AddSoaHistory(soa8, "SOA created by Evaluator.", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-16));
        AddSoaHistory(soa8, "SOA returned. Reason: Incorrect fee rate — should be ₱650 per current schedule.",
            SoaStatus.Pending, SoaStatus.Returned,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-14),
            "Incorrect fee rate — should be ₱650 per current schedule.");

        app8.StatementsOfAccount.Add(soa8);
        applications.Add(app8);

        // ── 9. OP returned to Evaluator (bounced check) ───────────────────────
        var app9 = MakeApp(Guid.Parse("a9000000-0000-0000-0000-000000000009"),
            "REF-2026-00009", "APP-2026-00009",
            ApplicationStatus.Approved, SubmissionMode.Single,
            ServicePermitId, applicants[9], now.AddDays(-22), "Manila Main Office");

        AddHistory(app9, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Gabriela Castro", "Client", now.AddDays(-22));
        AddHistory(app9, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-21));
        AddHistory(app9, "Approved. SOA/OP issued.", ApplicationStatus.Evaluating, ApplicationStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-19));

        var soa9 = MakeSoa(Guid.Parse("b9000000-0000-0000-0000-000000000001"), app9,
            applicants[9].Id, IssuedToType.Individual, FullName(applicants[9]),
            now.AddDays(-15), EvaluatorUserId,
            SoaStatus.Approved, AccountantUserId, now.AddDays(-19));
        AddSoaLine(soa9, "Amateur Radio Station Permit", "PRM-AMAT-001", "Class A", 1, 1, 480.00m);
        AddSoaLine(soa9, "Filing Fee", "FILING_FEE", null, 1, 1, 100.00m);
        AddSoaHistory(soa9, "SOA created.", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-20));
        AddSoaHistory(soa9, "SOA approved. OP generated.", SoaStatus.Pending, SoaStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-19));

        var op9 = MakeOp(Guid.Parse("e9000000-0000-0000-0000-000000000001"), app9, soa9, 580.00m,
            OpStatus.Returned);
        op9.Remarks = "Check payment bounced. Returned to Evaluator for review.";
        AddOpHistory(op9, "OP issued.", null, OpStatus.Billed,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-19));
        AddOpHistory(op9, "OP returned. Reason: Check payment bounced.",
            OpStatus.Billed, OpStatus.Returned,
            CashierUserId, "Bob Cashier", "Cashier", now.AddDays(-16), null,
            "Check payment bounced.");

        app9.StatementsOfAccount.Add(soa9);
        app9.OrdersOfPayment.Add(op9);
        applications.Add(app9);

        // ── 10. Draft — Client created draft, not yet submitted ────────────────
        var app10 = MakeApp(Guid.Parse("a1000000-0000-0000-0000-000000000010"),
            "REF-2026-00010", "APP-2026-00010",
            ApplicationStatus.Draft, SubmissionMode.Single,
            ServicePermitId, applicants[0], now.AddDays(-1), "Cebu Field Office");

        applications.Add(app10);

        // ── 11. Endorsed — Endorsed by Regional Director to Central Office ──────
        var app11 = MakeApp(Guid.Parse("a1100000-0000-0000-0000-000000000011"),
            "REF-2026-00011", "APP-2026-00011",
            ApplicationStatus.Evaluating, SubmissionMode.Single,
            ServiceLicenseId, applicants[1], now.AddDays(-14), "Davao Field Office");

        AddHistory(app11, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Maria Dela Cruz", "Client", now.AddDays(-14));
        AddHistory(app11, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-12));
        AddHistory(app11, "Endorsed to Central Office Commission for special frequency clearance.",
            ApplicationStatus.Evaluating, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Regional Director", "Director", now.AddDays(-10),
            "Endorsed to Central Office for special frequency clearance.");

        applications.Add(app11);

        // ── 12. Declined — Declined due to frequency spectrum overlap ──────────
        var app12 = MakeApp(Guid.Parse("a1200000-0000-0000-0000-000000000012"),
            "REF-2026-00012", "APP-2026-00012",
            ApplicationStatus.Returned, SubmissionMode.Single,
            ServicePermitId, applicants[2], now.AddDays(-25), "Manila Main Office");

        AddHistory(app12, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Roberto Mendoza", "Client", now.AddDays(-25));
        AddHistory(app12, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-23));
        AddHistory(app12, "Application declined. Requested frequency band unavailable in metro zone.",
            ApplicationStatus.Evaluating, ApplicationStatus.Returned,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-20),
            "Requested frequency band unavailable in metro zone.");

        applications.Add(app12);

        // ── 13. Company Bulk — Single Company SOA (IssuedToType = Company) ─────
        var companyDetail = new CompanyDetail
        {
            Id = Guid.NewGuid(),
            BarangayId = defaultBarangay?.Id,
            Name = "Globe Telecom Philippines, Inc.",
            Address = "Globe Telecom Plaza, Pioneer St, Mandaluyong City",
            RegistrationNumber = "SEC-REG-1995-001293",
            ContactNumber = "09170001122",
            Email = "cgutierrez@globe.com.ph",
            CreatedAt = now.AddDays(-60),
        };
        context.CompanyDetails.Add(companyDetail);

        var companyApplicant = new Applicant
        {
            Id = Guid.NewGuid(),
            TenantId = TenantId,
            UserId = ClientUserId,
            IsGuest = false,
            ApplicantType = ApplicantType.Company,
            CompanyDetail = companyDetail,
            CreatedAt = now.AddDays(-60),
        };
        context.Applicants.Add(companyApplicant);

        var app13 = new DomainApplication
        {
            Id = Guid.Parse("a1300000-0000-0000-0000-000000000013"),
            TenantId = TenantId,
            ApplicationNumber = "APP-2026-00013",
            ReferenceNumber = "REF-2026-00013",
            Status = ApplicationStatus.Approved,
            SubmissionMode = SubmissionMode.Bulk,
            Office = "Manila Main Office",
            UserId = ClientUserId,
            IsGuest = false,
            Remarks = "Bulk cell tower station permit applications for 3 sites.",
            CreatedAt = now.AddDays(-7),
        };
        app13.ApplicationApplicants.Add(new ApplicationApplicant
        {
            Id = Guid.NewGuid(),
            ApplicationId = app13.Id,
            ApplicantId = companyApplicant.Id,
            SequenceOrder = 1,
        });
        app13.ApplicationServices.Add(new ApplicationService
        {
            Id = Guid.NewGuid(),
            ApplicationId = app13.Id,
            ServiceCategoryId = PermitCategoryId,
            ServiceId = ServicePermitId,
            ApplicationTypeKey = "NEW",
        });

        AddHistory(app13, "Company bulk application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Carlos Gutierrez", "Client Representative", now.AddDays(-7));
        AddHistory(app13, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-6));
        AddHistory(app13, "Single Consolidated SOA prepared for company.",
            ApplicationStatus.Evaluating, ApplicationStatus.Approved,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-4));

        var soa13 = MakeSoa(Guid.Parse("b1300000-0000-0000-0000-000000000001"), app13,
            companyApplicant.Id, IssuedToType.Company, "Globe Telecom Philippines, Inc.",
            now.AddDays(25), EvaluatorUserId);
        soa13.IssuedToAddress = "Globe Telecom Plaza, Pioneer St, Mandaluyong City";
        AddSoaLine(soa13, "Cellular Mobile Base Station Permit (Site A - Makati)", "PRM-BASE-001", "300W ERP Base Station", 3, 1, 1500.00m);
        AddSoaLine(soa13, "Cellular Mobile Base Station Permit (Site B - Taguig)", "PRM-BASE-001", "300W ERP Base Station", 3, 1, 1500.00m);
        AddSoaLine(soa13, "Cellular Mobile Base Station Permit (Site C - Pasig)", "PRM-BASE-001", "300W ERP Base Station", 3, 1, 1500.00m);
        AddSoaLine(soa13, "Bulk Processing & Filing Fee", "BULK_FILING_FEE", "Group application handling charge", 1, 1, 500.00m);
        AddSoaHistory(soa13, "Consolidated Company SOA prepared.", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-4));

        app13.StatementsOfAccount.Add(soa13);
        applications.Add(app13);

        // ── 14. Check Payment Processing (OpStatus = Processing) ─────────────
        var app14 = MakeApp(Guid.Parse("a1400000-0000-0000-0000-000000000014"),
            "REF-2026-00014", "APP-2026-00014",
            ApplicationStatus.Approved, SubmissionMode.Single,
            ServiceLicenseId, applicants[3], now.AddDays(-11), "Cebu Field Office");

        AddHistory(app14, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Liza Villanueva", "Client", now.AddDays(-11));
        AddHistory(app14, "Approved. SOA & OP issued.", ApplicationStatus.Submitted, ApplicationStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-8));

        var soa14 = MakeSoa(Guid.Parse("b1400000-0000-0000-0000-000000000001"), app14,
            applicants[3].Id, IssuedToType.Individual, FullName(applicants[3]),
            now.AddDays(5), EvaluatorUserId,
            SoaStatus.Approved, AccountantUserId, now.AddDays(-8));
        AddSoaLine(soa14, "Commercial Radio Station License", "LIC-COMM-001", null, 3, 1, 1200.00m);
        AddSoaHistory(soa14, "SOA approved.", null, SoaStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-8));

        var op14 = MakeOp(Guid.Parse("e1400000-0000-0000-0000-000000000001"), app14, soa14, 1200.00m,
            OpStatus.Processing, PaymentMethod.Check, null, 1200.00m, CashierUserId, null);
        op14.CheckNumber = "CHK-BDO-992101";
        op14.CheckName = "Liza Villanueva";
        op14.CheckBank = "BDO Unibank Cebu Main Branch";
        op14.CheckDate = DateTime.UtcNow.AddDays(-2);
        op14.Remarks = "Check received at cashier counter. Awaiting bank clearance.";

        AddOpHistory(op14, "Order of Payment issued.", null, OpStatus.Billed,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-8));
        AddOpHistory(op14, "Check received by Cashier. Bank clearing in progress.",
            OpStatus.Billed, OpStatus.Processing,
            CashierUserId, "Bob Cashier", "Cashier", now.AddDays(-2), null,
            "Check CHK-BDO-992101 deposited for bank clearing.");

        app14.StatementsOfAccount.Add(soa14);
        app14.OrdersOfPayment.Add(op14);
        applications.Add(app14);

        // ── 15. Online Payment Completed (PaymentMethod = Online) ────────────
        var app15 = MakeApp(Guid.Parse("a1500000-0000-0000-0000-000000000015"),
            "REF-2026-00015", "APP-2026-00015",
            ApplicationStatus.Completed, SubmissionMode.Single,
            ServiceCertId, applicants[4], now.AddDays(-16), "Davao Field Office");

        AddHistory(app15, "Application submitted.", null, ApplicationStatus.Submitted,
            ClientUserId, "Carlo Reyes", "Client", now.AddDays(-16));
        AddHistory(app15, "Approved.", ApplicationStatus.Submitted, ApplicationStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-14));
        AddHistory(app15, "Payment completed via E-Payment Portal.", ApplicationStatus.Approved, ApplicationStatus.Completed,
            CashierUserId, "System Gateway", "Payment Gateway", now.AddDays(-12));

        var soa15 = MakeSoa(Guid.Parse("b1500000-0000-0000-0000-000000000001"), app15,
            applicants[4].Id, IssuedToType.Individual, FullName(applicants[4]),
            now.AddDays(-10), EvaluatorUserId,
            SoaStatus.Approved, AccountantUserId, now.AddDays(-14));
        AddSoaLine(soa15, "Radio Operator Certificate Renewal", "CERT-RADIO-REN", null, 5, 1, 650.00m);
        AddSoaHistory(soa15, "SOA approved.", null, SoaStatus.Approved,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-14));

        var op15 = MakeOp(Guid.Parse("e1500000-0000-0000-0000-000000000001"), app15, soa15, 650.00m,
            OpStatus.Paid, PaymentMethod.Online, "OR-2026-ONL-8812", 650.00m, CashierUserId, now.AddDays(-12));
        AddOpHistory(op15, "Order of Payment issued.", null, OpStatus.Billed,
            AccountantUserId, "Alice Accountant", "Accountant", now.AddDays(-14));
        AddOpHistory(op15, "Online payment confirmed via LandBank E-Payment Gateway.", OpStatus.Billed, OpStatus.Paid,
            CashierUserId, "System Gateway", "Payment Gateway", now.AddDays(-12), "OR-2026-ONL-8812");

        app15.StatementsOfAccount.Add(soa15);
        app15.OrdersOfPayment.Add(op15);
        applications.Add(app15);

        // ── 16. Multi-Correction Audit Trail — Filed by Third-Party Liaison ─
        var app16 = MakeApp(Guid.Parse("a1600000-0000-0000-0000-000000000016"),
            "REF-2026-00016", "APP-2026-00016",
            ApplicationStatus.Evaluating, SubmissionMode.Single,
            ServicePermitId, applicants[5], now.AddDays(-6), "Manila Main Office", liaisonUserId);

        AddHistory(app16, "Application submitted by Liaison Officer Engr. Ricardo Dizon on behalf of Ana Bautista.", null, ApplicationStatus.Submitted,
            liaisonUserId, "Engr. Ricardo Dizon", "Liaison Officer", now.AddDays(-6));
        AddHistory(app16, "Applicant details verified & updated during initial intake.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-5));

        AddCorrection(app16, "Applicant Profile", "ContactNumber", "09670000000", "09671234572", "Jane Evaluator", now.AddDays(-5));
        AddCorrection(app16, "Applicant Profile", "ZipCode", "1000", "1008", "Jane Evaluator", now.AddDays(-5));
        AddCorrection(app16, "Form Submission", "Station Location", "Block 4 Lot 1", "Unit 402 Sampaloc Manila", "Jane Evaluator", now.AddDays(-4));
        AddCorrection(app16, "Service Category", "ApplicationTypeKey", "RENEWAL", "NEW", "Jane Evaluator", now.AddDays(-4));

        AddFormSubmission(app16, applicants[5], new()
        {
            ("Liaison Representative", "Engr. Ricardo Dizon"),
            ("Authorization Letter No.", "AUTH-2026-APEX-09"),
            ("Commercial Operator ID", "COP-2024-5512"),
            ("Station Location", "Unit 402 Sampaloc Manila"),
            ("Equipment Power Rating", "100W PEP"),
        });

        applications.Add(app16);

        // ── 17. Multi-Item Complex SOA with 5 Fee Lines — Filed by Third-Party Liaison ─
        var app17 = MakeApp(Guid.Parse("a1700000-0000-0000-0000-000000000017"),
            "REF-2026-00017", "APP-2026-00017",
            ApplicationStatus.Approved, SubmissionMode.Single,
            ServiceLicenseId, applicants[6], now.AddDays(-9), "Cebu Field Office", liaisonUserId);

        AddHistory(app17, "Application submitted by Liaison Officer Engr. Ricardo Dizon on behalf of Miguel Lopez.", null, ApplicationStatus.Submitted,
            liaisonUserId, "Engr. Ricardo Dizon", "Liaison Officer", now.AddDays(-9));
        AddHistory(app17, "Under evaluation.", ApplicationStatus.Submitted, ApplicationStatus.Evaluating,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-7));
        AddHistory(app17, "Comprehensive multi-item SOA prepared.", ApplicationStatus.Evaluating, ApplicationStatus.Approved,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-5));

        AddFormSubmission(app17, applicants[6], new()
        {
            ("Public Trunkline Network Name", "Apex Metro-Trunk System"),
            ("Base Station Location", "Tower 2, IT Park, Lahug, Cebu City"),
            ("Number of Transceivers", "12 Units"),
            ("RF Radiation Compliance Certificate", "EMF-CERT-2025-0981"),
            ("Safety Officer In-Charge", "Engr. Manuel Roxas (PECE #4412)"),
            ("Emergency Power Source", "250 kVA Standby Generator Set"),
        });

        var soa17 = MakeSoa(Guid.Parse("b1700000-0000-0000-0000-000000000001"), app17,
            applicants[6].Id, IssuedToType.Individual, FullName(applicants[6]),
            now.AddDays(14), EvaluatorUserId);
        AddSoaLine(soa17, "Public Trunkline Service Station License", "LIC-TRUNK-001", "5-year commercial license", 5, 2, 2500.00m);
        AddSoaLine(soa17, "Technical Inspection & Measurement Fee", "FEE-INSPECT-01", "On-site RF radiation check", 1, 2, 850.00m);
        AddSoaLine(soa17, "Annual Spectrum Allocation Charge", "SPECTRUM_FEE", "VHF 150MHz band allocation", 1, 1, 1200.00m);
        AddSoaLine(soa17, "Standard Mandatory Filing Charge", "FILING_FEE", null, 1, 1, 180.00m);
        AddSoaLine(soa17, "Late Renewal Surcharge", "SURCHARGE_LATE", "20% penalty for 1-month delay", 1, 1, 500.00m);
        AddSoaHistory(soa17, "Comprehensive multi-item SOA prepared.", null, SoaStatus.Pending,
            EvaluatorUserId, "Jane Evaluator", "Evaluator", now.AddDays(-5));

        app17.StatementsOfAccount.Add(soa17);
        applications.Add(app17);

        // ─── Persist all ──────────────────────────────────────────────────────
        var existingAppIds = (await context.Applications.AsNoTracking().Select(a => a.Id).ToListAsync()).ToHashSet();
        var newAppsToInsert = applications.Where(a => !existingAppIds.Contains(a.Id)).ToList();
        if (newAppsToInsert.Count > 0)
        {
            context.Applications.AddRange(newAppsToInsert);
            await context.SaveChangesAsync();
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static string FullName(Applicant a) =>
        $"{a.ApplicantDetail?.FirstName} {a.ApplicantDetail?.LastName}".Trim();

    private static Applicant MakeApplicant(
        string firstName, string lastName, string middleName,
        string contactNumber, string emailAddress, DateOnly birthDate)
    {
        var detail = new ApplicantDetail
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            MiddleName = middleName,
            Nationality = "Filipino",
            Sex = "Male",
            Address = "Cebu City, Cebu",
            ContactNumber = contactNumber,
            EmailAddress = emailAddress,
            BirthDate = birthDate,
            ZipCode = "6000",
            CreatedAt = DateTime.UtcNow,
        };
        return new Applicant
        {
            Id = Guid.NewGuid(),
            TenantId = TenantId,
            UserId = ClientUserId,
            IsGuest = false,
            ApplicantType = ApplicantType.Individual,
            ApplicantDetail = detail,
            CreatedAt = DateTime.UtcNow,
        };
    }

    private static DomainApplication MakeApp(
        Guid id, string refNumber, string appNumber,
        ApplicationStatus status, SubmissionMode mode,
        Guid serviceId, Applicant applicant,
        DateTime createdAt, string office, Guid? userId = null)
    {
        var app = new DomainApplication
        {
            Id = id,
            TenantId = TenantId,
            ApplicationNumber = appNumber,
            ReferenceNumber = refNumber,
            Status = status,
            SubmissionMode = mode,
            Office = office,
            UserId = userId ?? ClientUserId,
            IsGuest = false,
            CreatedAt = createdAt,
        };
        app.ApplicationApplicants.Add(new ApplicationApplicant
        {
            Id = Guid.NewGuid(),
            ApplicationId = id,
            ApplicantId = applicant.Id,
            SequenceOrder = 1,
        });
        app.ApplicationServices.Add(new ApplicationService
        {
            Id = Guid.NewGuid(),
            ApplicationId = id,
            ServiceCategoryId = PermitCategoryId,
            ServiceId = serviceId,
            ApplicationTypeKey = "NEW",
        });
        return app;
    }

    private static StatementOfAccount MakeSoa(
        Guid id, DomainApplication app, Guid applicantId,
        IssuedToType issuedToType, string issuedToName,
        DateTime dueDate, Guid preparedBy,
        SoaStatus status = SoaStatus.Pending,
        Guid? approvedBy = null, DateTime? approvedAt = null)
    {
        return new StatementOfAccount
        {
            Id = id,
            ApplicationId = app.Id,
            ApplicantId = applicantId,
            SoaNumber = $"SOA-{app.CreatedAt:yyyy}-{id.ToString()[..6].ToUpper()}",
            Status = status,
            IssuedToType = issuedToType,
            IssuedToName = issuedToName,
            DueDate = dueDate,
            PreparedByUserId = preparedBy,
            ApprovedByUserId = approvedBy,
            ApprovedAt = approvedAt,
            TotalAmount = 0m,
            CreatedAt = app.CreatedAt.AddDays(2),
        };
    }

    private static void AddSoaLine(
        StatementOfAccount soa, string particular, string code,
        string? description, int validityYears, int noOfUnits, decimal feeRate)
    {
        var amount = noOfUnits * feeRate;
        soa.LineItems.Add(new SoaLineItem
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Particular = particular,
            ItemCode = code,
            Description = description,
            ValidityYears = validityYears,
            NoOfUnits = noOfUnits,
            FeeRate = feeRate,
            Amount = amount,
            PeriodOfCoverageStart = DateTime.UtcNow,
            PeriodOfCoverageEnd = DateTime.UtcNow.AddYears(validityYears),
        });
        soa.TotalAmount += amount;
    }

    private static void AddSoaHistory(
        StatementOfAccount soa, string action,
        SoaStatus? fromStatus, SoaStatus toStatus,
        Guid performedBy, string staffName, string staffRole,
        DateTime timestamp, string? remarks = null)
    {
        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = action,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            PerformedByUserId = performedBy,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = remarks,
            Timestamp = timestamp,
        });
    }

    private static OrderOfPayment MakeOp(
        Guid id, DomainApplication app, StatementOfAccount soa, decimal amountDue,
        OpStatus status = OpStatus.Billed,
        PaymentMethod? paymentMethod = null, string? orNumber = null,
        decimal amountReceived = 0m, Guid? verifiedBy = null, DateTime? paidAt = null)
    {
        return new OrderOfPayment
        {
            Id = id,
            ApplicationId = app.Id,
            StatementOfAccountId = soa.Id,
            OpNumber = $"OP-{app.CreatedAt:yyyy}-{id.ToString()[..6].ToUpper()}",
            Status = status,
            AmountDue = amountDue,
            AmountReceived = amountReceived,
            PaymentMethod = paymentMethod,
            OfficialReceiptNumber = orNumber,
            VerifiedByCashierId = verifiedBy,
            PaidAt = paidAt,
            CreatedAt = soa.CreatedAt.AddDays(1),
        };
    }

    private static void AddOpHistory(
        OrderOfPayment op, string action,
        OpStatus? fromStatus, OpStatus toStatus,
        Guid performedBy, string staffName, string staffRole,
        DateTime timestamp, string? orNumber = null, string? remarks = null)
    {
        op.Histories.Add(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = action,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            PerformedByUserId = performedBy,
            StaffName = staffName,
            StaffRole = staffRole,
            OfficialReceiptNumber = orNumber,
            Remarks = remarks,
            Timestamp = timestamp,
        });
    }

    private static void AddHistory(
        DomainApplication app, string action,
        ApplicationStatus? fromStatus, ApplicationStatus toStatus,
        Guid performedBy, string staffName, string staffRole,
        DateTime timestamp, string? remarks = null)
    {
        app.Histories.Add(new ApplicationHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Action = action,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            PerformedByUserId = performedBy,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = remarks,
            Timestamp = timestamp,
        });
    }

    private static void AddCorrection(
        DomainApplication app, string category, string fieldName,
        string oldValue, string newValue, string correctedBy, DateTime correctedAt)
    {
        app.CorrectionAuditTrails.Add(new CorrectionAuditTrail
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Category = category,
            FieldName = fieldName,
            OldValue = oldValue,
            NewValue = newValue,
            CorrectedByStaff = correctedBy,
            CorrectedAt = correctedAt,
        });
    }

    private static void AddFormSubmission(
        DomainApplication app, Applicant applicant,
        List<(string label, string value)> fields)
    {
        var submission = new FormSubmission
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            ApplicantId = applicant.Id,
            FormId = Guid.NewGuid(),
            CreatedAt = app.CreatedAt,
        };

        foreach (var (label, val) in fields)
        {
            submission.FieldValues.Add(new FormFieldValue
            {
                Id = Guid.NewGuid(),
                FormSubmissionId = submission.Id,
                FieldId = Guid.NewGuid(),
                CustomLabel = label,
                Value = val,
            });
        }

        app.FormSubmissions.Add(submission);
    }
}

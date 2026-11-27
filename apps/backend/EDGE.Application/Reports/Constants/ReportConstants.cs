using System.Collections.Generic;

namespace EDGE.Application.Reports.Constants;

public static class ReportConstants
{
    public const int DefaultBatchPageSize = 1000;
    public const int MaxSafetyRecordThreshold = 50000;

    public const string FormatStandard = "standard";
    public const string FormatNtcSheet = "ntc-sheet";

    public static readonly IReadOnlyList<string> StandardCategories = new[]
    {
        "Permits",
        "Licenses",
        "Accreditations",
        "Certificates",
        "Exams"
    };

    public static readonly IReadOnlyList<string> MonthNames = new[]
    {
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    };

    public static readonly IReadOnlyList<string> MonthShortNames = new[]
    {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    public static readonly IReadOnlyList<(string Code, string Label, int StartMonth, int EndMonth)> QuarterDefinitions = new[]
    {
        ("Q1", "Quarter 1 (Jan - Mar)", 0, 2),
        ("Q2", "Quarter 2 (Apr - Jun)", 3, 5),
        ("Q3", "Quarter 3 (Jul - Sep)", 6, 8),
        ("Q4", "Quarter 4 (Oct - Dec)", 9, 11)
    };

    public static readonly IReadOnlyList<(string Id, string Label, string ShortLabel)> RollingBuckets = new[]
    {
        ("w1", "Last 7 Days", "7D"),
        ("w2", "8-14 Days Ago", "14D"),
        ("w3", "15-30 Days Ago", "30D"),
        ("w4", "31-90 Days Ago", "90D")
    };

    public record StatutoryTemplate(
        string Code,
        string Title,
        string Agency,
        string Frequency,
        string LegalBasis,
        string BadgeColor
    );

    public static readonly StatutoryTemplate BarNo1 = new(
        Code: "NTC-BAR-1",
        Title: "Quarterly Physical Report of Operations",
        Agency: "Department of Budget and Management (DBM)",
        Frequency: "Quarterly",
        LegalBasis: "DBM-COA Joint Circular No. 2014-1",
        BadgeColor: "#2563EB"
    );

    public static readonly StatutoryTemplate BTrCoa01 = new(
        Code: "NTC-BTr-COA-01",
        Title: "Monthly Report of Collections and Deposits",
        Agency: "Commission on Audit (COA) / BTr",
        Frequency: "Monthly",
        LegalBasis: "COA Circular No. 2021-014 & NGAS Manual",
        BadgeColor: "#059669"
    );

    public static readonly StatutoryTemplate ArtaRa11032 = new(
        Code: "ARTA-RA-11032",
        Title: "Citizen's Charter SLA Compliance Report",
        Agency: "Anti-Red Tape Authority (ARTA)",
        Frequency: "Semi-Annual",
        LegalBasis: "Republic Act No. 11032 / Ease of Doing Business Act",
        BadgeColor: "#D97706"
    );

    public static readonly StatutoryTemplate SpectrumInventory = new(
        Code: "NTC-SPECTRUM-INV",
        Title: "Annual Radio Station & Spectrum Inventory",
        Agency: "NTC Central Office Spectrum Branch",
        Frequency: "Annual",
        LegalBasis: "Radio Control Act (Act No. 3846 as amended)",
        BadgeColor: "#7C3AED"
    );

    public static readonly StatutoryTemplate Csmr8888 = new(
        Code: "NTC-CSMR-8888",
        Title: "Citizen Satisfaction & 8888 Resolution Matrix",
        Agency: "Office of the President - 8888 Citizens' Center",
        Frequency: "Quarterly",
        LegalBasis: "Executive Order No. 6, s. 2016",
        BadgeColor: "#DC2626"
    );

    public static readonly StatutoryTemplate NovEnforcement = new(
        Code: "NTC-NOV-ENF",
        Title: "Enforcement & Notice of Violation Summary",
        Agency: "NTC Legal & Enforcement Branch",
        Frequency: "Quarterly",
        LegalBasis: "NTC Rules of Practice and Procedure (MC 09-05-2007)",
        BadgeColor: "#4B5563"
    );

    public static readonly StatutoryTemplate MisOps = new(
        Code: "NTC-MIS-OPS",
        Title: "Management Information System (MIS) Operations Accomplishment",
        Agency: "National Telecommunications Commission (NTC)",
        Frequency: "Monthly",
        LegalBasis: "NTC Annual Operating Plan & DBM Target Directives",
        BadgeColor: "#2563EB"
    );

    public static readonly StatutoryTemplate CoaApp26Monthly = new(
        Code: "NTC-COA-APP26-M",
        Title: "Report of Collections and Deposits (COA Appendix 26 - Monthly)",
        Agency: "Commission on Audit (COA)",
        Frequency: "Monthly",
        LegalBasis: "COA Circular No. 2020-006 & Government Accounting Manual (GAM) Vol II",
        BadgeColor: "#059669"
    );

    public static readonly StatutoryTemplate CoaApp26Daily = new(
        Code: "NTC-COA-APP26-D",
        Title: "Daily Collection Report (COA Appendix 26 - Daily OR Ledger)",
        Agency: "Commission on Audit (COA)",
        Frequency: "Daily",
        LegalBasis: "COA Circular No. 2020-006 & Republic Act No. 11032",
        BadgeColor: "#10B981"
    );

    public static readonly StatutoryTemplate BirDst01 = new(
        Code: "NTC-BIR-DST-01",
        Title: "Monthly Report of Documentary Stamp Tax (DST) Collection and Remittance",
        Agency: "Bureau of Internal Revenue (BIR)",
        Frequency: "Monthly",
        LegalBasis: "National Internal Revenue Code (NIRC) Sec 173-201 & TRAIN Law (RA 10963)",
        BadgeColor: "#D97706"
    );

    public static readonly StatutoryTemplate BtrInc01 = new(
        Code: "NTC-BTR-INC-01",
        Title: "Monthly Report of Income Collected and Deposited with the Bureau of the Treasury",
        Agency: "Bureau of the Treasury & COA",
        Frequency: "Monthly",
        LegalBasis: "Treasury Circular No. 01-2020 & General Appropriations Act",
        BadgeColor: "#7C3AED"
    );

    public static readonly StatutoryTemplate AppSumEval = new(
        Code: "NTC-APP-SUM-EVAL",
        Title: "Application Summary Report by Evaluator",
        Agency: "National Telecommunications Commission (NTC)",
        Frequency: "Monthly",
        LegalBasis: "Civil Service Commission SPMS & NTC Citizen Charter Work Standards",
        BadgeColor: "#0284C7"
    );

    public static readonly StatutoryTemplate AppSumSvc = new(
        Code: "NTC-APP-SUM-SVC",
        Title: "Application Summary Report by Service",
        Agency: "National Telecommunications Commission (NTC)",
        Frequency: "Monthly",
        LegalBasis: "NTC Citizens Charter & Regulatory Service Directory",
        BadgeColor: "#4F46E5"
    );

    public static readonly StatutoryTemplate AppSumEnt = new(
        Code: "NTC-APP-SUM-ENT",
        Title: "Application Summary Report by Entity",
        Agency: "National Telecommunications Commission (NTC)",
        Frequency: "On-Demand",
        LegalBasis: "Radio Control Act (Act 3846) & Public Telecommunications Policy Act (RA 7925)",
        BadgeColor: "#9333EA"
    );

    public static readonly StatutoryTemplate AppVol01 = new(
        Code: "NTC-APP-VOL-01",
        Title: "EDGE Application Volume Report",
        Agency: "National Telecommunications Commission (NTC)",
        Frequency: "Monthly",
        LegalBasis: "NTC Regional Performance Dashboard & ARTA RA 11032 Oversight",
        BadgeColor: "#0EA5E9"
    );

    public static readonly StatutoryTemplate ExamMst01 = new(
        Code: "NTC-EXAM-MST-01",
        Title: "Examination Masterlist (Commercial & Non-Commercial Radio Operator)",
        Agency: "National Telecommunications Commission (NTC)",
        Frequency: "On-Demand",
        LegalBasis: "Radio Control Act (Act 3846) & Radio Operator Examination Guidelines",
        BadgeColor: "#EA580C"
    );
}

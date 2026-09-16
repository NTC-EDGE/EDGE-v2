using System.Collections.Generic;

namespace EDGE.Application.Reports.Constants;

public static class ReportConstants
{
    public const int DefaultBatchPageSize = 1000;
    public const int MaxSafetyRecordThreshold = 50000;

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
}

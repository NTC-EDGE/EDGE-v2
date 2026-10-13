using System.Collections.Generic;

namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// Categories on the NTC Statement of Account fee matrix.
/// </summary>
public enum SoaCategory
{
    Licenses,
    Permits,
    AmateurRoc,
    OtherApplication
}

/// <summary>
/// Specific fee breakdown fields for a single Particular section (Yrs, %, Units, Fees).
/// </summary>
public class StatementOfAccountFeeDetail
{
    public string? NoOfYrs { get; set; }
    public string? Percent { get; set; }
    public string? NoOfUnits { get; set; }
    public decimal? Fees { get; set; }
}

/// <summary>
/// A line item in the NTC Statement of Account fee grid table.
/// </summary>
public class StatementOfAccountItem
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public SoaCategory Category { get; set; }

    public StatementOfAccountFeeDetail Particular1 { get; set; } = new();
    public StatementOfAccountFeeDetail Particular2 { get; set; } = new();
    public StatementOfAccountFeeDetail Particular3 { get; set; } = new();

    public decimal? SubTotal
    {
        get
        {
            decimal sum = 0;
            bool hasValue = false;
            if (Particular1.Fees.HasValue) { sum += Particular1.Fees.Value; hasValue = true; }
            if (Particular2.Fees.HasValue) { sum += Particular2.Fees.Value; hasValue = true; }
            if (Particular3.Fees.HasValue) { sum += Particular3.Fees.Value; hasValue = true; }
            return hasValue ? sum : null;
        }
    }
}

/// <summary>
/// Data model for NTC Statement of Account document.
/// Supports both blank templates and populated sample/production forms.
/// Renders as a 1-up portrait A4 document matching NTC official format.
/// </summary>
public class StatementOfAccountModel
{
    public string AgencyName { get; set; } = "NATIONAL TELECOMMUNICATIONS COMMISSION";
    public string Title { get; set; } = "Statement of Account";

    public string? PayorName { get; set; }
    public string? AccountNo { get; set; }
    public string Subtitle { get; set; } = "(RC Code-Year of Issue-Mo. Of Issue-Series of the RC)";
    public string? Date { get; set; }

    // Transaction Type Checkboxes
    public bool IsNew { get; set; }
    public bool IsMod { get; set; }
    public bool IsCo { get; set; }
    public bool IsMa { get; set; }
    public bool IsRen { get; set; }
    public bool IsDup { get; set; }
    public bool IsCv { get; set; }
    public bool IsRoc { get; set; }
    public bool IsOthersRroca { get; set; }
    public bool IsMs { get; set; }
    public bool IsOthers { get; set; }
    public string? OthersText { get; set; }

    // Particular Column Headers & Periods Covered
    public string? Particular1Header { get; set; }
    public string? Particular1PeriodCovered { get; set; }

    public string? Particular2Header { get; set; }
    public string? Particular2PeriodCovered { get; set; }

    public string? Particular3Header { get; set; }
    public string? Particular3PeriodCovered { get; set; }

    // Fee Items
    public List<StatementOfAccountItem> Items { get; set; } = new();

    // Notes
    public string? PaymentDueDate { get; set; }

    // Assessment checkboxes & OR stamp box
    public bool IsForAssessmentOnly { get; set; }
    public bool IsEndorsedForPayment { get; set; }

    public string? OrNo { get; set; }
    public string? OrAmount { get; set; }
    public string? OrDate { get; set; }
    public string? OrBy { get; set; }

    // Signatures
    public string PreparedByTitle { get; set; } = "EVALUATOR, NTC XIV";
    public string? PreparedByName { get; set; }

    public string ApprovedByTitle { get; set; } = "CEOD, NTC XIV";
    public string? ApprovedByName { get; set; }

    // Remarks
    public string Remarks { get; set; } = "1) Use additional sheets, if necessary to show detailed computation\n2) Payment should be in cash or checks in the form of managers/cashiers check;\nDemand draft check or postal money order payable to NTC 10, FAO Bureau of Treasury.";

    public string MonthOf { get; set; } = string.Empty;
    public bool IsAccountableFormOverlay { get; set; }

    public decimal? TotalAmount
    {
        get
        {
            decimal total = 0;
            bool hasValue = false;
            foreach (var item in Items)
            {
                if (item.SubTotal.HasValue)
                {
                    total += item.SubTotal.Value;
                    hasValue = true;
                }
            }
            return hasValue ? total : null;
        }
    }

    public StatementOfAccountModel()
    {
        InitDefaultItems();
    }

    public void InitDefaultItems()
    {
        Items = new List<StatementOfAccountItem>
        {
            // FOR LICENSES
            new() { Code = "4-02-01-010", Description = "Permit to Purchase", Category = SoaCategory.Licenses },
            new() { Code = "4-02-01-130", Description = "Filling Fee", Category = SoaCategory.Licenses },
            new() { Code = "4-02-01-010", Description = "Permit to Possess/Storage", Category = SoaCategory.Licenses },
            new() { Code = "4-02-01-010", Description = "Construction Permit Fee", Category = SoaCategory.Licenses },
            new() { Code = "4-02-01-060", Description = "Radio Station License", Category = SoaCategory.Licenses },
            new() { Code = "4-02-01-100", Description = "Inspection Fee", Category = SoaCategory.Licenses },
            new() { Code = "4-02-01-080", Description = "Spectrum User's Fee (SUF)", Category = SoaCategory.Licenses },
            new() { Code = "4-02-01-140", Description = "Fines/Penalties/Surcharges\n(SUR)Radio Station License\n(SUR)Spectrum User's Fee (SUF)", Category = SoaCategory.Licenses },

            // FOR PERMITS
            new() { Code = "4-02-01-010", Description = "Permit Fees (Dealers/Reseller/Service Center/Sell/ Transfer/REC/Import)", Category = SoaCategory.Permits },
            new() { Code = "4-02-01-100", Description = "Inspection Fee", Category = SoaCategory.Permits },
            new() { Code = "4-02-01-130", Description = "Filling Fee", Category = SoaCategory.Permits },
            new() { Code = "4-02-01-140", Description = "Fines/Penalties/Surcharges", Category = SoaCategory.Permits },

            // FOR AMATUER AND ROC
            new() { Code = "4-02-01-060", Description = "Radio Station License", Category = SoaCategory.AmateurRoc },
            new() { Code = "4-02-01-060", Description = "Radio Operator's Cert.", Category = SoaCategory.AmateurRoc },
            new() { Code = "4-02-01-130", Description = "Application Fee/Filing Fee", Category = SoaCategory.AmateurRoc },
            new() { Code = "4-02-02-040", Description = "Seminar Fee", Category = SoaCategory.AmateurRoc },
            new() { Code = "4-02-01-140", Description = "Fines/Penalties/Surcharges\n(SUR)Radio Station License :\nTO\n(SUR)Radio Operator's Cert. :\nTO", Category = SoaCategory.AmateurRoc },

            // OTHER APPLICATION
            new() { Code = "4-02-01-020", Description = "Registration Fee", Category = SoaCategory.OtherApplication },
            new() { Code = "4-02-01-070", Description = "Supervision & Regulation Fee", Category = SoaCategory.OtherApplication },
            new() { Code = "4-02-01-040", Description = "Verification Fee & Authentication Fees", Category = SoaCategory.OtherApplication },
            new() { Code = "4-02-01-030", Description = "Examination Fee", Category = SoaCategory.OtherApplication },
            new() { Code = "4-02-01-040", Description = "Clearance/Certification Fee", Category = SoaCategory.OtherApplication },
            new() { Code = "4-02-01-060", Description = "Modification Fee", Category = SoaCategory.OtherApplication },
            new() { Code = "4-02-01-990", Description = "Miscellaneous Income", Category = SoaCategory.OtherApplication },
            new() { Code = "4-01-04-010", Description = "Documentary Stamp Tax (DST)", Category = SoaCategory.OtherApplication },
            new() { Code = "", Description = "Others (PENALTY FOR LATE DELIVERY)", Category = SoaCategory.OtherApplication }
        };
    }
}

using System;
using System.Linq;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps real database StatementOfAccount and Application entities
/// to printable StatementOfAccountModel matching official NTC SOA form layout.
/// </summary>
public static class StatementOfAccountPrintMapper
{
    public static StatementOfAccountModel MapToPrintModel(
        StatementOfAccount? soa = null,
        EDGE.Domain.Entities.Application? app = null,
        OrderOfPayment? op = null,
        EDGE.Application.Applications.Dtos.RegionalSignatoriesDto? regionalSignatories = null)
    {
        var model = new StatementOfAccountModel();

        // 1. Resolve effective Order of Payment reference
        var activeOp = op
            ?? app?.OrdersOfPayment.FirstOrDefault(o => soa != null && o.StatementOfAccountId == soa.Id)
            ?? app?.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

        // 2. Basic Metadata & Payor
        model.AgencyName = "NATIONAL TELECOMMUNICATIONS COMMISSION";
        model.Title = "Statement of Account";

        var fallbackApplicantName = app?.ApplicationApplicants
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a => a?.CompanyDetail?.Name ?? (a?.ApplicantDetail != null ? $"{a.ApplicantDetail.FirstName} {a.ApplicantDetail.LastName}".Trim() : null))
            .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        model.PayorName = !string.IsNullOrWhiteSpace(soa?.IssuedToName)
            ? soa.IssuedToName
            : (fallbackApplicantName ?? (app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Applicant"));

        model.AccountNo = !string.IsNullOrWhiteSpace(soa?.SoaNumber)
            ? soa.SoaNumber
            : (app?.ReferenceNumber != null ? $"SOA-{app.ReferenceNumber}" : (activeOp?.OpNumber != null ? $"SOA-{activeOp.OpNumber}" : "SOA-TEMP"));

        var creationDate = soa != null && soa.CreatedAt != default
            ? soa.CreatedAt
            : (activeOp != null && activeOp.CreatedAt != default ? activeOp.CreatedAt : (app != null && app.CreatedAt != default ? app.CreatedAt : DateTime.UtcNow));

        model.Date = creationDate.ToString("MMM dd yyyy");
        model.MonthOf = creationDate.ToString("MMMM yyyy").ToUpperInvariant();

        var dueDate = soa != null && soa.DueDate != default
            ? soa.DueDate
            : creationDate.AddDays(30);

        model.PaymentDueDate = dueDate.ToString("MM/dd/yyyy");

        // 3. Transaction Type Checkboxes
        var primaryVariant = app?.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var primaryService = app?.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var variantDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? "").ToLowerInvariant();
        var serviceName = (primaryService?.Name ?? "").ToLowerInvariant();

        if (variantDesc.Contains("renew") || serviceName.Contains("renew"))
        {
            model.IsRen = true;
        }
        else if (variantDesc.Contains("mod") || serviceName.Contains("mod"))
        {
            model.IsMod = true;
        }
        else if (variantDesc.Contains("dup") || serviceName.Contains("dup"))
        {
            model.IsDup = true;
        }
        else if (variantDesc.Contains("cv") || serviceName.Contains("cv"))
        {
            model.IsCv = true;
        }
        else if (variantDesc.Contains("roc") || serviceName.Contains("roc"))
        {
            model.IsRoc = true;
        }
        else if (variantDesc.Contains("co") || serviceName.Contains("co"))
        {
            model.IsCo = true;
        }
        else if (variantDesc.Contains("ma") || serviceName.Contains("ma"))
        {
            model.IsMa = true;
        }
        else if (variantDesc.Contains("ms") || serviceName.Contains("ms"))
        {
            model.IsMs = true;
        }
        else
        {
            model.IsNew = true;
        }

        // 4. Assessment Checkboxes
        model.IsForAssessmentOnly = app?.Intent == ApplicationIntent.AssessmentOnly;
        model.IsEndorsedForPayment = (soa != null && soa.Status == SoaStatus.Approved) ||
                                     app?.Status == ApplicationStatus.PendingPayment ||
                                     app?.Status == ApplicationStatus.Completed ||
                                     (activeOp != null && (activeOp.PaidAt.HasValue || activeOp.Status == OpStatus.Paid));

        // 5. Particular Headers & Periods
        var firstItemWithPeriod = soa?.LineItems.FirstOrDefault(li => li.PeriodOfCoverageStart.HasValue && li.PeriodOfCoverageEnd.HasValue);
        model.Particular1Header = model.AccountNo;
        if (firstItemWithPeriod != null && firstItemWithPeriod.PeriodOfCoverageStart.HasValue && firstItemWithPeriod.PeriodOfCoverageEnd.HasValue)
        {
            model.Particular1PeriodCovered = $"{firstItemWithPeriod.PeriodOfCoverageStart.Value:MM/dd/yyyy} to {firstItemWithPeriod.PeriodOfCoverageEnd.Value:MM/dd/yyyy}";
        }
        else
        {
            model.Particular1PeriodCovered = $"{creationDate:MM/dd/yyyy} to {creationDate.AddYears(1):MM/dd/yyyy}";
        }

        // 6. Line Items mapping to grid items
        var lineItemsToMap = soa?.LineItems?.ToList();
        if ((lineItemsToMap == null || lineItemsToMap.Count == 0) && activeOp != null && activeOp.AmountDue > 0)
        {
            // Synthesize line item from Order of Payment reference
            lineItemsToMap = new List<SoaLineItem>
            {
                new SoaLineItem
                {
                    Particular = primaryService?.Name ?? "Regulatory & Statutory Assessment Fee",
                    ItemCode = "NTC-FEE",
                    Amount = activeOp.AmountDue,
                    ValidityYears = 1,
                    NoOfUnits = 1
                }
            };
        }

        if (lineItemsToMap != null)
        {
            foreach (var li in lineItemsToMap)
            {
                var matched = model.Items.FirstOrDefault(i =>
                    (!string.IsNullOrWhiteSpace(li.ItemCode) && string.Equals(i.Code, li.ItemCode, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrWhiteSpace(li.Particular) && i.Description.Contains(li.Particular, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrWhiteSpace(li.Particular) && li.Particular.Contains(i.Description, StringComparison.OrdinalIgnoreCase)));

                if (matched != null)
                {
                    matched.Particular1.Fees = (matched.Particular1.Fees ?? 0) + li.Amount;
                    if (li.ValidityYears > 0) matched.Particular1.NoOfYrs = li.ValidityYears.ToString();
                    if (li.NoOfUnits > 0) matched.Particular1.NoOfUnits = li.NoOfUnits.ToString();
                }
                else
                {
                    var othersItem = model.Items.FirstOrDefault(i => i.Category == SoaCategory.OtherApplication && i.Description == "Others");
                    if (othersItem != null && (othersItem.Particular1.Fees == null || othersItem.Particular1.Fees == 0))
                    {
                        othersItem.Description = $"Others: {li.Particular}";
                        othersItem.Code = li.ItemCode;
                        othersItem.Particular1.Fees = li.Amount;
                        if (li.ValidityYears > 0) othersItem.Particular1.NoOfYrs = li.ValidityYears.ToString();
                        if (li.NoOfUnits > 0) othersItem.Particular1.NoOfUnits = li.NoOfUnits.ToString();
                    }
                    else
                    {
                        model.Items.Add(new StatementOfAccountItem
                        {
                            Code = li.ItemCode,
                            Description = li.Particular,
                            Category = SoaCategory.OtherApplication,
                            Particular1 = new StatementOfAccountFeeDetail
                            {
                                Fees = li.Amount,
                                NoOfYrs = li.ValidityYears > 0 ? li.ValidityYears.ToString() : null,
                                NoOfUnits = li.NoOfUnits > 0 ? li.NoOfUnits.ToString() : null
                            }
                        });
                    }
                }
            }
        }

        // 7. Linked Order of Payment & OR Stamp Box if paid
        if (activeOp != null && !string.IsNullOrWhiteSpace(activeOp.OfficialReceiptNumber))
        {
            model.OrNo = activeOp.OfficialReceiptNumber;
            model.OrAmount = activeOp.AmountReceived > 0 ? $"P{activeOp.AmountReceived:N2}" : $"P{activeOp.AmountDue:N2}";
            model.OrDate = activeOp.PaidAt?.ToString("MMM dd yyyy") ?? activeOp.CreatedAt.ToString("MMM dd yyyy");
            model.OrBy = activeOp.Histories.FirstOrDefault(h => h.Action.Contains("Verified") || h.Action.Contains("Paid"))?.StaffName ?? "Cashier";
        }

        // 8. Signatures: Prepared By (Evaluator) & Approved By (Chief of EOD / Regional Director)
        var allHistories = (app?.Histories ?? Enumerable.Empty<Domain.Entities.ApplicationHistory>())
            .Select(h => new { h.StaffName, h.StaffRole, h.Action, ToStatus = (EDGE.Domain.Enums.ApplicationStatus?)h.ToStatus, h.Timestamp })
            .Concat((soa?.Histories ?? Enumerable.Empty<Domain.Entities.SoaHistory>())
                .Select(h => new { h.StaffName, h.StaffRole, h.Action, ToStatus = (EDGE.Domain.Enums.ApplicationStatus?)null, h.Timestamp }))
            .OrderByDescending(h => h.Timestamp)
            .ToList();

        // 8A. Resolve PREPARED BY:
        // Rule: The evaluator who evaluated / prepared the SOA. In multi-evaluator / re-evaluation
        // chains, the last evaluator who evaluated or approved the evaluation for the next stage.
        var evaluatorHistory = allHistories.FirstOrDefault(h =>
            h.ToStatus == EDGE.Domain.Enums.ApplicationStatus.ForAccountant ||
            (h.StaffRole != null && h.StaffRole.Contains("Evaluator", StringComparison.OrdinalIgnoreCase)) ||
            ((h.Action != null && (h.Action.Contains("Evaluation", StringComparison.OrdinalIgnoreCase) ||
                                   h.Action.Contains("SOA", StringComparison.OrdinalIgnoreCase) ||
                                   h.Action.Contains("Assessment", StringComparison.OrdinalIgnoreCase))) &&
             (h.StaffRole == null || (!h.StaffRole.Contains("Accountant", StringComparison.OrdinalIgnoreCase) && !h.StaffRole.Contains("Cashier", StringComparison.OrdinalIgnoreCase)))));

        var evaluatorName = evaluatorHistory?.StaffName
            ?? soa?.Histories.FirstOrDefault(h => h.Action == "Created" || h.StaffRole.Contains("Evaluator"))?.StaffName
            ?? activeOp?.Histories.FirstOrDefault(h => h.StaffRole.Contains("Evaluator"))?.StaffName;

        model.PreparedByName = !string.IsNullOrWhiteSpace(evaluatorName) ? evaluatorName : "EVALUATOR";

        var fallbackRegionLabel = !string.IsNullOrWhiteSpace(app?.Region?.Code)
            ? $"NTC {app.Region.Code}"
            : (!string.IsNullOrWhiteSpace(app?.Region?.Name)
                ? $"NTC {app.Region.Name}"
                : (!string.IsNullOrWhiteSpace(app?.Office) ? app.Office : "NTC"));

        if (regionalSignatories != null)
        {
            model.PreparedByTitle = regionalSignatories.GetResolvedEvaluatorTitle(evaluatorHistory?.StaffRole);
        }
        else
        {
            model.PreparedByTitle = $"Evaluator, {fallbackRegionLabel}";
        }

        // 8B. Resolve APPROVED BY:
        // Rule: The Chief of Enforcement and Operations Division (Chief of EOD).
        // If no Chief of EOD in the specified region, automatically defaults to Regional Director.
        var chiefOrDirectorHistory = allHistories.FirstOrDefault(h =>
            (h.StaffRole != null && (h.StaffRole.Contains("Chief", StringComparison.OrdinalIgnoreCase) ||
                                     h.StaffRole.Contains("CEOD", StringComparison.OrdinalIgnoreCase) ||
                                     h.StaffRole.Contains("Regional Director", StringComparison.OrdinalIgnoreCase) ||
                                     h.StaffRole.Contains("Director", StringComparison.OrdinalIgnoreCase))) ||
            (h.Action != null && (h.Action.Contains("Chief", StringComparison.OrdinalIgnoreCase) ||
                                  h.Action.Contains("Director", StringComparison.OrdinalIgnoreCase))));

        if (chiefOrDirectorHistory != null && !string.IsNullOrWhiteSpace(chiefOrDirectorHistory.StaffName))
        {
            model.ApprovedByName = chiefOrDirectorHistory.StaffName;
            var isDirector = chiefOrDirectorHistory.StaffRole.Contains("Director", StringComparison.OrdinalIgnoreCase);
            model.ApprovedByTitle = isDirector
                ? $"Regional Director, {fallbackRegionLabel}"
                : $"Chief, Enforcement & Operations Division, {fallbackRegionLabel}";
        }
        else if (regionalSignatories != null)
        {
            model.ApprovedByName = regionalSignatories.GetResolvedApproverName(defaultFallback: "CHIEF, EOD");
            model.ApprovedByTitle = regionalSignatories.GetResolvedApproverTitle();
        }
        else
        {
            model.ApprovedByName = "CHIEF, EOD";
            model.ApprovedByTitle = $"Chief, Enforcement & Operations Division, {fallbackRegionLabel}";
        }

        // 9. Remarks
        if (!string.IsNullOrWhiteSpace(soa?.Remarks))
        {
            model.Remarks = $"{soa.Remarks}\n\n{model.Remarks}";
        }
        else if (!string.IsNullOrWhiteSpace(activeOp?.Remarks))
        {
            model.Remarks = $"{activeOp.Remarks}\n\n{model.Remarks}";
        }

        return model;
    }
}

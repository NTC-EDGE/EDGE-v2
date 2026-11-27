using System;
using System.Linq;
using System.Text.RegularExpressions;
using EDGE.Application.Common.Helpers;
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
        EDGE.Application.Applications.Dtos.RegionalSignatoriesDto? regionalSignatories = null,
        OfficialReceipt? receipt = null,
        string? overrideOrNumber = null,
        IEnumerable<OfficialReceipt>? receipts = null,
        SoaNote? tenantSoaNote = null)
    {
        var model = new StatementOfAccountModel();

        // 1. Resolve effective Order of Payment reference
        var paidOp = app?.OrdersOfPayment?
            .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
            .FirstOrDefault(o => o.Status == EDGE.Domain.Enums.OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber));

        var activeOp = op
            ?? paidOp
            ?? app?.OrdersOfPayment.FirstOrDefault(o => soa != null && o.StatementOfAccountId == soa.Id)
            ?? app?.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

        // 2. Basic Metadata & Payor
        model.AgencyName = "NATIONAL TELECOMMUNICATIONS COMMISSION";
        model.RegionalOfficeName = !string.IsNullOrWhiteSpace(app?.Office)
            ? app.Office.Trim()
            : (!string.IsNullOrWhiteSpace(regionalSignatories?.OfficeName)
                ? regionalSignatories.OfficeName.Trim()
                : (!string.IsNullOrWhiteSpace(app?.Region?.Name) ? app.Region.Name.Trim() : null));
        model.Title = "Statement of Account";

        var isBulkConsolidatedSoa = (app?.SubmissionMode == SubmissionMode.Bulk || (app?.ApplicationApplicants?.Count ?? 0) > 1)
                                    && (soa == null || !soa.ApplicantId.HasValue);
        var isPerApplicantSoa = soa?.ApplicantId.HasValue == true;

        var companyName = app?.User?.CompanyDetail?.Name
            ?? app?.ApplicationApplicants
                .Select(aa => aa.Applicant?.CompanyDetail?.Name ?? aa.Applicant?.ApplicantDetail?.CompanyDetail?.Name)
                .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        var targetApplicantForSoa = isPerApplicantSoa
            ? app?.ApplicationApplicants.Select(aa => aa.Applicant).FirstOrDefault(a => a != null && a.Id == soa!.ApplicantId!.Value)
            : app?.ApplicationApplicants.Select(aa => aa.Applicant).FirstOrDefault(a => a != null);

        var targetApplicantPersonalName = targetApplicantForSoa?.ApplicantDetail != null
            ? string.Join(" ", new[]
            {
                targetApplicantForSoa.ApplicantDetail.FirstName,
                targetApplicantForSoa.ApplicantDetail.MiddleName,
                targetApplicantForSoa.ApplicantDetail.LastName,
                targetApplicantForSoa.ApplicantDetail.Suffix
            }.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s!.Trim()))
            : null;

        var fallbackApplicantName = isBulkConsolidatedSoa && !string.IsNullOrWhiteSpace(companyName)
            ? companyName!.Trim()
            : (isPerApplicantSoa && !string.IsNullOrWhiteSpace(targetApplicantPersonalName)
                ? targetApplicantPersonalName
                : (targetApplicantForSoa?.CompanyDetail?.Name ?? targetApplicantPersonalName ?? companyName));

        if (isBulkConsolidatedSoa && !string.IsNullOrWhiteSpace(companyName))
        {
            // For Bulk Consolidated SOA, ensure payor is the Company, not an individual applicant or representative
            var issuedName = soa?.IssuedToName?.Trim();
            var isPersonalOrRep = string.IsNullOrWhiteSpace(issuedName) ||
                (app?.ApplicationApplicants.Any(aa =>
                    aa.Applicant?.ApplicantDetail != null &&
                    (string.Equals(issuedName, $"{aa.Applicant.ApplicantDetail.FirstName} {aa.Applicant.ApplicantDetail.LastName}".Trim(), StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(issuedName, string.Join(" ", new[] { aa.Applicant.ApplicantDetail.FirstName, aa.Applicant.ApplicantDetail.MiddleName, aa.Applicant.ApplicantDetail.LastName, aa.Applicant.ApplicantDetail.Suffix }.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s!.Trim())), StringComparison.OrdinalIgnoreCase))) == true) ||
                (app?.User != null && string.Equals(issuedName, $"{app.User.FirstName} {app.User.LastName}".Trim(), StringComparison.OrdinalIgnoreCase) && !string.Equals(issuedName, companyName.Trim(), StringComparison.OrdinalIgnoreCase));

            model.PayorName = isPersonalOrRep ? companyName.Trim() : issuedName!;
        }
        else if (isPerApplicantSoa && !string.IsNullOrWhiteSpace(targetApplicantPersonalName))
        {
            // For By-Applicant SOA, ensure payor is the Individual Applicant, not the Company
            var issuedName = soa?.IssuedToName?.Trim();
            var isCompanyName = string.IsNullOrWhiteSpace(issuedName) ||
                (!string.IsNullOrWhiteSpace(companyName) && string.Equals(issuedName, companyName.Trim(), StringComparison.OrdinalIgnoreCase));

            model.PayorName = isCompanyName ? targetApplicantPersonalName : issuedName!;
        }
        else
        {
            model.PayorName = !string.IsNullOrWhiteSpace(soa?.IssuedToName)
                ? soa.IssuedToName
                : (fallbackApplicantName ?? (app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Applicant"));
        }

        model.AccountNo = !string.IsNullOrWhiteSpace(soa?.SoaNumber)
            ? soa.SoaNumber
            : (app?.ReferenceNumber != null ? $"SOA-{app.ReferenceNumber}" : (activeOp?.OpNumber != null ? $"SOA-{activeOp.OpNumber}" : "SOA-TEMP"));

        var creationDate = soa != null && soa.CreatedAt != default
            ? soa.CreatedAt
            : (activeOp != null && activeOp.CreatedAt != default ? activeOp.CreatedAt : (app != null && app.CreatedAt != default ? app.CreatedAt : DateTime.UtcNow));

        model.Date = creationDate.ToString("MMMM dd, yyyy");
        model.MonthOf = creationDate.ToString("MMMM yyyy").ToUpperInvariant();

        var dueDate = soa != null && soa.DueDate != default
            ? soa.DueDate
            : creationDate.AddDays(30);

        model.PaymentDueDate = dueDate.ToString("MMMM dd, yyyy");

        // 3. Transaction Type Checkboxes
        var primaryVariant = app?.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var primaryService = app?.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var variantDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? "").ToLowerInvariant();

        if (primaryVariant?.Type == ServiceVariantType.Renewal || app?.RenewedFromApplicationId != null || Regex.IsMatch(variantDesc, @"\b(renew|renewal|rn)\b", RegexOptions.IgnoreCase))
        {
            model.IsRen = true;
        }
        else if (primaryVariant?.Type == ServiceVariantType.Modification || primaryVariant?.Type == ServiceVariantType.Upgrade || Regex.IsMatch(variantDesc, @"\b(mod|modification|upgrade|amend|amendment)\b", RegexOptions.IgnoreCase))
        {
            model.IsMod = true;
        }
        else if (Regex.IsMatch(variantDesc, @"\b(dup|duplicate|replacement|lost)\b", RegexOptions.IgnoreCase))
        {
            model.IsDup = true;
        }
        else if (Regex.IsMatch(variantDesc, @"\bcv\b", RegexOptions.IgnoreCase) || variantDesc.Contains("change of vehicle"))
        {
            model.IsCv = true;
        }
        else if (Regex.IsMatch(variantDesc, @"\broc\b", RegexOptions.IgnoreCase) || variantDesc.Contains("radio operator certificate"))
        {
            model.IsRoc = true;
        }
        else if (Regex.IsMatch(variantDesc, @"\bco\b", RegexOptions.IgnoreCase) || variantDesc.Contains("change of ownership"))
        {
            model.IsCo = true;
        }
        else if (Regex.IsMatch(variantDesc, @"\bma\b", RegexOptions.IgnoreCase) || variantDesc.Contains("mobile amateur"))
        {
            model.IsMa = true;
        }
        else if (Regex.IsMatch(variantDesc, @"\bms\b", RegexOptions.IgnoreCase) || variantDesc.Contains("mobile station"))
        {
            model.IsMs = true;
        }
        else
        {
            model.IsNew = true;
        }

        // 4. Assessment Checkboxes
        model.IsForAssessmentOnly = app?.Intent == ApplicationIntent.AssessmentOnly;
        model.IsEndorsedForPayment = !model.IsForAssessmentOnly;

        // 5. Particular Headers & Periods
        var soaLineItems = soa?.LineItems ?? new List<SoaLineItem>();
        var firstItemWithPeriod = soaLineItems.FirstOrDefault(li => li.PeriodOfCoverageStart.HasValue && li.PeriodOfCoverageEnd.HasValue);
        var particularNumber = ResolveParticularNumber(app);
        model.Particular1Header = !string.IsNullOrWhiteSpace(particularNumber) ? particularNumber : model.AccountNo;
        if (firstItemWithPeriod != null && firstItemWithPeriod.PeriodOfCoverageStart.HasValue && firstItemWithPeriod.PeriodOfCoverageEnd.HasValue)
        {
            model.Particular1PeriodCovered = $"{firstItemWithPeriod.PeriodOfCoverageStart.Value:MM/dd/yyyy} to {firstItemWithPeriod.PeriodOfCoverageEnd.Value:MM/dd/yyyy}";
        }
        else if (soaLineItems.Any(li => li.ValidityYears > 0))
        {
            var maxYears = soaLineItems.Max(li => li.ValidityYears);
            model.Particular1PeriodCovered = $"{creationDate:MM/dd/yyyy} to {creationDate.AddYears(maxYears):MM/dd/yyyy}";
        }
        else
        {
            model.Particular1PeriodCovered = string.Empty;
        }

        // 6. Line Items mapping to grid items
        var lineItemsToMap = soa?.LineItems?
            .GroupBy(li =>
            {
                var part = li.Particular ?? string.Empty;
                var canonical = EDGE.Domain.Constants.FeeConstants.Codes.NormalizeCanonicalCode(li.ItemCode, part);
                var isOthers = part.StartsWith("Others", StringComparison.OrdinalIgnoreCase);
                return !isOthers && canonical != "FEE"
                    ? canonical
                    : $"{canonical}::{part}";
            }, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();
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

                var feeRate = li.FeeRate > 0 ? li.FeeRate : (li.NoOfUnits > 1 ? li.Amount / li.NoOfUnits : li.Amount);
                if (matched != null)
                {
                    matched.Particular1.Fees = feeRate;
                    matched.Particular1.Amount = (matched.Particular1.Amount ?? 0) + li.Amount;
                    if (li.ValidityYears > 0) matched.Particular1.NoOfYrs = li.ValidityYears.ToString();
                    if (li.NoOfUnits > 0) matched.Particular1.NoOfUnits = li.NoOfUnits.ToString();
                }
                else
                {
                    var othersItem = model.Items.FirstOrDefault(i => i.Category == SoaCategory.OtherApplication && 
                        (i.Description == "Others" || i.Description.StartsWith("Others", StringComparison.OrdinalIgnoreCase)));
                    if (othersItem != null && (othersItem.Particular1.Amount == null || othersItem.Particular1.Amount == 0))
                    {
                        var safeParticular = li.Particular ?? "Other Fee";
                        othersItem.Description = safeParticular.StartsWith("Others", StringComparison.OrdinalIgnoreCase)
                            ? safeParticular
                            : $"Others: {safeParticular}";
                        othersItem.Code = !string.IsNullOrWhiteSpace(li.ItemCode) ? li.ItemCode : "4-02-01-990";
                        othersItem.Particular1.Fees = feeRate;
                        othersItem.Particular1.Amount = li.Amount;
                        if (li.ValidityYears > 0) othersItem.Particular1.NoOfYrs = li.ValidityYears.ToString();
                        if (li.NoOfUnits > 0) othersItem.Particular1.NoOfUnits = li.NoOfUnits.ToString();
                    }
                    else
                    {
                        model.Items.Add(new StatementOfAccountItem
                        {
                            Code = li.ItemCode ?? string.Empty,
                            Description = li.Particular ?? "Other Fee",
                            Category = SoaCategory.OtherApplication,
                            Particular1 = new StatementOfAccountFeeDetail
                            {
                                Fees = feeRate,
                                Amount = li.Amount,
                                NoOfYrs = li.ValidityYears > 0 ? li.ValidityYears.ToString() : null,
                                NoOfUnits = li.NoOfUnits > 0 ? li.NoOfUnits.ToString() : null
                            }
                        });
                    }
                }
            }
        }

        // 7. Linked Order of Payment & OR Stamp Box if paid - supports single or multiple Official Receipts
        var allReceiptNumbers = new List<string>();

        // Identify any explicitly cancelled receipts to avoid exposing stale or voided receipt numbers
        var cancelledReceiptNumbers = (receipts ?? Enumerable.Empty<OfficialReceipt>())
            .Concat(receipt != null ? new[] { receipt } : Enumerable.Empty<OfficialReceipt>())
            .Where(r => r != null && (r.Status == ReceiptStatus.Cancelled || r.CancelledAt != null) && !string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
            .Select(r => r.OfficialReceiptNumber.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(overrideOrNumber))
        {
            allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(overrideOrNumber));
        }
        else
        {
            if (receipts != null)
            {
                allReceiptNumbers.AddRange(receipts
                    .Where(r => r != null && r.Status != ReceiptStatus.Cancelled && r.CancelledAt == null && !string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
                    .Select(r => r.OfficialReceiptNumber.Trim()));
            }

            if (receipt != null && receipt.Status != ReceiptStatus.Cancelled && receipt.CancelledAt == null && !string.IsNullOrWhiteSpace(receipt.OfficialReceiptNumber))
            {
                allReceiptNumbers.Add(receipt.OfficialReceiptNumber.Trim());
            }

            if (activeOp != null && activeOp.Status != OpStatus.Returned && !string.IsNullOrWhiteSpace(activeOp.OfficialReceiptNumber))
            {
                allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(activeOp.OfficialReceiptNumber));
            }

            if (app?.OrdersOfPayment != null)
            {
                foreach (var otherOp in app.OrdersOfPayment)
                {
                    if (otherOp.Status != OpStatus.Returned && !string.IsNullOrWhiteSpace(otherOp.OfficialReceiptNumber))
                    {
                        allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(otherOp.OfficialReceiptNumber));
                    }
                }
            }

            if (app?.IssuedDocumentDetails != null)
            {
                foreach (var doc in app.IssuedDocumentDetails)
                {
                    if (!string.IsNullOrWhiteSpace(doc.OfficialReceiptNumber))
                    {
                        allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(doc.OfficialReceiptNumber));
                    }
                }
            }

            if (activeOp?.Histories != null)
            {
                foreach (var h in activeOp.Histories)
                {
                    if (!string.IsNullOrWhiteSpace(h.OfficialReceiptNumber) &&
                        (h.Action == null || (!h.Action.Contains("Returned", StringComparison.OrdinalIgnoreCase) && !h.Action.Contains("Cancel", StringComparison.OrdinalIgnoreCase))))
                    {
                        allReceiptNumbers.AddRange(DelimitedStringHelper.SplitDelimited(h.OfficialReceiptNumber));
                    }
                }
            }
        }

        var distinctOrNumbers = DelimitedStringHelper.ParseDistinctTokens(
            allReceiptNumbers.Where(n => !cancelledReceiptNumbers.Contains(n.Trim())),
            comparer: StringComparer.OrdinalIgnoreCase);

        var effectiveOrNumber = DelimitedStringHelper.FormatOrDisplay(distinctOrNumbers);

        model.OrNumbers = distinctOrNumbers;

        bool isPaid = distinctOrNumbers.Count > 0
            || (activeOp != null && activeOp.Status == EDGE.Domain.Enums.OpStatus.Paid)
            || receipt != null
            || (receipts != null && receipts.Any())
            || (app != null && (app.Status == EDGE.Domain.Enums.ApplicationStatus.ForIssuance
                             || app.Status == EDGE.Domain.Enums.ApplicationStatus.Completed
                             || app.Status == EDGE.Domain.Enums.ApplicationStatus.Approved));

        if (isPaid)
        {
            decimal effectiveAmount;
            if (!string.IsNullOrWhiteSpace(overrideOrNumber))
            {
                var matchingReceipt = receipts?.FirstOrDefault(r => string.Equals(r.OfficialReceiptNumber?.Trim(), overrideOrNumber.Trim(), StringComparison.OrdinalIgnoreCase))
                    ?? (string.Equals(receipt?.OfficialReceiptNumber?.Trim(), overrideOrNumber.Trim(), StringComparison.OrdinalIgnoreCase) ? receipt : null);

                effectiveAmount = matchingReceipt?.Amount > 0
                    ? matchingReceipt.Amount
                    : (activeOp?.AmountReceived > 0 ? activeOp.AmountReceived : (activeOp?.AmountDue ?? model.TotalAmount ?? 0));
            }
            else
            {
                var receiptsSum = receipts?.Where(r => r.Status != ReceiptStatus.Cancelled).Sum(r => r.Amount) ?? 0;
                effectiveAmount = activeOp?.AmountReceived > 0
                    ? activeOp.AmountReceived
                    : (receiptsSum > 0
                        ? receiptsSum
                        : (receipt != null && receipt.Amount > 0
                            ? receipt.Amount
                            : (activeOp?.AmountDue ?? model.TotalAmount ?? 0)));
            }

            var effectiveDate = activeOp?.PaidAt
                ?? receipt?.IssuedAt
                ?? receipts?.OrderByDescending(r => r.IssuedAt).Select(r => (DateTime?)r.IssuedAt).FirstOrDefault()
                ?? activeOp?.Histories?.FirstOrDefault(h => h.Action != null && (h.Action.Contains("Verified") || h.Action.Contains("Paid")))?.Timestamp
                ?? (activeOp != null && activeOp.CreatedAt != default ? activeOp.CreatedAt : (app != null && app.CreatedAt != default ? app.CreatedAt : DateTime.UtcNow));

            var cashierStaff = activeOp?.Histories?.FirstOrDefault(h => h.Action != null && (h.Action.Contains("Verified") || h.Action.Contains("Paid")))?.StaffName
                ?? app?.Histories?.FirstOrDefault(h => h.StaffRole != null && h.StaffRole.Contains("Cashier", StringComparison.OrdinalIgnoreCase))?.StaffName
                ?? (receipt?.IssuedByUser != null ? $"{receipt.IssuedByUser.FirstName} {receipt.IssuedByUser.LastName}".Trim() : null)
                ?? (receipts?.FirstOrDefault(r => r.IssuedByUser != null)?.IssuedByUser is { } firstCashierUser ? $"{firstCashierUser.FirstName} {firstCashierUser.LastName}".Trim() : null)
                ?? "Cashier";

            model.OrNo = !string.IsNullOrWhiteSpace(effectiveOrNumber) ? effectiveOrNumber : "OR-RECORDED";
            model.OrAmount = $"P{effectiveAmount:N2}";
            model.OrDate = effectiveDate.ToString("MMMM dd, yyyy");
            model.OrBy = cashierStaff;
        }

        // 8. Signatures: Prepared By (Evaluator) & Approved By (Chief of EOD / Regional Director)
        var allHistories = (app?.Histories ?? Enumerable.Empty<Domain.Entities.ApplicationHistory>())
            .Select(h => new { h.StaffName, h.StaffRole, h.Action, ToStatus = (EDGE.Domain.Enums.ApplicationStatus?)h.ToStatus, h.Timestamp, h.PerformedByUserId })
            .Concat((soa?.Histories ?? Enumerable.Empty<Domain.Entities.SoaHistory>())
                .Select(h => new { h.StaffName, h.StaffRole, h.Action, ToStatus = (EDGE.Domain.Enums.ApplicationStatus?)null, h.Timestamp, h.PerformedByUserId }))
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

        var soaEvaluatorHistory = soa?.Histories?.FirstOrDefault(h => h.Action == "Created" || (h.StaffRole != null && h.StaffRole.Contains("Evaluator", StringComparison.OrdinalIgnoreCase)));
        var opEvaluatorHistory = activeOp?.Histories?.FirstOrDefault(h => h.StaffRole != null && h.StaffRole.Contains("Evaluator", StringComparison.OrdinalIgnoreCase));

        var evaluatorName = evaluatorHistory?.StaffName
            ?? soaEvaluatorHistory?.StaffName
            ?? opEvaluatorHistory?.StaffName;

        model.PreparedByUserId = evaluatorHistory?.PerformedByUserId
            ?? soaEvaluatorHistory?.PerformedByUserId
            ?? opEvaluatorHistory?.PerformedByUserId;

        var fallbackRegionLabel = !string.IsNullOrWhiteSpace(app?.Region?.Code)
            ? $"NTC {app.Region.Code}"
            : (!string.IsNullOrWhiteSpace(app?.Region?.Name)
                ? $"NTC {app.Region.Name}"
                : (!string.IsNullOrWhiteSpace(app?.Office) ? app.Office : "NTC"));

        model.PreparedByName = !string.IsNullOrWhiteSpace(evaluatorName)
            ? evaluatorName
            : (regionalSignatories != null
                ? regionalSignatories.GetResolvedEvaluatorName()
                : (!string.IsNullOrWhiteSpace(fallbackRegionLabel) && fallbackRegionLabel != "NTC" ? $"EVALUATOR, {fallbackRegionLabel}" : "EVALUATOR"));

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
            model.ApprovedByUserId = chiefOrDirectorHistory.PerformedByUserId;
            var isDirector = chiefOrDirectorHistory.StaffRole != null &&
                             chiefOrDirectorHistory.StaffRole.Contains("Director", StringComparison.OrdinalIgnoreCase);
            model.ApprovedByTitle = isDirector
                ? $"Regional Director, {fallbackRegionLabel}"
                : $"Chief, Enforcement & Operations Division, {fallbackRegionLabel}";
            model.ApprovedBySignature = regionalSignatories?.GetResolvedApproverSignature();
        }
        else if (regionalSignatories != null)
        {
            model.ApprovedByName = regionalSignatories.GetResolvedApproverName(defaultFallback: "CHIEF, EOD");
            model.ApprovedByTitle = regionalSignatories.GetResolvedApproverTitle();
            model.ApprovedBySignature = regionalSignatories.GetResolvedApproverSignature();
        }
        else
        {
            model.ApprovedByName = "CHIEF, EOD";
            model.ApprovedByTitle = $"Chief, Enforcement & Operations Division, {fallbackRegionLabel}";
        }

        if (!string.IsNullOrWhiteSpace(model.ApprovedBySignature))
        {
            model.ApprovedBySignatureBytes = AcroForm.SignatoryImageHelper.TryDecodeInlineSignatureBytes(model.ApprovedBySignature);
        }

        // 9. Remarks & Notes
        // Statement of Account (SOA) is an assessment billing document, NOT a payment receipt.
        // It stores the immutable string snapshot of the regional SOA note / evaluator instructions saved on the record.
        // If Remarks is present, it is used directly as the primary source of truth, ensuring historic client billing
        // records remain unchanged even if the regional SOA note is subsequently updated in tenant settings.
        var cleanRemarks = (!string.IsNullOrWhiteSpace(soa?.Remarks) && !soa.Remarks.Contains("[PAYMENT_BREAKDOWN"))
            ? soa.Remarks.Trim()
            : null;

        if (!string.IsNullOrWhiteSpace(cleanRemarks))
        {
            model.Remarks = cleanRemarks;
        }
        else
        {
            var effectiveNote = soa?.SoaNote ?? tenantSoaNote;
            var noteText = !string.IsNullOrWhiteSpace(effectiveNote?.Notes) ? effectiveNote.Notes.Trim() : null;
            if (!string.IsNullOrWhiteSpace(noteText))
            {
                model.Remarks = noteText;
            }
            else if (!string.IsNullOrWhiteSpace(app?.Remarks) && !app.Remarks.Contains("[PAYMENT_BREAKDOWN"))
            {
                model.Remarks = app.Remarks.Trim();
            }
            else
            {
                // SOA Note is not hardcoded and comes purely from backend.
                // If nothing is saved in SOA note and no tenant SOA note can be pulled from backend,
                // keep Remarks empty.
                model.Remarks = string.Empty;
            }
        }

        if (string.IsNullOrWhiteSpace(model.Remarks))
        {
            model.Remarks = string.Empty;
        }

        return model;
    }

    public static string ResolveParticularNumber(EDGE.Domain.Entities.Application? app)
    {
        if (app == null) return string.Empty;

        // 1. License Number or Form Number from Issued Document Details
        if (app.IssuedDocumentDetails != null && app.IssuedDocumentDetails.Any())
        {
            var issuedLic = app.IssuedDocumentDetails
                .Select(d => !string.IsNullOrWhiteSpace(d.LicenseNumber) ? d.LicenseNumber.Trim() : d.FormNumber?.Trim())
                .FirstOrDefault(num => !string.IsNullOrWhiteSpace(num));
            if (!string.IsNullOrWhiteSpace(issuedLic))
                return issuedLic;
        }

        // 2. Permit, License, Certificate, Registration, or Call Sign from FormFieldValues
        if (app.FormSubmissions != null && app.FormSubmissions.Any())
        {
            foreach (var sub in app.FormSubmissions)
            {
                if (sub.FieldValues == null) continue;
                foreach (var fv in sub.FieldValues)
                {
                    if (string.IsNullOrWhiteSpace(fv.Value)) continue;
                    var label = (fv.CustomLabel ?? fv.Field?.Label)?.ToLowerInvariant() ?? string.Empty;
                    var key = label;

                    if (label.Contains("license number") || key.Contains("licensenumber") ||
                        label.Contains("permit number") || key.Contains("permitnumber") ||
                        label.Contains("certificate number") || key.Contains("certificatenumber") ||
                        label.Contains("registration number") || key.Contains("registrationnumber") ||
                        label.Contains("call sign") || key.Contains("callsign") ||
                        label.Contains("roc number") || key.Contains("rocnumber") ||
                        label.Contains("rsl number") || key.Contains("rslnumber"))
                    {
                        return fv.Value.Trim();
                    }
                }
            }
        }

        // 3. Application Number
        if (!string.IsNullOrWhiteSpace(app.ApplicationNumber))
            return app.ApplicationNumber.Trim();

        // 4. Reference Number
        if (!string.IsNullOrWhiteSpace(app.ReferenceNumber))
            return app.ReferenceNumber.Trim();

        return app.Id != Guid.Empty ? $"APP-{app.Id.ToString()[..8].ToUpper()}" : string.Empty;
    }
}

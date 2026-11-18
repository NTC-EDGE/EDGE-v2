using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

using System.Security.Cryptography;
using System.Text;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.Receipts.Queries.PendingPayments;

public record PendingPaymentLineItemDto(
    string FeeCode,
    string Description,
    decimal Amount
);

public record BulkPaymentOpItemDto(
    Guid OrderOfPaymentId,
    Guid? StatementOfAccountId,
    Guid? ApplicantId,
    string OpNumber,
    string SoaNumber,
    string ApplicantName,
    decimal AmountDue,
    decimal AmountReceived,
    decimal RemainingBalance,
    string Status,
    string? OfficialReceiptNumber,
    List<PendingPaymentLineItemDto> LineItems
);

public record PendingPaymentDto(
    Guid OrderOfPaymentId,
    Guid ApplicationId,
    Guid StatementOfAccountId,
    Guid TenantId,
    string OpNumber,
    string SoaNumber,
    string ApplicationNumber,
    string ReferenceNumber,
    string ApplicantName,
    string ApplicantType,
    string ServiceName,
    string ServiceCategory,
    decimal AmountDue,
    DateTime BilledAt,
    string? Remarks,
    List<PendingPaymentLineItemDto> LineItems,
    decimal AmountReceived = 0,
    decimal RemainingBalance = 0,
    string? PaymentMethod = null,
    string? CheckNumber = null,
    string? CheckBank = null,
    DateTime? CheckDate = null,
    string? PaymentReferenceNumber = null,
    string? PayorName = null,
    string? PayorAddress = null,
    bool IsBulkApplication = false,
    List<BulkPaymentOpItemDto>? BulkOpItems = null
);

public record GetPendingPaymentsQuery(
    Guid TenantId,
    string? SearchTerm = null,
    string? FieldOffice = null
) : IRequest<ApiResponse<List<PendingPaymentDto>>>;

public class GetPendingPaymentsQueryHandler : IRequestHandler<GetPendingPaymentsQuery, ApiResponse<List<PendingPaymentDto>>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IFieldOfficeRepository _fieldOfficeRepository;

    public GetPendingPaymentsQueryHandler(
        IOfficialReceiptRepository receiptRepository,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantContextService tenantContextService,
        IFieldOfficeRepository fieldOfficeRepository)
    {
        _receiptRepository = receiptRepository;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantContextService = tenantContextService;
        _fieldOfficeRepository = fieldOfficeRepository;
    }

    public async Task<ApiResponse<List<PendingPaymentDto>>> Handle(GetPendingPaymentsQuery request, CancellationToken cancellationToken)
    {
        var targetTenantId = request.TenantId;
        var userIdStr = _currentUserService.UserId;
        Guid? resolvedUserId = null;
        string? resolvedEmail = null;

        if (!string.IsNullOrEmpty(userIdStr))
        {
            if (Guid.TryParse(userIdStr, out var parsedGuid))
            {
                resolvedUserId = parsedGuid;
            }
            else
            {
                var dbUser = await _userRepository.GetByAuthUserIdAsync(userIdStr, cancellationToken);
                if (dbUser != null)
                {
                    resolvedUserId = dbUser.Id;
                    resolvedEmail = dbUser.Email;
                }
                else
                {
                    resolvedUserId = CreateGuidFromString(userIdStr);
                }
            }
        }

        if (targetTenantId == Guid.Empty)
        {
            if (_tenantContextService.TenantId.HasValue && _tenantContextService.TenantId.Value != Guid.Empty)
            {
                targetTenantId = _tenantContextService.TenantId.Value;
            }
            else
            {
                var activeTenants = await _tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
                if (activeTenants.Count > 0)
                {
                    targetTenantId = activeTenants.First();
                }
            }
        }

        string? effectiveFieldOffice = request.FieldOffice;
        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);

        // Apply field office scoping for regular Cashier/Accountant staff
        // Regional Directors and Administrators can see all pending payments across all field offices in the region.
        if (!isSuperAdmin && resolvedUserId.HasValue)
        {
            bool isAdministrative = _currentUserService.IsAdminClaim ||
                                   AdministrativeIdentityPolicy.IsAdministrativeEmail(resolvedEmail);

            TenantMember? currentMembership = null;
            if (targetTenantId != Guid.Empty)
            {
                currentMembership = await _tenantMemberRepository.GetByTenantAndUserAsync(targetTenantId, resolvedUserId.Value, cancellationToken);
            }
            else
            {
                var memberships = await _tenantMemberRepository.GetMembersByUserAsync(resolvedUserId.Value, cancellationToken);
                currentMembership = memberships.FirstOrDefault();
            }

            if (currentMembership?.Role != null &&
                AdministrativeIdentityPolicy.IsAdministrativeRole(currentMembership.Role.Key ?? currentMembership.Role.Name))
            {
                isAdministrative = true;
            }

            if (!isAdministrative)
            {
                if (currentMembership?.FieldOffice != null &&
                    currentMembership.FieldOffice.Category != FieldOfficeCategory.Main &&
                    !string.IsNullOrWhiteSpace(currentMembership.FieldOffice.Name))
                {
                    effectiveFieldOffice = currentMembership.FieldOffice.Name;
                }
                else if (currentMembership?.FieldOfficeId.HasValue == true && currentMembership.FieldOfficeId.Value != Guid.Empty)
                {
                    var office = await _fieldOfficeRepository.GetByIdAsync(currentMembership.FieldOfficeId.Value, cancellationToken);
                    if (office != null && office.Category != FieldOfficeCategory.Main && !string.IsNullOrWhiteSpace(office.Name))
                    {
                        effectiveFieldOffice = office.Name;
                    }
                }
            }
        }

        var list = await _receiptRepository.GetPendingOrdersOfPaymentAsync(targetTenantId, request.SearchTerm, effectiveFieldOffice, cancellationToken);

        var receiptsByOpId = new Dictionary<Guid, List<OfficialReceipt>>();
        foreach (var pendingOp in list.Where(o => o.AmountReceived > 0 || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber)))
        {
            if (!receiptsByOpId.ContainsKey(pendingOp.Id))
            {
                var opReceipts = await _receiptRepository.GetByOrderOfPaymentIdAsync(pendingOp.Id, cancellationToken);
                receiptsByOpId[pendingOp.Id] = (opReceipts ?? new List<OfficialReceipt>())
                    .Where(r => r.Status != ReceiptStatus.Cancelled)
                    .OrderBy(r => r.IssuedAt)
                    .ToList();
            }
        }

        var dtos = list.Select(op =>
        {
            var app = op.Application;
            var soaApplicantId = op.StatementOfAccount?.ApplicantId;
            var matchedApplicant = soaApplicantId.HasValue
                ? app?.ApplicationApplicants?.FirstOrDefault(aa => aa.ApplicantId == soaApplicantId.Value)?.Applicant
                : null;
            var primaryApplicant = matchedApplicant ?? app?.ApplicationApplicants?.Select(aa => aa.Applicant).FirstOrDefault();
            var primaryDetail = primaryApplicant?.ApplicantDetail;
            var filingUser = app?.User;

            string applicantName = "Applicant";
            if (!string.IsNullOrWhiteSpace(op.StatementOfAccount?.IssuedToName))
            {
                applicantName = op.StatementOfAccount.IssuedToName.Trim();
            }
            else if (primaryDetail != null && !string.IsNullOrWhiteSpace(primaryDetail.FirstName))
            {
                applicantName = $"{primaryDetail.FirstName} {primaryDetail.LastName}".Trim();
            }
            else if (filingUser?.CompanyDetail != null && !string.IsNullOrWhiteSpace(filingUser.CompanyDetail.Name))
            {
                applicantName = filingUser.CompanyDetail.Name.Trim();
            }
            else if (filingUser != null && !string.IsNullOrWhiteSpace(filingUser.FirstName))
            {
                applicantName = $"{filingUser.FirstName} {filingUser.LastName}".Trim();
            }

            var service = primaryApplicant?.Service;
            var serviceName = service?.Name ?? "General Application";
            var serviceCat = service?.ServiceCategory?.Name ?? "Permits";

            var lineItems = op.StatementOfAccount?.LineItems?.Select(li => new PendingPaymentLineItemDto(
                li.ItemCode ?? "FEE",
                li.Description ?? li.Particular ?? "Processing Fee",
                li.Amount
            )).ToList() ?? new List<PendingPaymentLineItemDto>();

            if (lineItems.Count == 0 && op.AmountDue > 0)
            {
                lineItems.Add(new PendingPaymentLineItemDto("PAYMENT", $"Payment for {serviceName}", op.AmountDue));
            }

            var amtReceived = op.AmountReceived;
            var remBalance = op.AmountDue > amtReceived ? op.AmountDue - amtReceived : 0m;

            var effectiveCheckNumber = op.CheckNumber;
            var effectiveCheckBank = op.CheckBank;
            var effectiveCheckDate = op.CheckDate;
            string? paymentRefNumber = null;
            string? effectivePayorName = !string.IsNullOrWhiteSpace(op.CheckName) ? op.CheckName.Trim() : null;

            TryExtractCheckAndRefDetails(op.Remarks, ref effectiveCheckNumber, ref effectiveCheckBank, ref effectiveCheckDate, ref paymentRefNumber, ref effectivePayorName);

            var activeAppOps = app?.OrdersOfPayment?
                .Where(o => o.Status != OpStatus.Returned)
                .OrderBy(o => o.CreatedAt)
                .ToList() ?? new List<OrderOfPayment>();

            var appApplicants = app?.ApplicationApplicants?
                .Where(aa => aa.Applicant != null)
                .ToList() ?? new List<ApplicationApplicant>();

            var isBulkApp = app != null && (
                app.SubmissionMode == SubmissionMode.Bulk ||
                appApplicants.Count > 1 ||
                activeAppOps.Count > 1);

            List<BulkPaymentOpItemDto>? bulkOpItems = null;
            if (activeAppOps.Count > 1)
            {
                bulkOpItems = activeAppOps.Select(sibOp =>
                {
                    var sibSoaApplicantId = sibOp.StatementOfAccount?.ApplicantId;
                    var sibAppApplicant = sibSoaApplicantId.HasValue
                        ? appApplicants.FirstOrDefault(aa => aa.ApplicantId == sibSoaApplicantId.Value)?.Applicant
                        : null;
                    var sibDetail = sibAppApplicant?.ApplicantDetail;
                    var sibName = !string.IsNullOrWhiteSpace(sibOp.StatementOfAccount?.IssuedToName)
                        ? sibOp.StatementOfAccount.IssuedToName.Trim()
                        : (sibDetail != null && !string.IsNullOrWhiteSpace(sibDetail.FirstName)
                            ? $"{sibDetail.FirstName} {sibDetail.LastName}".Trim()
                            : applicantName);

                    var sibLineItems = sibOp.StatementOfAccount?.LineItems?.Select(li => new PendingPaymentLineItemDto(
                        li.ItemCode ?? "FEE",
                        li.Description ?? li.Particular ?? "Processing Fee",
                        li.Amount
                    )).ToList() ?? new List<PendingPaymentLineItemDto>();

                    var sibReceived = sibOp.AmountReceived;
                    var sibRem = sibOp.AmountDue > sibReceived ? sibOp.AmountDue - sibReceived : 0m;

                    return new BulkPaymentOpItemDto(
                        sibOp.Id,
                        sibOp.StatementOfAccountId,
                        sibSoaApplicantId,
                        sibOp.OpNumber,
                        sibOp.StatementOfAccount?.SoaNumber ?? string.Empty,
                        sibName,
                        sibOp.AmountDue,
                        sibReceived,
                        sibRem,
                        sibOp.Status.ToString(),
                        sibOp.Status == OpStatus.Paid ? sibOp.OfficialReceiptNumber : null,
                        sibLineItems
                    );
                }).ToList();
            }
            else if (isBulkApp && appApplicants.Count > 1)
            {
                var count = appApplicants.Count;
                var perApplicantAmount = Math.Round(op.AmountDue / count, 2);
                var opIssuedReceipts = receiptsByOpId.TryGetValue(op.Id, out var rList) ? rList : new List<OfficialReceipt>();
                var usedReceiptIds = new HashSet<Guid>();

                bulkOpItems = appApplicants.Select((aa, idx) =>
                {
                    var aDetail = aa.Applicant?.ApplicantDetail;
                    var aName = aDetail != null && !string.IsNullOrWhiteSpace(aDetail.FirstName)
                        ? $"{aDetail.FirstName} {aDetail.LastName}".Trim()
                        : $"Applicant #{idx + 1}";
                    var itemAmount = idx == count - 1
                        ? Math.Max(0m, op.AmountDue - (perApplicantAmount * (count - 1)))
                        : perApplicantAmount;
                    var perApplicantLineItems = lineItems.Count > 0
                        ? lineItems.Select(li => new PendingPaymentLineItemDto(
                            li.FeeCode,
                            $"{li.Description} ({aName})",
                            Math.Round(li.Amount / count, 2)
                        )).ToList()
                        : new List<PendingPaymentLineItemDto>
                        {
                            new("PAYMENT", $"Payment for {serviceName} ({aName})", itemAmount)
                        };

                    var slotMarker = $"(#{idx + 1})";
                    var matchedReceipt = opIssuedReceipts.FirstOrDefault(r =>
                        !usedReceiptIds.Contains(r.Id) &&
                        ((r.Remarks != null && r.Remarks.Contains(slotMarker, StringComparison.OrdinalIgnoreCase)) ||
                         (!string.IsNullOrWhiteSpace(aName) &&
                          ((r.PayorName != null && string.Equals(r.PayorName.Trim(), aName, StringComparison.OrdinalIgnoreCase)) ||
                           (r.Remarks != null && r.Remarks.Contains($"({aName})", StringComparison.OrdinalIgnoreCase)) ||
                           (r.LineItems != null && r.LineItems.Any(li => li.Description != null && li.Description.Contains($"({aName})", StringComparison.OrdinalIgnoreCase)))))));

                    if (matchedReceipt != null)
                    {
                        usedReceiptIds.Add(matchedReceipt.Id);
                    }

                    var isApplicantPaid = op.Status == OpStatus.Paid || matchedReceipt != null;
                    var applicantStatus = isApplicantPaid ? OpStatus.Paid.ToString() : OpStatus.Billed.ToString();
                    var applicantOrNumber = matchedReceipt?.OfficialReceiptNumber ?? (op.Status == OpStatus.Paid ? op.OfficialReceiptNumber : null);
                    var applicantReceived = isApplicantPaid ? (matchedReceipt?.Amount ?? itemAmount) : 0m;
                    var applicantRemaining = isApplicantPaid ? 0m : itemAmount;

                    return new BulkPaymentOpItemDto(
                        op.Id,
                        op.StatementOfAccountId,
                        aa.ApplicantId,
                        $"{op.OpNumber} (#{idx + 1})",
                        op.StatementOfAccount?.SoaNumber ?? string.Empty,
                        aName,
                        itemAmount,
                        applicantReceived,
                        applicantRemaining,
                        applicantStatus,
                        applicantOrNumber,
                        perApplicantLineItems
                    );
                }).ToList();
            }

            return new PendingPaymentDto(
                op.Id,
                op.ApplicationId,
                op.StatementOfAccountId,
                app?.TenantId ?? Guid.Empty,
                op.OpNumber,
                op.StatementOfAccount?.SoaNumber ?? string.Empty,
                app?.ApplicationNumber ?? string.Empty,
                app?.ReferenceNumber ?? string.Empty,
                applicantName,
                primaryApplicant?.ApplicantType.ToString() ?? "Individual",
                serviceName,
                serviceCat,
                op.AmountDue,
                op.CreatedAt,
                op.Remarks,
                lineItems,
                amtReceived,
                remBalance,
                op.PaymentMethod?.ToString(),
                effectiveCheckNumber,
                effectiveCheckBank,
                effectiveCheckDate,
                paymentRefNumber,
                effectivePayorName,
                op.StatementOfAccount?.IssuedToAddress,
                isBulkApp,
                bulkOpItems
            );
        }).ToList();

        return ApiResponse<List<PendingPaymentDto>>.Success(dtos, "Pending payments retrieved successfully.");
    }

    private static void TryExtractCheckAndRefDetails(
        string? remarks,
        ref string? checkNumber,
        ref string? checkBank,
        ref DateTime? checkDate,
        ref string? paymentRef,
        ref string? payorName)
    {
        if (string.IsNullOrWhiteSpace(remarks)) return;
        const string tagStart = "[PAYMENT_BREAKDOWN:";
        var startIdx = remarks.IndexOf(tagStart, StringComparison.Ordinal);
        if (startIdx >= 0)
        {
            var jsonStart = startIdx + tagStart.Length;
            string? json = null;
            const string explicitEnd = ":END_PAYMENT_BREAKDOWN]";
            var explicitEndIdx = remarks.IndexOf(explicitEnd, jsonStart, StringComparison.Ordinal);
            if (explicitEndIdx >= 0)
            {
                json = remarks.Substring(jsonStart, explicitEndIdx - jsonStart).Trim();
            }
            else
            {
                int braceCount = 0;
                bool started = false;
                for (int i = jsonStart; i < remarks.Length; i++)
                {
                    if (remarks[i] == '{')
                    {
                        braceCount++;
                        started = true;
                    }
                    else if (remarks[i] == '}')
                    {
                        braceCount--;
                        if (started && braceCount == 0)
                        {
                            json = remarks.Substring(jsonStart, i - jsonStart + 1).Trim();
                            break;
                        }
                    }
                }

                if (string.IsNullOrWhiteSpace(json))
                {
                    var lastBracket = remarks.LastIndexOf(']');
                    if (lastBracket > jsonStart)
                    {
                        json = remarks.Substring(jsonStart, lastBracket - jsonStart).Trim();
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(json))
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(json);
                    if (string.IsNullOrWhiteSpace(payorName) && doc.RootElement.TryGetProperty("payorName", out var payorElem))
                    {
                        var p = payorElem.GetString()?.Trim();
                        if (!string.IsNullOrWhiteSpace(p))
                        {
                            payorName = p;
                        }
                    }

                    if (doc.RootElement.TryGetProperty("items", out var itemsElem) && itemsElem.ValueKind == System.Text.Json.JsonValueKind.Array)
                    {
                        foreach (var item in itemsElem.EnumerateArray())
                        {
                            if (item.TryGetProperty("mode", out var modeElem))
                            {
                                var mode = modeElem.GetString();
                                if (mode == "Check")
                                {
                                    if (string.IsNullOrWhiteSpace(checkNumber) && item.TryGetProperty("checkNumber", out var numElem))
                                    {
                                        checkNumber = numElem.GetString()?.Trim();
                                    }
                                    if (string.IsNullOrWhiteSpace(checkBank) && item.TryGetProperty("checkBank", out var bankElem))
                                    {
                                        checkBank = bankElem.GetString()?.Trim();
                                    }
                                    if (!checkDate.HasValue && item.TryGetProperty("checkDate", out var dateElem))
                                    {
                                        var dateStr = dateElem.GetString();
                                        if (!string.IsNullOrWhiteSpace(dateStr) && DateTime.TryParse(dateStr, out var parsedDate))
                                        {
                                            checkDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                                        }
                                    }
                                }
                                else if (mode == "Online" && string.IsNullOrWhiteSpace(paymentRef))
                                {
                                    if (item.TryGetProperty("referenceNumber", out var refElem))
                                    {
                                        paymentRef = refElem.GetString()?.Trim();
                                    }
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Fallback gracefully
                }
            }
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}

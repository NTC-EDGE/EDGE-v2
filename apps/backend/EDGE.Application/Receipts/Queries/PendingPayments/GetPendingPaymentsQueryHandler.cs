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

namespace EDGE.Application.Receipts.Queries.PendingPayments;

public record PendingPaymentLineItemDto(
    string FeeCode,
    string Description,
    decimal Amount
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
    List<PendingPaymentLineItemDto> LineItems
);

public record GetPendingPaymentsQuery(
    Guid TenantId,
    string? SearchTerm = null
) : IRequest<ApiResponse<List<PendingPaymentDto>>>;

public class GetPendingPaymentsQueryHandler : IRequestHandler<GetPendingPaymentsQuery, ApiResponse<List<PendingPaymentDto>>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;

    public GetPendingPaymentsQueryHandler(IOfficialReceiptRepository receiptRepository)
    {
        _receiptRepository = receiptRepository;
    }

    public async Task<ApiResponse<List<PendingPaymentDto>>> Handle(GetPendingPaymentsQuery request, CancellationToken cancellationToken)
    {
        var list = await _receiptRepository.GetPendingOrdersOfPaymentAsync(request.TenantId, request.SearchTerm, cancellationToken);

        var dtos = list.Select(op =>
        {
            var app = op.Application;
            var primaryApplicant = app?.ApplicationApplicants?.Select(aa => aa.Applicant).FirstOrDefault();
            var primaryDetail = primaryApplicant?.ApplicantDetail;
            var filingUser = app?.User;

            string applicantName = "Applicant";
            if (primaryDetail != null && !string.IsNullOrWhiteSpace(primaryDetail.FirstName))
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
                lineItems
            );
        }).ToList();

        return ApiResponse<List<PendingPaymentDto>>.Success(dtos, "Pending payments retrieved successfully.");
    }
}

using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.SubmitPayment;

public record SubmitPaymentCommand(
    Guid ApplicationId,
    Guid? OrderOfPaymentId = null,
    PaymentMethod PaymentMethod = PaymentMethod.Online,
    string? ReferenceNumber = null,
    string? PayorName = null,
    decimal? AmountPaid = null,
    string? Remarks = null,
    Guid? ProofOfPaymentFileId = null
) : IRequest<ApiResponse<bool>>;

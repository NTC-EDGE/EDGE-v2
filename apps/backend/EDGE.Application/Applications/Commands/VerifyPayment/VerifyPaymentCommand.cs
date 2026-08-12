using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.VerifyPayment;

public record VerifyPaymentCommand(Guid OpId, string OfficialReceiptNumber, decimal AmountReceived) : IRequest<ApiResponse<bool>>;

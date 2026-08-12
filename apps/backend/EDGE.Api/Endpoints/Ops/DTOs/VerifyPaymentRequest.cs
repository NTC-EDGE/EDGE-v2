namespace EDGE.Api.Endpoints.Ops.DTOs;

public record VerifyPaymentRequest(string OfficialReceiptNumber, decimal AmountReceived);

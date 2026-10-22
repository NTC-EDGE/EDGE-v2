namespace EDGE.Api.Endpoints.Soas.DTOs;

public record ApproveSoaRequest(string? Remarks = null, Guid? ApplicationId = null);

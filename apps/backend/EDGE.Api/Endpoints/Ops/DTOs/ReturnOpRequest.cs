using EDGE.Domain.Enums;

namespace EDGE.Api.Endpoints.Ops.DTOs;

public record ReturnOpRequest(string Remarks, ReturnTarget ReturnTo);

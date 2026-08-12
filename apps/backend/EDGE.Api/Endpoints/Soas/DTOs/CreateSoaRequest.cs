using System;
using System.Collections.Generic;
using EDGE.Application.Applications.Commands.CreateSoa;

namespace EDGE.Api.Endpoints.Soas.DTOs;

public record CreateSoaRequest(
    Guid? ApplicantId,
    string IssuedToType,
    string IssuedToName,
    string? IssuedToAddress,
    DateTime DueDate,
    List<CreateSoaLineItemRequest> LineItems);

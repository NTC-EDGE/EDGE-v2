using System;
using System.Collections.Generic;
using EDGE.Application.Applications.Commands.CreateSoa;

namespace EDGE.Api.Endpoints.Soas.DTOs;

public record CreateSoaRequest(
    Guid? ApplicantId = null,
    string? IssuedToType = null,
    string? IssuedToName = null,
    string? IssuedToAddress = null,
    DateTime? DueDate = null,
    List<CreateSoaLineItemRequest>? LineItems = null,
    int? ValidityYears = null,
    int? NoOfUnits = null,
    DateTime? ExpirationDate = null,
    int? AdditionalServicesCount = null,
    int? NoOfCopies = null);

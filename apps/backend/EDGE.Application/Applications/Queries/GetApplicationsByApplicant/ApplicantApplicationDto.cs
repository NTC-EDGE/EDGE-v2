using System;
using System.Collections.Generic;

namespace EDGE.Application.Applications.Queries.GetApplicationsByApplicant;

public record ApplicantScheduleDto(
    string Date,
    string Time,
    string Venue
);

public record ApplicantDocumentDto(
    string Id,
    string Name,
    string Type,
    string Size,
    string Category,
    DateTime UploadedAt
);

public record ApplicantApplicationDto(
    Guid Id,
    string ReferenceNumber,
    string Mode,
    string ServiceName,
    string ServiceCategory,
    string Element,
    string Status,
    DateTime? SubmittedAt,
    string ApplicantName,
    string Sex,
    string Nationality,
    string StreetAddress,
    string Barangay,
    string CityMunicipality,
    string Province,
    string Region,
    string ZipCode,
    string MobileNumber,
    string Email,
    string ExamineeType,
    ApplicantScheduleDto? Schedule,
    List<ApplicantDocumentDto> Documents
);

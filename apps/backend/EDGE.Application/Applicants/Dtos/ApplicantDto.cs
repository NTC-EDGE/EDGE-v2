using System;

namespace EDGE.Application.Applicants.Dtos;

public class ApplicantDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; }
    public string ApplicantType { get; set; } = string.Empty;
    public ApplicantDetailDto? Details { get; set; }
    public List<FormFieldValueDto> FormFieldValues { get; set; } = new();
}

public class FormFieldValueDto
{
    public Guid FieldId { get; set; }
    public string FieldLabel { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class ApplicantDetailDto
{
    public Guid Id { get; set; }
    public Guid BarangayId { get; set; }
    public string BarangayName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Suffix { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public string Sex { get; set; } = string.Empty;
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public DateOnly BirthDate { get; set; }
    public string ContactNumber { get; set; } = string.Empty;
    public string? ZipCode { get; set; }
    public string? SchoolAttended { get; set; }
    public string? CourseTaken { get; set; }
    public string? YearGraduated { get; set; }
    public string? ESignature { get; set; }
    public CompanyDetailDto? Company { get; set; }
}

public class CompanyDetailDto
{
    public Guid Id { get; set; }
    public Guid BarangayId { get; set; }
    public string BarangayName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? EntityType { get; set; }
}

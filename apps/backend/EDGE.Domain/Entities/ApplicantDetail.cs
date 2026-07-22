using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ApplicantDetail : AuditableEntity
{
    public Guid BarangayId { get; set; }
    public Barangay? Barangay { get; set; }
    public Guid? CompanyDetailId { get; set; }
    public CompanyDetail? CompanyDetail { get; set; }

    // Biographical Columns
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

    // Contact & Education
    public string ContactNumber { get; set; } = string.Empty;
    public string? ZipCode { get; set; }
    public string? SchoolAttended { get; set; }
    public string? CourseTaken { get; set; }
    public string? YearGraduated { get; set; }

    // System Column
    public string? ESignature { get; set; }
}

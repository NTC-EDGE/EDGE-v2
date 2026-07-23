using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.MockData;

/// <summary>
/// Replaces the old MockDataFactory.GetNtc101Application() method, which built an
/// Ntc101Application out of the generic Applicant/Equipment shape (borrowed from the
/// org-applicant forms) — that shape has no fields for the exam checkboxes, applicant's
/// personal details split by name/DOB/sex/nationality/school, assistance request, or the
/// admission slip section, so none of those ever printed. Paste this method's body into
/// MockDataFactory to replace the old one.
/// </summary>
public static partial class MockDataFactory
{
    public static Ntc101Application GetNtc101Application()
    {
        var applicationId = Guid.NewGuid();

        var applicantPerson = new ApplicantPerson
        {
            LastName = "Dela Cruz",
            FirstName = "Juan",
            MiddleName = "Santos",
            DateOfBirth = new DateOnly(1998, 3, 14),
            Sex = Sex.Male,
            Nationality = "Filipino",
            Address = new Address
            {
                UnitRoomBldgNo = "Block 12, Lot 5",
                Street = "Sampaguita Street",
                Barangay = "Central",
                CityMunicipality = "Quezon City",
                Province = "Metro Manila",
                ZipCode = "1100"
            },
            ContactNumber = "+63 918 123 4567",
            Email = "juan.delacruz@email.ph",
            SchoolAttended = "Technological University of the Philippines",
            CourseTaken = "Electronics Engineering",
            YearGraduated = 2020
        };

        var assistanceRequest = new AssistanceRequest
        {
            NeedsAssistance = false,
            Details = null
        };

        var admissionSlip = new AdmissionSlip
        {
            ExamineeName = "Juan Santos Dela Cruz",
            MailingAddressLine1 = "Block 12, Lot 5, Sampaguita Street, Central,",
            MailingAddressLine2 = "Quezon City, Metro Manila 1100",
            ExaminationFor = "Restricted Radiotelephone Operator Certificate",
            PlaceOfExam = "NTC Regional Office - NCR, Quezon City",
            DateOfExam = new DateOnly(2026, 8, 15),
            TimeOfExam = "9:00 AM",
            AuthorizedOfficer = null // filled in by NTC staff, not at submission time
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0041120",
            OrDate = new DateOnly(2026, 7, 20),
            Amount = 1800.00m,
            CollectingOfficer = "E. Santos"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Juan D. dela Cruz",
            DateAccomplished = new DateOnly(2026, 7, 20)
        };

        return new Ntc101Application
        {
            ApplicationId = applicationId,
            RevisionNo = "03",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = TypeOfApplication.New,
            ExamCode = ExamCode.RrocAircraft_Element1,
            DateOfExam = new DateOnly(2026, 8, 15),
            ApplicantPerson = applicantPerson,
            AssistanceRequest = assistanceRequest,
            AdmissionSlip = admissionSlip,
            Payment = payment,
            Declaration = declaration
        };
    }
}

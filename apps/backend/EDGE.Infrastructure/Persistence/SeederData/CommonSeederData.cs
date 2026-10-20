using System;
using System.Collections.Generic;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class CommonSeederData
{
    public static readonly string Ntc105Contract = @"
    {
        ""formNo"": ""NTC 1-05"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2025-03-31"",
        ""serviceCategory"": null,
        ""group"": null,
        ""applicationTypes"": [],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""equipment"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""note"": ""Continuation sheet only — extends equipment[] on parent application (1-04, 1-09, 1-11, 1-18).""
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc110Contract = @"
    {
        ""formNo"": ""NTC 1-10"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2021-03-31"",
        ""serviceCategory"": null,
        ""group"": null,
        ""applicationTypes"": [],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""stations"", ""required"": true },
            { ""key"": ""antennas"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""note"": ""Continuation sheet only — extends stations[]/antennas[] on parent application (1-11, 1-14, 1-22).""
        },
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, Field> GetFieldsPool()
    {
        return new Dictionary<string, Field>
        {
            // Core Personal / Applicant
            ["fullName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000001"), FieldType = "text", Label = "Full Legal Name", SyncBackOnSubmit = true },
            ["birthDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000002"), FieldType = "date", Label = "Date of Birth", SyncBackOnSubmit = true },
            ["sex"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000041"), FieldType = "dropdown", Label = "Sex / Gender", SyncBackOnSubmit = true, ValidationRules = @"[""Male"",""Female""]" },
            ["civilStatus"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000042"), FieldType = "dropdown", Label = "Civil Status", SyncBackOnSubmit = true, ValidationRules = @"[""Single"",""Married"",""Widowed"",""Separated""]" },
            ["nationality"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000043"), FieldType = "dropdown", Label = "Nationality / Citizenship", SyncBackOnSubmit = true, ValidationRules = @"[""Filipino"",""Foreign National / Others""]" },

            // Granular Address
            ["region"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000051"), FieldType = "dropdown", Label = "Region", SyncBackOnSubmit = true },
            ["province"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000052"), FieldType = "dropdown", Label = "Province", SyncBackOnSubmit = true },
            ["city"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000053"), FieldType = "dropdown", Label = "City / Municipality", SyncBackOnSubmit = true },
            ["barangay"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000054"), FieldType = "dropdown", Label = "Barangay", SyncBackOnSubmit = true },
            ["street"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000055"), FieldType = "text", Label = "Street Address / Unit / Building", SyncBackOnSubmit = true },
            ["zipCode"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000056"), FieldType = "text", Label = "Zip / Postal Code", SyncBackOnSubmit = true },
            ["address"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000003"), FieldType = "text", Label = "Complete Address", SyncBackOnSubmit = true },

            // Contact & Emergency
            ["contactNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000004"), FieldType = "text", Label = "Contact / Mobile Number", SyncBackOnSubmit = true },
            ["email"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000005"), FieldType = "text", Label = "Email Address", SyncBackOnSubmit = true },
            ["emergencyContactPerson"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000071"), FieldType = "text", Label = "Emergency Contact Person", SyncBackOnSubmit = false },
            ["emergencyContactNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000072"), FieldType = "text", Label = "Emergency Contact Number", SyncBackOnSubmit = false },

            // Education
            ["schoolName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000061"), FieldType = "text", Label = "School / University Attended", SyncBackOnSubmit = false },
            ["courseDegree"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000062"), FieldType = "text", Label = "Course / Degree Program", SyncBackOnSubmit = false },
            ["yearGraduated"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000063"), FieldType = "text", Label = "Year Graduated", SyncBackOnSubmit = false },
            ["education"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000006"), FieldType = "text", Label = "Education / School Attended", SyncBackOnSubmit = false },

            // NTC 1-01 Exam Specific
            ["examCategory"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000007"), FieldType = "dropdown", Label = "Exam Category", SyncBackOnSubmit = false, ValidationRules = @"[""Radiotelegraphy"",""Radiotelephony"",""Amateur"",""Restricted Radiotelephone""]" },
            ["examineeType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000008"), FieldType = "dropdown", Label = "Examinee Type", SyncBackOnSubmit = false, ValidationRules = @"[""FirstTaker"",""Retaker"",""Upgrade""]" },
            ["elements"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000009"), FieldType = "text", Label = "Selected Exam Elements", SyncBackOnSubmit = false },
            ["specialNeeds"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000010"), FieldType = "text", Label = "Special Assistance Details", SyncBackOnSubmit = false },
            ["admissionNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000011"), FieldType = "text", Label = "Admission Slip Number", SyncBackOnSubmit = false },

            // Core Declarations & Payment
            ["signatureField"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000012"), FieldType = "signature", Label = "Applicant Signature", SyncBackOnSubmit = false },
            ["declarationCheckbox"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000013"), FieldType = "checkbox", Label = "I hereby declare that all the above entries are true and correct. Under the Revised Penal Code, I shall be held liable for any willful false statement(s) or misrepresentation(s) made in this application form that may serve as a valid ground for the denial of this application and/or cancellation/revocation of thepermit issued/granted. Further, I am freely giving full consent for the collection and processing of personal information in accordance with Republic Act No. 10713, Data Privacy Act of 2012.", SyncBackOnSubmit = false },
            ["paymentOrNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000021"), FieldType = "text", Label = "Official Receipt (OR) Number", SyncBackOnSubmit = false },
            ["paymentAmount"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000022"), FieldType = "number", Label = "Amount Paid", SyncBackOnSubmit = false },
            ["paymentDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000023"), FieldType = "date", Label = "Payment Date", SyncBackOnSubmit = false },

            // NTC 1-02 Certificate Specific
            ["typeOfCertificate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000014"), FieldType = "dropdown", Label = "Type of Certificate", SyncBackOnSubmit = false, ValidationRules = @"[""1RTG"",""2RTG"",""3RTG"",""1PHN"",""2PHN"",""3PHN"",""SROP"",""RROC-Land Mobile"",""RROC-Aircraft"",""GROC"",""TP RROC-Aircraft"",""Other""]" },
            ["weight_kg"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000015"), FieldType = "number", Label = "Weight (kg)", SyncBackOnSubmit = false },
            ["height_cm"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000016"), FieldType = "number", Label = "Height (cm)", SyncBackOnSubmit = false },
            ["employmentStatus"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000017"), FieldType = "dropdown", Label = "Employment Status", SyncBackOnSubmit = false, ValidationRules = @"[""Employed"",""Unemployed""]" },
            ["employmentType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000018"), FieldType = "dropdown", Label = "Type", SyncBackOnSubmit = false, ValidationRules = @"[""Local"",""Foreign""]" },
            ["employmentLocation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000046"), FieldType = "text", Label = "Employment Location", SyncBackOnSubmit = false },
            ["examSeminarAddress"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000047"), FieldType = "text", Label = "Seminar / Exam Address", SyncBackOnSubmit = false },
            ["examSeminarDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000019"), FieldType = "date", Label = "Date", SyncBackOnSubmit = false },
            ["examSeminarRating"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000020"), FieldType = "text", Label = "Rating", SyncBackOnSubmit = false },

            ["permitType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000024"), FieldType = "dropdown", Label = "Permit / License Type", SyncBackOnSubmit = false, ValidationRules = @"[""Amateur Radio Operator Certificate"",""Amateur Radio Station License"",""Club Radio Station License"",""Temporary Permit for Foreign Visitor"",""Special Permit for Vanity/Special Call Sign"",""Lifetime Amateur Radio Station Supplementary Certificate""]" },
            ["classOfStation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000025"), FieldType = "dropdown", Label = "Class of Station", SyncBackOnSubmit = false, ValidationRules = @"[""Class A"",""Class B"",""Class C"",""Class D""]" },
            ["clubDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000026"), FieldType = "text", Label = "Amateur Club Details", SyncBackOnSubmit = false },
            ["registrationType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000045"), FieldType = "dropdown", Label = "Registration Type", SyncBackOnSubmit = false, ValidationRules = @"[""Dealers"",""Non-Dealers""]" },

            // Technical Vessel & Station & Equipment
            ["vesselName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000027"), FieldType = "text", Label = "Vessel Name", SyncBackOnSubmit = false },
            ["callSign"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000028"), FieldType = "text", Label = "Call Sign", SyncBackOnSubmit = false },
            ["imoNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000029"), FieldType = "text", Label = "IMO Number / Gross Tonnage", SyncBackOnSubmit = false },
            ["equipmentDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000030"), FieldType = "repeater", Label = "Particulars of Equipment", SyncBackOnSubmit = false },
            ["radioOfficers"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000031"), FieldType = "repeater", Label = "Radio Officers Details", SyncBackOnSubmit = false },
            ["stationLocation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000032"), FieldType = "text", Label = "Station Location / Coordinates", SyncBackOnSubmit = false },
            ["antennaDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000033"), FieldType = "repeater", Label = "Antenna Technical Details", SyncBackOnSubmit = false },

            // Accreditations & Regs
            ["personnelDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000034"), FieldType = "repeater", Label = "ECE / Technician Personnel Details", SyncBackOnSubmit = false },
            ["devicesDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000035"), FieldType = "repeater", Label = "Registered Devices Details (WDN/SRD/RFID)", SyncBackOnSubmit = false },
            ["valueAddedServices"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000036"), FieldType = "text", Label = "Value-Added Services / Category", SyncBackOnSubmit = false },
            ["circumstances"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000037"), FieldType = "textarea", Label = "Circumstances Relating to Lost/Mutilation of Permit/License/Certificate", SyncBackOnSubmit = false },
            ["tvroDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000038"), FieldType = "repeater", Label = "TVRO / CATV Receiver & Satellite Details", SyncBackOnSubmit = false },

            // NTC 1-09 Permit Fields
            ["stationClass"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000101"), FieldType = "dropdown", Label = "Station Class", SyncBackOnSubmit = false, ValidationRules = @"[""RT"",""FX"",""FB"",""FX/FB"",""ML"",""P"",""Others""]" },
            ["serviceArea"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000102"), FieldType = "text", Label = "Points of Comm/Service Area (optional)", SyncBackOnSubmit = false },
            ["frequency"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000103"), FieldType = "text", Label = "Frequency: Within Authorized Amateur Band", SyncBackOnSubmit = false },
            ["bandwidth"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000104"), FieldType = "text", Label = "Bandwidth", SyncBackOnSubmit = false },
            ["emission"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000105"), FieldType = "text", Label = "Emission", SyncBackOnSubmit = false },
            ["powerOutput"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000106"), FieldType = "text", Label = "Power Output (watts)", SyncBackOnSubmit = false },
            ["hoursOfOperation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000107"), FieldType = "text", Label = "Hours of Operation", SyncBackOnSubmit = false },
            ["configuration"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000108"), FieldType = "text", Label = "Configuration", SyncBackOnSubmit = false },
            ["dataRate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000109"), FieldType = "text", Label = "Data Rate", SyncBackOnSubmit = false },
            ["remarks"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000110"), FieldType = "text", Label = "Remarks", SyncBackOnSubmit = false },
            ["serialNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000111"), FieldType = "text", Label = "Serial Number", SyncBackOnSubmit = false },
            ["frequencyRange"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000112"), FieldType = "text", Label = "Frequency Range", SyncBackOnSubmit = false },
            ["antennaType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000113"), FieldType = "text", Label = "Antenna Type", SyncBackOnSubmit = false },
            ["height"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000114"), FieldType = "text", Label = "Antenna Height", SyncBackOnSubmit = false },
            ["gain"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000115"), FieldType = "text", Label = "Antenna Gain", SyncBackOnSubmit = false },
            ["directivity"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000116"), FieldType = "text", Label = "Antenna Directivity", SyncBackOnSubmit = false },
            ["diameter"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000117"), FieldType = "text", Label = "Antenna Diameter", SyncBackOnSubmit = false },
            ["polarization"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000118"), FieldType = "text", Label = "Antenna Polarization", SyncBackOnSubmit = false },
            ["beamwidth"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000119"), FieldType = "text", Label = "Antenna Beamwidth", SyncBackOnSubmit = false },
            ["antennaRemarks"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000128"), FieldType = "text", Label = "Antenna Remarks", SyncBackOnSubmit = false },
            ["dealerName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000120"), FieldType = "text", Label = "Name of Dealer", SyncBackOnSubmit = false },
            ["authorizedSellerBuyer"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000121"), FieldType = "text", Label = "Authorized Seller/Buyer", SyncBackOnSubmit = false },
            ["orInvoiceNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000122"), FieldType = "text", Label = "OR/Invoice No,", SyncBackOnSubmit = false },
            ["permitRslNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000123"), FieldType = "text", Label = "Permit/RSL No.", SyncBackOnSubmit = false },
            ["sellerAddress"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000124"), FieldType = "text", Label = "Seller Address", SyncBackOnSubmit = false },
            ["amateurLicenseNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000125"), FieldType = "text", Label = "Amateur License No", SyncBackOnSubmit = false },
            ["intendedUseType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000126"), FieldType = "checkbox_group", Label = "Intended Use of Equipment", SyncBackOnSubmit = false, ValidationRules = @"[""Additional Radio Equipment"",""New Radio Station"",""Change of Equipment"",""Storage at"",""Others""]" },
            ["specifyDetails"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000127"), FieldType = "text", Label = "Specify Details", SyncBackOnSubmit = false },
            ["natureOfService"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000129"), FieldType = "dropdown", Label = "Type", SyncBackOnSubmit = false, ValidationRules = @"[""CV Private"",""CO Government""]" },
            ["frequencyUnit"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000132"), FieldType = "dropdown", Label = "Frequency Unit", SyncBackOnSubmit = false, ValidationRules = @"[""KHz"",""MHz"",""GHz""]" },
            ["aeroClassOfStation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000130"), FieldType = "dropdown", Label = "Class of Station", SyncBackOnSubmit = false, ValidationRules = @"[""FA"",""MA""]" },
            ["aeroStationParticulars"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000131"), FieldType = "repeater", Label = "Class of Station", SyncBackOnSubmit = false, ValidationRules = @"[{""key"":""classOfStation"",""label"":""Class of Station"",""type"":""select"",""options"":[""FA"",""MA""]}]" },

            // Amateur Radio Station License (NTC_AMA_LICENSES) specific fields
            ["appType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000200"), FieldType = "dropdown", Label = "Application Type", SyncBackOnSubmit = false, ValidationRules = "[\"NEW\",\"RENEWAL\",\"MODIFICATION\"]" },
            ["noOfYears"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000201"), FieldType = "dropdown", Label = "Number of Years", SyncBackOnSubmit = false, ValidationRules = "[\"1\",\"2\",\"3\",\"5\"]" },
            ["licenseNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000202"), FieldType = "text", Label = "Existing License No", SyncBackOnSubmit = false },
            ["dateOfExpiry"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000203"), FieldType = "date", Label = "License Expiry Date", SyncBackOnSubmit = false },
            ["modificationDueTo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000204"), FieldType = "dropdown", Label = "Modification Due To", SyncBackOnSubmit = false, ValidationRules = "[\"Change of Station Location\",\"Change / Additional Equipment\",\"Upgrade of Class of Station\",\"Change of Call Sign\",\"Change of Name / Personal Info\"]" },
            ["placeOfExamSeminar"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000205"), FieldType = "text", Label = "Place of Exam / Seminar", SyncBackOnSubmit = false },
            ["dateOfExamSeminar"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000206"), FieldType = "date", Label = "Date of Exam / Seminar", SyncBackOnSubmit = false },
            ["ratings"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000207"), FieldType = "text", Label = "Ratings / Exam Score Details", SyncBackOnSubmit = false },
            ["particularsEquipment"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000208"), FieldType = "text", Label = "Particulars of Radio Equipment (JSON)", SyncBackOnSubmit = false },
            ["location"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000209"), FieldType = "text", Label = "Station Location / Installation Address", SyncBackOnSubmit = false },
            ["middleName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000210"), FieldType = "text", Label = "Middle Name", SyncBackOnSubmit = false },
            ["suffix"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000211"), FieldType = "text", Label = "Suffix", SyncBackOnSubmit = false },

            // TVRO Registration (NTC_1_22) specific fields
            ["exactLocation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000220"), FieldType = "text", Label = "Exact Location of TVRO System", SyncBackOnSubmit = false },
            ["longitude"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000221"), FieldType = "text", Label = "Longitude (deg-min-sec)", SyncBackOnSubmit = false },
            ["latitude"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000222"), FieldType = "text", Label = "Latitude (deg-min-sec)", SyncBackOnSubmit = false },
            ["tvroEquipment"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000223"), FieldType = "repeater", Label = "Particulars of Equipment", SyncBackOnSubmit = false },
            ["tvroAntenna"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000224"), FieldType = "repeater", Label = "Particulars of Antenna System", SyncBackOnSubmit = false },
            ["tvroSignal"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000225"), FieldType = "repeater", Label = "Particulars of Signal to be Received", SyncBackOnSubmit = false },
            ["bsdNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000226"), FieldType = "text", Label = "BSD No. (Assigned by NTC)", SyncBackOnSubmit = false },

            // Invoice fields for NTC 1-19 and Non-Dealer Certificate registrations
            ["invoiceNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000228"), FieldType = "text", Label = "Invoice Number", SyncBackOnSubmit = false },

            // Company & Corporate Applicant Fields (NTC 1-19 and generic company filings)
            ["companyName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000081"), FieldType = "text", Label = "Company / Business Name", SyncBackOnSubmit = true },
            ["applicantName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000088"), FieldType = "text", Label = "Applicant Name", SyncBackOnSubmit = true },
            ["representativeName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000082"), FieldType = "text", Label = "Authorized Representative Name", SyncBackOnSubmit = false },
            ["representativePosition"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000083"), FieldType = "text", Label = "Designation / Position", SyncBackOnSubmit = false },
            ["makeTypeModel"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000084"), FieldType = "text", Label = "Make / Type / Model", SyncBackOnSubmit = false },
            ["deviceType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000085"), FieldType = "dropdown", Label = "Device / Equipment Type", SyncBackOnSubmit = false, ValidationRules = @"[""Wireless Data Network (WDN) - Indoor"",""Short Range Devices (SRD)"",""Radio Frequency Identification (RFID) Devices"",""Short Range Radio Services (SRRS) Devices"",""Public Trunked Radio Equipment (Mobile/Portable)""]" },
            ["dtiSecRegistration"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000086"), FieldType = "text", Label = "SEC/DTI Registration Number", SyncBackOnSubmit = false },
            ["serialNumbers"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000087"), FieldType = "text", Label = "Serial Number(s)", SyncBackOnSubmit = false },

            // Entity Type field (Accreditations, VAS Registration, etc.)
            ["entityType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000230"), FieldType = "dropdown", Label = "Entity Type", SyncBackOnSubmit = false, ValidationRules = @"[""Corporation"",""Single Proprietorship"",""Partnership"",""Others""]" },
            ["cpcnPaCaNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000231"), FieldType = "text", Label = "CPCN / PA / CA No.", SyncBackOnSubmit = false },
            ["cpcnDateOfExpiry"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000232"), FieldType = "date", Label = "CPCN / PA / CA No. Date of Expiry", SyncBackOnSubmit = false },
            ["corVasNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000233"), FieldType = "text", Label = "COR / VAS No.", SyncBackOnSubmit = false },
            ["corVasExpiryDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000238"), FieldType = "date", Label = "COR / VAS No. Date of Expiry", SyncBackOnSubmit = false },
            ["knownByAnotherName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000234"), FieldType = "dropdown", Label = "Known by other Name", SyncBackOnSubmit = false, ValidationRules = @"[""Yes"",""No""]" },
            ["otherTradeName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000235"), FieldType = "text", Label = "Please specify", SyncBackOnSubmit = false },
            ["vasRegistrationNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000236"), FieldType = "text", Label = "VAS Registration No. (Assigned by NTC)", SyncBackOnSubmit = false },
            ["serviceClassification"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000237"), FieldType = "dropdown", Label = "Service", SyncBackOnSubmit = false, ValidationRules = @"[""VALUE-ADDED SERVICE (VAS) PROVIDER"",""PUBLIC CALLING STATION/OFFICE/TELECENTER SERVICE PROVIDER (PCSOTSP)"",""RESELLER"",""VOICE OVER INTERNET PROTOCOL (VOIP) PROVIDER"",""Others""]" },

            // Copy of Certificate (NTC 1-21) specific fields
            ["targetService"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000240"), FieldType = "dropdown", Label = "Service", SyncBackOnSubmit = false, ValidationRules = @"[""Radio Operator Certificates (ROC) excluding Amateur ROC"",""Certificates in the Amateur Service"",""Certificate of Registration for RFID, SRD, WDN, Devices- Indoor"",""Certificate of Registration as a Value-Added Service (VAS) Provider"",""TVRO Registration Certificate""]" },
            ["targetCertificateType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000241"), FieldType = "dropdown", Label = "Type", SyncBackOnSubmit = false },
            ["targetCertificateNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000242"), FieldType = "text", Label = "Certificate Number", SyncBackOnSubmit = false },
            ["noOfCopies"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000243"), FieldType = "dropdown", Label = "No. of Copies", SyncBackOnSubmit = false, ValidationRules = @"[""1"",""2"",""3"",""4"",""5"",""10""]" },

            // Accreditations (NTC 1-18) Section 3 Technical Personnel fields
            ["supervisingEngineer"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000252"), FieldType = "text", Label = "Supervising Engineer", SyncBackOnSubmit = false },
            ["certificateEctNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000250"), FieldType = "text", Label = "Certificate/ECT No.", SyncBackOnSubmit = false },
            ["certificateEctExpiryDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000255"), FieldType = "date", Label = "Certificate/ECT No. Date of Expiry", SyncBackOnSubmit = false },
            ["technicianName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000253"), FieldType = "text", Label = "Technician Name", SyncBackOnSubmit = false },
            ["technicianCertNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000254"), FieldType = "text", Label = "Certificate/Number", SyncBackOnSubmit = false },
            ["technicianExpiryDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000251"), FieldType = "date", Label = "Certificate/Number Date of Expiry", SyncBackOnSubmit = false },

            // Amateur Permits (NTC 1-09) specific fields
            ["preferredCallSign"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000261"), FieldType = "text", Label = "Preferred Call Sign/s", SyncBackOnSubmit = false },
            ["bandwidthUnit"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000260"), FieldType = "dropdown", Label = "Unit", SyncBackOnSubmit = false, ValidationRules = @"[""KHz"",""MHz"",""GHz""]" },
            ["noOfUnits"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000262"), FieldType = "number", Label = "Number of Units", SyncBackOnSubmit = false },
            ["amateurLicenseNoPermitNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000266"), FieldType = "text", Label = "Amateur License no./Permit to Possess No.", SyncBackOnSubmit = false },
            ["proposedEquipments"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000267"), FieldType = "repeater", Label = "Particulars of Proposed Equipment", SyncBackOnSubmit = false },

            // Aliases & Missing Equipment / Station Fields
            ["makeModel"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000270"), FieldType = "text", Label = "Make / Model", SyncBackOnSubmit = false },
            ["officerName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000271"), FieldType = "text", Label = "Officer / Technician Name", SyncBackOnSubmit = false },
            ["certificateNumber"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000272"), FieldType = "text", Label = "Certificate / Registration Number", SyncBackOnSubmit = false },
            ["expiryDate"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000273"), FieldType = "date", Label = "Expiry Date", SyncBackOnSubmit = false },
            ["citizenship"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000274"), FieldType = "text", Label = "Citizenship", SyncBackOnSubmit = false },
            ["stationLicenseNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000275"), FieldType = "text", Label = "Station License No.", SyncBackOnSubmit = false },

            // Amateur License Fields
            ["classOfAmateur"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000280"), FieldType = "dropdown", Label = "Class of Amateur", SyncBackOnSubmit = false, ValidationRules = @"[""Class A"",""Class B"",""Class C"",""Class D""]" },
            ["handleName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000281"), FieldType = "text", Label = "Handle Name", SyncBackOnSubmit = false },
            ["clubName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000282"), FieldType = "text", Label = "Club Name", SyncBackOnSubmit = false },
            ["trusteeName"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000283"), FieldType = "text", Label = "Trustee Name", SyncBackOnSubmit = false },
            ["trusteeCallSign"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000284"), FieldType = "text", Label = "Trustee Call Sign", SyncBackOnSubmit = false },
            ["trusteeLicenseNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000285"), FieldType = "text", Label = "Trustee License No.", SyncBackOnSubmit = false },
            ["clubAddress"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000286"), FieldType = "text", Label = "Club Address", SyncBackOnSubmit = false },
            ["stationType"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000287"), FieldType = "dropdown", Label = "Station Type", SyncBackOnSubmit = false, ValidationRules = @"[""Fixed"",""Land Mobile"",""Portable"",""Repeater""]" },
            ["authorizedPower"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000288"), FieldType = "text", Label = "Authorized Power", SyncBackOnSubmit = false },
            ["frequencyBands"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000289"), FieldType = "text", Label = "Frequency Bands", SyncBackOnSubmit = false },

            // Aeronautical License Fields
            ["aircraftRegNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000290"), FieldType = "text", Label = "Aircraft Registration No. (RP-)", SyncBackOnSubmit = false },
            ["aircraftMakeModel"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000291"), FieldType = "text", Label = "Aircraft Make / Model", SyncBackOnSubmit = false },
            ["aircraftSerialNo"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000292"), FieldType = "text", Label = "Aircraft Serial No.", SyncBackOnSubmit = false },
            ["registeredOwner"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000293"), FieldType = "text", Label = "Registered Owner", SyncBackOnSubmit = false },
            ["baseOfOperation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000294"), FieldType = "text", Label = "Base of Operation / Home Airport", SyncBackOnSubmit = false },

            // TVRO / CATV License Fields
            ["carrierFrequency"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000295"), FieldType = "text", Label = "Carrier Frequency", SyncBackOnSubmit = false },
            ["channelCapacity"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000296"), FieldType = "text", Label = "Channel Capacity", SyncBackOnSubmit = false },
            ["azimuth"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000297"), FieldType = "text", Label = "Azimuth Angle", SyncBackOnSubmit = false },
            ["elevation"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000298"), FieldType = "text", Label = "Elevation Angle", SyncBackOnSubmit = false },

            // NTC 1-24 Fields (Affidavit of Ownership and Loss with Undertaking)
            ["action_requested"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000307"), FieldType = "dropdown", Label = "Action Requested", SyncBackOnSubmit = false, ValidationRules = @"[""BLOCK GSM Handset"",""UNBLOCK GSM Handset""]" },
            ["make_model_type"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000308"), FieldType = "text", Label = "Make / Model / Type", SyncBackOnSubmit = false },
            ["imei_number"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000309"), FieldType = "text", Label = "International Mobile Equipment Identification (IMEI)", SyncBackOnSubmit = false, ValidationRules = @"^[0-9]{15}$" },
            ["mobile_number"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000310"), FieldType = "text", Label = "Subscriber Identity Module (SIM) / Cell Phone Number", SyncBackOnSubmit = false, ValidationRules = @"^09[0-9]{9}$" },
            ["identity_proof_type"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000311"), FieldType = "dropdown", Label = "Government Identification Attached", SyncBackOnSubmit = false, ValidationRules = @"[""Copy of government-issued ID or Passport"",""Copy of school ID (for students)"",""Copy of Birth Certificate or NBI Clearance""]" },
            ["proof_of_ownership_type"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000312"), FieldType = "dropdown", Label = "Proof of Ownership", SyncBackOnSubmit = false, ValidationRules = @"[""Official Receipt of Mobile Phone"",""Original Phone Box with IMEI"",""Certificate of Purchase from Authorized Seller"",""Affidavit of Loss with Police Blotter""]" },
            ["loss_reason"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000313"), FieldType = "dropdown", Label = "Incident Type", SyncBackOnSubmit = false, ValidationRules = @"[""Lost / Misplaced"",""Stolen (Theft / Robbery / Hold-up)""]" },
            ["age_group"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000314"), FieldType = "dropdown", Label = "Age Group", SyncBackOnSubmit = false, ValidationRules = @"[""Below 18"",""18 - 29"",""30 - 39"",""40 - 49"",""50 - 59"",""60 up""]" },
            ["place_of_incident"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000315"), FieldType = "text", Label = "Place of Incident", SyncBackOnSubmit = false },
            ["date_of_incident"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000316"), FieldType = "date", Label = "Date of Incident", SyncBackOnSubmit = false },
            ["time_of_day"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000317"), FieldType = "dropdown", Label = "Time of Incident", SyncBackOnSubmit = false, ValidationRules = @"[""Daytime"",""Nighttime""]" },

            // NTC 1-25 Fields (Complaint Form - Rev 03 03/31/2025)
            ["provider_business_name"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000324"), FieldType = "text", Label = "Business Name", SyncBackOnSubmit = false },
            ["provider_business_address"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000325"), FieldType = "textarea", Label = "Business Address", SyncBackOnSubmit = false },
            ["provider_contact_number"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000326"), FieldType = "text", Label = "Contact Number", SyncBackOnSubmit = false },
            ["complaint_types"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000327"), FieldType = "checkbox_group", Label = "Nature of Complaint", SyncBackOnSubmit = false, ValidationRules = @"[""Billing Complaint"",""Spam"",""Poor Service (Technical Service/Customer Service)"",""Scam"",""Fair Use"",""Denial of Subscription Plan"",""Others, please specify""]" },
            ["others_specification"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000328"), FieldType = "text", Label = "If Others, Please Specify", SyncBackOnSubmit = false },
            ["time_of_incident"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000329"), FieldType = "time", Label = "Time of incident/transaction", SyncBackOnSubmit = false },
            ["state_briefly_details"] = new() { Id = Guid.Parse("fd000000-0000-0000-0000-000000000330"), FieldType = "textarea", Label = "State Briefly the Details of Complaint", SyncBackOnSubmit = false },
            ["attached_proof_documents"] = new() {
                Id = Guid.Parse("fd000000-0000-0000-0000-000000000331"),
                FieldType = "repeater",
                Label = "Attached Proof / Supporting Documents",
                SyncBackOnSubmit = false,
                ValidationRules = @"{""repeaterColumns"":[{""id"":""c1"",""key"":""document_description"",""label"":""Document Description"",""placeholder"":""e.g. Screenshot of Spam / Billing Statement / Official Receipt"",""required"":true,""type"":""text""},{""id"":""c2"",""key"":""attachment_file"",""label"":""Attached Document / File"",""placeholder"":""Upload file"",""required"":true,""type"":""file""}],""addButtonLabel"":""Add Another Proof / Attachment""}"
            },

            // Repeater Fields for Blocking / Unblocking Devices & SIMs
            ["device_particulars"] = new() {
                Id = Guid.Parse("fd000000-0000-0000-0000-000000000332"),
                FieldType = "repeater",
                Label = "Device Particulars",
                SyncBackOnSubmit = false,
                ValidationRules = @"{""repeaterColumns"":[{""id"":""c1"",""key"":""make_model_type"",""label"":""Make / Type / Model"",""placeholder"":""e.g. Apple iPhone 15 Pro / Samsung Galaxy S24"",""required"":true,""type"":""text""},{""id"":""c2"",""key"":""imei_number"",""label"":""IMEI Number (15 Digits)"",""placeholder"":""e.g. 356789012345678"",""required"":true,""type"":""number""}],""addButtonLabel"":""Add Another Device (Dual SIM / Multiple Handsets)""}"
            },
            ["sim_mobile_numbers"] = new() {
                Id = Guid.Parse("fd000000-0000-0000-0000-000000000333"),
                FieldType = "repeater",
                Label = "SIM Card / Mobile Numbers",
                SyncBackOnSubmit = false,
                ValidationRules = @"{""repeaterColumns"":[{""id"":""c1"",""key"":""mobile_number"",""label"":""Mobile Number"",""placeholder"":""09XXXXXXXXX or +639XXXXXXXXX"",""required"":true,""type"":""text""}],""addButtonLabel"":""Add Another Mobile Number""}"
            }
        };
    }
}

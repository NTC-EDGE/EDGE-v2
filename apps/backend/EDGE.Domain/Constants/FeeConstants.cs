namespace EDGE.Domain.Constants;

/// <summary>
/// Domain constants for fee calculation codes, standard formulas, statutory default amounts, and surcharge rules.
/// </summary>
public static class FeeConstants
{
    public static class Codes
    {
        public const string Roc = "ROC";
        public const string Dst = "DST";
        public const string Modification = "MOD";
        public const string FilingFee = "FF";
        public const string ApplicationFee = "AF";
        public const string Seminar = "SEM";
        public const string Registration = "REG";
        public const string AnnualRegistration1 = "ARF1";
        public const string AnnualRegistration2 = "ARF2";
        public const string FirstCopy = "FC";
        public const string SucceedingCopies = "SC";
        public const string Duplicate = "DUP";
        public const string PossessPermit = "POSS_PERMIT";
        public const string License = "LIC";
        public const string Permit = "PERMIT";
        public const string Exam = "EXAM";
        public const string Accreditation = "ACCRED";
        public const string Surcharge = "SUR";
        public const string Request = "REQ_FEE";
        public const string DefaultBase = "FEE_BASE";
    }

    public static class Amounts
    {
        // Common Taxes & Base Fees
        public const decimal DocumentaryStampTax = 30.00m;
        public const decimal CertificateModification = 120.00m;
        public const decimal ForeignPilotTemporary = 100.00m;
        public const decimal DefaultFallbackRate = 100.00m;

        // Commercial ROC Rates per Element (Annual)
        public const decimal Roc1RtgAnnualRate = 180.00m;
        public const decimal Roc2RtgAnnualRate = 120.00m;
        public const decimal Roc3RtgAnnualRate = 60.00m;
        public const decimal Roc1PhnAnnualRate = 120.00m;
        public const decimal Roc2PhnAnnualRate = 100.00m;
        public const decimal Roc3PhnAnnualRate = 60.00m;
        public const decimal RocDefaultAnnualRate = 180.00m;

        // Government & Land Mobile Station ROC Rates
        public const decimal GovFilingFee = 10.00m;
        public const decimal GovApplicationFee = 20.00m;
        public const decimal GovRocAnnualRate = 60.00m;
        public const decimal LandMobileRocAnnualRate = 30.00m;

        // Special ROC & Aircraft Rates
        public const decimal SpecialRocSeminarFee = 20.00m;
        public const decimal SpecialRocAnnualRate = 60.00m;
        public const decimal AircraftRocAnnualRate = 100.00m;

        // Amateur ROC Rates
        public const decimal AmateurRocAnnualRate = 60.00m;
        public const decimal AmateurModificationFee = 60.00m;
        public const decimal AmateurLifetimeFilingFee = 60.00m;
        public const decimal AmateurLifetimeModificationFee = 50.00m;
        public const decimal AmateurLifetimePossessPermitFee = 50.00m;

        // RFID / SRD / WDN Rates
        public const decimal RfidApplicationFee = 180.00m;
        public const decimal RfidHighPowerUnitRate = 300.00m;
        public const decimal RfidLowPowerUnitRate = 100.00m;
        public const decimal SrdWdnUnitRate = 50.00m;

        // TVRO & VAS Provider Rates
        public const decimal TvroRegistrationRate = 6500.00m;
        public const decimal VasFilingFee = 300.00m;
        public const decimal VasAnnualBaseRate = 6000.00m;
        public const decimal VasAnnualExcessRate = 1000.00m;

        // Copies & Certified True Copies
        public const decimal CertifiedTrueCopyFirstPage = 6.00m;
        public const decimal CertifiedTrueCopySucceedingPage = 2.50m;
        public const decimal DuplicateCopyRate = 120.00m;

        // Other Categories (Licenses, Permits, Exams, Accreditations, Requests)
        public const decimal LicenseFilingFee = 180.00m;
        public const decimal DefaultLicenseRate = 500.00m;
        public const decimal PermitFilingFee = 100.00m;
        public const decimal DefaultPermitRate = 300.00m;
        public const decimal ExamApplicationFee = 50.00m;
        public const decimal DefaultExamRate = 100.00m;
        public const decimal AccreditationFilingFee = 300.00m;
        public const decimal DefaultAccreditationRate = 1200.00m;
        public const decimal DefaultRequestRate = 150.00m;
    }

    public static class Surcharges
    {
        public const int Tier1Days = 180;
        public const int Tier2Days = 365;
        public const double ExcessBlockDays = 180.0;
        public const decimal Tier1Multiplier = 0.50m;
        public const decimal Tier2Multiplier = 1.00m;
        public const decimal ExcessStepMultiplier = 0.50m;
    }

    public static class Formulas
    {
        public const string RocNew = "FEEROC = (ROC)(YR) + DST";
        public const string RocRenewal = "FEEROC = (ROC)(YR) + DST + SUR";
        public const string RocModification = "FEEROC = MOD + DST";
        public const string GovRocNew = "FEEROC = FF + AF + (ROC)(YR) + DST";
        public const string GovRocRenewal = "FEEROC = FF + AF + (ROC)(YR) + DST + SUR";
        public const string LandMobileRocNew = "FEEROC = FF + AF + (ROC)(YR) + DST";
        public const string LandMobileRocRenewal = "FEEROC = FF + AF + (ROC)(YR) + DST + SUR";
        public const string SpecialRocNew = "FEEROC = AF + SEM + (ROC)(YR) + DST";
        public const string SpecialRocRenewal = "FEEROC = AF + SEM + (ROC)(YR) + DST + SUR";
        public const string AmateurRocNew = "FEEAT-ROC = (ROC)(YR) + DST";
        public const string AmateurRocRenewal = "FEEAT-ROC = (ROC)(YR) + DST + SUR";
        public const string AmateurLifetime = "FEEAT-LIFETIME = FF + MOD + POSS_PERMIT + DST";
        public const string AmateurModification = "FEEAT-ROC = MOD + DST";
        public const string RfidRegistration = "FEEREG = AF + (REG)(UNIT) + DST";
        public const string TvroRegistration = "FEETVROREG = REG + DST";
        public const string VasRenewal = "FEECERT = FF + (ARF1 + (ARF2)(NAS))(YR) + DST";
        public const string VasRenewalWithSurcharge = "FEECERT = FF + (ARF1 + (ARF2)(NAS))(YR) + DST + SUR";
        public const string CertifiedTrueCopy = "FEECTC = FC + (SC)(COPY) + DST";
        public const string DuplicateCopy = "FEEDUP = DUP + DST";
        public const string LicenseNew = "FEELIC = FF + (LIC)(YR)(UNIT) + DST";
        public const string LicenseRenewal = "FEELIC = FF + (LIC)(YR)(UNIT) + DST + SUR";
        public const string LicenseModification = "FEELIC = FF + MOD + DST";
        public const string PermitStandard = "FEEPERMIT = FF + (PERMIT)(UNIT) + DST";
        public const string ExamStandard = "FEEEXAM = AF + EXAM + DST";
        public const string AccreditationNew = "FEEACCRED = FF + (ACCRED)(YR) + DST";
        public const string AccreditationRenewal = "FEEACCRED = FF + (ACCRED)(YR) + DST + SUR";
        public const string RequestStandard = "FEEREQ = REQ_FEE + DST";
        public const string DefaultStandard = "FEE = (RATE)(YR)(UNIT) + DST";
        public const string DefaultRenewal = "FEE = (RATE)(YR)(UNIT) + DST + SUR";
    }
}

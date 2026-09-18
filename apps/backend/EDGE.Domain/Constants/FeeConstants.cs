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

        // Permits-specific codes
        public const string Purchase = "PUR";
        public const string Possess = "POS";
        public const string SellTransfer = "STF";
        public const string PermitFee = "PF";
        public const string InspectionFee = "IF";
        public const string Demo = "DEMO";
        public const string PermitToTransport = "PTR";
        public const string SpecialPermit = "SP";
        public const string LicenseFee = "LF";
        public const string ConstructionPermit = "CPF";
        public const string SpectrumUsage = "SUF";
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

        // Permits: Amateur Service Rates
        public const decimal AmateurPermitUnitRate = 50.00m;
        public const decimal AmateurForeignVisitorFilingFee = 60.00m;
        public const decimal AmateurForeignVisitorRocRate = 60.00m;
        public const decimal AmateurForeignVisitorClassALicense = 120.00m;
        public const decimal AmateurForeignVisitorClassBLicense = 132.00m;
        public const decimal AmateurForeignVisitorClassCLicense = 144.00m;
        public const decimal AmateurVanityCallSignRate = 1000.00m;
        public const decimal AmateurSpecialEventCallSignRate = 120.00m;

        // Permits: Power-Rated Station Rates
        public const decimal PowerStationFilingFee = 180.00m;
        public const decimal PowerHighPurchaseRate = 240.00m;
        public const decimal PowerHighPossessRate = 120.00m;
        public const decimal PowerHighSellTransferRate = 240.00m;
        public const decimal PowerMediumPurchaseRate = 120.00m;
        public const decimal PowerMediumPossessRate = 96.00m;
        public const decimal PowerMediumSellTransferRate = 120.00m;
        public const decimal PowerLowPurchaseRate = 96.00m;
        public const decimal PowerLowPossessRate = 60.00m;
        public const decimal PowerLowSellTransferRate = 96.00m;

        // Permits: Operational & Equipment Rates
        public const decimal PermitDemoFee = 85.00m;
        public const decimal PermitToTransportRate = 85.00m;
        public const decimal PermitModificationFee = 120.00m;

        // Radio Communications Equipment Dealer/Manufacturer/Service Center
        public const decimal RadioEquipmentFilingFee = 180.00m;
        public const decimal RadioEquipmentDealerPermitRate = 1200.00m;
        public const decimal RadioEquipmentDealerInspectionRate = 720.00m;
        public const decimal RadioEquipmentManufacturerPermitRate = 1760.00m;
        public const decimal RadioEquipmentManufacturerInspectionRate = 720.00m;
        public const decimal RadioEquipmentServiceCenterPermitRate = 720.00m;
        public const decimal RadioEquipmentServiceCenterInspectionRate = 720.00m;

        // Mobile Phone Permits
        public const decimal MobilePhoneFilingFee = 500.00m;
        public const decimal MobilePhoneDealerMainPermitRate = 2500.00m;
        public const decimal MobilePhoneDealerBranchPermitRate = 1500.00m;
        public const decimal MobilePhoneDealerInspectionRate = 1500.00m;
        public const decimal MobilePhoneRetailerPermitRate = 1500.00m;
        public const decimal MobilePhoneRetailerInspectionRate = 1500.00m;
        public const decimal MobilePhoneServiceCenterFilingFee = 180.00m;
        public const decimal MobilePhoneServiceCenterPermitRate = 1200.00m;
        public const decimal MobilePhoneServiceCenterInspectionRate = 720.00m;

        // Permit Copies
        public const decimal PermitCertifiedTrueCopyFirstPage = 24.00m;
        public const decimal PermitCertifiedTrueCopySucceedingPage = 6.00m;

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
        // Certificates Formulas
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

        // Permits Formulas
        public const string PermitAmateurPurchase = "TOTAL = (PUR)(UNIT) + DST";
        public const string PermitAmateurPossess = "TOTAL = (POS)(UNIT) + DST";
        public const string PermitAmateurPurchasePossess = "FEEPUR/POS = (PUR)(UNIT) + (POS)(UNIT) + DST";
        public const string PermitAmateurSellTransfer = "FEESTF = (STF)(UNIT) + DST";
        public const string PermitAmateurForeignVisitor = "FEEAT-TEMPORARY = FF + (PUR)(UNIT) + (POS)(UNIT) + (ROC)(YR) + (LF)(YR) + DST";
        public const string PermitAmateurVanity = "FEEVANITY-AT = (SP)(YR) + DST";
        public const string PermitAmateurSpecialEvent = "FEESPECIAL EVENT-AT = SP + DST";
        public const string PermitStationPurchase = "TOTAL = (PUR)(UNIT) + DST";
        public const string PermitStationPossess = "TOTAL = (POS)(UNIT) + DST";
        public const string PermitStationPurchasePossess = "FEEPUR/POS = (FF)(UNIT) + (PUR)(UNIT) + (POS)(UNIT) + DST";
        public const string PermitStationSellTransfer = "FEESTF = (STF)(UNIT) + DST";
        public const string PermitDemoPropagate = "FEEDEMO = (FF)(UNIT) + (DEMO)(CH_UNIT) + DST";
        public const string PermitTransport = "FEEPTR = (PTR)(UNIT) + DST";
        public const string PermitDealerNew = "FEEDP = FF + (PF)(YR) + (IF)(YR) + DST";
        public const string PermitDealerRenewal = "FEEDP = (PF)(YR) + (IF)(YR) + DST + SUR";
        public const string PermitDealerModification = "FEEDP = MOD + DST";
        public const string PermitMobilePhoneDealerNew = "FEEMPDP = FF + (PF)(YR) + (IF)(YR) + DST";
        public const string PermitMobilePhoneDealerRenewal = "FEEMPDP = (PF)(YR) + (IF)(YR) + DST + SUR";
        public const string PermitMobilePhoneDealerModification = "FEEMPDP = MOD + DST";
        public const string PermitMobilePhoneRetailerNew = "FEEMPRRP = FF + (PF)(YR) + (IF)(YR) + DST";
        public const string PermitMobilePhoneRetailerRenewal = "FEEMPRRP = (PF)(YR) + (IF)(YR) + DST + SUR";
        public const string PermitMobilePhoneRetailerModification = "FEEMPRRP = MOD + DST";
        public const string PermitMobilePhoneServiceCenterNew = "FEEMPSCP = FF + (PF)(YR) + (IF)(YR) + DST";
        public const string PermitMobilePhoneServiceCenterRenewal = "FEEMPSCP = (PF)(YR) + (IF)(YR) + DST + SUR";
        public const string PermitMobilePhoneServiceCenterModification = "FEEMPSCP = MOD + DST";
        public const string PermitCertifiedTrueCopy = "TOTAL = FC + (SC)(COPY) + DST";
        public const string PermitDuplicateCopy = "TOTAL = DUP + DST";

        // License & Others
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

using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Licenses (Radio Station Licenses, Maritime, Aeronautical, FLM, TVRO/CATV, and Copies).
/// </summary>
public class LicenseFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    public ServiceCategoryType Category => ServiceCategoryType.License;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.License;
        }

        return activity.SafeContains("LICENSE") ||
               applicationType.SafeContains("License") ||
               activity.SafeContains("TVRO") ||
               activity.SafeContains("CATV") ||
               activity.SafeContains("COPY OF LICENSES");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var units = Math.Max(1, request.NoOfUnits);
        var copies = Math.Max(1, request.NoOfCopies);
        var channels = Math.Max(1, request.NoOfChannels);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        string formulaApplied;

        // 1. COPY OF LICENSES
        if (activity.SafeContains("COPY OF LICENSES") || appType.SafeContains("Copy of License") || appType.SafeContains("Certified True Copy") || appType.SafeContains("Duplicate Copy"))
        {
            formulaApplied = CalculateLicenseCopies(lineItems, appType, copies);
        }
        // 2. TVRO / CATV STATION LICENSE
        else if (activity.SafeContains("TVRO") || activity.SafeContains("CATV") || appType.SafeContains("TVRO") || appType.SafeContains("CATV"))
        {
            formulaApplied = CalculateTvroCatvLicenses(lineItems, appType, years, request.ExpirationDate, asOfDate);
        }
        // 3. LICENSE IN THE AMATEUR SERVICE
        else if (activity.SafeContains("AMATEUR") || appType.SafeContains("Amateur"))
        {
            formulaApplied = CalculateAmateurLicenses(lineItems, appType, element, years, units, request.ExpirationDate, asOfDate);
        }
        // 4. LICENSE IN THE AERONAUTICAL SERVICE
        else if (activity.SafeContains("AERONAUTICAL") || appType.SafeContains("Aeronautical") || appType.SafeContains("Aircraft"))
        {
            formulaApplied = CalculateAeronauticalLicenses(lineItems, appType, element, years, units, request.ExpirationDate, asOfDate);
        }
        // 5. LICENSE IN THE MARITIME SERVICE
        else if (activity.SafeContains("MARITIME") || appType.SafeContains("Ship Station") || appType.SafeContains("Ship Earth") || appType.SafeContains("Coastal"))
        {
            formulaApplied = CalculateMaritimeLicenses(lineItems, appType, element, years, units, request.ExpirationDate, asOfDate);
        }
        // 6. OTHER RADIO STATION LICENSES/SERVICES (Microwave, VSAT, Public Trunked, BWA, WDN, BTS)
        else if (activity.SafeContains("OTHER RADIO") || appType.SafeContains("Microwave") || appType.SafeContains("VSAT") || appType.SafeContains("Public Trunked") || appType.SafeContains("BWA") || appType.SafeContains("BTS"))
        {
            formulaApplied = CalculateOtherLicenses(lineItems, appType, element, years, units, channels, request.ExpirationDate, asOfDate);
        }
        // 7. FIXED AND LAND MOBILE SERVICE (FLM)
        else if (activity.SafeContains("FIXED AND LAND MOBILE") || activity.SafeContains("FLM") || appType.SafeContains("Radio Station License"))
        {
            formulaApplied = CalculateFlmLicenses(lineItems, appType, element, years, units, channels, request.ExpirationDate, asOfDate);
        }
        // Fallback standard license
        else
        {
            formulaApplied = CalculateDefaultLicense(lineItems, appType, years, units, request.ExpirationDate, asOfDate);
        }

        // Add DST
        lineItems.Add(new CalculatedFeeLineItemDto("Documentary Stamp Tax (DST)", FeeConstants.Codes.Dst, "Statutory Documentary Stamp Tax", 1, 1, DST_AMOUNT, DST_AMOUNT, IsTax: true));

        var subTotal = lineItems.Where(li => !li.IsSurcharge && !li.IsTax).Sum(li => li.Amount);
        var surchargeAmount = lineItems.Where(li => li.IsSurcharge).Sum(li => li.Amount);
        var taxAmount = lineItems.Where(li => li.IsTax).Sum(li => li.Amount);
        var totalAmount = lineItems.Sum(li => li.Amount);

        return new FeeCalculationResultDto(
            Activity: activity,
            ApplicationType: appType,
            Element: string.IsNullOrWhiteSpace(element) ? null : element,
            FormulaApplied: formulaApplied,
            SubTotal: subTotal,
            SurchargeAmount: surchargeAmount,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            LineItems: lineItems,
            Category: ServiceCategoryType.License
        );
    }

    #region 1. License Copies
    private static string CalculateLicenseCopies(List<CalculatedFeeLineItemDto> lineItems, string appType, int copies)
    {
        if (appType.SafeContains("Certified True Copy") || appType.SafeContains("CTC"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Certified True Copy (First Page)", FeeConstants.Codes.FirstCopy, "First copy authentication fee", 1, 1, FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage, FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage));
            if (copies > 1)
            {
                var extraCopies = copies - 1;
                lineItems.Add(new CalculatedFeeLineItemDto("Certified True Copy (Succeeding Pages)", FeeConstants.Codes.SucceedingCopies, "Succeeding copies authentication fee", 1, extraCopies, FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage, FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage * extraCopies));
            }
            return FeeConstants.Formulas.LicenseCertifiedTrueCopy;
        }

        // Duplicate Copy
        lineItems.Add(new CalculatedFeeLineItemDto("Duplicate License Copy", FeeConstants.Codes.Duplicate, "Statutory Duplicate Copy Issuance Fee", 1, 1, FeeConstants.Amounts.DuplicateCopyRate, FeeConstants.Amounts.DuplicateCopyRate));
        return FeeConstants.Formulas.LicenseDuplicateCopy;
    }
    #endregion

    #region 2. TVRO / CATV Station Licenses
    private static string CalculateTvroCatvLicenses(List<CalculatedFeeLineItemDto> lineItems, string appType, int years, DateTime? expirationDate, DateTime asOfDate)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");
        var isCatv = appType.SafeContains("CATV");

        if (isCatv)
        {
            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "CATV License Modification Fee", 1, 1, FeeConstants.Amounts.CatvModificationFee, FeeConstants.Amounts.CatvModificationFee));
                return FeeConstants.Formulas.LicenseCatvModification;
            }

            if (isRenewal)
            {
                var lfTotal = FeeConstants.Amounts.CatvLicenseFee * years;
                lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "CATV Station Annual License Fee", years, 1, FeeConstants.Amounts.CatvLicenseFee, lfTotal));
                lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "CATV Station Annual Inspection Fee", years, 1, FeeConstants.Amounts.CatvInspectionFee, FeeConstants.Amounts.CatvInspectionFee * years));

                ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseCatvRenewal;
            }

            // New
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "CATV License Application Filing Fee", 1, 1, FeeConstants.Amounts.CatvFilingFee, FeeConstants.Amounts.CatvFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "CATV Station Construction Permit Fee", 1, 1, FeeConstants.Amounts.CatvConstructionPermitFee, FeeConstants.Amounts.CatvConstructionPermitFee));
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "CATV Station Annual License Fee", years, 1, FeeConstants.Amounts.CatvLicenseFee, FeeConstants.Amounts.CatvLicenseFee * years));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "CATV Station Annual Inspection Fee", years, 1, FeeConstants.Amounts.CatvInspectionFee, FeeConstants.Amounts.CatvInspectionFee * years));
            return FeeConstants.Formulas.LicenseCatvNew;
        }

        // TVRO Station License
        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "TVRO License Modification Fee", 1, 1, FeeConstants.Amounts.TvroModificationFee, FeeConstants.Amounts.TvroModificationFee));
            return FeeConstants.Formulas.LicenseTvroModification;
        }

        if (isRenewal)
        {
            var lfTotal = FeeConstants.Amounts.TvroLicenseFee * years;
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "TVRO Station Annual License Fee", years, 1, FeeConstants.Amounts.TvroLicenseFee, lfTotal));
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseTvroRenewal;
        }

        // New TVRO
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "TVRO Station Annual License Fee", years, 1, FeeConstants.Amounts.TvroLicenseFee, FeeConstants.Amounts.TvroLicenseFee * years));
        return FeeConstants.Formulas.LicenseTvroNew;
    }
    #endregion

    #region 3. Amateur Service Licenses
    private static string CalculateAmateurLicenses(List<CalculatedFeeLineItemDto> lineItems, string appType, string element, int years, int units, DateTime? expirationDate, DateTime asOfDate)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        // Lifetime Amateur Radio Station License for Class A
        if (appType.SafeContains("Lifetime"))
        {
            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur Lifetime License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseFilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur Lifetime License Modification Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseModificationFee, FeeConstants.Amounts.AmateurLicenseModificationFee));
                return FeeConstants.Formulas.LicenseAmateurLifetimeModification;
            }

            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Lifetime Amateur Station License Fee", 1, 1, FeeConstants.Amounts.AmateurLifetimeLicenseFee, FeeConstants.Amounts.AmateurLifetimeLicenseFee));
            return FeeConstants.Formulas.LicenseAmateurLifetimeNew;
        }

        // Amateur Club Radio Station License
        if (appType.SafeContains("Club"))
        {
            var isDuplex = element.SafeContains("DUPLEX") || appType.SafeContains("Duplex");
            var clubLfRate = isDuplex ? FeeConstants.Amounts.AmateurClubDuplexLicenseFee : FeeConstants.Amounts.AmateurClubSimplexLicenseFee;

            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur Club License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AmateurClubFilingFee, FeeConstants.Amounts.AmateurClubFilingFee));
                lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Amateur Club Modification Construction Permit Fee", 1, 1, FeeConstants.Amounts.AmateurClubModificationCpf, FeeConstants.Amounts.AmateurClubModificationCpf));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur Club License Modification Fee", 1, 1, FeeConstants.Amounts.AmateurClubModificationFee, FeeConstants.Amounts.AmateurClubModificationFee));
                return FeeConstants.Formulas.LicenseAmateurClubModification;
            }

            if (isRenewal)
            {
                var lfTotal = clubLfRate * years;
                lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({(isDuplex ? "Duplex" : "Simplex")})", FeeConstants.Codes.LicenseFee, "Amateur Club Station Annual License Fee", years, 1, clubLfRate, lfTotal));
                ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseAmateurClubRenewal;
            }

            // New Club License
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur Club License Application Filing Fee", 1, 1, FeeConstants.Amounts.AmateurClubFilingFee, FeeConstants.Amounts.AmateurClubFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Amateur Club Construction Permit Fee", 1, 1, FeeConstants.Amounts.AmateurClubConstructionPermitFee, FeeConstants.Amounts.AmateurClubConstructionPermitFee));
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({(isDuplex ? "Duplex" : "Simplex")})", FeeConstants.Codes.LicenseFee, "Amateur Club Station Annual License Fee", years, 1, clubLfRate, clubLfRate * years));
            return FeeConstants.Formulas.LicenseAmateurClubNew;
        }

        // Standard Amateur Radio Station License
        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseFilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur License Modification Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseModificationFee, FeeConstants.Amounts.AmateurLicenseModificationFee));
            return FeeConstants.Formulas.LicenseAmateurModification;
        }

        decimal classLfRate = element.SafeContains("Class A") ? FeeConstants.Amounts.AmateurLicenseClassARate :
                              element.SafeContains("Class B") ? FeeConstants.Amounts.AmateurLicenseClassBRate :
                              element.SafeContains("Class C") ? FeeConstants.Amounts.AmateurLicenseClassCRate :
                              element.SafeContains("Class D") ? FeeConstants.Amounts.AmateurLicenseClassDRate :
                              FeeConstants.Amounts.AmateurLicenseClassARate;

        var classLabel = string.IsNullOrWhiteSpace(element) ? "Class A" : element;

        if (isRenewal)
        {
            var lfTotal = classLfRate * years * units;
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({classLabel})", FeeConstants.Codes.LicenseFee, $"Amateur Station Annual License Fee ({classLabel})", years, units, classLfRate, lfTotal));
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseAmateurRenewal;
        }

        // New Amateur Station License
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur License Application Filing Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseFilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee));
        lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({classLabel})", FeeConstants.Codes.LicenseFee, $"Amateur Station Annual License Fee ({classLabel})", years, units, classLfRate, classLfRate * years * units));
        return FeeConstants.Formulas.LicenseAmateurNew;
    }
    #endregion

    #region 4. Aeronautical Service Licenses
    private static string CalculateAeronauticalLicenses(List<CalculatedFeeLineItemDto> lineItems, string appType, string element, int years, int units, DateTime? expirationDate, DateTime asOfDate)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");
        var isAircraft = appType.SafeContains("Aircraft");

        var powerTier = ResolvePowerTier(element);

        if (isAircraft)
        {
            decimal cpfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.AeroAircraftHighCpf :
                              powerTier == PowerTier.Medium ? FeeConstants.Amounts.AeroAircraftMedCpf :
                              FeeConstants.Amounts.AeroAircraftLowCpf;

            decimal lfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.AeroAircraftHighLf :
                             powerTier == PowerTier.Medium ? FeeConstants.Amounts.AeroAircraftMedLf :
                             FeeConstants.Amounts.AeroAircraftLowLf;

            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Aircraft Station License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AeroFilingFee, FeeConstants.Amounts.AeroFilingFee));
                lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Aircraft Station Construction Permit Fee", 1, 1, cpfRate, cpfRate));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Aircraft Station License Modification Fee", 1, 1, FeeConstants.Amounts.AeroModificationFee, FeeConstants.Amounts.AeroModificationFee));
                return FeeConstants.Formulas.LicenseAeroAircraftModification;
            }

            if (isRenewal)
            {
                var lfTotal = lfRate * years * units;
                lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Aircraft Station Annual License Fee ({powerTier})", years, units, lfRate, lfTotal));
                lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Aircraft Station Annual Inspection Fee", years, units, FeeConstants.Amounts.AeroInspectionFee, FeeConstants.Amounts.AeroInspectionFee * years * units));
                ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseAeroAircraftRenewal;
            }

            // New Aircraft Station
            lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Aircraft Station Construction Permit Fee", 1, units, cpfRate, cpfRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Aircraft Station Annual License Fee ({powerTier})", years, units, lfRate, lfRate * years * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Aircraft Station Annual Inspection Fee", years, units, FeeConstants.Amounts.AeroInspectionFee, FeeConstants.Amounts.AeroInspectionFee * years * units));
            return FeeConstants.Formulas.LicenseAeroAircraftNew;
        }

        // Fixed Aeronautical Station License
        decimal fixedCpfRate = FeeConstants.Amounts.AeroFixedHighCpf; // 120 for all tiers on New
        decimal fixedModCpfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.AeroFixedHighModCpf :
                                  powerTier == PowerTier.Medium ? FeeConstants.Amounts.AeroFixedMedModCpf :
                                  FeeConstants.Amounts.AeroFixedLowModCpf;

        decimal fixedLfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.AeroFixedHighLf :
                              powerTier == PowerTier.Medium ? FeeConstants.Amounts.AeroFixedMedLf :
                              FeeConstants.Amounts.AeroFixedLowLf;

        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Fixed Aeronautical License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AeroFilingFee, FeeConstants.Amounts.AeroFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Fixed Aeronautical Modification Construction Permit Fee", 1, 1, fixedModCpfRate, fixedModCpfRate));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Fixed Aeronautical License Modification Fee", 1, 1, FeeConstants.Amounts.AeroModificationFee, FeeConstants.Amounts.AeroModificationFee));
            return FeeConstants.Formulas.LicenseAeroFixedModification;
        }

        if (isRenewal)
        {
            var lfTotal = fixedLfRate * years * units;
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Fixed Aeronautical Station Annual License Fee ({powerTier})", years, units, fixedLfRate, lfTotal));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Fixed Aeronautical Station Annual Inspection Fee", years, units, FeeConstants.Amounts.AeroInspectionFee, FeeConstants.Amounts.AeroInspectionFee * years * units));
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseAeroFixedRenewal;
        }

        // New Fixed Aeronautical
        lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Fixed Aeronautical Construction Permit Fee", 1, units, fixedCpfRate, fixedCpfRate * units));
        lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Fixed Aeronautical Station Annual License Fee ({powerTier})", years, units, fixedLfRate, fixedLfRate * years * units));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Fixed Aeronautical Station Annual Inspection Fee", years, units, FeeConstants.Amounts.AeroInspectionFee, FeeConstants.Amounts.AeroInspectionFee * years * units));
        return FeeConstants.Formulas.LicenseAeroFixedNew;
    }
    #endregion

    #region 5. Maritime Service Licenses
    private static string CalculateMaritimeLicenses(List<CalculatedFeeLineItemDto> lineItems, string appType, string element, int years, int units, DateTime? expirationDate, DateTime asOfDate)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");
        var isInternational = appType.SafeContains("International");
        var isPrivateCoastal = appType.SafeContains("Private Coastal");
        var isPublicCoastal = appType.SafeContains("Public Coastal");

        var powerTier = ResolvePowerTier(element);

        // International Trade (Ship Station & Ship Earth Station)
        if (isInternational)
        {
            if (isModification)
            {
                decimal purRate = powerTier == PowerTier.High ? FeeConstants.Amounts.PowerHighPurchaseRate :
                                  powerTier == PowerTier.Medium ? FeeConstants.Amounts.PowerMediumPurchaseRate :
                                  FeeConstants.Amounts.PowerLowPurchaseRate;
                decimal posRate = powerTier == PowerTier.High ? FeeConstants.Amounts.PowerHighPossessRate :
                                  powerTier == PowerTier.Medium ? FeeConstants.Amounts.PowerMediumPossessRate :
                                  FeeConstants.Amounts.PowerLowPossessRate;

                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "International Ship Station Modification Filing Fee", 1, units, FeeConstants.Amounts.MaritimeFilingFee, FeeConstants.Amounts.MaritimeFilingFee * units));
                lineItems.Add(new CalculatedFeeLineItemDto($"Purchase Permit Fee ({powerTier})", FeeConstants.Codes.Purchase, "Purchase Permit Fee per Unit", 1, units, purRate, purRate * units));
                lineItems.Add(new CalculatedFeeLineItemDto($"Possess Permit Fee ({powerTier})", FeeConstants.Codes.Possess, "Possess Permit Fee per Unit", 1, units, posRate, posRate * units));
                lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "International Ship Station Construction Permit Fee", 1, 1, FeeConstants.Amounts.MaritimeIntlModCpf, FeeConstants.Amounts.MaritimeIntlModCpf));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "International Ship Station Modification Fee", 1, 1, FeeConstants.Amounts.MaritimeModificationFee, FeeConstants.Amounts.MaritimeModificationFee));
                return FeeConstants.Formulas.LicenseMaritimeIntlModification;
            }

            // Renewal
            var lfTotal = FeeConstants.Amounts.MaritimeIntlLf * years * units;
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "International Ship Station Annual License Fee", years, units, FeeConstants.Amounts.MaritimeIntlLf, lfTotal));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "International Ship Station Annual Inspection Fee", years, units, FeeConstants.Amounts.MaritimeIntlIf, FeeConstants.Amounts.MaritimeIntlIf * years * units));
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseMaritimeIntlRenewal;
        }

        // Private Coastal Station License
        if (isPrivateCoastal)
        {
            var isTelephony = element.SafeContains("Telephony") || element.SafeContains("HF") || element.SafeContains("VHF");
            var isVhf = element.SafeContains("VHF");

            decimal cpfRate, lfRate, ifRate;
            if (isTelephony)
            {
                if (isVhf)
                {
                    cpfRate = FeeConstants.Amounts.MarPrivCoastVhfCpf;
                    lfRate = FeeConstants.Amounts.MarPrivCoastVhfLf;
                    ifRate = FeeConstants.Amounts.MarPrivCoastVhfIf;
                }
                else
                {
                    cpfRate = FeeConstants.Amounts.MarPrivCoastHfCpf;
                    lfRate = FeeConstants.Amounts.MarPrivCoastHfLf;
                    ifRate = FeeConstants.Amounts.MarPrivCoastHfIf;
                }
            }
            else
            {
                cpfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.MarPrivCoastHighCpf :
                          powerTier == PowerTier.Medium ? FeeConstants.Amounts.MarPrivCoastMedCpf :
                          FeeConstants.Amounts.MarPrivCoastLowCpf;

                lfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.MarPrivCoastHighLf :
                         powerTier == PowerTier.Medium ? FeeConstants.Amounts.MarPrivCoastMedLf :
                         FeeConstants.Amounts.MarPrivCoastLowLf;

                ifRate = FeeConstants.Amounts.MaritimeInspectionFee;
            }

            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Private Coastal Station Modification Filing Fee", 1, 1, FeeConstants.Amounts.MaritimeFilingFee, FeeConstants.Amounts.MaritimeFilingFee));
                lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Private Coastal Station Construction Permit Fee", 1, 1, cpfRate, cpfRate));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Private Coastal Station Modification Fee", 1, 1, FeeConstants.Amounts.MaritimeModificationFee, FeeConstants.Amounts.MaritimeModificationFee));
                return FeeConstants.Formulas.LicenseMaritimePrivateCoastalModification;
            }

            if (isRenewal)
            {
                var lfTotal = lfRate * years * units;
                lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Private Coastal Station Annual License Fee", years, units, lfRate, lfTotal));
                lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Private Coastal Station Annual Inspection Fee", years, units, ifRate, ifRate * years * units));
                ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseMaritimePrivateCoastalRenewal;
            }

            // New Private Coastal
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Private Coastal Station Construction Permit Fee", 1, units, cpfRate, cpfRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Private Coastal Station Annual License Fee", years, units, lfRate, lfRate * years * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Private Coastal Station Annual Inspection Fee", years, units, ifRate, ifRate * years * units));
            return FeeConstants.Formulas.LicenseMaritimePrivateCoastalNew;
        }

        // Public Coastal Station License
        if (isPublicCoastal)
        {
            var isTelephony = element.SafeContains("Telephony") || element.SafeContains("HF") || element.SafeContains("VHF");
            var isVhf = element.SafeContains("VHF");

            decimal cpfRate, lfRate, ifRate;
            if (isTelephony)
            {
                if (isVhf)
                {
                    cpfRate = FeeConstants.Amounts.MarPubCoastVhfCpf;
                    lfRate = FeeConstants.Amounts.MarPubCoastVhfLf;
                    ifRate = FeeConstants.Amounts.MarPubCoastVhfIf;
                }
                else
                {
                    cpfRate = FeeConstants.Amounts.MarPubCoastHfCpf;
                    lfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.MarPubCoastHfHighLf :
                             powerTier == PowerTier.Medium ? FeeConstants.Amounts.MarPubCoastHfMedLf :
                             FeeConstants.Amounts.MarPubCoastHfLowLf;
                    ifRate = FeeConstants.Amounts.MarPubCoastHfIf;
                }
            }
            else
            {
                cpfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.MarPubCoastHighCpf :
                          powerTier == PowerTier.Medium ? FeeConstants.Amounts.MarPubCoastMedCpf :
                          FeeConstants.Amounts.MarPubCoastLowCpf;

                lfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.MarPubCoastHighLf :
                         powerTier == PowerTier.Medium ? FeeConstants.Amounts.MarPubCoastMedLf :
                         FeeConstants.Amounts.MarPubCoastLowLf;

                ifRate = FeeConstants.Amounts.MarPubCoastIf;
            }

            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Public Coastal Station Modification Filing Fee", 1, 1, FeeConstants.Amounts.MaritimeFilingFee, FeeConstants.Amounts.MaritimeFilingFee));
                lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Public Coastal Station Construction Permit Fee", 1, 1, cpfRate, cpfRate));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Public Coastal Station Modification Fee", 1, 1, FeeConstants.Amounts.MaritimeModificationFee, FeeConstants.Amounts.MaritimeModificationFee));
                return FeeConstants.Formulas.LicenseMaritimePublicCoastalModification;
            }

            if (isRenewal)
            {
                var lfTotal = lfRate * years * units;
                lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Public Coastal Station Annual License Fee", years, units, lfRate, lfTotal));
                lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Public Coastal Station Annual Inspection Fee", years, units, ifRate, ifRate * years * units));
                ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseMaritimePublicCoastalRenewal;
            }

            // New Public Coastal
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Public Coastal Station Construction Permit Fee", 1, units, cpfRate, cpfRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Public Coastal Station Annual License Fee", years, units, lfRate, lfRate * years * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Public Coastal Station Annual Inspection Fee", years, units, ifRate, ifRate * years * units));
            return FeeConstants.Formulas.LicenseMaritimePublicCoastalNew;
        }

        // Ship Station License Domestic Trade
        decimal domCpfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.MaritimeDomHighCpf :
                             powerTier == PowerTier.Medium ? FeeConstants.Amounts.MaritimeDomMedCpf :
                             FeeConstants.Amounts.MaritimeDomLowCpf;

        decimal domLfRate = powerTier == PowerTier.High ? FeeConstants.Amounts.MaritimeDomHighLf :
                            powerTier == PowerTier.Medium ? FeeConstants.Amounts.MaritimeDomMedLf :
                            FeeConstants.Amounts.MaritimeDomLowLf;

        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Ship Station Domestic Modification Filing Fee", 1, 1, FeeConstants.Amounts.MaritimeFilingFee, FeeConstants.Amounts.MaritimeFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Ship Station Construction Permit Fee", 1, 1, domCpfRate, domCpfRate));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Ship Station Modification Fee", 1, 1, FeeConstants.Amounts.MaritimeModificationFee, FeeConstants.Amounts.MaritimeModificationFee));
            return FeeConstants.Formulas.LicenseMaritimeDomesticModification;
        }

        if (isRenewal)
        {
            var lfTotal = domLfRate * years * units;
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Ship Station Domestic Annual License Fee ({powerTier})", years, units, domLfRate, lfTotal));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Ship Station Domestic Annual Inspection Fee", years, units, FeeConstants.Amounts.MaritimeInspectionFee, FeeConstants.Amounts.MaritimeInspectionFee * years * units));
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseMaritimeDomesticRenewal;
        }

        // Domestic New: Check if with originally-installed equipment
        var withOriginalEquip = appType.SafeContains("With Originally") || appType.SafeContains("Originally0");
        if (withOriginalEquip)
        {
            decimal purRate = powerTier == PowerTier.High ? FeeConstants.Amounts.PowerHighPurchaseRate :
                              powerTier == PowerTier.Medium ? FeeConstants.Amounts.PowerMediumPurchaseRate :
                              FeeConstants.Amounts.PowerLowPurchaseRate;
            decimal posRate = powerTier == PowerTier.High ? FeeConstants.Amounts.PowerHighPossessRate :
                              powerTier == PowerTier.Medium ? FeeConstants.Amounts.PowerMediumPossessRate :
                              FeeConstants.Amounts.PowerLowPossessRate;

            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Ship Station Domestic Application Filing Fee", 1, units, FeeConstants.Amounts.MaritimeFilingFee, FeeConstants.Amounts.MaritimeFilingFee * units));
            lineItems.Add(new CalculatedFeeLineItemDto($"Purchase Permit Fee ({powerTier})", FeeConstants.Codes.Purchase, "Purchase Permit Fee per Unit", 1, units, purRate, purRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto($"Possess Permit Fee ({powerTier})", FeeConstants.Codes.Possess, "Possess Permit Fee per Unit", 1, units, posRate, posRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Ship Station Construction Permit Fee", 1, 1, domCpfRate, domCpfRate));
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Ship Station Domestic Annual License Fee ({powerTier})", years, units, domLfRate, domLfRate * years * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Ship Station Domestic Annual Inspection Fee", years, units, FeeConstants.Amounts.MaritimeInspectionFee, FeeConstants.Amounts.MaritimeInspectionFee * years * units));
            return FeeConstants.Formulas.LicenseMaritimeDomesticWithEquipNew;
        }

        // Without originally installed equipment
        lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Ship Station Construction Permit Fee", 1, 1, domCpfRate, domCpfRate));
        lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Ship Station Domestic Annual License Fee ({powerTier})", years, units, domLfRate, domLfRate * years * units));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Ship Station Domestic Annual Inspection Fee", years, units, FeeConstants.Amounts.MaritimeInspectionFee, FeeConstants.Amounts.MaritimeInspectionFee * years * units));
        return FeeConstants.Formulas.LicenseMaritimeDomesticWithoutEquipNew;
    }
    #endregion

    #region 6. Other Radio Station Licenses
    private static string CalculateOtherLicenses(List<CalculatedFeeLineItemDto> lineItems, string appType, string element, int years, int units, int channels, DateTime? expirationDate, DateTime asOfDate)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        if (appType.SafeContains("BTS") && isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "BTS Modification Filing Fee", 1, 1, FeeConstants.Amounts.FlmFilingFee, FeeConstants.Amounts.FlmFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "BTS Construction Permit Fee per Channel", 1, channels, FeeConstants.Amounts.OtherBtsCpf, FeeConstants.Amounts.OtherBtsCpf * channels));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "BTS Modification Fee", 1, 1, FeeConstants.Amounts.FlmModificationFee, FeeConstants.Amounts.FlmModificationFee));
            return FeeConstants.Formulas.LicenseOtherBtsModification;
        }

        decimal lfRate = appType.SafeContains("Microwave") ? FeeConstants.Amounts.OtherMicrowaveLf :
                         appType.SafeContains("VSAT") ? FeeConstants.Amounts.OtherVsatLf :
                         appType.SafeContains("Public Trunked") ? FeeConstants.Amounts.OtherTrunkedLf :
                         appType.SafeContains("BWA") ? FeeConstants.Amounts.OtherBwaLf :
                         appType.SafeContains("WDN") ? FeeConstants.Amounts.OtherWdnLf :
                         appType.SafeContains("BTS") ? FeeConstants.Amounts.OtherBtsLf :
                         FeeConstants.Amounts.OtherMicrowaveLf;

        decimal ifRate = appType.SafeContains("Microwave") ? FeeConstants.Amounts.OtherMicrowaveIf :
                         appType.SafeContains("VSAT") ? FeeConstants.Amounts.OtherVsatIf :
                         appType.SafeContains("Public Trunked") ? FeeConstants.Amounts.OtherTrunkedIf :
                         appType.SafeContains("BWA") ? FeeConstants.Amounts.OtherBwaIf :
                         appType.SafeContains("WDN") ? FeeConstants.Amounts.OtherWdnIf :
                         appType.SafeContains("BTS") ? FeeConstants.Amounts.OtherBtsIf :
                         FeeConstants.Amounts.OtherMicrowaveIf;

        var lfTotal = lfRate * channels * units * years;
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee per Channel/Unit", years, channels * units, lfRate, lfTotal));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Radio Station Annual Inspection Fee per Channel/Unit", years, channels * units, ifRate, ifRate * channels * units * years));

        if (isRenewal)
        {
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
        }

        return FeeConstants.Formulas.LicenseOtherRenewal;
    }
    #endregion

    #region 7. Fixed and Land Mobile Service (FLM) Licenses
    private static string CalculateFlmLicenses(List<CalculatedFeeLineItemDto> lineItems, string appType, string element, int years, int units, int channels, DateTime? expirationDate, DateTime asOfDate)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        var isPortable = element.SafeContains("PORTABLE") || element.SafeContains("(P)") || element.SafeContains(" P ");
        var isRepeater = element.SafeContains("REPEATER") || element.SafeContains("(RT)");
        var isLandBase = element.SafeContains("LAND BASE") || element.SafeContains("(FB)");
        var isLandMobile = element.SafeContains("LAND MOBILE") || element.SafeContains("(ML)");
        var isFixed = !isPortable && !isRepeater && !isLandBase && !isLandMobile; // Default FX

        var isDuplex = element.SafeContains("DUPLEX");
        var isWdn = element.SafeContains("WDN") || element.SafeContains("WIRELESS DATA NETWORK");
        var powerTier = ResolvePowerTier(element);

        // Resolve CPF Rate (0 for Portable, 600 for Repeater, 240 for other station types)
        decimal cpfRate = isPortable ? 0m : (isRepeater ? FeeConstants.Amounts.FlmCpfRepeater : FeeConstants.Amounts.FlmCpfStandard);

        // Resolve LF Rate & IF Rate
        decimal lfRate, ifRate;
        if (isWdn)
        {
            lfRate = isFixed ? 480.00m : 240.00m;
            ifRate = isFixed ? 480.00m : 240.00m;
        }
        else if (isDuplex)
        {
            if (isRepeater)
            {
                lfRate = 1320.00m;
                ifRate = 480.00m;
            }
            else if (isFixed)
            {
                lfRate = powerTier == PowerTier.High ? 1200.00m : (powerTier == PowerTier.Medium ? 960.00m : 720.00m);
                ifRate = 480.00m;
            }
            else if (isLandBase)
            {
                lfRate = powerTier == PowerTier.High ? 1440.00m : (powerTier == PowerTier.Medium ? 1200.00m : 960.00m);
                ifRate = 480.00m;
            }
            else if (isLandMobile)
            {
                lfRate = powerTier == PowerTier.High ? 960.00m : (powerTier == PowerTier.Medium ? 720.00m : 960.00m);
                ifRate = powerTier == PowerTier.Low ? 480.00m : 240.00m;
            }
            else // Portable
            {
                lfRate = powerTier == PowerTier.High ? 960.00m : 480.00m;
                ifRate = 240.00m;
            }
        }
        else // Simplex
        {
            if (isFixed)
            {
                lfRate = powerTier == PowerTier.High ? 600.00m : (powerTier == PowerTier.Medium ? 480.00m : 360.00m);
                ifRate = 480.00m;
            }
            else if (isLandBase)
            {
                lfRate = powerTier == PowerTier.High ? 720.00m : (powerTier == PowerTier.Medium ? 600.00m : 480.00m);
                ifRate = 480.00m;
            }
            else if (isLandMobile)
            {
                lfRate = powerTier == PowerTier.High ? 480.00m : (powerTier == PowerTier.Medium ? 360.00m : 240.00m);
                ifRate = powerTier == PowerTier.High ? 480.00m : 240.00m;
            }
            else // Portable
            {
                lfRate = powerTier == PowerTier.High ? 480.00m : (powerTier == PowerTier.Medium ? 360.00m : 240.00m);
                ifRate = 240.00m;
            }
        }

        if (isModification)
        {
            if (isPortable)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Portable Station Modification Fee", 1, units, FeeConstants.Amounts.FlmModificationFee, FeeConstants.Amounts.FlmModificationFee * units));
                return FeeConstants.Formulas.LicenseFlmPortableModification;
            }

            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Station Modification Filing Fee", 1, units, FeeConstants.Amounts.FlmFilingFee, FeeConstants.Amounts.FlmFilingFee * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Station Construction Permit Fee", 1, units, cpfRate, cpfRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Station Modification Fee", 1, units, FeeConstants.Amounts.FlmModificationFee, FeeConstants.Amounts.FlmModificationFee * units));
            return FeeConstants.Formulas.LicenseFlmModification;
        }

        if (isRenewal)
        {
            var lfTotal = lfRate * channels * units * years;
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee per Channel/Unit", years, channels * units, lfRate, lfTotal));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Radio Station Annual Inspection Fee per Unit", years, units, ifRate, ifRate * units * years));
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseFlmRenewal;
        }

        // New FLM License
        if (cpfRate > 0)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Radio Station Construction Permit Fee per Unit", 1, units, cpfRate, cpfRate * units));
        }
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee per Channel/Unit", years, channels * units, lfRate, lfRate * channels * units * years));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Radio Station Annual Inspection Fee per Unit", years, units, ifRate, ifRate * units * years));
        return FeeConstants.Formulas.LicenseFlmNew;
    }
    #endregion

    #region Default Fallback
    private static string CalculateDefaultLicense(List<CalculatedFeeLineItemDto> lineItems, string appType, int years, int units, DateTime? expirationDate, DateTime asOfDate)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "License Modification Filing Fee", 1, 1, FeeConstants.Amounts.LicenseFilingFee, FeeConstants.Amounts.LicenseFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "License Modification Fee", 1, 1, FeeConstants.Amounts.CertificateModification, FeeConstants.Amounts.CertificateModification));
            return FeeConstants.Formulas.LicenseModification;
        }

        var licenseRate = FeeConstants.Amounts.DefaultLicenseRate;
        var lfTotal = licenseRate * years * units;

        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "License Application Filing Fee", 1, 1, FeeConstants.Amounts.LicenseFilingFee, FeeConstants.Amounts.LicenseFilingFee));
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee", years, units, licenseRate, lfTotal));

        if (isRenewal)
        {
            ApplySurcharge(lineItems, lfTotal, expirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseRenewal;
        }

        return FeeConstants.Formulas.LicenseNew;
    }
    #endregion

    #region Helpers
    private enum PowerTier
    {
        High,
        Medium,
        Low
    }

    private static PowerTier ResolvePowerTier(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return PowerTier.High;

        var upper = text.ToUpperInvariant();

        // 1. Check High first (>100W, HIGH, ABOVE 100W)
        if (upper.Contains("HIGH") || upper.Contains(">100") || upper.Contains("> 100") || upper.Contains("ABOVE 100"))
            return PowerTier.High;

        // 2. Check Medium (25W-100W, 25W UP TO 100W, MEDIUM, ABOVE 25W)
        if (upper.Contains("MEDIUM") || upper.Contains("25W-100W") || upper.Contains("25W - 100W") || upper.Contains("25W UP TO 100W") || upper.Contains("ABOVE 25W"))
            return PowerTier.Medium;

        // 3. Check Low (25W & BELOW, LOW, <=25W)
        if (upper.Contains("LOW") || upper.Contains("BELOW") || upper.Contains("<=25W") || upper.Contains("25W AND BELOW") || upper.Contains("25W & BELOW"))
            return PowerTier.Low;

        return PowerTier.High;
    }

    private static void ApplySurcharge(List<CalculatedFeeLineItemDto> lineItems, decimal baseAmount, DateTime? expirationDate, DateTime asOfDate)
    {
        if (!expirationDate.HasValue)
            return;

        var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(expirationDate.Value, asOfDate);
        if (multiplier > 0)
        {
            var surcharge = baseAmount * multiplier;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Surcharge (Late Renewal Penalty)",
                ItemCode: FeeConstants.Codes.Surcharge,
                Description: description,
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: surcharge,
                Amount: surcharge,
                IsSurcharge: true
            ));
        }
    }
    #endregion
}

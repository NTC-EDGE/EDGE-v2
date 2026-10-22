using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Permits:
/// - Amateur Service Permits (Purchase, Possess, Sell/Transfer, Foreign Visitor Class A/B/C, Vanity Call Sign, Special Event)
/// - Power-Rated Station Permits (Aeronautical, Maritime, Fixed/Land Mobile, VSAT, Private, Civic, Government, PTEs)
/// - Operational Permits (Demo & Propagate, Permit to Transport)
/// - Radio Communications Equipment Permits (Dealer, Manufacturer, Service Center)
/// - Mobile Phone Permits (Dealer Main/Branch, Retailer/Reseller, Service Center)
/// - Copy of Permits (Certified True Copy, Duplicate Copy)
/// </summary>
public class PermitFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    public ServiceCategoryType Category => ServiceCategoryType.Permit;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Permit;
        }

        return activity.SafeContainsAny("PERMIT", "PURCHASE", "POSSESS", "STORAGE", "TRANSPORT", "DEALER", "RETAILER", "MANUFACTURER")
            || applicationType.SafeContainsAny("Permit", "Purchase", "Possess", "Transport", "Dealer", "Manufacturer", "Retailer", "Vanity", "Special Event");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var units = Math.Max(1, request.NoOfUnits);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        string formulaApplied;

        // 1. Copy of Permits
        if (activity.SafeContains("COPY OF PERMITS") || appType.SafeContainsAny("Certified True Copy", "Duplicate Copy"))
        {
            formulaApplied = CalculateCopyOfPermits(appType, request.NoOfCopies, lineItems);
        }
        // 2. Mobile Phone Permits
        else if (activity.SafeContains("MOBILE PHONE") || appType.SafeContains("Mobile Phone"))
        {
            formulaApplied = CalculateMobilePhonePermits(appType, element, years, request.ExpirationDate, asOfDate, lineItems);
        }
        // 3. Radio Communications Equipment (Dealer / Manufacturer / Service Center / Transport)
        else if (activity.SafeContains("RADIO COMMUNICATIONS EQUIPMENT") || appType.SafeContainsAny("Dealer Permit", "Manufacturer Permit", "Service Center Permit", "Permit to Transport"))
        {
            formulaApplied = CalculateRadioEquipmentPermits(appType, element, units, years, request.ExpirationDate, asOfDate, lineItems);
        }
        // 4. Temporary Demo and Propagate
        else if (activity.SafeContains("DEMONSTRATE") || appType.SafeContains("Demonstrate and Propagate") || appType.SafeContains("Demo"))
        {
            formulaApplied = CalculateDemoPropagate(units, request.AdditionalServicesCount, lineItems);
        }
        // 5. Amateur Service Permits
        else if (activity.SafeContains("AMATEUR") || appType.SafeContains("Amateur"))
        {
            formulaApplied = CalculateAmateurPermits(appType, element, units, years, lineItems);
        }
        // 6. Power-Rated Station Permits (Aeronautical, Maritime, Fixed & Land Mobile, VSAT, Private, Government, Civic, PTEs)
        else
        {
            formulaApplied = CalculatePowerStationPermits(activity, appType, element, units, lineItems);
        }

        // Add mandatory Documentary Stamp Tax (DST)
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: "Documentary Stamp Tax (DST)",
            ItemCode: FeeConstants.Codes.Dst,
            Description: "Statutory Documentary Stamp Tax",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: DST_AMOUNT,
            Amount: DST_AMOUNT,
            IsTax: true
        ));

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
            Category: ServiceCategoryType.Permit
        );
    }

    #region 1. Copy of Permits

    private static string CalculateCopyOfPermits(string appType, int copies, List<CalculatedFeeLineItemDto> lineItems)
    {
        if (appType.SafeContains("Duplicate"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Duplicate Copy Fee",
                ItemCode: FeeConstants.Codes.Duplicate,
                Description: "Duplicate Permit Re-issuance Fee",
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: FeeConstants.Amounts.DuplicateCopyRate,
                Amount: FeeConstants.Amounts.DuplicateCopyRate
            ));
            return FeeConstants.Formulas.PermitDuplicateCopy;
        }

        // Certified True Copy: FC = 24, SC = 6
        var totalCopies = Math.Max(1, copies);
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: "First Copy Fee",
            ItemCode: FeeConstants.Codes.FirstCopy,
            Description: "Permit Certified True Copy - First Copy",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage,
            Amount: FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage
        ));

        if (totalCopies > 1)
        {
            var succeeding = totalCopies - 1;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Succeeding Copies Fee",
                ItemCode: FeeConstants.Codes.SucceedingCopies,
                Description: $"Permit Certified True Copy - {succeeding} succeeding page(s)/copy",
                ValidityYears: 1,
                NoOfUnits: succeeding,
                FeeRate: FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage,
                Amount: FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage * succeeding
            ));
        }

        return FeeConstants.Formulas.PermitCertifiedTrueCopy;
    }

    #endregion

    #region 2. Mobile Phone Permits

    private static string CalculateMobilePhonePermits(
        string appType,
        string element,
        int years,
        DateTime? expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");
        var isBranch = element.SafeContains("BRANCH") || appType.SafeContains("BRANCH");

        // Service Center Permit
        if (appType.SafeContains("Service Center"))
        {
            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Mobile Phone Service Center Modification", 1, 1, FeeConstants.Amounts.PermitModificationFee, FeeConstants.Amounts.PermitModificationFee));
                return FeeConstants.Formulas.PermitMobilePhoneServiceCenterModification;
            }

            decimal pf = FeeConstants.Amounts.MobilePhoneServiceCenterPermitRate;
            decimal iF = FeeConstants.Amounts.MobilePhoneServiceCenterInspectionRate;

            if (!isRenewal)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative Filing Fee", 1, 1, FeeConstants.Amounts.MobilePhoneServiceCenterFilingFee, FeeConstants.Amounts.MobilePhoneServiceCenterFilingFee));
            }

            lineItems.Add(new CalculatedFeeLineItemDto("Permit Fee", FeeConstants.Codes.PermitFee, "Mobile Phone Service Center Permit Fee", years, 1, pf, pf * years));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Mobile Phone Service Center Inspection Fee", years, 1, iF, iF * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(pf, expirationDate.Value, asOfDate, lineItems);
                return FeeConstants.Formulas.PermitMobilePhoneServiceCenterRenewal;
            }
            return FeeConstants.Formulas.PermitMobilePhoneServiceCenterNew;
        }

        // Retailer / Reseller Permit
        if (appType.SafeContainsAny("Retailer", "Reseller"))
        {
            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Mobile Phone Retailer/Reseller Modification", 1, 1, FeeConstants.Amounts.PermitModificationFee, FeeConstants.Amounts.PermitModificationFee));
                return FeeConstants.Formulas.PermitMobilePhoneRetailerModification;
            }

            decimal pf = FeeConstants.Amounts.MobilePhoneRetailerPermitRate;
            decimal iF = FeeConstants.Amounts.MobilePhoneRetailerInspectionRate;

            if (!isRenewal)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative Filing Fee", 1, 1, FeeConstants.Amounts.MobilePhoneFilingFee, FeeConstants.Amounts.MobilePhoneFilingFee));
            }

            lineItems.Add(new CalculatedFeeLineItemDto("Permit Fee", FeeConstants.Codes.PermitFee, "Mobile Phone Retailer/Reseller Permit Fee", years, 1, pf, pf * years));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Mobile Phone Retailer/Reseller Inspection Fee", years, 1, iF, iF * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(pf, expirationDate.Value, asOfDate, lineItems);
                return FeeConstants.Formulas.PermitMobilePhoneRetailerRenewal;
            }
            return FeeConstants.Formulas.PermitMobilePhoneRetailerNew;
        }

        // Dealer Permit (Main / Branch)
        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Mobile Phone Dealer Modification", 1, 1, FeeConstants.Amounts.PermitModificationFee, FeeConstants.Amounts.PermitModificationFee));
            return FeeConstants.Formulas.PermitMobilePhoneDealerModification;
        }

        decimal dealerPf = isBranch ? FeeConstants.Amounts.MobilePhoneDealerBranchPermitRate : FeeConstants.Amounts.MobilePhoneDealerMainPermitRate;
        decimal dealerIf = FeeConstants.Amounts.MobilePhoneDealerInspectionRate;
        var dealerDesc = isBranch ? "Mobile Phone Dealer (Branch) Permit Fee" : "Mobile Phone Dealer (Main) Permit Fee";

        if (!isRenewal)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative Filing Fee", 1, 1, FeeConstants.Amounts.MobilePhoneFilingFee, FeeConstants.Amounts.MobilePhoneFilingFee));
        }

        lineItems.Add(new CalculatedFeeLineItemDto("Permit Fee", FeeConstants.Codes.PermitFee, dealerDesc, years, 1, dealerPf, dealerPf * years));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Mobile Phone Dealer Inspection Fee", years, 1, dealerIf, dealerIf * years));

        if (isRenewal && expirationDate.HasValue)
        {
            ApplySurcharge(dealerPf, expirationDate.Value, asOfDate, lineItems);
            return FeeConstants.Formulas.PermitMobilePhoneDealerRenewal;
        }
        return FeeConstants.Formulas.PermitMobilePhoneDealerNew;
    }

    #endregion

    #region 3. Radio Communications Equipment Permits

    private static string CalculateRadioEquipmentPermits(
        string appType,
        string element,
        int units,
        int years,
        DateTime? expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        // Permit to Transport (PTR = 85 * units)
        if (appType.SafeContains("Transport"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Permit to Transport Fee",
                ItemCode: FeeConstants.Codes.PermitToTransport,
                Description: $"Radio Communications Equipment Permit to Transport ({units} unit(s))",
                ValidityYears: 1,
                NoOfUnits: units,
                FeeRate: FeeConstants.Amounts.PermitToTransportRate,
                Amount: FeeConstants.Amounts.PermitToTransportRate * units
            ));
            return FeeConstants.Formulas.PermitTransport;
        }

        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Radio Equipment Permit Modification", 1, 1, FeeConstants.Amounts.PermitModificationFee, FeeConstants.Amounts.PermitModificationFee));
            return FeeConstants.Formulas.PermitDealerModification;
        }

        decimal pf;
        decimal iF;
        string desc;

        if (appType.SafeContains("Manufacturer"))
        {
            pf = FeeConstants.Amounts.RadioEquipmentManufacturerPermitRate;
            iF = FeeConstants.Amounts.RadioEquipmentManufacturerInspectionRate;
            desc = "Radio Communication Equipment Manufacturer";
        }
        else if (appType.SafeContains("Service Center"))
        {
            pf = FeeConstants.Amounts.RadioEquipmentServiceCenterPermitRate;
            iF = FeeConstants.Amounts.RadioEquipmentServiceCenterInspectionRate;
            desc = "Radio Communication Equipment Service Center";
        }
        else
        {
            // Default: Dealer Permit
            pf = FeeConstants.Amounts.RadioEquipmentDealerPermitRate;
            iF = FeeConstants.Amounts.RadioEquipmentDealerInspectionRate;
            desc = "Radio Communication Equipment Dealer";
        }

        if (!isRenewal)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative Filing Fee", 1, 1, FeeConstants.Amounts.RadioEquipmentFilingFee, FeeConstants.Amounts.RadioEquipmentFilingFee));
        }

        lineItems.Add(new CalculatedFeeLineItemDto("Permit Fee", FeeConstants.Codes.PermitFee, $"{desc} Permit Fee", years, 1, pf, pf * years));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, $"{desc} Inspection Fee", years, 1, iF, iF * years));

        if (isRenewal && expirationDate.HasValue)
        {
            ApplySurcharge(pf, expirationDate.Value, asOfDate, lineItems);
            return FeeConstants.Formulas.PermitDealerRenewal;
        }

        return FeeConstants.Formulas.PermitDealerNew;
    }

    #endregion

    #region 4. Operational Permits (Demo and Propagate)

    private static string CalculateDemoPropagate(int units, int additionalServicesCount, List<CalculatedFeeLineItemDto> lineItems)
    {
        var channels = additionalServicesCount > 0 ? additionalServicesCount : units;

        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Demo Application Filing Fee", 1, units, FeeConstants.Amounts.PowerStationFilingFee, FeeConstants.Amounts.PowerStationFilingFee * units));
        lineItems.Add(new CalculatedFeeLineItemDto("Demo/Propagate Fee", FeeConstants.Codes.Demo, $"Temporary Demo and Propagate Fee ({channels} channel(s))", 1, channels, FeeConstants.Amounts.PermitDemoFee, FeeConstants.Amounts.PermitDemoFee * channels));

        return FeeConstants.Formulas.PermitDemoPropagate;
    }

    #endregion

    #region 5. Amateur Service Permits

    private static string CalculateAmateurPermits(
        string appType,
        string element,
        int units,
        int years,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        // Foreign Visitor Temporary Permit
        if (appType.SafeContains("Foreign Visitor") || appType.SafeContains("Temporary Permit to Operate"))
        {
            var (lfRate, className) = ResolveAmateurVisitorLicenseRate(element);
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Foreign Visitor Amateur Filing Fee", 1, 1, FeeConstants.Amounts.AmateurForeignVisitorFilingFee, FeeConstants.Amounts.AmateurForeignVisitorFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", FeeConstants.Codes.Roc, "Foreign Visitor Certificate Fee", 1, 1, FeeConstants.Amounts.AmateurForeignVisitorRocRate, FeeConstants.Amounts.AmateurForeignVisitorRocRate));
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({className})", FeeConstants.Codes.LicenseFee, $"Foreign Visitor Amateur License Fee ({className})", 1, 1, lfRate, lfRate));

            return FeeConstants.Formulas.PermitAmateurForeignVisitor;
        }

        // Vanity Call Sign
        if (appType.SafeContains("Vanity Call Sign") || appType.SafeContains("Vanity"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Special Permit Fee", FeeConstants.Codes.SpecialPermit, "Vanity Call Sign Special Permit Fee", years, 1, FeeConstants.Amounts.AmateurVanityCallSignRate, FeeConstants.Amounts.AmateurVanityCallSignRate * years));
            return FeeConstants.Formulas.PermitAmateurVanity;
        }

        // Special Event Call Sign
        if (appType.SafeContains("Special Event"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Special Permit Fee", FeeConstants.Codes.SpecialPermit, "Special Event Call Sign Special Permit Fee", 1, 1, FeeConstants.Amounts.AmateurSpecialEventCallSignRate, FeeConstants.Amounts.AmateurSpecialEventCallSignRate));
            return FeeConstants.Formulas.PermitAmateurSpecialEvent;
        }

        // Combined Purchase and Possess
        if (appType.SafeContains("Purchase/Possess") || appType.SafeContains("Purchase / Possess") || appType.SafeContains("Purchase and Possess"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Purchase Permit Fee", FeeConstants.Codes.Purchase, "Amateur Station Permit to Purchase", 1, units, FeeConstants.Amounts.AmateurPermitUnitRate, FeeConstants.Amounts.AmateurPermitUnitRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Possess Permit Fee", FeeConstants.Codes.Possess, "Amateur Station Permit to Possess", 1, units, FeeConstants.Amounts.AmateurPermitUnitRate, FeeConstants.Amounts.AmateurPermitUnitRate * units));
            return FeeConstants.Formulas.PermitAmateurPurchasePossess;
        }

        // Permit to Sell / Transfer
        if (appType.SafeContainsAny("Sell", "Transfer"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Sell/Transfer Fee", FeeConstants.Codes.SellTransfer, "Amateur Station Permit to Sell/Transfer", 1, units, FeeConstants.Amounts.AmateurPermitUnitRate, FeeConstants.Amounts.AmateurPermitUnitRate * units));
            return FeeConstants.Formulas.PermitAmateurSellTransfer;
        }

        // Permit to Possess / Storage
        if (appType.SafeContains("Possess") || appType.SafeContains("Storage"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Possess Fee", FeeConstants.Codes.Possess, "Amateur Station Permit to Possess/Storage", 1, units, FeeConstants.Amounts.AmateurPermitUnitRate, FeeConstants.Amounts.AmateurPermitUnitRate * units));
            return FeeConstants.Formulas.PermitAmateurPossess;
        }

        // Permit to Purchase (Default)
        lineItems.Add(new CalculatedFeeLineItemDto("Purchase Permit Fee", FeeConstants.Codes.Purchase, "Amateur Station Permit to Purchase", 1, units, FeeConstants.Amounts.AmateurPermitUnitRate, FeeConstants.Amounts.AmateurPermitUnitRate * units));
        return FeeConstants.Formulas.PermitAmateurPurchase;
    }

    private static (decimal Rate, string ClassName) ResolveAmateurVisitorLicenseRate(string element)
    {
        var e = element.SafeTrim().ToUpperInvariant();
        if (e.SafeContains("CLASS B")) return (FeeConstants.Amounts.AmateurForeignVisitorClassBLicense, "Class B");
        if (e.SafeContains("CLASS C")) return (FeeConstants.Amounts.AmateurForeignVisitorClassCLicense, "Class C");

        return (FeeConstants.Amounts.AmateurForeignVisitorClassALicense, "Class A");
    }

    #endregion

    #region 6. Power-Rated Station Permits

    private static string CalculatePowerStationPermits(
        string activity,
        string appType,
        string element,
        int units,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        var (purRate, posRate, stfRate, powerTierDesc) = ResolvePowerRates(element, appType);

        // Combined Purchase & Possess
        if (appType.SafeContains("Purchase/Possess") || appType.SafeContains("Purchase / Possess") || appType.SafeContains("Purchase and Possess") || appType.SafeContains("Purchase /Possess"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Station Application Filing Fee", 1, units, FeeConstants.Amounts.PowerStationFilingFee, FeeConstants.Amounts.PowerStationFilingFee * units));
            lineItems.Add(new CalculatedFeeLineItemDto($"Purchase Fee ({powerTierDesc})", FeeConstants.Codes.Purchase, $"Permit to Purchase ({powerTierDesc})", 1, units, purRate, purRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto($"Possess Fee ({powerTierDesc})", FeeConstants.Codes.Possess, $"Permit to Possess ({powerTierDesc})", 1, units, posRate, posRate * units));
            return FeeConstants.Formulas.PermitStationPurchasePossess;
        }

        // Sell / Transfer
        if (appType.SafeContainsAny("Sell", "Transfer"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto($"Sell/Transfer Fee ({powerTierDesc})", FeeConstants.Codes.SellTransfer, $"Permit to Sell/Transfer ({powerTierDesc})", 1, units, stfRate, stfRate * units));
            return FeeConstants.Formulas.PermitStationSellTransfer;
        }

        // Possess / Storage
        if (appType.SafeContains("Possess") || appType.SafeContains("Storage"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto($"Possess Fee ({powerTierDesc})", FeeConstants.Codes.Possess, $"Permit to Possess ({powerTierDesc})", 1, units, posRate, posRate * units));
            return FeeConstants.Formulas.PermitStationPossess;
        }

        // Permit to Purchase (Default)
        lineItems.Add(new CalculatedFeeLineItemDto($"Purchase Fee ({powerTierDesc})", FeeConstants.Codes.Purchase, $"Permit to Purchase ({powerTierDesc})", 1, units, purRate, purRate * units));
        return FeeConstants.Formulas.PermitStationPurchase;
    }

    private static (decimal PurRate, decimal PosRate, decimal StfRate, string PowerTierDesc) ResolvePowerRates(string element, string appType)
    {
        var e = $"{element} {appType}".ToUpperInvariant();

        if (e.SafeContains("HIGH") || e.SafeContains("ABOVE 100W") || e.SafeContains("> 100W") || e.SafeContains(">100W"))
        {
            return (
                FeeConstants.Amounts.PowerHighPurchaseRate,
                FeeConstants.Amounts.PowerHighPossessRate,
                FeeConstants.Amounts.PowerHighSellTransferRate,
                "High Powered >100W"
            );
        }

        if (e.SafeContains("MEDIUM") || e.SafeContains("UP TO 100W") || e.SafeContains("25W-100W") || e.SafeContains("25W - 100W") || e.SafeContains("25 TO 100"))
        {
            return (
                FeeConstants.Amounts.PowerMediumPurchaseRate,
                FeeConstants.Amounts.PowerMediumPossessRate,
                FeeConstants.Amounts.PowerMediumSellTransferRate,
                "Medium Powered >25W-100W"
            );
        }

        if (e.SafeContains("LOW") || e.SafeContains("25W AND BELOW") || e.SafeContains("25W BELOW") || e.SafeContains("<= 25W") || e.SafeContains("≤ 25W") || e.SafeContains("25W & BELOW"))
        {
            return (
                FeeConstants.Amounts.PowerLowPurchaseRate,
                FeeConstants.Amounts.PowerLowPossessRate,
                FeeConstants.Amounts.PowerLowSellTransferRate,
                "Low Powered ≤25W"
            );
        }

        // Default: High Powered (>100W)
        return (
            FeeConstants.Amounts.PowerHighPurchaseRate,
            FeeConstants.Amounts.PowerHighPossessRate,
            FeeConstants.Amounts.PowerHighSellTransferRate,
            "High Powered >100W"
        );
    }


    #endregion

    private static void ApplySurcharge(
        decimal basePermitFee,
        DateTime expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(expirationDate, asOfDate);
        if (multiplier > 0)
        {
            var surchargeAmount = basePermitFee * multiplier;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Surcharge (Late Renewal Penalty)",
                ItemCode: FeeConstants.Codes.Surcharge,
                Description: description,
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: surchargeAmount,
                Amount: surchargeAmount,
                IsSurcharge: true
            ));
        }
    }
}

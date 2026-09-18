using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class MaritimeLicenseSubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return activity.SafeContains("MARITIME") ||
               applicationType.SafeContains("Ship Station") ||
               applicationType.SafeContains("Ship Earth") ||
               applicationType.SafeContains("Coastal");
    }

    public string Calculate(
        List<CalculatedFeeLineItemDto> lineItems,
        FeeCalculationRequest request,
        int years,
        int units,
        int copies,
        int channels,
        DateTime asOfDate)
    {
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");
        var isInternational = appType.SafeContains("International");
        var isPrivateCoastal = appType.SafeContains("Private Coastal");
        var isPublicCoastal = appType.SafeContains("Public Coastal");

        var powerTier = LicenseCalculationHelper.ResolvePowerTier(element);

        // International Trade (Ship Station & Ship Earth Station)
        if (isInternational)
        {
            if (isModification)
            {
                decimal purRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.PowerHighPurchaseRate :
                                  powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.PowerMediumPurchaseRate :
                                  FeeConstants.Amounts.PowerLowPurchaseRate;
                decimal posRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.PowerHighPossessRate :
                                  powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.PowerMediumPossessRate :
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
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
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
                cpfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.MarPrivCoastHighCpf :
                          powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.MarPrivCoastMedCpf :
                          FeeConstants.Amounts.MarPrivCoastLowCpf;

                lfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.MarPrivCoastHighLf :
                         powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.MarPrivCoastMedLf :
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
                LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
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
                    lfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.MarPubCoastHfHighLf :
                             powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.MarPubCoastHfMedLf :
                             FeeConstants.Amounts.MarPubCoastHfLowLf;
                    ifRate = FeeConstants.Amounts.MarPubCoastHfIf;
                }
            }
            else
            {
                cpfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.MarPubCoastHighCpf :
                          powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.MarPubCoastMedCpf :
                          FeeConstants.Amounts.MarPubCoastLowCpf;

                lfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.MarPubCoastHighLf :
                         powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.MarPubCoastMedLf :
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
                LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseMaritimePublicCoastalRenewal;
            }

            // New Public Coastal
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Public Coastal Station Construction Permit Fee", 1, units, cpfRate, cpfRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Public Coastal Station Annual License Fee", years, units, lfRate, lfRate * years * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Public Coastal Station Annual Inspection Fee", years, units, ifRate, ifRate * years * units));
            return FeeConstants.Formulas.LicenseMaritimePublicCoastalNew;
        }

        // Ship Station License Domestic Trade
        decimal domCpfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.MaritimeDomHighCpf :
                             powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.MaritimeDomMedCpf :
                             FeeConstants.Amounts.MaritimeDomLowCpf;

        decimal domLfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.MaritimeDomHighLf :
                            powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.MaritimeDomMedLf :
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
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseMaritimeDomesticRenewal;
        }

        // Domestic New: Check if with originally-installed equipment
        var withOriginalEquip = appType.SafeContains("With Originally") || appType.SafeContains("Originally0");
        if (withOriginalEquip)
        {
            decimal purRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.PowerHighPurchaseRate :
                              powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.PowerMediumPurchaseRate :
                              FeeConstants.Amounts.PowerLowPurchaseRate;
            decimal posRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.PowerHighPossessRate :
                              powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.PowerMediumPossessRate :
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
}

using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class AeronauticalLicenseSubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return activity.SafeContains("AERONAUTICAL") ||
               applicationType.SafeContains("Aeronautical") ||
               applicationType.SafeContains("Aircraft");
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
        var isAircraft = appType.SafeContains("Aircraft");

        var powerTier = LicenseCalculationHelper.ResolvePowerTier(element);

        if (isAircraft)
        {
            decimal cpfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.AeroAircraftHighCpf :
                              powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.AeroAircraftMedCpf :
                              FeeConstants.Amounts.AeroAircraftLowCpf;

            decimal lfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.AeroAircraftHighLf :
                             powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.AeroAircraftMedLf :
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
                LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
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
        decimal fixedModCpfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.AeroFixedHighModCpf :
                                  powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.AeroFixedMedModCpf :
                                  FeeConstants.Amounts.AeroFixedLowModCpf;

        decimal fixedLfRate = powerTier == LicensePowerTier.High ? FeeConstants.Amounts.AeroFixedHighLf :
                              powerTier == LicensePowerTier.Medium ? FeeConstants.Amounts.AeroFixedMedLf :
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
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseAeroFixedRenewal;
        }

        // New Fixed Aeronautical
        lineItems.Add(new CalculatedFeeLineItemDto($"Construction Permit Fee ({powerTier})", FeeConstants.Codes.ConstructionPermit, "Fixed Aeronautical Construction Permit Fee", 1, units, fixedCpfRate, fixedCpfRate * units));
        lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({powerTier})", FeeConstants.Codes.LicenseFee, $"Fixed Aeronautical Station Annual License Fee ({powerTier})", years, units, fixedLfRate, fixedLfRate * years * units));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Fixed Aeronautical Station Annual Inspection Fee", years, units, FeeConstants.Amounts.AeroInspectionFee, FeeConstants.Amounts.AeroInspectionFee * years * units));
        return FeeConstants.Formulas.LicenseAeroFixedNew;
    }
}

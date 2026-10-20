using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Accreditations (Service Centers, Training Providers, Testing Centers).
/// </summary>
public class AccreditationFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    public ServiceCategoryType Category => ServiceCategoryType.Accreditation;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Accreditation;
        }

        return activity.SafeContains("ACCREDITATION") || applicationType.SafeContains("Accreditation");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MOD");
        var isCpe = activity.SafeContains("CPE") || activity.SafeContains("PREMISES") || activity.SafeContains("CUSTOMER") || element.SafeContains("MOBILE") || appType.SafeContains("MOBILE");

        string formulaApplied;

        if (isCpe)
        {
            var isNonMobile = activity.SafeContains("NON-MOBILE") || element.SafeContains("NON-MOBILE") || appType.SafeContains("NON-MOBILE");
            decimal pfRate = isNonMobile ? FeeConstants.Amounts.CpeNonMobilePermitRate : FeeConstants.Amounts.CpeMobilePermitRate;
            decimal ifRate = isNonMobile ? FeeConstants.Amounts.CpeNonMobileInspectionRate : FeeConstants.Amounts.CpeMobileInspectionRate;

            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "CPE Supplier Accreditation Modification Fee", 1, 1, FeeConstants.Amounts.CpeModificationFee, FeeConstants.Amounts.CpeModificationFee));
                formulaApplied = FeeConstants.Formulas.CpeAccreditationModification;
            }
            else if (isRenewal)
            {
                // Permit/Accreditation Fee (PF)
                lineItems.Add(new CalculatedFeeLineItemDto("Permit/Accreditation Fee", FeeConstants.Codes.PermitFee, "CPE Supplier Accreditation Assessment Fee", years, 1, pfRate, pfRate * years));

                // Inspection Fee (IF)
                lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "CPE Supplier Inspection Fee", years, 1, ifRate, ifRate * years));

                if (request.ExpirationDate.HasValue)
                {
                    var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(request.ExpirationDate.Value, asOfDate);
                    if (multiplier > 0)
                    {
                        var surcharge = (pfRate * years) * multiplier;
                        lineItems.Add(new CalculatedFeeLineItemDto("Surcharge (Late Renewal Penalty)", FeeConstants.Codes.Surcharge, description, 1, 1, surcharge, surcharge, IsSurcharge: true));
                    }
                }
                formulaApplied = FeeConstants.Formulas.CpeAccreditationRenewal;
            }
            else
            {
                // Filing Fee (FF)
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "CPE Supplier Accreditation Filing Fee", 1, 1, FeeConstants.Amounts.CpeFilingFee, FeeConstants.Amounts.CpeFilingFee));

                // Permit/Accreditation Fee (PF)
                lineItems.Add(new CalculatedFeeLineItemDto("Permit/Accreditation Fee", FeeConstants.Codes.PermitFee, "CPE Supplier Accreditation Assessment Fee", years, 1, pfRate, pfRate * years));

                // Inspection Fee (IF)
                lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "CPE Supplier Inspection Fee", years, 1, ifRate, ifRate * years));

                formulaApplied = FeeConstants.Formulas.CpeAccreditationNew;
            }
        }
        else
        {
            // Generic Service Center / Training Provider Accreditation
            decimal baseRate = FeeConstants.Amounts.DefaultAccreditationRate;

            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Accreditation Modification Fee", 1, 1, FeeConstants.Amounts.CertificateModification, FeeConstants.Amounts.CertificateModification));
                formulaApplied = FeeConstants.Formulas.AccreditationModification;
            }
            else if (isRenewal)
            {
                lineItems.Add(new CalculatedFeeLineItemDto(
                    Particular: string.IsNullOrWhiteSpace(element) ? "Accreditation Fee" : $"Accreditation Fee ({element})",
                    ItemCode: FeeConstants.Codes.Accreditation,
                    Description: "Annual Accreditation Assessment Fee",
                    ValidityYears: years,
                    NoOfUnits: 1,
                    FeeRate: baseRate,
                    Amount: baseRate * years
                ));

                if (request.ExpirationDate.HasValue)
                {
                    var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(request.ExpirationDate.Value, asOfDate);
                    if (multiplier > 0)
                    {
                        var surcharge = (baseRate * years) * multiplier;
                        lineItems.Add(new CalculatedFeeLineItemDto("Surcharge (Late Renewal Penalty)", FeeConstants.Codes.Surcharge, description, 1, 1, surcharge, surcharge, IsSurcharge: true));
                    }
                }
                formulaApplied = FeeConstants.Formulas.AccreditationRenewal;
            }
            else
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Accreditation Filing Fee", 1, 1, FeeConstants.Amounts.AccreditationFilingFee, FeeConstants.Amounts.AccreditationFilingFee));

                lineItems.Add(new CalculatedFeeLineItemDto(
                    Particular: string.IsNullOrWhiteSpace(element) ? "Accreditation Fee" : $"Accreditation Fee ({element})",
                    ItemCode: FeeConstants.Codes.Accreditation,
                    Description: "Annual Accreditation Assessment Fee",
                    ValidityYears: years,
                    NoOfUnits: 1,
                    FeeRate: baseRate,
                    Amount: baseRate * years
                ));

                formulaApplied = FeeConstants.Formulas.AccreditationNew;
            }
        }

        // DST
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
            Category: ServiceCategoryType.Accreditation
        );
    }
}

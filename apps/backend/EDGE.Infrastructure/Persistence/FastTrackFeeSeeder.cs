using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Constants;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence.SeederData;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Persistence;

public static class FastTrackFeeSeeder
{
    public static async Task SeedFeesAndVariantFeesAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        // 1. Seed or update Master Fees
        var masterFees = new List<(string Code, string Name, string Description)>
        {
            (FeeConstants.Codes.Roc, "Radio Operator Certificate Fee", "Statutory base certificate annual fee"),
            (FeeConstants.Codes.Dst, "Documentary Stamp Tax", "Statutory documentary stamp tax (fixed ₱30.00)"),
            (FeeConstants.Codes.Modification, "Modification Fee", "Certificate modification and amendment fee"),
            (FeeConstants.Codes.FilingFee, "Filing Fee", "Application administrative filing fee"),
            (FeeConstants.Codes.ApplicationFee, "Application Fee", "Application evaluation and processing fee"),
            (FeeConstants.Codes.Seminar, "Seminar Fee", "Special Radio Operator Seminar Fee"),
            (FeeConstants.Codes.Registration, "Registration Fee", "Equipment and station registration fee"),
            (FeeConstants.Codes.AnnualRegistration1, "Annual Registration Fee 1", "VAS Annual Registration Fee for the first 5 services"),
            (FeeConstants.Codes.AnnualRegistration2, "Annual Registration Fee 2", "VAS Annual Registration Fee per additional service in excess of 5"),
            (FeeConstants.Codes.FirstCopy, "First Copy Fee", "Certified True Copy - First Copy authentication fee"),
            (FeeConstants.Codes.SucceedingCopies, "Succeeding Copies Fee", "Certified True Copy - Succeeding page/copy fee"),
            (FeeConstants.Codes.Duplicate, "Duplicate Copy Fee", "Duplicate copy re-issuance fee"),
            (FeeConstants.Codes.PossessPermit, "Possess Permit Fee", "Amateur Lifetime Possess Permit Fee"),
            (FeeConstants.Codes.License, "License Fee", "Radio Station / Dealer License Annual Fee"),
            (FeeConstants.Codes.Permit, "Permit Fee", "Permit to Purchase / Possess / Import Fee"),
            (FeeConstants.Codes.Exam, "Examination Fee", "Radio Operator Examination Admission Fee"),
            (FeeConstants.Codes.Accreditation, "Accreditation Fee", "Service Center / Testing Center Annual Accreditation Fee"),
            (FeeConstants.Codes.Request, "Request / Administrative Processing Fee", "Special request and administrative filing fee")
        };

        var existingFees = await context.Fees.IgnoreQueryFilters().ToListAsync();
        var feeMap = new Dictionary<string, Fee>(StringComparer.OrdinalIgnoreCase);

        foreach (var (code, name, desc) in masterFees)
        {
            var fee = existingFees.FirstOrDefault(f => f.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
            if (fee == null)
            {
                fee = new Fee
                {
                    Id = Guid.NewGuid(),
                    Code = code.ToUpper(),
                    Name = name,
                    Description = desc,
                    IsActive = true
                };
                context.Fees.Add(fee);
            }
            else
            {
                fee.Name = name;
                fee.Description = desc;
                fee.IsActive = true;
                if (fee.IsDeleted)
                {
                    fee.IsDeleted = false;
                    fee.IsDeletedBy = string.Empty;
                }
            }
            feeMap[code] = fee;
        }
        await context.SaveChangesAsync();

        // 2. Map ServiceVariantFees
        var variantFeesToSeed = new List<(Guid VariantId, string FeeCode, decimal Amount)>
        {
            // Commercial ROC Mod
            (CertificatesCategorySeederData.VarRocCommMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
            (CertificatesCategorySeederData.VarRocCommMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Aircraft ROC
            (CertificatesCategorySeederData.VarRocAirNew, FeeConstants.Codes.Roc, 100.00m),
            (CertificatesCategorySeederData.VarRocAirNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocAirRen, FeeConstants.Codes.Roc, 100.00m),
            (CertificatesCategorySeederData.VarRocAirRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocAirMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
            (CertificatesCategorySeederData.VarRocAirMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Foreign Pilot
            (CertificatesCategorySeederData.VarRocPilotNew, FeeConstants.Codes.Roc, FeeConstants.Amounts.ForeignPilotTemporary),
            (CertificatesCategorySeederData.VarRocPilotNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocPilotMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
            (CertificatesCategorySeederData.VarRocPilotMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Government ROC
            (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.FilingFee, 10.00m),
            (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.ApplicationFee, 20.00m),
            (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.FilingFee, 10.00m),
            (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.ApplicationFee, 20.00m),
            (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocGovMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
            (CertificatesCategorySeederData.VarRocGovMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Land Mobile ROC
            (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.FilingFee, 10.00m),
            (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.ApplicationFee, 20.00m),
            (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.Roc, 30.00m),
            (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.FilingFee, 10.00m),
            (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.ApplicationFee, 20.00m),
            (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.Roc, 30.00m),
            (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocLandMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
            (CertificatesCategorySeederData.VarRocLandMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Special Radio Operator
            (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.ApplicationFee, 20.00m),
            (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.Seminar, 20.00m),
            (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.ApplicationFee, 20.00m),
            (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.Seminar, 20.00m),
            (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRocSpecMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
            (CertificatesCategorySeederData.VarRocSpecMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Amateur Radio Operator
            (CertificatesCategorySeederData.VarAmaRocNew, FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarAmaRocNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarAmaRocRen, FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarAmaRocRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarAmaRocMod, FeeConstants.Codes.Modification, 60.00m),
            (CertificatesCategorySeederData.VarAmaRocMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Amateur Lifetime
            (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.FilingFee, 60.00m),
            (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.Modification, 50.00m),
            (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.PossessPermit, 50.00m),
            (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // RFID / SRD / WDN Devices
            (CertificatesCategorySeederData.VarRfidDealers, FeeConstants.Codes.ApplicationFee, 180.00m),
            (CertificatesCategorySeederData.VarRfidDealers, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarRfidNonDealers, FeeConstants.Codes.ApplicationFee, 180.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // TVRO Registration
            (CertificatesCategorySeederData.VarTvroComm, FeeConstants.Codes.Registration, FeeConstants.Amounts.TvroRegistrationRate),
            (CertificatesCategorySeederData.VarTvroComm, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarTvroNonComm, FeeConstants.Codes.Registration, FeeConstants.Amounts.TvroRegistrationRate),
            (CertificatesCategorySeederData.VarTvroNonComm, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // VAS Provider
            (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.FilingFee, 300.00m),
            (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.AnnualRegistration1, FeeConstants.Amounts.VasAnnualBaseRate),
            (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.AnnualRegistration2, FeeConstants.Amounts.VasAnnualExcessRate),
            (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

            // Copy of Certificates
            (CertificatesCategorySeederData.VarCertTrueCopy, FeeConstants.Codes.FirstCopy, FeeConstants.Amounts.CertifiedTrueCopyFirstPage),
            (CertificatesCategorySeederData.VarCertTrueCopy, FeeConstants.Codes.SucceedingCopies, FeeConstants.Amounts.CertifiedTrueCopySucceedingPage),
            (CertificatesCategorySeederData.VarCertTrueCopy, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
            (CertificatesCategorySeederData.VarCertDuplicate, FeeConstants.Codes.Duplicate, FeeConstants.Amounts.DuplicateCopyRate),
            (CertificatesCategorySeederData.VarCertDuplicate, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax)
        };

        var allVariantsInDb = (await context.ServiceVariants.IgnoreQueryFilters().Select(v => v.Id).ToListAsync()).ToHashSet();
        var existingVariantFees = await context.ServiceVariantFees.IgnoreQueryFilters().ToListAsync();

        foreach (var (variantId, feeCode, amount) in variantFeesToSeed)
        {
            if (!allVariantsInDb.Contains(variantId) || !feeMap.TryGetValue(feeCode, out var fee))
                continue;

            var existingRecord = existingVariantFees.FirstOrDefault(vf => vf.ServiceVariantId == variantId && vf.FeeId == fee.Id);
            if (existingRecord == null)
            {
                context.ServiceVariantFees.Add(new ServiceVariantFee
                {
                    Id = Guid.NewGuid(),
                    ServiceVariantId = variantId,
                    FeeId = fee.Id,
                    Amount = amount
                });
            }
            else
            {
                existingRecord.Amount = amount;
                if (existingRecord.IsDeleted)
                {
                    existingRecord.IsDeleted = false;
                    existingRecord.IsDeletedBy = string.Empty;
                }
            }
        }
        await context.SaveChangesAsync();

        // 3. Map ServiceVariantElementFees (ROC Commercial Elements & RFID Elements)
        var allDbElements = await context.Elements.IgnoreQueryFilters().ToListAsync();
        var existingElementFees = await context.ServiceVariantElementFees.IgnoreQueryFilters().ToListAsync();

        var elementFeesToSeed = new List<(Guid VariantId, string ElementCode, string FeeCode, decimal Amount)>
        {
            // Commercial ROC New
            (CertificatesCategorySeederData.VarRocCommNew, "1RTG", FeeConstants.Codes.Roc, 180.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "2RTG", FeeConstants.Codes.Roc, 120.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "3RTG", FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "1PHN", FeeConstants.Codes.Roc, 120.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "2PHN", FeeConstants.Codes.Roc, 100.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "3PHN", FeeConstants.Codes.Roc, 60.00m),

            // Commercial ROC Renewal
            (CertificatesCategorySeederData.VarRocCommRen, "1RTG", FeeConstants.Codes.Roc, 180.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "2RTG", FeeConstants.Codes.Roc, 120.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "3RTG", FeeConstants.Codes.Roc, 60.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "1PHN", FeeConstants.Codes.Roc, 120.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "2PHN", FeeConstants.Codes.Roc, 100.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "3PHN", FeeConstants.Codes.Roc, 60.00m),

            // RFID Devices
            (CertificatesCategorySeederData.VarRfidDealers, "RFID HIGH POWER", FeeConstants.Codes.Registration, 300.00m),
            (CertificatesCategorySeederData.VarRfidDealers, "RFID LOW POWER", FeeConstants.Codes.Registration, 100.00m),
            (CertificatesCategorySeederData.VarRfidDealers, "SRD/WDN", FeeConstants.Codes.Registration, 50.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "RFID HIGH POWER", FeeConstants.Codes.Registration, 300.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "RFID LOW POWER", FeeConstants.Codes.Registration, 100.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "SRD/WDN", FeeConstants.Codes.Registration, 50.00m)
        };

        foreach (var (variantId, elementCode, feeCode, amount) in elementFeesToSeed)
        {
            if (!allVariantsInDb.Contains(variantId) || !feeMap.TryGetValue(feeCode, out var fee))
                continue;

            var el = allDbElements.FirstOrDefault(e => e.Code.Equals(elementCode, StringComparison.OrdinalIgnoreCase) || e.Name.Equals(elementCode, StringComparison.OrdinalIgnoreCase));
            if (el == null)
            {
                el = new Element { Id = Guid.NewGuid(), Code = elementCode.ToUpper(), Name = elementCode, Description = elementCode };
                context.Elements.Add(el);
                allDbElements.Add(el);
            }

            var existingVef = existingElementFees.FirstOrDefault(vef => vef.ServiceVariantId == variantId && vef.ElementId == el.Id && vef.FeeId == fee.Id);
            if (existingVef == null)
            {
                context.ServiceVariantElementFees.Add(new ServiceVariantElementFee
                {
                    Id = Guid.NewGuid(),
                    ServiceVariantId = variantId,
                    ElementId = el.Id,
                    FeeId = fee.Id,
                    Amount = amount
                });
            }
            else
            {
                existingVef.Amount = amount;
                if (existingVef.IsDeleted)
                {
                    existingVef.IsDeleted = false;
                    existingVef.IsDeletedBy = string.Empty;
                }
            }
        }

        await context.SaveChangesAsync();
    }
}

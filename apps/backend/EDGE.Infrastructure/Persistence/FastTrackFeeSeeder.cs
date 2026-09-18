using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
            ("ROC", "Radio Operator Certificate Fee", "Statutory base certificate annual fee"),
            ("DST", "Documentary Stamp Tax", "Statutory documentary stamp tax (fixed ₱30.00)"),
            ("MOD", "Modification Fee", "Certificate modification and amendment fee"),
            ("FF", "Filing Fee", "Application administrative filing fee"),
            ("AF", "Application Fee", "Application evaluation and processing fee"),
            ("SEM", "Seminar Fee", "Special Radio Operator Seminar Fee"),
            ("REG", "Registration Fee", "Equipment and station registration fee"),
            ("ARF1", "Annual Registration Fee 1", "VAS Annual Registration Fee for the first 5 services"),
            ("ARF2", "Annual Registration Fee 2", "VAS Annual Registration Fee per additional service in excess of 5"),
            ("FC", "First Copy Fee", "Certified True Copy - First Copy authentication fee"),
            ("SC", "Succeeding Copies Fee", "Certified True Copy - Succeeding page/copy fee"),
            ("DUP", "Duplicate Copy Fee", "Duplicate copy re-issuance fee"),
            ("POSS_PERMIT", "Possess Permit Fee", "Amateur Lifetime Possess Permit Fee"),
            ("LIC", "License Fee", "Radio Station / Dealer License Annual Fee"),
            ("PERMIT", "Permit Fee", "Permit to Purchase / Possess / Import Fee"),
            ("EXAM", "Examination Fee", "Radio Operator Examination Admission Fee"),
            ("ACCRED", "Accreditation Fee", "Service Center / Testing Center Annual Accreditation Fee")
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
            (CertificatesCategorySeederData.VarRocCommMod, "MOD", 120.00m),
            (CertificatesCategorySeederData.VarRocCommMod, "DST", 30.00m),

            // Aircraft ROC
            (CertificatesCategorySeederData.VarRocAirNew, "ROC", 100.00m),
            (CertificatesCategorySeederData.VarRocAirNew, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocAirRen, "ROC", 100.00m),
            (CertificatesCategorySeederData.VarRocAirRen, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocAirMod, "MOD", 120.00m),
            (CertificatesCategorySeederData.VarRocAirMod, "DST", 30.00m),

            // Foreign Pilot
            (CertificatesCategorySeederData.VarRocPilotNew, "ROC", 100.00m),
            (CertificatesCategorySeederData.VarRocPilotNew, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocPilotMod, "MOD", 120.00m),
            (CertificatesCategorySeederData.VarRocPilotMod, "DST", 30.00m),

            // Government ROC
            (CertificatesCategorySeederData.VarRocGovNew, "FF", 10.00m),
            (CertificatesCategorySeederData.VarRocGovNew, "AF", 20.00m),
            (CertificatesCategorySeederData.VarRocGovNew, "ROC", 60.00m),
            (CertificatesCategorySeederData.VarRocGovNew, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocGovRen, "FF", 10.00m),
            (CertificatesCategorySeederData.VarRocGovRen, "AF", 20.00m),
            (CertificatesCategorySeederData.VarRocGovRen, "ROC", 60.00m),
            (CertificatesCategorySeederData.VarRocGovRen, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocGovMod, "MOD", 120.00m),
            (CertificatesCategorySeederData.VarRocGovMod, "DST", 30.00m),

            // Land Mobile ROC
            (CertificatesCategorySeederData.VarRocLandNew, "FF", 10.00m),
            (CertificatesCategorySeederData.VarRocLandNew, "AF", 20.00m),
            (CertificatesCategorySeederData.VarRocLandNew, "ROC", 30.00m),
            (CertificatesCategorySeederData.VarRocLandNew, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocLandRen, "FF", 10.00m),
            (CertificatesCategorySeederData.VarRocLandRen, "AF", 20.00m),
            (CertificatesCategorySeederData.VarRocLandRen, "ROC", 30.00m),
            (CertificatesCategorySeederData.VarRocLandRen, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocLandMod, "MOD", 120.00m),
            (CertificatesCategorySeederData.VarRocLandMod, "DST", 30.00m),

            // Special Radio Operator
            (CertificatesCategorySeederData.VarRocSpecNew, "AF", 20.00m),
            (CertificatesCategorySeederData.VarRocSpecNew, "SEM", 20.00m),
            (CertificatesCategorySeederData.VarRocSpecNew, "ROC", 60.00m),
            (CertificatesCategorySeederData.VarRocSpecNew, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocSpecRen, "AF", 20.00m),
            (CertificatesCategorySeederData.VarRocSpecRen, "SEM", 20.00m),
            (CertificatesCategorySeederData.VarRocSpecRen, "ROC", 60.00m),
            (CertificatesCategorySeederData.VarRocSpecRen, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRocSpecMod, "MOD", 120.00m),
            (CertificatesCategorySeederData.VarRocSpecMod, "DST", 30.00m),

            // Amateur Radio Operator
            (CertificatesCategorySeederData.VarAmaRocNew, "ROC", 60.00m),
            (CertificatesCategorySeederData.VarAmaRocNew, "DST", 30.00m),
            (CertificatesCategorySeederData.VarAmaRocRen, "ROC", 60.00m),
            (CertificatesCategorySeederData.VarAmaRocRen, "DST", 30.00m),
            (CertificatesCategorySeederData.VarAmaRocMod, "MOD", 60.00m),
            (CertificatesCategorySeederData.VarAmaRocMod, "DST", 30.00m),

            // Amateur Lifetime
            (CertificatesCategorySeederData.VarAmaLifetimeMod, "FF", 60.00m),
            (CertificatesCategorySeederData.VarAmaLifetimeMod, "MOD", 50.00m),
            (CertificatesCategorySeederData.VarAmaLifetimeMod, "POSS_PERMIT", 50.00m),
            (CertificatesCategorySeederData.VarAmaLifetimeMod, "DST", 30.00m),

            // RFID / SRD / WDN Devices
            (CertificatesCategorySeederData.VarRfidDealers, "AF", 180.00m),
            (CertificatesCategorySeederData.VarRfidDealers, "DST", 30.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "AF", 180.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "DST", 30.00m),

            // TVRO Registration
            (CertificatesCategorySeederData.VarTvroComm, "REG", 6500.00m),
            (CertificatesCategorySeederData.VarTvroComm, "DST", 30.00m),
            (CertificatesCategorySeederData.VarTvroNonComm, "REG", 6500.00m),
            (CertificatesCategorySeederData.VarTvroNonComm, "DST", 30.00m),

            // VAS Provider
            (CertificatesCategorySeederData.VarVasRenewal, "FF", 300.00m),
            (CertificatesCategorySeederData.VarVasRenewal, "ARF1", 6000.00m),
            (CertificatesCategorySeederData.VarVasRenewal, "ARF2", 1000.00m),
            (CertificatesCategorySeederData.VarVasRenewal, "DST", 30.00m),

            // Copy of Certificates
            (CertificatesCategorySeederData.VarCertTrueCopy, "FC", 6.00m),
            (CertificatesCategorySeederData.VarCertTrueCopy, "SC", 2.50m),
            (CertificatesCategorySeederData.VarCertTrueCopy, "DST", 30.00m),
            (CertificatesCategorySeederData.VarCertDuplicate, "DUP", 120.00m),
            (CertificatesCategorySeederData.VarCertDuplicate, "DST", 30.00m)
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
            (CertificatesCategorySeederData.VarRocCommNew, "1RTG", "ROC", 180.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "2RTG", "ROC", 120.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "3RTG", "ROC", 60.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "1PHN", "ROC", 120.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "2PHN", "ROC", 100.00m),
            (CertificatesCategorySeederData.VarRocCommNew, "3PHN", "ROC", 60.00m),

            // Commercial ROC Renewal
            (CertificatesCategorySeederData.VarRocCommRen, "1RTG", "ROC", 180.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "2RTG", "ROC", 120.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "3RTG", "ROC", 60.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "1PHN", "ROC", 120.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "2PHN", "ROC", 100.00m),
            (CertificatesCategorySeederData.VarRocCommRen, "3PHN", "ROC", 60.00m),

            // RFID Devices
            (CertificatesCategorySeederData.VarRfidDealers, "RFID HIGH POWER", "REG", 300.00m),
            (CertificatesCategorySeederData.VarRfidDealers, "RFID LOW POWER", "REG", 100.00m),
            (CertificatesCategorySeederData.VarRfidDealers, "SRD/WDN", "REG", 50.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "RFID HIGH POWER", "REG", 300.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "RFID LOW POWER", "REG", 100.00m),
            (CertificatesCategorySeederData.VarRfidNonDealers, "SRD/WDN", "REG", 50.00m)
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

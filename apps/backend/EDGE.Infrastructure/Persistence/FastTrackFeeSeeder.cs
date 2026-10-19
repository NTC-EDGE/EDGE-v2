using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Constants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence.SeederData;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Persistence;

public static class FastTrackFeeSeeder
{
    public static async Task SeedFeesAndVariantFeesAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        try
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
                (FeeConstants.Codes.Request, "Request / Administrative Processing Fee", "Special request and administrative filing fee"),
                (FeeConstants.Codes.Purchase, "Purchase Permit Fee", "Statutory permit to purchase fee"),
                (FeeConstants.Codes.Possess, "Possess Permit Fee", "Statutory permit to possess fee"),
                (FeeConstants.Codes.SellTransfer, "Sell/Transfer Permit Fee", "Statutory permit to sell or transfer fee"),
                (FeeConstants.Codes.PermitFee, "Permit Fee", "Statutory operational permit fee"),
                (FeeConstants.Codes.InspectionFee, "Inspection Fee", "Statutory station/equipment inspection fee"),
                (FeeConstants.Codes.Demo, "Demo/Propagate Fee", "Temporary demonstration and propagation fee"),
                (FeeConstants.Codes.PermitToTransport, "Permit to Transport Fee", "Radio communications equipment transport fee"),
                (FeeConstants.Codes.SpecialPermit, "Special Permit Fee", "Amateur vanity or special event permit fee"),
                (FeeConstants.Codes.LicenseFee, "License Fee", "Statutory station license fee"),
                (FeeConstants.Codes.ConstructionPermit, "Construction Permit Fee", "Radio station construction permit fee"),
                (FeeConstants.Codes.SpectrumUsage, "Spectrum User Fee", "Statutory spectrum user fee")
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

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                logger?.LogWarning(ex, "Concurrent update detected while seeding Master Fees. Refreshing fee map.");
                var reloadedFees = await context.Fees.IgnoreQueryFilters().AsNoTracking().ToListAsync();
                foreach (var f in reloadedFees)
                {
                    feeMap[f.Code] = f;
                }
            }

            // 2. Map ServiceVariantFees (Certificates + Permits)
            var variantFeesToSeed = new List<(Guid VariantId, string FeeCode, decimal Amount)>
            {
                #region Certificates
                // Commercial ROC Mod
                (CertificatesCategorySeederData.VarRocCommMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
                (CertificatesCategorySeederData.VarRocCommMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Aircraft ROC
                (CertificatesCategorySeederData.VarRocAirNew, FeeConstants.Codes.Roc, FeeConstants.Amounts.AircraftRocAnnualRate),
                (CertificatesCategorySeederData.VarRocAirNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocAirRen, FeeConstants.Codes.Roc, FeeConstants.Amounts.AircraftRocAnnualRate),
                (CertificatesCategorySeederData.VarRocAirRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocAirMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
                (CertificatesCategorySeederData.VarRocAirMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Foreign Pilot
                (CertificatesCategorySeederData.VarRocPilotNew, FeeConstants.Codes.Roc, FeeConstants.Amounts.ForeignPilotTemporary),
                (CertificatesCategorySeederData.VarRocPilotNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocPilotMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
                (CertificatesCategorySeederData.VarRocPilotMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Government ROC
                (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.GovFilingFee),
                (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.GovApplicationFee),
                (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.Roc, FeeConstants.Amounts.GovRocAnnualRate),
                (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.GovFilingFee),
                (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.GovApplicationFee),
                (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.Roc, FeeConstants.Amounts.GovRocAnnualRate),
                (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocGovMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
                (CertificatesCategorySeederData.VarRocGovMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Land Mobile ROC
                (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.GovFilingFee),
                (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.GovApplicationFee),
                (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.Roc, FeeConstants.Amounts.LandMobileRocAnnualRate),
                (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.GovFilingFee),
                (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.GovApplicationFee),
                (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.Roc, FeeConstants.Amounts.LandMobileRocAnnualRate),
                (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocLandMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
                (CertificatesCategorySeederData.VarRocLandMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Special Radio Operator
                (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.GovApplicationFee),
                (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.Seminar, FeeConstants.Amounts.SpecialRocSeminarFee),
                (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.Roc, FeeConstants.Amounts.SpecialRocAnnualRate),
                (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.GovApplicationFee),
                (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.Seminar, FeeConstants.Amounts.SpecialRocSeminarFee),
                (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.Roc, FeeConstants.Amounts.SpecialRocAnnualRate),
                (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRocSpecMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CertificateModification),
                (CertificatesCategorySeederData.VarRocSpecMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Amateur Radio Operator
                (CertificatesCategorySeederData.VarAmaRocNew, FeeConstants.Codes.Roc, FeeConstants.Amounts.AmateurRocAnnualRate),
                (CertificatesCategorySeederData.VarAmaRocNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarAmaRocRen, FeeConstants.Codes.Roc, FeeConstants.Amounts.AmateurRocAnnualRate),
                (CertificatesCategorySeederData.VarAmaRocRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarAmaRocMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.AmateurModificationFee),
                (CertificatesCategorySeederData.VarAmaRocMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Amateur Lifetime
                (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.AmateurLifetimeFilingFee),
                (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.AmateurLifetimeModificationFee),
                (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.PossessPermit, FeeConstants.Amounts.AmateurLifetimePossessPermitFee),
                (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // RFID / SRD / WDN Devices
                (CertificatesCategorySeederData.VarRfidDealers, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.RfidApplicationFee),
                (CertificatesCategorySeederData.VarRfidDealers, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarRfidNonDealers, FeeConstants.Codes.ApplicationFee, FeeConstants.Amounts.RfidApplicationFee),
                (CertificatesCategorySeederData.VarRfidNonDealers, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // TVRO Registration
                (CertificatesCategorySeederData.VarTvroComm, FeeConstants.Codes.Registration, FeeConstants.Amounts.TvroRegistrationRate),
                (CertificatesCategorySeederData.VarTvroComm, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarTvroNonComm, FeeConstants.Codes.Registration, FeeConstants.Amounts.TvroRegistrationRate),
                (CertificatesCategorySeederData.VarTvroNonComm, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // VAS Provider
                (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.VasFilingFee),
                (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.AnnualRegistration1, FeeConstants.Amounts.VasAnnualBaseRate),
                (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.AnnualRegistration2, FeeConstants.Amounts.VasAnnualExcessRate),
                (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Copy of Certificates
                (CertificatesCategorySeederData.VarCertTrueCopy, FeeConstants.Codes.FirstCopy, FeeConstants.Amounts.CertifiedTrueCopyFirstPage),
                (CertificatesCategorySeederData.VarCertTrueCopy, FeeConstants.Codes.SucceedingCopies, FeeConstants.Amounts.CertifiedTrueCopySucceedingPage),
                (CertificatesCategorySeederData.VarCertTrueCopy, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (CertificatesCategorySeederData.VarCertDuplicate, FeeConstants.Codes.Duplicate, FeeConstants.Amounts.DuplicateCopyRate),
                (CertificatesCategorySeederData.VarCertDuplicate, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                #endregion

                #region Permits
                // 1. Amateur Service Permits
                (PermitsCategorySeederData.VarAmPur, FeeConstants.Codes.Purchase, FeeConstants.Amounts.AmateurPermitUnitRate),
                (PermitsCategorySeederData.VarAmPur, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAmStorage, FeeConstants.Codes.Possess, FeeConstants.Amounts.AmateurPermitUnitRate),
                (PermitsCategorySeederData.VarAmStorage, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAmPurPoss, FeeConstants.Codes.Purchase, FeeConstants.Amounts.AmateurPermitUnitRate),
                (PermitsCategorySeederData.VarAmPurPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.AmateurPermitUnitRate),
                (PermitsCategorySeederData.VarAmPurPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAmSell, FeeConstants.Codes.SellTransfer, FeeConstants.Amounts.AmateurPermitUnitRate),
                (PermitsCategorySeederData.VarAmSell, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAmForeign, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.AmateurForeignVisitorFilingFee),
                (PermitsCategorySeederData.VarAmForeign, FeeConstants.Codes.Roc, FeeConstants.Amounts.AmateurForeignVisitorRocRate),
                (PermitsCategorySeederData.VarAmForeign, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAmVanityNew, FeeConstants.Codes.SpecialPermit, FeeConstants.Amounts.AmateurVanityCallSignRate),
                (PermitsCategorySeederData.VarAmVanityNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAmVanityRen, FeeConstants.Codes.SpecialPermit, FeeConstants.Amounts.AmateurVanityCallSignRate),
                (PermitsCategorySeederData.VarAmVanityRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAmSpecialEvent, FeeConstants.Codes.SpecialPermit, FeeConstants.Amounts.AmateurSpecialEventCallSignRate),
                (PermitsCategorySeederData.VarAmSpecialEvent, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // 2. Demo and Operational
                (PermitsCategorySeederData.VarFlmDemo, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarFlmDemo, FeeConstants.Codes.Demo, FeeConstants.Amounts.PermitDemoFee),
                (PermitsCategorySeederData.VarFlmDemo, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarEquipTransport, FeeConstants.Codes.PermitToTransport, FeeConstants.Amounts.PermitToTransportRate),
                (PermitsCategorySeederData.VarEquipTransport, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // 3. Radio Equipment Dealer / Manufacturer / Service Center
                (PermitsCategorySeederData.VarEquipDealerNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.RadioEquipmentFilingFee),
                (PermitsCategorySeederData.VarEquipDealerNew, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.RadioEquipmentDealerPermitRate),
                (PermitsCategorySeederData.VarEquipDealerNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.RadioEquipmentDealerInspectionRate),
                (PermitsCategorySeederData.VarEquipDealerNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarEquipDealerRen, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.RadioEquipmentDealerPermitRate),
                (PermitsCategorySeederData.VarEquipDealerRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.RadioEquipmentDealerInspectionRate),
                (PermitsCategorySeederData.VarEquipDealerRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarEquipDealerMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.PermitModificationFee),
                (PermitsCategorySeederData.VarEquipDealerMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (PermitsCategorySeederData.VarEquipMfgNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.RadioEquipmentFilingFee),
                (PermitsCategorySeederData.VarEquipMfgNew, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.RadioEquipmentManufacturerPermitRate),
                (PermitsCategorySeederData.VarEquipMfgNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.RadioEquipmentManufacturerInspectionRate),
                (PermitsCategorySeederData.VarEquipMfgNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarEquipMfgRen, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.RadioEquipmentManufacturerPermitRate),
                (PermitsCategorySeederData.VarEquipMfgRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.RadioEquipmentManufacturerInspectionRate),
                (PermitsCategorySeederData.VarEquipMfgRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarEquipMfgMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.PermitModificationFee),
                (PermitsCategorySeederData.VarEquipMfgMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (PermitsCategorySeederData.VarEquipSvcNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.RadioEquipmentFilingFee),
                (PermitsCategorySeederData.VarEquipSvcNew, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.RadioEquipmentServiceCenterPermitRate),
                (PermitsCategorySeederData.VarEquipSvcNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.RadioEquipmentServiceCenterInspectionRate),
                (PermitsCategorySeederData.VarEquipSvcNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarEquipSvcRen, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.RadioEquipmentServiceCenterPermitRate),
                (PermitsCategorySeederData.VarEquipSvcRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.RadioEquipmentServiceCenterInspectionRate),
                (PermitsCategorySeederData.VarEquipSvcRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarEquipSvcMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.PermitModificationFee),
                (PermitsCategorySeederData.VarEquipSvcMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // 4. Mobile Phone Permits
                (PermitsCategorySeederData.VarMpRetailerNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.MobilePhoneFilingFee),
                (PermitsCategorySeederData.VarMpRetailerNew, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneRetailerPermitRate),
                (PermitsCategorySeederData.VarMpRetailerNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.MobilePhoneRetailerInspectionRate),
                (PermitsCategorySeederData.VarMpRetailerNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMpRetailerRen, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneRetailerPermitRate),
                (PermitsCategorySeederData.VarMpRetailerRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.MobilePhoneRetailerInspectionRate),
                (PermitsCategorySeederData.VarMpRetailerRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMpRetailerMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.PermitModificationFee),
                (PermitsCategorySeederData.VarMpRetailerMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (PermitsCategorySeederData.VarMpSvcNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.MobilePhoneServiceCenterFilingFee),
                (PermitsCategorySeederData.VarMpSvcNew, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneServiceCenterPermitRate),
                (PermitsCategorySeederData.VarMpSvcNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.MobilePhoneServiceCenterInspectionRate),
                (PermitsCategorySeederData.VarMpSvcNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMpSvcRen, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneServiceCenterPermitRate),
                (PermitsCategorySeederData.VarMpSvcRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.MobilePhoneServiceCenterInspectionRate),
                (PermitsCategorySeederData.VarMpSvcRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMpSvcMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.PermitModificationFee),
                (PermitsCategorySeederData.VarMpSvcMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (PermitsCategorySeederData.VarMpDealerNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.MobilePhoneFilingFee),
                (PermitsCategorySeederData.VarMpDealerNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.MobilePhoneDealerInspectionRate),
                (PermitsCategorySeederData.VarMpDealerNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMpDealerRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.MobilePhoneDealerInspectionRate),
                (PermitsCategorySeederData.VarMpDealerRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMpDealerMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.PermitModificationFee),
                (PermitsCategorySeederData.VarMpDealerMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // 5. Permit Copies
                (PermitsCategorySeederData.VarPermitTrueCopy, FeeConstants.Codes.FirstCopy, FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage),
                (PermitsCategorySeederData.VarPermitTrueCopy, FeeConstants.Codes.SucceedingCopies, FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage),
                (PermitsCategorySeederData.VarPermitTrueCopy, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarPermitDuplicate, FeeConstants.Codes.Duplicate, FeeConstants.Amounts.DuplicateCopyRate),
                (PermitsCategorySeederData.VarPermitDuplicate, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // 6. Power-Rated Station Permits
                // Purchase
                (PermitsCategorySeederData.VarAeroStnPur, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarAeroStnPur, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAirStnPur, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarAirStnPur, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarShipPur, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarMarShipPur, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarPrivCoastPur, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarMarPrivCoastPur, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarPubCoastPur, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarMarPubCoastPur, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPurVsat, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPurVsat, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPurPriv, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPurPriv, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPurCag, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPurCag, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPurGov, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPurGov, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Possess / Storage
                (PermitsCategorySeederData.VarAeroStnPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarAeroStnPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAeroStorage, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarAeroStorage, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAirStnPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarAirStnPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarShipPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarMarShipPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarShipStorage, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarMarShipStorage, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarPrivCoastPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarMarPrivCoastPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarPubCoastPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarMarPubCoastPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPossVsat, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPossVsat, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPossPriv, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPossPriv, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPossCag, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPossCag, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPossGov, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPossGov, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmStorage, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmStorage, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarPteStorage, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarPteStorage, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Purchase/Possess
                (PermitsCategorySeederData.VarAeroStnPurPoss, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarAeroStnPurPoss, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarAeroStnPurPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarAeroStnPurPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAirStnPurPoss, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarAirStnPurPoss, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarAirStnPurPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarAirStnPurPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarShipPurPoss, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarMarShipPurPoss, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarMarShipPurPoss, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarMarShipPurPoss, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarPrivCoastPP, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarMarPrivCoastPP, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarMarPrivCoastPP, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarMarPrivCoastPP, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarPubCoastPP, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarMarPubCoastPP, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarMarPubCoastPP, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarMarPubCoastPP, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPPVsat, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarFlmPPVsat, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPPVsat, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPPVsat, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPPPriv, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarFlmPPPriv, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPPPriv, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPPPriv, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPPCag, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarFlmPPCag, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPPCag, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPPCag, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmPPGov, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.PowerStationFilingFee),
                (PermitsCategorySeederData.VarFlmPPGov, FeeConstants.Codes.Purchase, FeeConstants.Amounts.PowerHighPurchaseRate),
                (PermitsCategorySeederData.VarFlmPPGov, FeeConstants.Codes.Possess, FeeConstants.Amounts.PowerHighPossessRate),
                (PermitsCategorySeederData.VarFlmPPGov, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Sell / Transfer
                (PermitsCategorySeederData.VarAeroStnSell, FeeConstants.Codes.SellTransfer, FeeConstants.Amounts.PowerHighSellTransferRate),
                (PermitsCategorySeederData.VarAeroStnSell, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarAirStnSell, FeeConstants.Codes.SellTransfer, FeeConstants.Amounts.PowerHighSellTransferRate),
                (PermitsCategorySeederData.VarAirStnSell, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarShipSell, FeeConstants.Codes.SellTransfer, FeeConstants.Amounts.PowerHighSellTransferRate),
                (PermitsCategorySeederData.VarMarShipSell, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarMarPubCoastSell, FeeConstants.Codes.SellTransfer, FeeConstants.Amounts.PowerHighSellTransferRate),
                (PermitsCategorySeederData.VarMarPubCoastSell, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmSell, FeeConstants.Codes.SellTransfer, FeeConstants.Amounts.PowerHighSellTransferRate),
                (PermitsCategorySeederData.VarFlmSell, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Construction Permit
                (PermitsCategorySeederData.VarFlmConstNew, FeeConstants.Codes.ConstructionPermit, FeeConstants.Amounts.FlmCpfStandard),
                (PermitsCategorySeederData.VarFlmConstNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (PermitsCategorySeederData.VarFlmConstMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.FlmModificationFee),
                (PermitsCategorySeederData.VarFlmConstMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                #endregion

                #region Licenses
                // 1. Amateur Service Licenses
                (LicensesCategorySeederData.VarAmaRslNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee),
                (LicensesCategorySeederData.VarAmaRslNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarAmaRslRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarAmaRslMod, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee),
                (LicensesCategorySeederData.VarAmaRslMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.AmateurLicenseModificationFee),
                (LicensesCategorySeederData.VarAmaRslMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (LicensesCategorySeederData.VarAmaLifetimeNew, FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLifetimeLicenseFee),
                (LicensesCategorySeederData.VarAmaLifetimeNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee),
                (LicensesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.AmateurLicenseModificationFee),
                (LicensesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (LicensesCategorySeederData.VarAmaClubNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.AmateurClubFilingFee),
                (LicensesCategorySeederData.VarAmaClubNew, FeeConstants.Codes.ConstructionPermit, FeeConstants.Amounts.AmateurClubConstructionPermitFee),
                (LicensesCategorySeederData.VarAmaClubNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarAmaClubRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarAmaClubMod, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.AmateurClubFilingFee),
                (LicensesCategorySeederData.VarAmaClubMod, FeeConstants.Codes.ConstructionPermit, FeeConstants.Amounts.AmateurClubModificationCpf),
                (LicensesCategorySeederData.VarAmaClubMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.AmateurClubModificationFee),
                (LicensesCategorySeederData.VarAmaClubMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // 2. TVRO / CATV Licenses
                (LicensesCategorySeederData.VarTvroNew, FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.TvroLicenseFee),
                (LicensesCategorySeederData.VarTvroNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarTvroRen, FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.TvroLicenseFee),
                (LicensesCategorySeederData.VarTvroRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarTvroMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.TvroModificationFee),
                (LicensesCategorySeederData.VarTvroMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (LicensesCategorySeederData.VarCatvNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.CatvFilingFee),
                (LicensesCategorySeederData.VarCatvNew, FeeConstants.Codes.ConstructionPermit, FeeConstants.Amounts.CatvConstructionPermitFee),
                (LicensesCategorySeederData.VarCatvNew, FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.CatvLicenseFee),
                (LicensesCategorySeederData.VarCatvNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.CatvInspectionFee),
                (LicensesCategorySeederData.VarCatvNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarCatvRen, FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.CatvLicenseFee),
                (LicensesCategorySeederData.VarCatvRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.CatvInspectionFee),
                (LicensesCategorySeederData.VarCatvRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarCatvMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CatvModificationFee),
                (LicensesCategorySeederData.VarCatvMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // 3. License Copies
                (LicensesCategorySeederData.VarLicTrueCopy, FeeConstants.Codes.FirstCopy, FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage),
                (LicensesCategorySeederData.VarLicTrueCopy, FeeConstants.Codes.SucceedingCopies, FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage),
                (LicensesCategorySeederData.VarLicTrueCopy, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                (LicensesCategorySeederData.VarLicDuplicate, FeeConstants.Codes.Duplicate, FeeConstants.Amounts.DuplicateCopyRate),
                (LicensesCategorySeederData.VarLicDuplicate, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                #endregion

                #region Accreditations
                // Mobile Phone CPE Supplier Accreditation
                (AccreditationsCategorySeederData.VarCpeMobileNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.CpeFilingFee),
                (AccreditationsCategorySeederData.VarCpeMobileNew, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.CpeMobilePermitRate),
                (AccreditationsCategorySeederData.VarCpeMobileNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.CpeMobileInspectionRate),
                (AccreditationsCategorySeederData.VarCpeMobileNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (AccreditationsCategorySeederData.VarCpeMobileRen, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.CpeMobilePermitRate),
                (AccreditationsCategorySeederData.VarCpeMobileRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.CpeMobileInspectionRate),
                (AccreditationsCategorySeederData.VarCpeMobileRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (AccreditationsCategorySeederData.VarCpeMobileMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CpeModificationFee),
                (AccreditationsCategorySeederData.VarCpeMobileMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                // Non-Mobile Phone CPE Supplier Accreditation
                (AccreditationsCategorySeederData.VarCpeNonMobileNew, FeeConstants.Codes.FilingFee, FeeConstants.Amounts.CpeFilingFee),
                (AccreditationsCategorySeederData.VarCpeNonMobileNew, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.CpeNonMobilePermitRate),
                (AccreditationsCategorySeederData.VarCpeNonMobileNew, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.CpeNonMobileInspectionRate),
                (AccreditationsCategorySeederData.VarCpeNonMobileNew, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (AccreditationsCategorySeederData.VarCpeNonMobileRen, FeeConstants.Codes.PermitFee, FeeConstants.Amounts.CpeNonMobilePermitRate),
                (AccreditationsCategorySeederData.VarCpeNonMobileRen, FeeConstants.Codes.InspectionFee, FeeConstants.Amounts.CpeNonMobileInspectionRate),
                (AccreditationsCategorySeederData.VarCpeNonMobileRen, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),

                (AccreditationsCategorySeederData.VarCpeNonMobileMod, FeeConstants.Codes.Modification, FeeConstants.Amounts.CpeModificationFee),
                (AccreditationsCategorySeederData.VarCpeNonMobileMod, FeeConstants.Codes.Dst, FeeConstants.Amounts.DocumentaryStampTax),
                #endregion

                #region Exams
                // Radio Operator Examinations
                (ExamsCategorySeederData.VarRtgFirstTaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarRtgRetaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarRtgUpgrade, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarRtpFirstTaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarRtpRetaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarRtpUpgrade, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarAmaFirstTaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarAmaRetaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarAmaUpgrade, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarRrocAirFirstTaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate),
                (ExamsCategorySeederData.VarRrocAirRetaker, FeeConstants.Codes.Exam, FeeConstants.Amounts.DefaultExamRate)
                #endregion
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
                        Amount = amount,
                        IsActive = true
                    });
                }
                else
                {
                    existingRecord.Amount = amount;
                    existingRecord.IsActive = true;
                    if (existingRecord.IsDeleted)
                    {
                        existingRecord.IsDeleted = false;
                        existingRecord.IsDeletedBy = string.Empty;
                    }
                }
            }

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                logger?.LogWarning(ex, "Concurrent update detected while seeding ServiceVariantFees.");
            }

            // 3. Map ServiceVariantElementFees (ROC Commercial Elements, RFID Elements, Foreign Visitor Elements, Mobile Phone Dealer Elements)
            var allDbElements = await context.Elements.IgnoreQueryFilters().ToListAsync();
            var existingElementFees = await context.ServiceVariantElementFees.IgnoreQueryFilters().ToListAsync();

            var elementFeesToSeed = new List<(Guid VariantId, string ElementCode, string FeeCode, decimal Amount)>
            {
                #region Certificates Elements
                // Commercial ROC New
                (CertificatesCategorySeederData.VarRocCommNew, "1RTG", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc1RtgAnnualRate),
                (CertificatesCategorySeederData.VarRocCommNew, "2RTG", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc2RtgAnnualRate),
                (CertificatesCategorySeederData.VarRocCommNew, "3RTG", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc3RtgAnnualRate),
                (CertificatesCategorySeederData.VarRocCommNew, "1PHN", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc1PhnAnnualRate),
                (CertificatesCategorySeederData.VarRocCommNew, "2PHN", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc2PhnAnnualRate),
                (CertificatesCategorySeederData.VarRocCommNew, "3PHN", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc3PhnAnnualRate),

                // Commercial ROC Renewal
                (CertificatesCategorySeederData.VarRocCommRen, "1RTG", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc1RtgAnnualRate),
                (CertificatesCategorySeederData.VarRocCommRen, "2RTG", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc2RtgAnnualRate),
                (CertificatesCategorySeederData.VarRocCommRen, "3RTG", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc3RtgAnnualRate),
                (CertificatesCategorySeederData.VarRocCommRen, "1PHN", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc1PhnAnnualRate),
                (CertificatesCategorySeederData.VarRocCommRen, "2PHN", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc2PhnAnnualRate),
                (CertificatesCategorySeederData.VarRocCommRen, "3PHN", FeeConstants.Codes.Roc, FeeConstants.Amounts.Roc3PhnAnnualRate),

                // RFID Devices
                (CertificatesCategorySeederData.VarRfidDealers, "RFID HIGH POWER", FeeConstants.Codes.Registration, FeeConstants.Amounts.RfidHighPowerUnitRate),
                (CertificatesCategorySeederData.VarRfidDealers, "RFID LOW POWER", FeeConstants.Codes.Registration, FeeConstants.Amounts.RfidLowPowerUnitRate),
                (CertificatesCategorySeederData.VarRfidDealers, "SRD/WDN", FeeConstants.Codes.Registration, FeeConstants.Amounts.SrdWdnUnitRate),
                (CertificatesCategorySeederData.VarRfidNonDealers, "RFID HIGH POWER", FeeConstants.Codes.Registration, FeeConstants.Amounts.RfidHighPowerUnitRate),
                (CertificatesCategorySeederData.VarRfidNonDealers, "RFID LOW POWER", FeeConstants.Codes.Registration, FeeConstants.Amounts.RfidLowPowerUnitRate),
                (CertificatesCategorySeederData.VarRfidNonDealers, "SRD/WDN", FeeConstants.Codes.Registration, FeeConstants.Amounts.SrdWdnUnitRate),
                #endregion

                #region Permits Elements
                // Foreign Visitor Amateur License
                (PermitsCategorySeederData.VarAmForeign, "Class A", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurForeignVisitorClassALicense),
                (PermitsCategorySeederData.VarAmForeign, "Class B", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurForeignVisitorClassBLicense),
                (PermitsCategorySeederData.VarAmForeign, "Class C", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurForeignVisitorClassCLicense),

                // Mobile Phone Dealer Main / Branch
                (PermitsCategorySeederData.VarMpDealerNew, "MAIN", FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneDealerMainPermitRate),
                (PermitsCategorySeederData.VarMpDealerNew, "BRANCH", FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneDealerBranchPermitRate),
                (PermitsCategorySeederData.VarMpDealerRen, "MAIN", FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneDealerMainPermitRate),
                (PermitsCategorySeederData.VarMpDealerRen, "BRANCH", FeeConstants.Codes.PermitFee, FeeConstants.Amounts.MobilePhoneDealerBranchPermitRate),
                #endregion

                #region Licenses Elements
                // Amateur Radio Station License
                (LicensesCategorySeederData.VarAmaRslNew, "Class A", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassARate),
                (LicensesCategorySeederData.VarAmaRslNew, "Class B", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassBRate),
                (LicensesCategorySeederData.VarAmaRslNew, "Class C", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassCRate),
                (LicensesCategorySeederData.VarAmaRslNew, "Class D", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassDRate),

                (LicensesCategorySeederData.VarAmaRslRen, "Class A", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassARate),
                (LicensesCategorySeederData.VarAmaRslRen, "Class B", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassBRate),
                (LicensesCategorySeederData.VarAmaRslRen, "Class C", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassCRate),
                (LicensesCategorySeederData.VarAmaRslRen, "Class D", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurLicenseClassDRate),

                // Amateur Club License
                (LicensesCategorySeederData.VarAmaClubNew, "Simplex", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurClubSimplexLicenseFee),
                (LicensesCategorySeederData.VarAmaClubNew, "Duplex", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurClubDuplexLicenseFee),
                (LicensesCategorySeederData.VarAmaClubRen, "Simplex", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurClubSimplexLicenseFee),
                (LicensesCategorySeederData.VarAmaClubRen, "Duplex", FeeConstants.Codes.LicenseFee, FeeConstants.Amounts.AmateurClubDuplexLicenseFee)
                #endregion
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
                        Amount = amount,
                        IsActive = true
                    });
                }
                else
                {
                    existingVef.Amount = amount;
                    existingVef.IsActive = true;
                    if (existingVef.IsDeleted)
                    {
                        existingVef.IsDeleted = false;
                        existingVef.IsDeletedBy = string.Empty;
                    }
                }
            }

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                logger?.LogWarning(ex, "Concurrent update detected while seeding ServiceVariantElementFees.");
            }

            // 4. Seed ServiceVariantFormulas
            var variantFormulasToSeed = new List<(Guid VariantId, string Formula, bool ApplySurcharge)>
            {
                (CertificatesCategorySeederData.VarRocCommMod, FeeConstants.Formulas.RocModification, false),
                (CertificatesCategorySeederData.VarRocAirNew, FeeConstants.Formulas.RocNew, false),
                (CertificatesCategorySeederData.VarRocAirRen, FeeConstants.Formulas.RocRenewal, true),
                (CertificatesCategorySeederData.VarRocAirMod, FeeConstants.Formulas.RocModification, false),
                (CertificatesCategorySeederData.VarRocPilotNew, "FEEROC = ROC + DST", false),
                (CertificatesCategorySeederData.VarRocPilotMod, FeeConstants.Formulas.RocModification, false),
                (CertificatesCategorySeederData.VarRocGovNew, FeeConstants.Formulas.GovRocNew, false),
                (CertificatesCategorySeederData.VarRocGovRen, FeeConstants.Formulas.GovRocRenewal, true),
                (CertificatesCategorySeederData.VarRocGovMod, FeeConstants.Formulas.RocModification, false),
                (CertificatesCategorySeederData.VarRocLandNew, FeeConstants.Formulas.LandMobileRocNew, false),
                (CertificatesCategorySeederData.VarRocLandRen, FeeConstants.Formulas.LandMobileRocRenewal, true),
                (CertificatesCategorySeederData.VarRocLandMod, FeeConstants.Formulas.RocModification, false),
                (CertificatesCategorySeederData.VarRocSpecNew, FeeConstants.Formulas.SpecialRocNew, false),
                (CertificatesCategorySeederData.VarRocSpecRen, FeeConstants.Formulas.SpecialRocRenewal, true),
                (CertificatesCategorySeederData.VarRocSpecMod, FeeConstants.Formulas.RocModification, false),
                (CertificatesCategorySeederData.VarAmaRocNew, FeeConstants.Formulas.AmateurRocNew, false),
                (CertificatesCategorySeederData.VarAmaRocRen, FeeConstants.Formulas.AmateurRocRenewal, true),
                (CertificatesCategorySeederData.VarAmaRocMod, FeeConstants.Formulas.AmateurModification, false),
                (CertificatesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Formulas.AmateurLifetime, false),
                (CertificatesCategorySeederData.VarTvroComm, FeeConstants.Formulas.TvroRegistration, false),
                (CertificatesCategorySeederData.VarTvroNonComm, FeeConstants.Formulas.TvroRegistration, false),
                (CertificatesCategorySeederData.VarVasRenewal, FeeConstants.Formulas.VasRenewalWithSurcharge, true),
                (CertificatesCategorySeederData.VarCertTrueCopy, FeeConstants.Formulas.CertifiedTrueCopy, false),
                (CertificatesCategorySeederData.VarCertDuplicate, FeeConstants.Formulas.DuplicateCopy, false),

                #region Permits Formulas
                // 1. Amateur Service Permits
                (PermitsCategorySeederData.VarAmPur, FeeConstants.Formulas.PermitAmateurPurchase, false),
                (PermitsCategorySeederData.VarAmStorage, FeeConstants.Formulas.PermitAmateurPossess, false),
                (PermitsCategorySeederData.VarAmPurPoss, FeeConstants.Formulas.PermitAmateurPurchasePossess, false),
                (PermitsCategorySeederData.VarAmSell, FeeConstants.Formulas.PermitAmateurSellTransfer, false),
                (PermitsCategorySeederData.VarAmVanityNew, FeeConstants.Formulas.PermitAmateurVanity, false),
                (PermitsCategorySeederData.VarAmVanityRen, FeeConstants.Formulas.PermitAmateurVanity, false),
                (PermitsCategorySeederData.VarAmSpecialEvent, FeeConstants.Formulas.PermitAmateurSpecialEvent, false),

                // 2. Operational & Equipment Permits
                (PermitsCategorySeederData.VarFlmDemo, FeeConstants.Formulas.PermitDemoPropagate, false),
                (PermitsCategorySeederData.VarEquipTransport, FeeConstants.Formulas.PermitTransport, false),
                (PermitsCategorySeederData.VarEquipDealerNew, FeeConstants.Formulas.PermitDealerNew, false),
                (PermitsCategorySeederData.VarEquipDealerRen, FeeConstants.Formulas.PermitDealerRenewal, true),
                (PermitsCategorySeederData.VarEquipDealerMod, FeeConstants.Formulas.PermitDealerModification, false),
                (PermitsCategorySeederData.VarEquipMfgNew, FeeConstants.Formulas.PermitDealerNew, false),
                (PermitsCategorySeederData.VarEquipMfgRen, FeeConstants.Formulas.PermitDealerRenewal, true),
                (PermitsCategorySeederData.VarEquipMfgMod, FeeConstants.Formulas.PermitDealerModification, false),
                (PermitsCategorySeederData.VarEquipSvcNew, FeeConstants.Formulas.PermitDealerNew, false),
                (PermitsCategorySeederData.VarEquipSvcRen, FeeConstants.Formulas.PermitDealerRenewal, true),
                (PermitsCategorySeederData.VarEquipSvcMod, FeeConstants.Formulas.PermitDealerModification, false),

                // 3. Mobile Phone Permits
                (PermitsCategorySeederData.VarMpRetailerNew, FeeConstants.Formulas.PermitMobilePhoneRetailerNew, false),
                (PermitsCategorySeederData.VarMpRetailerRen, FeeConstants.Formulas.PermitMobilePhoneRetailerRenewal, true),
                (PermitsCategorySeederData.VarMpRetailerMod, FeeConstants.Formulas.PermitMobilePhoneRetailerModification, false),
                (PermitsCategorySeederData.VarMpSvcNew, FeeConstants.Formulas.PermitMobilePhoneServiceCenterNew, false),
                (PermitsCategorySeederData.VarMpSvcRen, FeeConstants.Formulas.PermitMobilePhoneServiceCenterRenewal, true),
                (PermitsCategorySeederData.VarMpSvcMod, FeeConstants.Formulas.PermitMobilePhoneServiceCenterModification, false),
                (PermitsCategorySeederData.VarMpDealerMod, FeeConstants.Formulas.PermitMobilePhoneDealerModification, false),

                // 4. Copy of Permits
                (PermitsCategorySeederData.VarPermitTrueCopy, FeeConstants.Formulas.PermitCertifiedTrueCopy, false),
                (PermitsCategorySeederData.VarPermitDuplicate, FeeConstants.Formulas.PermitDuplicateCopy, false),

                // 5. Power-Rated Station Permits
                // Aero
                (PermitsCategorySeederData.VarAeroStnPur, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarAeroStnPoss, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarAeroStnPurPoss, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarAeroStorage, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarAeroStnSell, FeeConstants.Formulas.PermitStationSellTransfer, false),
                (PermitsCategorySeederData.VarAirStnPur, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarAirStnPoss, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarAirStnPurPoss, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarAirStnSell, FeeConstants.Formulas.PermitStationSellTransfer, false),

                // Mar
                (PermitsCategorySeederData.VarMarShipPur, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarMarShipPoss, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarMarShipStorage, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarMarShipPurPoss, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarMarShipSell, FeeConstants.Formulas.PermitStationSellTransfer, false),
                (PermitsCategorySeederData.VarMarPrivCoastPur, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarMarPrivCoastPoss, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarMarPrivCoastPP, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarMarPubCoastPur, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarMarPubCoastPoss, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarMarPubCoastPP, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarMarPubCoastSell, FeeConstants.Formulas.PermitStationSellTransfer, false),

                // FLM
                (PermitsCategorySeederData.VarFlmPurVsat, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarFlmPurPriv, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarFlmPurCag, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarFlmPurGov, FeeConstants.Formulas.PermitStationPurchase, false),
                (PermitsCategorySeederData.VarFlmPossVsat, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarFlmPossPriv, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarFlmPossCag, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarFlmPossGov, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarFlmPPVsat, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarFlmPPPriv, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarFlmPPCag, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarFlmPPGov, FeeConstants.Formulas.PermitStationPurchasePossess, false),
                (PermitsCategorySeederData.VarFlmStorage, FeeConstants.Formulas.PermitStationPossess, false),
                (PermitsCategorySeederData.VarFlmSell, FeeConstants.Formulas.PermitStationSellTransfer, false),
                (PermitsCategorySeederData.VarFlmConstNew, FeeConstants.Codes.ConstructionPermit, false),
                (PermitsCategorySeederData.VarFlmConstMod, FeeConstants.Codes.Modification, false),

                // PTE
                (PermitsCategorySeederData.VarPteStorage, FeeConstants.Formulas.PermitStationPossess, false),
                #endregion

                #region Licenses Formulas
                // 1. Amateur Service
                (LicensesCategorySeederData.VarAmaRslNew, FeeConstants.Formulas.LicenseAmateurNew, false),
                (LicensesCategorySeederData.VarAmaRslRen, FeeConstants.Formulas.LicenseAmateurRenewal, true),
                (LicensesCategorySeederData.VarAmaRslMod, FeeConstants.Formulas.LicenseAmateurModification, false),
                (LicensesCategorySeederData.VarAmaLifetimeNew, FeeConstants.Formulas.LicenseAmateurLifetimeNew, false),
                (LicensesCategorySeederData.VarAmaLifetimeMod, FeeConstants.Formulas.LicenseAmateurLifetimeModification, false),
                (LicensesCategorySeederData.VarAmaClubNew, FeeConstants.Formulas.LicenseAmateurClubNew, false),
                (LicensesCategorySeederData.VarAmaClubRen, FeeConstants.Formulas.LicenseAmateurClubRenewal, true),
                (LicensesCategorySeederData.VarAmaClubMod, FeeConstants.Formulas.LicenseAmateurClubModification, false),

                // 2. Aeronautical Service
                (LicensesCategorySeederData.VarAeroFixedNew, FeeConstants.Formulas.LicenseAeroFixedNew, false),
                (LicensesCategorySeederData.VarAeroFixedRen, FeeConstants.Formulas.LicenseAeroFixedRenewal, true),
                (LicensesCategorySeederData.VarAeroFixedMod, FeeConstants.Formulas.LicenseAeroFixedModification, false),
                (LicensesCategorySeederData.VarAeroAircraftNew, FeeConstants.Formulas.LicenseAeroAircraftNew, false),
                (LicensesCategorySeederData.VarAeroAircraftRen, FeeConstants.Formulas.LicenseAeroAircraftRenewal, true),
                (LicensesCategorySeederData.VarAeroAircraftMod, FeeConstants.Formulas.LicenseAeroAircraftModification, false),

                // 3. Maritime Service
                (LicensesCategorySeederData.VarMarDomWithoutNew, FeeConstants.Formulas.LicenseMaritimeDomesticWithoutEquipNew, false),
                (LicensesCategorySeederData.VarMarDomWithNew, FeeConstants.Formulas.LicenseMaritimeDomesticWithEquipNew, false),
                (LicensesCategorySeederData.VarMarDomRen, FeeConstants.Formulas.LicenseMaritimeDomesticRenewal, true),
                (LicensesCategorySeederData.VarMarDomMod, FeeConstants.Formulas.LicenseMaritimeDomesticModification, false),
                (LicensesCategorySeederData.VarMarIntlRen, FeeConstants.Formulas.LicenseMaritimeIntlRenewal, true),
                (LicensesCategorySeederData.VarMarIntlEarthRen, FeeConstants.Formulas.LicenseMaritimeIntlRenewal, true),
                (LicensesCategorySeederData.VarMarIntlMod, FeeConstants.Formulas.LicenseMaritimeIntlModification, false),
                (LicensesCategorySeederData.VarMarIntlEarthMod, FeeConstants.Formulas.LicenseMaritimeIntlModification, false),
                (LicensesCategorySeederData.VarMarPrivCoastNew, FeeConstants.Formulas.LicenseMaritimePrivateCoastalNew, false),
                (LicensesCategorySeederData.VarMarPrivCoastRen, FeeConstants.Formulas.LicenseMaritimePrivateCoastalRenewal, true),
                (LicensesCategorySeederData.VarMarPrivCoastMod, FeeConstants.Formulas.LicenseMaritimePrivateCoastalModification, false),
                (LicensesCategorySeederData.VarMarPubCoastNew, FeeConstants.Formulas.LicenseMaritimePublicCoastalNew, false),
                (LicensesCategorySeederData.VarMarPubCoastRen, FeeConstants.Formulas.LicenseMaritimePublicCoastalRenewal, true),
                (LicensesCategorySeederData.VarMarPubCoastMod, FeeConstants.Formulas.LicenseMaritimePublicCoastalModification, false),

                // 4. Fixed & Land Mobile (FLM)
                (LicensesCategorySeederData.VarFlmRslNew, FeeConstants.Formulas.LicenseFlmNew, false),
                (LicensesCategorySeederData.VarFlmRslRen, FeeConstants.Formulas.LicenseFlmRenewal, true),
                (LicensesCategorySeederData.VarFlmRslMod, FeeConstants.Formulas.LicenseFlmModification, false),

                // 5. Other Radio Services
                (LicensesCategorySeederData.VarOtherMicrowaveRen, FeeConstants.Formulas.LicenseOtherRenewal, true),
                (LicensesCategorySeederData.VarOtherMicrowaveMod, FeeConstants.Formulas.LicenseFlmModification, false),
                (LicensesCategorySeederData.VarOtherVsatRen, FeeConstants.Formulas.LicenseOtherRenewal, true),
                (LicensesCategorySeederData.VarOtherVsatMod, FeeConstants.Formulas.LicenseFlmModification, false),
                (LicensesCategorySeederData.VarOtherTrunkedRen, FeeConstants.Formulas.LicenseOtherRenewal, true),
                (LicensesCategorySeederData.VarOtherTrunkedMod, FeeConstants.Formulas.LicenseFlmModification, false),
                (LicensesCategorySeederData.VarOtherBwaRen, FeeConstants.Formulas.LicenseOtherRenewal, true),
                (LicensesCategorySeederData.VarOtherBwaMod, FeeConstants.Formulas.LicenseFlmModification, false),
                (LicensesCategorySeederData.VarOtherWdnNew, FeeConstants.Formulas.LicenseFlmNew, false),
                (LicensesCategorySeederData.VarOtherWdnRen, FeeConstants.Formulas.LicenseFlmRenewal, true),
                (LicensesCategorySeederData.VarOtherWdnMod, FeeConstants.Formulas.LicenseFlmModification, false),
                (LicensesCategorySeederData.VarOtherBtsRen, FeeConstants.Formulas.LicenseOtherRenewal, true),
                (LicensesCategorySeederData.VarOtherBtsMod, FeeConstants.Formulas.LicenseOtherBtsModification, false),

                // 6. TVRO & CATV
                (LicensesCategorySeederData.VarTvroNew, FeeConstants.Formulas.LicenseTvroNew, false),
                (LicensesCategorySeederData.VarTvroRen, FeeConstants.Formulas.LicenseTvroRenewal, true),
                (LicensesCategorySeederData.VarTvroMod, FeeConstants.Formulas.LicenseTvroModification, false),
                (LicensesCategorySeederData.VarCatvNew, FeeConstants.Formulas.LicenseCatvNew, false),
                (LicensesCategorySeederData.VarCatvRen, FeeConstants.Formulas.LicenseCatvRenewal, true),
                (LicensesCategorySeederData.VarCatvMod, FeeConstants.Formulas.LicenseCatvModification, false),

                // 7. Copy of Licenses
                (LicensesCategorySeederData.VarLicTrueCopy, FeeConstants.Formulas.LicenseCertifiedTrueCopy, false),
                (LicensesCategorySeederData.VarLicDuplicate, FeeConstants.Formulas.LicenseDuplicateCopy, false),
                #endregion

                #region Requests and Complaints Formulas
                (RequestsAndComplaintsCategorySeederData.VarReqBlocking, FeeConstants.Formulas.RequestsAndComplaintsFree, false),
                (RequestsAndComplaintsCategorySeederData.VarReqUnblocking, FeeConstants.Formulas.RequestsAndComplaintsFree, false),
                (RequestsAndComplaintsCategorySeederData.VarReqSpam, FeeConstants.Formulas.RequestsAndComplaintsFree, false),
                (RequestsAndComplaintsCategorySeederData.VarReqProvider, FeeConstants.Formulas.RequestsAndComplaintsFree, false),
                (RequestsAndComplaintsCategorySeederData.VarReqTape, FeeConstants.Formulas.RequestsAndComplaintsFree, false),
                #endregion

                #region Accreditations Formulas
                (AccreditationsCategorySeederData.VarCpeMobileNew, FeeConstants.Formulas.CpeAccreditationNew, false),
                (AccreditationsCategorySeederData.VarCpeMobileRen, FeeConstants.Formulas.CpeAccreditationRenewal, true),
                (AccreditationsCategorySeederData.VarCpeMobileMod, FeeConstants.Formulas.CpeAccreditationModification, false),
                (AccreditationsCategorySeederData.VarCpeNonMobileNew, FeeConstants.Formulas.CpeAccreditationNew, false),
                (AccreditationsCategorySeederData.VarCpeNonMobileRen, FeeConstants.Formulas.CpeAccreditationRenewal, true),
                (AccreditationsCategorySeederData.VarCpeNonMobileMod, FeeConstants.Formulas.CpeAccreditationModification, false),
                #endregion

                #region Exams Formulas
                (ExamsCategorySeederData.VarRtgFirstTaker, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarRtgRetaker, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarRtgUpgrade, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarRtpFirstTaker, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarRtpRetaker, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarRtpUpgrade, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarAmaFirstTaker, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarAmaRetaker, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarAmaUpgrade, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarRrocAirFirstTaker, FeeConstants.Formulas.ExamStandard, false),
                (ExamsCategorySeederData.VarRrocAirRetaker, FeeConstants.Formulas.ExamStandard, false)
                #endregion
            };

            var existingVariantFormulas = await context.ServiceVariantFormulas.IgnoreQueryFilters().ToListAsync();
            foreach (var (variantId, formula, applySur) in variantFormulasToSeed)
            {
                if (!allVariantsInDb.Contains(variantId)) continue;
                var existingF = existingVariantFormulas.FirstOrDefault(f => f.ServiceVariantId == variantId);
                if (existingF == null)
                {
                    context.ServiceVariantFormulas.Add(new ServiceVariantFormula
                    {
                        Id = Guid.NewGuid(),
                        ServiceVariantId = variantId,
                        FormulaExpression = formula,
                        Description = formula,
                        ApplyLateRenewalSurcharge = applySur,
                        IsActive = true
                    });
                }
                else
                {
                    existingF.FormulaExpression = formula;
                    existingF.Description = formula;
                    existingF.ApplyLateRenewalSurcharge = applySur;
                    existingF.IsActive = true;
                }
            }

            // 5. Seed ServiceVariantElementFormulas
            var elementFormulasToSeed = new List<(Guid VariantId, string ElementCode, string Formula, bool ApplySurcharge)>
            {
                #region Certificates Elements
                // Commercial ROC New
                (CertificatesCategorySeederData.VarRocCommNew, "1RTG", FeeConstants.Formulas.RocNew, false),
                (CertificatesCategorySeederData.VarRocCommNew, "2RTG", FeeConstants.Formulas.RocNew, false),
                (CertificatesCategorySeederData.VarRocCommNew, "3RTG", FeeConstants.Formulas.RocNew, false),
                (CertificatesCategorySeederData.VarRocCommNew, "1PHN", FeeConstants.Formulas.RocNew, false),
                (CertificatesCategorySeederData.VarRocCommNew, "2PHN", FeeConstants.Formulas.RocNew, false),
                (CertificatesCategorySeederData.VarRocCommNew, "3PHN", FeeConstants.Formulas.RocNew, false),

                // Commercial ROC Renewal
                (CertificatesCategorySeederData.VarRocCommRen, "1RTG", FeeConstants.Formulas.RocRenewal, true),
                (CertificatesCategorySeederData.VarRocCommRen, "2RTG", FeeConstants.Formulas.RocRenewal, true),
                (CertificatesCategorySeederData.VarRocCommRen, "3RTG", FeeConstants.Formulas.RocRenewal, true),
                (CertificatesCategorySeederData.VarRocCommRen, "1PHN", FeeConstants.Formulas.RocRenewal, true),
                (CertificatesCategorySeederData.VarRocCommRen, "2PHN", FeeConstants.Formulas.RocRenewal, true),
                (CertificatesCategorySeederData.VarRocCommRen, "3PHN", FeeConstants.Formulas.RocRenewal, true),

                // RFID Devices
                (CertificatesCategorySeederData.VarRfidDealers, "RFID HIGH POWER", FeeConstants.Formulas.RfidRegistration, false),
                (CertificatesCategorySeederData.VarRfidDealers, "RFID LOW POWER", FeeConstants.Formulas.RfidRegistration, false),
                (CertificatesCategorySeederData.VarRfidDealers, "SRD/WDN", FeeConstants.Formulas.RfidRegistration, false),
                (CertificatesCategorySeederData.VarRfidNonDealers, "RFID HIGH POWER", FeeConstants.Formulas.RfidRegistration, false),
                (CertificatesCategorySeederData.VarRfidNonDealers, "RFID LOW POWER", FeeConstants.Formulas.RfidRegistration, false),
                (CertificatesCategorySeederData.VarRfidNonDealers, "SRD/WDN", FeeConstants.Formulas.RfidRegistration, false),
                #endregion

                #region Permits Elements
                // Foreign Visitor Amateur License
                (PermitsCategorySeederData.VarAmForeign, "Class A", FeeConstants.Formulas.PermitAmateurForeignVisitor, false),
                (PermitsCategorySeederData.VarAmForeign, "Class B", FeeConstants.Formulas.PermitAmateurForeignVisitor, false),
                (PermitsCategorySeederData.VarAmForeign, "Class C", FeeConstants.Formulas.PermitAmateurForeignVisitor, false),

                // Mobile Phone Dealer Main / Branch
                (PermitsCategorySeederData.VarMpDealerNew, "MAIN", FeeConstants.Formulas.PermitMobilePhoneDealerNew, false),
                (PermitsCategorySeederData.VarMpDealerNew, "BRANCH", FeeConstants.Formulas.PermitMobilePhoneDealerNew, false),
                (PermitsCategorySeederData.VarMpDealerRen, "MAIN", FeeConstants.Formulas.PermitMobilePhoneDealerRenewal, true),
                (PermitsCategorySeederData.VarMpDealerRen, "BRANCH", FeeConstants.Formulas.PermitMobilePhoneDealerRenewal, true),
                #endregion

                #region Licenses Elements
                // Amateur Radio Station License
                (LicensesCategorySeederData.VarAmaRslNew, "Class A", FeeConstants.Formulas.LicenseAmateurNew, false),
                (LicensesCategorySeederData.VarAmaRslNew, "Class B", FeeConstants.Formulas.LicenseAmateurNew, false),
                (LicensesCategorySeederData.VarAmaRslNew, "Class C", FeeConstants.Formulas.LicenseAmateurNew, false),
                (LicensesCategorySeederData.VarAmaRslNew, "Class D", FeeConstants.Formulas.LicenseAmateurNew, false),

                (LicensesCategorySeederData.VarAmaRslRen, "Class A", FeeConstants.Formulas.LicenseAmateurRenewal, true),
                (LicensesCategorySeederData.VarAmaRslRen, "Class B", FeeConstants.Formulas.LicenseAmateurRenewal, true),
                (LicensesCategorySeederData.VarAmaRslRen, "Class C", FeeConstants.Formulas.LicenseAmateurRenewal, true),
                (LicensesCategorySeederData.VarAmaRslRen, "Class D", FeeConstants.Formulas.LicenseAmateurRenewal, true),

                // Amateur Club License
                (LicensesCategorySeederData.VarAmaClubNew, "Simplex", FeeConstants.Formulas.LicenseAmateurClubNew, false),
                (LicensesCategorySeederData.VarAmaClubNew, "Duplex", FeeConstants.Formulas.LicenseAmateurClubNew, false),
                (LicensesCategorySeederData.VarAmaClubRen, "Simplex", FeeConstants.Formulas.LicenseAmateurClubRenewal, true),
                (LicensesCategorySeederData.VarAmaClubRen, "Duplex", FeeConstants.Formulas.LicenseAmateurClubRenewal, true),
                #endregion
            };

            var existingElementFormulas = await context.ServiceVariantElementFormulas.IgnoreQueryFilters().ToListAsync();
            foreach (var (variantId, elementCode, formula, applySur) in elementFormulasToSeed)
            {
                if (!allVariantsInDb.Contains(variantId)) continue;
                var el = allDbElements.FirstOrDefault(e => e.Code.Equals(elementCode, StringComparison.OrdinalIgnoreCase) || e.Name.Equals(elementCode, StringComparison.OrdinalIgnoreCase));
                if (el == null) continue;

                var existingEf = existingElementFormulas.FirstOrDefault(f => f.ServiceVariantId == variantId && f.ElementId == el.Id);
                if (existingEf == null)
                {
                    context.ServiceVariantElementFormulas.Add(new ServiceVariantElementFormula
                    {
                        Id = Guid.NewGuid(),
                        ServiceVariantId = variantId,
                        ElementId = el.Id,
                        FormulaExpression = formula,
                        Description = formula,
                        ApplyLateRenewalSurcharge = applySur,
                        IsActive = true
                    });
                }
                else
                {
                    existingEf.FormulaExpression = formula;
                    existingEf.Description = formula;
                    existingEf.ApplyLateRenewalSurcharge = applySur;
                    existingEf.IsActive = true;
                }
            }

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                logger?.LogWarning(ex, "Concurrent update detected while seeding Formulas.");
            }
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Unexpected error during FastTrack fee seeding execution.");
            throw;
        }
    }
}

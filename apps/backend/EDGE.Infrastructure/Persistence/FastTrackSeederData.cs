using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence.SeederData;

namespace EDGE.Infrastructure.Persistence;

/// <summary>
/// Aggregates modular seeder definitions across all service categories.
/// Service category definitions are separated per file in SeederData/.
/// </summary>
public static class FastTrackSeederData
{
    // Re-expose contract constants for backward compatibility
    public static readonly string Ntc101Contract = ExamsCategorySeederData.Ntc101Contract;
    public static readonly string Ntc102Contract = CertificatesCategorySeederData.Ntc102Contract;
    public static readonly string Ntc103Contract = CertificatesCategorySeederData.Ntc103Contract;
    public static readonly string Ntc104Contract = LicensesCategorySeederData.Ntc104Contract;
    public static readonly string Ntc105Contract = CommonSeederData.Ntc105Contract;
    public static readonly string Ntc109Contract = PermitsCategorySeederData.Ntc109Contract;
    public static readonly string Ntc110Contract = CommonSeederData.Ntc110Contract;
    public static readonly string Ntc111Contract = LicensesCategorySeederData.Ntc111Contract;
    public static readonly string Ntc114Contract = PermitsCategorySeederData.Ntc114Contract;
    public static readonly string Ntc118Contract = AccreditationsCategorySeederData.Ntc118Contract;
    public static readonly string Ntc119Contract = CertificatesCategorySeederData.Ntc119Contract;
    public static readonly string Ntc120Contract = CertificatesCategorySeederData.Ntc120Contract;
    public static readonly string Ntc121Contract = CertificatesCategorySeederData.Ntc121Contract;
    public static readonly string Ntc122Contract = CertificatesCategorySeederData.Ntc122Contract;
    public static readonly string NtcReqComplaintsContract = RequestsAndComplaintsCategorySeederData.NtcReqComplaintsContract;

    public static Dictionary<string, string> GetContractMap()
    {
        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["NTC_1_05"] = CommonSeederData.Ntc105Contract,
            ["NTC_1_10"] = CommonSeederData.Ntc110Contract
        };

        foreach (var entry in ExamsCategorySeederData.GetContractMapEntries())
            map[entry.Key] = entry.Value;
        foreach (var entry in CertificatesCategorySeederData.GetContractMapEntries())
            map[entry.Key] = entry.Value;
        foreach (var entry in LicensesCategorySeederData.GetContractMapEntries())
            map[entry.Key] = entry.Value;
        foreach (var entry in PermitsCategorySeederData.GetContractMapEntries())
            map[entry.Key] = entry.Value;
        foreach (var entry in AccreditationsCategorySeederData.GetContractMapEntries())
            map[entry.Key] = entry.Value;
        foreach (var entry in RequestsAndComplaintsCategorySeederData.GetContractMapEntries())
            map[entry.Key] = entry.Value;

        return map;
    }

    public static List<(string Key, Guid Id, Guid CategoryId, string Name, string? Group, string Code, string Desc, string Contract)> GetServiceDefs(Dictionary<string, Guid> categoryIds)
    {
        var list = new List<ServiceCategoryDef>();
        list.AddRange(ExamsCategorySeederData.GetServiceDefs(categoryIds["Exams"]));
        list.AddRange(CertificatesCategorySeederData.GetServiceDefs(categoryIds["Certificates"]));
        list.AddRange(LicensesCategorySeederData.GetServiceDefs(categoryIds["Licenses"]));
        list.AddRange(PermitsCategorySeederData.GetServiceDefs(categoryIds["Permits"]));
        list.AddRange(AccreditationsCategorySeederData.GetServiceDefs(categoryIds["Accreditations"]));
        list.AddRange(RequestsAndComplaintsCategorySeederData.GetServiceDefs(categoryIds["RequestsAndComplaints"]));

        return list.Select(d => (d.Key, d.Id, d.CategoryId, d.Name, d.Group, d.Code, d.Desc, d.Contract)).ToList();
    }

    public static List<(Guid Id, Guid ServiceId, ServiceVariantType Type, string Description)> GetVariantDefs()
    {
        var list = new List<ServiceVariantDef>();
        list.AddRange(ExamsCategorySeederData.GetVariantDefs());
        list.AddRange(CertificatesCategorySeederData.GetVariantDefs());
        list.AddRange(LicensesCategorySeederData.GetVariantDefs());
        list.AddRange(PermitsCategorySeederData.GetVariantDefs());
        list.AddRange(AccreditationsCategorySeederData.GetVariantDefs());
        list.AddRange(RequestsAndComplaintsCategorySeederData.GetVariantDefs());

        return list.Select(v => (v.Id, v.ServiceId, v.Type, v.Description)).ToList();
    }

    public static Dictionary<string, Field> GetFieldsPool() => CommonSeederData.GetFieldsPool();

    public static List<(Guid VariantId, string Code, string Description)> GetBackfillElements()
    {
        var list = new List<VariantElementDef>();
        list.AddRange(ExamsCategorySeederData.GetBackfillElements());
        list.AddRange(CertificatesCategorySeederData.GetBackfillElements());
        list.AddRange(PermitsCategorySeederData.GetBackfillElements());
        list.AddRange(LicensesCategorySeederData.GetBackfillElements());

        return list.Select(e => (e.VariantId, e.Code, e.Description)).ToList();
    }

    public static List<(Guid ServiceId, Guid? ServiceVariantId, string Content)> GetBackfillNotes(Guid svc101)
    {
        var list = new List<ServiceNoteDef>();
        list.AddRange(ExamsCategorySeederData.GetBackfillNotes(svc101));

        return list.Select(n => (n.ServiceId, n.ServiceVariantId, n.Content)).ToList();
    }

    public static Dictionary<string, (Guid Id, string Name, string Desc)> GetBackfillRequirements()
    {
        var result = new Dictionary<string, (Guid Id, string Name, string Desc)>();

        void Merge(Dictionary<string, RequirementDef> source)
        {
            foreach (var kvp in source)
            {
                result[kvp.Key] = (kvp.Value.Id, kvp.Value.Name, kvp.Value.Desc);
            }
        }

        Merge(ExamsCategorySeederData.GetBackfillRequirements());
        Merge(CertificatesCategorySeederData.GetBackfillRequirements());
        Merge(LicensesCategorySeederData.GetBackfillRequirements());
        Merge(PermitsCategorySeederData.GetBackfillRequirements());
        Merge(AccreditationsCategorySeederData.GetBackfillRequirements());
        Merge(RequestsAndComplaintsCategorySeederData.GetBackfillRequirements());

        return result;
    }

    public static List<(Guid VariantId, Guid ReqId, bool IsRequired)> GetBackfillVariantRequirements()
    {
        var list = new List<VariantRequirementDef>();
        list.AddRange(ExamsCategorySeederData.GetBackfillVariantRequirements());
        list.AddRange(CertificatesCategorySeederData.GetBackfillVariantRequirements());
        list.AddRange(LicensesCategorySeederData.GetBackfillVariantRequirements());
        list.AddRange(PermitsCategorySeederData.GetBackfillVariantRequirements());
        list.AddRange(AccreditationsCategorySeederData.GetBackfillVariantRequirements());
        list.AddRange(RequestsAndComplaintsCategorySeederData.GetBackfillVariantRequirements());

        return list.Select(vr => (vr.VariantId, vr.ReqId, vr.IsRequired)).ToList();
    }

    public static List<ServiceFormDef> GetAllFormDefs()
    {
        var forms = new List<ServiceFormDef>();
        forms.AddRange(ExamsCategorySeederData.GetFormDefs());
        forms.AddRange(CertificatesCategorySeederData.GetFormDefs());
        forms.AddRange(LicensesCategorySeederData.GetFormDefs());
        forms.AddRange(PermitsCategorySeederData.GetFormDefs());
        forms.AddRange(AccreditationsCategorySeederData.GetFormDefs());
        forms.AddRange(RequestsAndComplaintsCategorySeederData.GetFormDefs());
        return forms;
    }
}

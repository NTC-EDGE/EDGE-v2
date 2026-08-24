using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence.SeederData;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class ServiceInformationDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var existingIds = await context.ServiceInformations
            .Select(x => x.Id)
            .ToListAsync();

        var existingServiceIds = await context.ServiceInformations
            .Select(x => x.ServiceId)
            .ToListAsync();

        var services = await context.Services.ToListAsync();
        if (!services.Any())
        {
            return;
        }

        Guid? FindServiceId(params string[] titleKeywords)
        {
            foreach (var kw in titleKeywords)
            {
                var match = services.FirstOrDefault(s =>
                    s.Name.ToLower().Contains(kw.ToLower()) ||
                    kw.ToLower().Contains(s.Name.ToLower()) ||
                    (s.Code != null && s.Code.ToLower().Contains(kw.ToLower())));
                if (match != null) return match.Id;
            }
            return null;
        }

        var allDefs = new List<ServiceInformationDef>();
        allDefs.AddRange(AccreditationsCategorySeederData.GetServiceInformations());
        allDefs.AddRange(CertificatesCategorySeederData.GetServiceInformations());
        allDefs.AddRange(ExamsCategorySeederData.GetServiceInformations());
        allDefs.AddRange(LicensesCategorySeederData.GetServiceInformations());
        allDefs.AddRange(PermitsCategorySeederData.GetServiceInformations());
        allDefs.AddRange(RequestsAndComplaintsCategorySeederData.GetServiceInformations());

        var seedList = new List<ServiceInformation>();

        foreach (var def in allDefs)
        {
            var matchedId = FindServiceId(def.Keywords);
            if (matchedId.HasValue)
            {
                seedList.Add(new ServiceInformation
                {
                    Id = def.Id,
                    ServiceId = matchedId.Value,
                    Information = def.Information,
                    WhoMayAvail = def.WhoMayAvail
                });
            }
        }

        foreach (var item in seedList)
        {
            if (existingIds.Contains(item.Id) || existingServiceIds.Contains(item.ServiceId))
            {
                continue;
            }

            context.ServiceInformations.Add(item);
            existingIds.Add(item.Id);
            existingServiceIds.Add(item.ServiceId);
        }

        await context.SaveChangesAsync();
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class FormRepository : IFormRepository
{
    private readonly ApplicationDbContext _context;

    public FormRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .Include(f => f.Sections.OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.ServiceId == serviceId, cancellationToken);
    }
}

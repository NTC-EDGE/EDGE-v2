using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceVariantFormulaRepository
{
    Task<ServiceVariantFormula?> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantFormula>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ServiceVariantFormula formula, CancellationToken cancellationToken = default);
    void Delete(ServiceVariantFormula formula);

    Task<ServiceVariantElementFormula?> GetElementFormulaAsync(Guid serviceVariantId, Guid elementId, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantElementFormula>> GetAllElementFormulasAsync(CancellationToken cancellationToken = default);
    Task AddElementFormulaAsync(ServiceVariantElementFormula formula, CancellationToken cancellationToken = default);
    void DeleteElementFormula(ServiceVariantElementFormula formula);
}

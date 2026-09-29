using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Receipts.Services;

public record ValidatedCustodian(
    Guid UserId,
    string FullName,
    bool IsPrimary,
    User User,
    TenantMember Membership
);

public class CashierCustodianValidationResult
{
    public bool Succeeded { get; private init; }
    public string? ErrorMessage { get; private init; }
    public List<ValidatedCustodian> ValidatedCustodians { get; private init; } = [];

    public static CashierCustodianValidationResult Success(List<ValidatedCustodian> custodians) =>
        new() { Succeeded = true, ValidatedCustodians = custodians };

    public static CashierCustodianValidationResult Failure(string errorMessage) =>
        new() { Succeeded = false, ErrorMessage = errorMessage };
}

public interface ICashierCustodianValidator
{
    Task<CashierCustodianValidationResult> ValidateCustodiansAsync(
        Guid tenantId,
        IEnumerable<Guid> userIdsToAssign,
        Guid? preferredPrimaryUserId,
        CancellationToken cancellationToken);
}

public class CashierCustodianValidator : ICashierCustodianValidator
{
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;

    public CashierCustodianValidator(
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository)
    {
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
    }

    public async Task<CashierCustodianValidationResult> ValidateCustodiansAsync(
        Guid tenantId,
        IEnumerable<Guid> userIdsToAssign,
        Guid? preferredPrimaryUserId,
        CancellationToken cancellationToken)
    {
        var distinctUserIds = userIdsToAssign.Where(id => id != Guid.Empty).Distinct().ToList();

        if (distinctUserIds.Count == 0)
        {
            return CashierCustodianValidationResult.Failure("Please select at least one authorized Cashier to assign this booklet series.");
        }

        Guid primaryUserId = preferredPrimaryUserId.HasValue && preferredPrimaryUserId.Value != Guid.Empty && distinctUserIds.Contains(preferredPrimaryUserId.Value)
            ? preferredPrimaryUserId.Value
            : distinctUserIds.First();

        var validatedList = new List<ValidatedCustodian>();

        foreach (var userId in distinctUserIds)
        {
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return CashierCustodianValidationResult.Failure($"Cashier user '{userId}' was not found.");
            }

            var membership = await _tenantMemberRepository.GetByTenantAndUserAsync(tenantId, userId, cancellationToken);
            if (membership == null)
            {
                return CashierCustodianValidationResult.Failure($"Cashier '{user.FirstName} {user.LastName}' must belong to this regional office / tenant.");
            }

            if (!CashierCustodianPolicy.IsAuthorizedCashier(user, membership))
            {
                var roleDisplayName = membership.Role?.Name ?? membership.Position ?? "User";
                return CashierCustodianValidationResult.Failure($"User '{user.FirstName} {user.LastName}' has the role '{roleDisplayName}' and is not authorized to hold Official Receipt booklets. Only Cashiers can be assigned.");
            }

            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            validatedList.Add(new ValidatedCustodian(
                userId,
                fullName,
                userId == primaryUserId,
                user,
                membership
            ));
        }

        return CashierCustodianValidationResult.Success(validatedList);
    }
}

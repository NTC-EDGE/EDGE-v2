using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Commands.BankAccounts.UpdateAgencyBankAccount;

public record UpdateAgencyBankAccountCommand(
    Guid Id,
    string BankName,
    string AccountName,
    string AccountNumber,
    string? Branch = null,
    string? FundCluster = null,
    bool IsActive = true,
    string? Remarks = null
) : IRequest<ApiResponse<AgencyBankAccountDto>>;

public class UpdateAgencyBankAccountCommandValidator : AbstractValidator<UpdateAgencyBankAccountCommand>
{
    public UpdateAgencyBankAccountCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Bank account Id is required.");
        RuleFor(x => x.BankName).NotEmpty().MaximumLength(150).WithMessage("Bank name is required.");
        RuleFor(x => x.AccountName).NotEmpty().MaximumLength(200).WithMessage("Account name is required.");
        RuleFor(x => x.AccountNumber).NotEmpty().MaximumLength(100).WithMessage("Account number is required.");
        RuleFor(x => x.FundCluster).MaximumLength(100).WithMessage("Fund cluster must not exceed 100 characters.");
    }
}

public class UpdateAgencyBankAccountCommandHandler : IRequestHandler<UpdateAgencyBankAccountCommand, ApiResponse<AgencyBankAccountDto>>
{
    private readonly IAgencyBankAccountRepository _bankAccountRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAgencyBankAccountCommandHandler(
        IAgencyBankAccountRepository bankAccountRepository,
        IUnitOfWork unitOfWork)
    {
        _bankAccountRepository = bankAccountRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<AgencyBankAccountDto>> Handle(UpdateAgencyBankAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (account == null)
        {
            return ApiResponse<AgencyBankAccountDto>.Fail("Agency bank account not found.");
        }

        var exists = await _bankAccountRepository.ExistsAccountNumberAsync(account.TenantId, request.AccountNumber.Trim(), account.Id, cancellationToken);
        if (exists)
        {
            return ApiResponse<AgencyBankAccountDto>.Fail($"Account number '{request.AccountNumber}' is already in use by another account.");
        }

        account.BankName = request.BankName.Trim();
        account.AccountName = request.AccountName.Trim();
        account.AccountNumber = request.AccountNumber.Trim();
        account.Branch = request.Branch?.Trim();
        account.FundCluster = string.IsNullOrWhiteSpace(request.FundCluster) ? "01" : request.FundCluster.Trim();
        account.IsActive = request.IsActive;
        account.Remarks = request.Remarks?.Trim();

        await _bankAccountRepository.UpdateAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new AgencyBankAccountDto(
            account.Id,
            account.TenantId,
            account.BankName,
            account.AccountName,
            account.AccountNumber,
            account.Branch,
            account.FundCluster,
            account.IsActive,
            account.Remarks
        );

        return ApiResponse<AgencyBankAccountDto>.Success(dto, "Agency bank account updated successfully.");
    }
}

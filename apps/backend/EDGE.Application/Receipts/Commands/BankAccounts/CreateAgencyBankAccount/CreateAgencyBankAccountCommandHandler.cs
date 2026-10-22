using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Commands.BankAccounts.CreateAgencyBankAccount;

public record CreateAgencyBankAccountCommand(
    Guid TenantId,
    string BankName,
    string AccountName,
    string AccountNumber,
    string? Branch = null,
    string? FundCluster = null,
    bool IsActive = true,
    string? Remarks = null
) : IRequest<ApiResponse<AgencyBankAccountDto>>;

public class CreateAgencyBankAccountCommandValidator : AbstractValidator<CreateAgencyBankAccountCommand>
{
    public CreateAgencyBankAccountCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.BankName).NotEmpty().MaximumLength(150).WithMessage("Bank name is required.");
        RuleFor(x => x.AccountName).NotEmpty().MaximumLength(200).WithMessage("Account name is required.");
        RuleFor(x => x.AccountNumber).NotEmpty().MaximumLength(100).WithMessage("Account number is required.");
        RuleFor(x => x.FundCluster).MaximumLength(100).WithMessage("Fund cluster must not exceed 100 characters.");
    }
}

public class CreateAgencyBankAccountCommandHandler : IRequestHandler<CreateAgencyBankAccountCommand, ApiResponse<AgencyBankAccountDto>>
{
    private readonly IAgencyBankAccountRepository _bankAccountRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAgencyBankAccountCommandHandler(
        IAgencyBankAccountRepository bankAccountRepository,
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _bankAccountRepository = bankAccountRepository;
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<AgencyBankAccountDto>> Handle(CreateAgencyBankAccountCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<AgencyBankAccountDto>.Fail("Tenant not found.");
        }

        var exists = await _bankAccountRepository.ExistsAccountNumberAsync(request.TenantId, request.AccountNumber.Trim(), null, cancellationToken);
        if (exists)
        {
            return ApiResponse<AgencyBankAccountDto>.Fail($"Account number '{request.AccountNumber}' already exists for this tenant.");
        }

        var account = new AgencyBankAccount
        {
            TenantId = request.TenantId,
            BankName = request.BankName.Trim(),
            AccountName = request.AccountName.Trim(),
            AccountNumber = request.AccountNumber.Trim(),
            Branch = request.Branch?.Trim(),
            FundCluster = string.IsNullOrWhiteSpace(request.FundCluster) ? "01" : request.FundCluster.Trim(),
            IsActive = request.IsActive,
            Remarks = request.Remarks?.Trim()
        };

        await _bankAccountRepository.AddAsync(account, cancellationToken);
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

        return ApiResponse<AgencyBankAccountDto>.Success(dto, "Agency bank account registered successfully.");
    }
}

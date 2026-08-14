using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.GenerateSoa;

public class GenerateSoaCommandHandler : IRequestHandler<GenerateSoaCommand, ApiResponse<List<Guid>>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IServiceFeeRepository _serviceFeeRepository;
    private readonly IServiceVariantFeeRepository _serviceVariantFeeRepository;
    private readonly IServiceVariantElementFeeRepository _serviceVariantElementFeeRepository;
    private readonly IElementRepository _elementRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public GenerateSoaCommandHandler(
        IApplicationFullRepository applicationRepository,
        IServiceFeeRepository serviceFeeRepository,
        IServiceVariantFeeRepository serviceVariantFeeRepository,
        IServiceVariantElementFeeRepository serviceVariantElementFeeRepository,
        IElementRepository elementRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _applicationRepository = applicationRepository;
        _serviceFeeRepository = serviceFeeRepository;
        _serviceVariantFeeRepository = serviceVariantFeeRepository;
        _serviceVariantElementFeeRepository = serviceVariantElementFeeRepository;
        _elementRepository = elementRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<List<Guid>>> Handle(GenerateSoaCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<List<Guid>>.Fail("Application not found.");
        }

        var applicants = app.ApplicationApplicants
            .OrderBy(aa => aa.SequenceOrder)
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a => a!)
            .ToList();

        if (applicants.Count == 0)
        {
            return ApiResponse<List<Guid>>.Fail("Application has no applicants.");
        }

        var incompleteApplicants = applicants.Where(a => a.Status != ApplicantStatus.Complete).ToList();
        if (incompleteApplicants.Any())
        {
            return ApiResponse<List<Guid>>.Fail("Cannot generate SOA: All applicants must have status 'Complete'.");
        }

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Evaluator", cancellationToken);
        var generatedSoaIds = new List<Guid>();

        foreach (var applicant in applicants)
        {
            // Check if active SOA already exists for this applicant
            var existingSoa = app.StatementsOfAccount.FirstOrDefault(s => s.ApplicantId == applicant.Id);
            if (existingSoa != null)
            {
                generatedSoaIds.Add(existingSoa.Id);
                continue;
            }

            var lineItems = new List<SoaLineItem>();

            // 1. Resolve Service-level fees
            if (applicant.ServiceId.HasValue && applicant.ServiceId.Value != Guid.Empty)
            {
                var serviceFees = await _serviceFeeRepository.GetAllAsync(applicant.ServiceId.Value, null, true, cancellationToken);
                foreach (var sf in serviceFees.Where(sf => sf.ServiceVariantId == null && sf.ServiceVariantElementId == null))
                {
                    lineItems.Add(new SoaLineItem
                    {
                        Id = Guid.NewGuid(),
                        Particular = sf.Fee?.Name ?? "Service Fee",
                        ItemCode = sf.Fee?.Code ?? "SRV-FEE",
                        Description = sf.Fee?.Description,
                        ValidityYears = 1,
                        NoOfUnits = 1,
                        FeeRate = sf.Amount,
                        Amount = sf.Amount
                    });
                }
            }

            // 2. Resolve Service Variant-level fees
            if (applicant.ServiceVariantId.HasValue && applicant.ServiceVariantId.Value != Guid.Empty)
            {
                var variantFees = await _serviceVariantFeeRepository.GetByServiceVariantIdAsync(applicant.ServiceVariantId.Value, cancellationToken);
                foreach (var vf in variantFees)
                {
                    lineItems.Add(new SoaLineItem
                    {
                        Id = Guid.NewGuid(),
                        Particular = vf.Fee?.Name ?? $"{applicant.ServiceVariant?.Type} Fee",
                        ItemCode = vf.Fee?.Code ?? "VAR-FEE",
                        Description = vf.Fee?.Description,
                        ValidityYears = 1,
                        NoOfUnits = 1,
                        FeeRate = vf.Amount,
                        Amount = vf.Amount
                    });
                }

                // Also check ServiceFee configured for variant
                if (applicant.ServiceId.HasValue)
                {
                    var allServiceFees = await _serviceFeeRepository.GetAllAsync(applicant.ServiceId.Value, null, true, cancellationToken);
                    foreach (var sf in allServiceFees.Where(sf => sf.ServiceVariantId == applicant.ServiceVariantId.Value && sf.ServiceVariantElementId == null))
                    {
                        lineItems.Add(new SoaLineItem
                        {
                            Id = Guid.NewGuid(),
                            Particular = sf.Fee?.Name ?? $"{applicant.ServiceVariant?.Type} Service Fee",
                            ItemCode = sf.Fee?.Code ?? "VAR-SRV-FEE",
                            Description = sf.Fee?.Description,
                            ValidityYears = 1,
                            NoOfUnits = 1,
                            FeeRate = sf.Amount,
                            Amount = sf.Amount
                        });
                    }
                }

                // 3. Resolve Element-level fees
                var variantElementFees = await _serviceVariantElementFeeRepository.GetByServiceVariantIdAsync(applicant.ServiceVariantId.Value, cancellationToken);
                if (variantElementFees.Any())
                {
                    // Find elements selected in form submission field values
                    var submission = applicant.FormSubmission ?? app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == applicant.Id);
                    var formValues = submission?.FieldValues ?? new List<FormFieldValue>();

                    var matchingElementFees = new List<ServiceVariantElementFee>();

                    if (formValues.Any())
                    {
                        foreach (var svef in variantElementFees)
                        {
                            var elementCode = svef.Element?.Code;
                            var elementName = svef.Element?.Name;

                            bool isSelected = formValues.Any(fv =>
                                (!string.IsNullOrWhiteSpace(elementCode) && (fv.Value.Contains(elementCode, StringComparison.OrdinalIgnoreCase) || fv.CustomLabel?.Contains(elementCode, StringComparison.OrdinalIgnoreCase) == true)) ||
                                (!string.IsNullOrWhiteSpace(elementName) && (fv.Value.Contains(elementName, StringComparison.OrdinalIgnoreCase) || fv.CustomLabel?.Contains(elementName, StringComparison.OrdinalIgnoreCase) == true)) ||
                                fv.Value.Contains(svef.ElementId.ToString(), StringComparison.OrdinalIgnoreCase)
                            );

                            if (isSelected)
                            {
                                matchingElementFees.Add(svef);
                            }
                        }
                    }

                    // If elements were matched from form fields, add them
                    foreach (var ef in matchingElementFees)
                    {
                        lineItems.Add(new SoaLineItem
                        {
                            Id = Guid.NewGuid(),
                            Particular = ef.Fee?.Name ?? $"Element Fee ({ef.Element?.Name ?? ef.Element?.Code})",
                            ItemCode = ef.Fee?.Code ?? ef.Element?.Code ?? "ELEM-FEE",
                            Description = ef.Element?.Description ?? ef.Fee?.Description,
                            ValidityYears = 1,
                            NoOfUnits = 1,
                            FeeRate = ef.Amount,
                            Amount = ef.Amount
                        });
                    }
                }
            }

            // Note: If no matching fees configured, lineItems remains empty (0 items) with TotalAmount = 0.

            var issuedToName = $"{applicant.ApplicantDetail?.FirstName} {applicant.ApplicantDetail?.LastName}".Trim();
            if (string.IsNullOrEmpty(issuedToName))
            {
                issuedToName = applicant.CompanyDetail?.Name ?? app.User?.CompanyDetail?.Name ?? $"{app.User?.FirstName} {app.User?.LastName}".Trim();
                if (string.IsNullOrEmpty(issuedToName))
                {
                    issuedToName = "Applicant";
                }
            }

            var issuedToAddress = applicant.ApplicantDetail?.Address 
                ?? applicant.CompanyDetail?.Address 
                ?? app.User?.CompanyDetail?.Address 
                ?? app.Office;

            var soa = new StatementOfAccount
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                ApplicantId = applicant.Id,
                SoaNumber = $"SOA-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                Status = SoaStatus.Pending,
                IssuedToType = applicant.ApplicantType == ApplicantType.Company ? IssuedToType.Company : IssuedToType.Individual,
                IssuedToName = issuedToName,
                IssuedToAddress = issuedToAddress,
                DueDate = DateTime.UtcNow.AddDays(30),
                PreparedByUserId = userContext.UserId,
                TotalAmount = lineItems.Sum(li => li.Amount),
                LineItems = lineItems
            };

            foreach (var li in lineItems)
            {
                li.StatementOfAccountId = soa.Id;
            }

            soa.Histories.Add(new SoaHistory
            {
                Id = Guid.NewGuid(),
                StatementOfAccountId = soa.Id,
                Action = $"SOA generated for applicant {soa.IssuedToName}",
                ToStatus = SoaStatus.Pending,
                PerformedByUserId = userContext.UserId,
                StaffName = userContext.StaffName,
                StaffRole = userContext.StaffRole,
                Timestamp = DateTime.UtcNow
            });

            await _applicationRepository.AddSoaAsync(soa, cancellationToken);
            generatedSoaIds.Add(soa.Id);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<List<Guid>>.Success(generatedSoaIds, $"{generatedSoaIds.Count} Statement(s) of Account generated successfully.");
    }
}

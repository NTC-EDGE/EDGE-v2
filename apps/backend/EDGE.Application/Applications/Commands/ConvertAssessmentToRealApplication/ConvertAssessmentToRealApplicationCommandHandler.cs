using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ConvertAssessmentToRealApplication;

public class ConvertAssessmentToRealApplicationCommandHandler
    : IRequestHandler<ConvertAssessmentToRealApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IApplicantRepository? _applicantRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ConvertAssessmentToRealApplicationCommandHandler> _logger;

    public ConvertAssessmentToRealApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILogger<ConvertAssessmentToRealApplicationCommandHandler> logger,
        IApplicantRepository? applicantRepository = null)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _logger = logger;
        _applicantRepository = applicantRepository;
    }

    public async Task<ApiResponse<Guid>> Handle(
        ConvertAssessmentToRealApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var sourceApp = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken)
                        ?? await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (sourceApp == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        if (sourceApp.Intent == ApplicationIntent.Regular)
        {
            return ApiResponse<Guid>.Fail("This application is already filed as an official/real application.");
        }

        var existingOfficialApp = sourceApp.Renewals?
            .FirstOrDefault(r => !r.IsDeleted && r.Intent == ApplicationIntent.Regular && r.Status != ApplicationStatus.Draft);
        if (existingOfficialApp != null)
        {
            return ApiResponse<Guid>.Success(
                existingOfficialApp.Id,
                "An official application has already been created from this pre-assessment.");
        }

        var currentUserIdStr = _currentUserService.UserId;
        Guid? actingUserId = null;
        if (!string.IsNullOrEmpty(currentUserIdStr))
        {
            var parsed = Guid.TryParse(currentUserIdStr, out var g) ? g : CreateGuidFromString(currentUserIdStr);
            if (await _applicationRepository.UserExistsAsync(parsed, cancellationToken))
            {
                actingUserId = parsed;
            }
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var newAppNumber = $"APP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
            var newRefNumber = $"REF-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
            var sourceRefLabel = sourceApp.ReferenceNumber ?? sourceApp.ApplicationNumber ?? sourceApp.Id.ToString()[..8].ToUpper();

            // 1. Keep the source Pre-Assessment application as Completed & AssessmentOnly
            sourceApp.Intent = ApplicationIntent.AssessmentOnly;
            if (sourceApp.Status != ApplicationStatus.Completed)
            {
                sourceApp.Status = ApplicationStatus.Completed;
            }
            sourceApp.ConvertedToRegularAt = DateTime.UtcNow;
            await _applicationRepository.UpdateAsync(sourceApp, cancellationToken);

            // 2. Create a brand-new Official Application starting at Submitted (Evaluator queue)
            var newApp = new Domain.Entities.Application
            {
                Id = Guid.NewGuid(),
                TenantId = sourceApp.TenantId,
                ScheduleId = sourceApp.ScheduleId,
                RegionId = sourceApp.RegionId,
                Office = sourceApp.Office,
                ApplicationNumber = newAppNumber,
                ReferenceNumber = newRefNumber,
                Status = ApplicationStatus.Submitted,
                Intent = ApplicationIntent.Regular,
                SubmissionMode = sourceApp.SubmissionMode,
                DataEntryMethod = sourceApp.DataEntryMethod ?? DataEntryMethod.Manual,
                UserId = sourceApp.UserId ?? actingUserId,
                IsGuest = sourceApp.IsGuest,
                RenewedFromApplicationId = sourceApp.Id,
                Remarks = $"Official application submitted from Pre-Assessment #{sourceRefLabel}."
            };

            await _applicationRepository.AddAsync(newApp, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 3. Clone Applicants, ApplicantDetails, and CompanyDetails for the new application
            var oldToNewApplicantIds = new Dictionary<Guid, Guid>();
            var sourceApplicants = (sourceApp.ApplicationApplicants ?? new List<ApplicationApplicant>())
                .OrderBy(aa => aa.SequenceOrder)
                .ToList();

            string submitterDisplayName = _currentUserService.Email ?? "Applicant";
            int seq = 1;

            foreach (var srcAppApplicant in sourceApplicants)
            {
                var srcApplicant = srcAppApplicant.Applicant;
                if (srcApplicant == null) continue;

                ApplicantDetail? clonedDetail = null;
                if (srcApplicant.ApplicantDetail != null)
                {
                    var srcDetail = srcApplicant.ApplicantDetail;
                    CompanyDetail? detailCompany = null;
                    if (srcDetail.CompanyDetail != null)
                    {
                        detailCompany = new CompanyDetail
                        {
                            Id = Guid.NewGuid(),
                            BarangayId = srcDetail.CompanyDetail.BarangayId,
                            Address = srcDetail.CompanyDetail.Address,
                            Name = srcDetail.CompanyDetail.Name,
                            RegistrationNumber = srcDetail.CompanyDetail.RegistrationNumber,
                            ContactNumber = srcDetail.CompanyDetail.ContactNumber,
                            Email = srcDetail.CompanyDetail.Email,
                            EntityType = srcDetail.CompanyDetail.EntityType
                        };
                        if (_applicantRepository != null)
                        {
                            await _applicantRepository.AddCompanyDetailAsync(detailCompany, cancellationToken);
                        }
                        else
                        {
                            await _applicationRepository.AddCompanyDetailAsync(detailCompany, cancellationToken);
                        }
                    }

                    clonedDetail = new ApplicantDetail
                    {
                        Id = Guid.NewGuid(),
                        BarangayId = srcDetail.BarangayId,
                        CompanyDetailId = detailCompany?.Id,
                        CompanyDetail = detailCompany,
                        Address = srcDetail.Address,
                        FirstName = srcDetail.FirstName,
                        MiddleName = srcDetail.MiddleName,
                        LastName = srcDetail.LastName,
                        Suffix = srcDetail.Suffix,
                        Nationality = srcDetail.Nationality,
                        Sex = srcDetail.Sex,
                        Height = srcDetail.Height,
                        Weight = srcDetail.Weight,
                        BirthDate = srcDetail.BirthDate,
                        EmailAddress = srcDetail.EmailAddress,
                        ContactNumber = srcDetail.ContactNumber,
                        ZipCode = srcDetail.ZipCode,
                        SchoolAttended = srcDetail.SchoolAttended,
                        CourseTaken = srcDetail.CourseTaken,
                        YearGraduated = srcDetail.YearGraduated,
                        ESignature = srcDetail.ESignature
                    };

                    if (_applicantRepository != null)
                    {
                        await _applicantRepository.AddApplicantDetailAsync(clonedDetail, cancellationToken);
                    }

                    var candidateName = $"{srcDetail.FirstName} {srcDetail.LastName}".Trim();
                    if (seq == 1 && !string.IsNullOrWhiteSpace(candidateName))
                    {
                        submitterDisplayName = candidateName;
                    }
                }

                CompanyDetail? clonedCompany = null;
                if (srcApplicant.CompanyDetail != null)
                {
                    var srcComp = srcApplicant.CompanyDetail;
                    clonedCompany = new CompanyDetail
                    {
                        Id = Guid.NewGuid(),
                        BarangayId = srcComp.BarangayId,
                        Address = srcComp.Address,
                        Name = srcComp.Name,
                        RegistrationNumber = srcComp.RegistrationNumber,
                        ContactNumber = srcComp.ContactNumber,
                        Email = srcComp.Email,
                        EntityType = srcComp.EntityType
                    };
                    if (_applicantRepository != null)
                    {
                        await _applicantRepository.AddCompanyDetailAsync(clonedCompany, cancellationToken);
                    }
                    else
                    {
                        await _applicationRepository.AddCompanyDetailAsync(clonedCompany, cancellationToken);
                    }

                    if (seq == 1 && submitterDisplayName == (_currentUserService.Email ?? "Applicant") && !string.IsNullOrWhiteSpace(srcComp.Name))
                    {
                        submitterDisplayName = srcComp.Name.Trim();
                    }
                }

                var newApplicant = new Applicant
                {
                    Id = Guid.NewGuid(),
                    TenantId = srcApplicant.TenantId != Guid.Empty ? srcApplicant.TenantId : newApp.TenantId,
                    UserId = srcApplicant.UserId ?? newApp.UserId,
                    IsGuest = srcApplicant.IsGuest,
                    ApplicantType = srcApplicant.ApplicantType,
                    ApplicantDetailId = clonedDetail?.Id,
                    ApplicantDetail = clonedDetail,
                    CompanyDetailId = clonedCompany?.Id,
                    CompanyDetail = clonedCompany,
                    Status = ApplicantStatus.Complete,
                    ServiceId = srcApplicant.ServiceId,
                    ServiceVariantId = srcApplicant.ServiceVariantId
                };

                if (_applicantRepository != null)
                {
                    await _applicantRepository.AddApplicantAsync(newApplicant, cancellationToken);
                }

                oldToNewApplicantIds[srcApplicant.Id] = newApplicant.Id;

                var newAppApplicant = new ApplicationApplicant
                {
                    ApplicationId = newApp.Id,
                    ApplicantId = newApplicant.Id,
                    Applicant = newApplicant,
                    SequenceOrder = srcAppApplicant.SequenceOrder > 0 ? srcAppApplicant.SequenceOrder : seq
                };
                await _applicationRepository.AddApplicationApplicantAsync(newAppApplicant, cancellationToken);
                seq++;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 4. Clone FormSubmissions and FormFieldValues
            var allSourceSubmissions = (sourceApp.FormSubmissions ?? new List<FormSubmission>())
                .Concat(sourceApplicants.Where(aa => aa.Applicant?.FormSubmission != null).Select(aa => aa.Applicant!.FormSubmission!))
                .GroupBy(fs => fs.Id)
                .Select(g => g.First())
                .ToList();

            var clonedApplicantSubmissionSet = new HashSet<Guid>();
            var defaultNewApplicantId = oldToNewApplicantIds.Values.FirstOrDefault();

            foreach (var srcSubmission in allSourceSubmissions)
            {
                Guid targetNewApplicantId = Guid.Empty;
                if (oldToNewApplicantIds.TryGetValue(srcSubmission.ApplicantId, out var mappedApplicantId))
                {
                    targetNewApplicantId = mappedApplicantId;
                }
                else if (defaultNewApplicantId != Guid.Empty)
                {
                    targetNewApplicantId = defaultNewApplicantId;
                }

                if (targetNewApplicantId == Guid.Empty || !clonedApplicantSubmissionSet.Add(targetNewApplicantId))
                {
                    continue;
                }

                var newSubmission = new FormSubmission
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = newApp.Id,
                    FormId = srcSubmission.FormId,
                    ApplicantId = targetNewApplicantId
                };
                await _applicationRepository.AddFormSubmissionAsync(newSubmission, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var distinctFieldValues = (srcSubmission.FieldValues ?? new List<FormFieldValue>())
                    .GroupBy(fv => fv.FieldId)
                    .Select(g => g.Last())
                    .ToList();

                foreach (var srcFv in distinctFieldValues)
                {
                    await _applicationRepository.AddFormFieldValueAsync(new FormFieldValue
                    {
                        Id = Guid.NewGuid(),
                        FormSubmissionId = newSubmission.Id,
                        FieldId = srcFv.FieldId,
                        CustomLabel = srcFv.CustomLabel,
                        Value = srcFv.Value
                    }, cancellationToken);
                }
            }

            // 5. Clone ApplicationRequirements (preserving StoredFileId & requirement links, resetting IsApproved for official evaluation)
            var sourceRequirements = (sourceApp.ApplicationRequirements ?? new List<ApplicationRequirement>())
                .Where(r => !r.IsDeleted)
                .ToList();

            foreach (var srcReq in sourceRequirements)
            {
                Guid targetNewApplicantId = defaultNewApplicantId;
                if (oldToNewApplicantIds.TryGetValue(srcReq.ApplicantId, out var mappedApplicantId))
                {
                    targetNewApplicantId = mappedApplicantId;
                }

                if (targetNewApplicantId == Guid.Empty) continue;

                var newReq = new ApplicationRequirement
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = newApp.Id,
                    ApplicantId = targetNewApplicantId,
                    RequirementId = srcReq.RequirementId,
                    ServiceVariantRequirementId = srcReq.ServiceVariantRequirementId,
                    StoredFileId = srcReq.StoredFileId,
                    TenantId = srcReq.TenantId != Guid.Empty ? srcReq.TenantId : newApp.TenantId,
                    Url = srcReq.Url,
                    IsApproved = false
                };
                await _applicationRepository.AddApplicationRequirementAsync(newReq, cancellationToken);
            }

            // 6. Log history on the original Pre-Assessment application
            var sourceHistoryRemarks = !string.IsNullOrWhiteSpace(request.Remarks)
                ? request.Remarks
                : $"Proceeded from Pre-Assessment. New Official Application #{newRefNumber} created and submitted for evaluation.";

            await _applicationRepository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = sourceApp.Id,
                Action = "Official Application Created from Assessment",
                FromStatus = sourceApp.Status,
                ToStatus = sourceApp.Status,
                PerformedByUserId = actingUserId,
                StaffName = submitterDisplayName,
                StaffRole = "Applicant",
                Remarks = sourceHistoryRemarks,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            // 7. Log status history and application history on the new Official Application
            await _applicationRepository.AddApplicationStatusHistoryAsync(new ApplicationStatusHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = newApp.Id,
                Status = ApplicationStatus.Submitted,
                Remarks = $"Initial submission created from Pre-Assessment #{sourceRefLabel}",
                Timestamp = DateTime.UtcNow,
                UserId = actingUserId
            }, cancellationToken);

            await _applicationRepository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = newApp.Id,
                Action = "Application submitted by applicant",
                FromStatus = null,
                ToStatus = ApplicationStatus.Submitted,
                PerformedByUserId = actingUserId,
                StaffName = submitterDisplayName,
                StaffRole = "Applicant",
                Remarks = $"Official application created from Pre-Assessment #{sourceRefLabel} and submitted for evaluation.",
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(
                newApp.Id,
                "Official application created and submitted for evaluation.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create official application from assessment '{ApplicationId}'.", request.ApplicationId);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during application conversion for ApplicationId '{ApplicationId}'.", request.ApplicationId);
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while creating the official application. Please try again later.");
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}


using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Reports.DTOs;
using EDGE.Application.Reports.Queries.GenerateStatutoryReportPdf;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Reports;

public class GenerateStatutoryReportPdfQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _appRepo = new();
    private readonly Mock<ITenantRepository> _tenantRepo = new();
    private readonly Mock<IFieldOfficeRepository> _fieldOfficeRepo = new();
    private readonly Mock<IOfficialReceiptRepository> _receiptRepo = new();
    private readonly Mock<IBankDepositRepository> _depositRepo = new();
    private readonly Mock<IFeedbackRepository> _feedbackRepo = new();
    private readonly Mock<ITenantContextService> _tenantContext = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<ITenantMemberRepository> _memberRepo = new();
    private readonly Mock<IRegionalConfigurationService> _regionalConfig = new();
    private readonly Mock<IStatutoryReportPdfGenerator> _pdfGenerator = new();

    private GenerateStatutoryReportPdfQueryHandler CreateHandler() => new(
        _appRepo.Object,
        _tenantRepo.Object,
        _fieldOfficeRepo.Object,
        _receiptRepo.Object,
        _depositRepo.Object,
        _feedbackRepo.Object,
        _tenantContext.Object,
        _currentUser.Object,
        _userRepo.Object,
        _memberRepo.Object,
        _regionalConfig.Object,
        _pdfGenerator.Object);

    [Fact]
    public async Task Handle_ShouldPreserveExactConfiguredCodesAndTenantName_WithoutHardcodedRewrites()
    {
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        StatutoryReportDocumentData? captured = null;

        _currentUser.SetupGet(x => x.UserId).Returns(userId.ToString());
        _tenantContext.Setup(x => x.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _tenantRepo.Setup(x => x.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Code = "07", Name = "Region VII - Central Visayas" });
        _regionalConfig.Setup(x => x.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto
            {
                TenantId = tenantId,
                TenantCode = "07",
                TenantName = "Region VII - Central Visayas",
                RcCodeSoa = "07",
                RcCodeOp = "07",
                FundCluster = "01",
                MfoPapCode = "310100100001000",
                ReportSignatories = new ReportSignatoriesDto
                {
                    RegionalDirectorName = "ENGR. DIRECTOR VII",
                    RegionalDirectorTitle = "Regional Director"
                }
            });
        _fieldOfficeRepo.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FieldOffice>());
        _userRepo.Setup(x => x.ResolveCurrentUserAsync(_currentUser.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { Id = userId, FirstName = "Juan", LastName = "Officer" });
        _appRepo.Setup(x => x.GetPagedApplicationSummaryDtosAsync(
                null, null, null, null, null,
                It.IsAny<int>(), It.IsAny<int>(),
                null, null, tenantId, null, null, null, null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedApplicationListDto
            {
                Items = new List<ApplicationSummaryDto>(),
                TotalCount = 0,
                PageNumber = 1,
                PageSize = 1000
            });
        _tenantRepo.Setup(x => x.GetTenantTransactionsAsync(
                tenantId, null, It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<TenantTransactionDto>(), 0));
        _receiptRepo.Setup(x => x.GetByTenantAsync(
                tenantId, null, null, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OfficialReceipt>());
        _depositRepo.Setup(x => x.GetByTenantAsync(
                tenantId, null, null, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BankDeposit>());
        _pdfGenerator.Setup(x => x.GeneratePdf(It.IsAny<StatutoryReportDocumentData>()))
            .Callback<StatutoryReportDocumentData>(d => captured = d)
            .Returns(new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D });

        var handler = CreateHandler();
        var result = await handler.Handle(
            new GenerateStatutoryReportPdfQuery(Code: "NTC-COA-APP26-M", TenantId: tenantId),
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        captured.Should().NotBeNull();
        captured!.TenantName.Should().Be("Region VII - Central Visayas");
        captured.FundCluster.Should().Be("01"); // Not rewritten to "01101101"
        captured.ResponsibilityCenterCode.Should().Be("07"); // Not defaulted to "61"
        captured.MfoPapCode.Should().Be("310100100001000");
        captured.Signatories.RegionalDirectorName.Should().Be("ENGR. DIRECTOR VII");
    }

    [Fact]
    public async Task Handle_ShouldReturnForbidden_WhenUserIsNotMemberOfRequestedTenant()
    {
        var tenantId = Guid.NewGuid();
        _currentUser.SetupGet(x => x.UserId).Returns(Guid.NewGuid().ToString());
        _tenantContext.Setup(x => x.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _tenantContext.Setup(x => x.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var handler = CreateHandler();
        var result = await handler.Handle(
            new GenerateStatutoryReportPdfQuery(Code: "NTC-MIS-OPS", TenantId: tenantId),
            CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().StartWith("403");
    }

    [Fact]
    public async Task Validator_ShouldReject_WhenEndDateIsBeforeStartDate()
    {
        var validator = new GenerateStatutoryReportPdfQueryValidator();
        var query = new GenerateStatutoryReportPdfQuery(
            Code: "NTC-MIS-OPS",
            StartDate: new DateTime(2026, 5, 10),
            EndDate: new DateTime(2026, 5, 1));

        var validation = await validator.ValidateAsync(query);

        validation.IsValid.Should().BeFalse();
        validation.Errors.Should().Contain(e => e.PropertyName == "EndDate");
    }

    [Fact]
    public async Task Validator_ShouldReject_InvalidReportFormat()
    {
        var validator = new GenerateStatutoryReportPdfQueryValidator();
        var query = new GenerateStatutoryReportPdfQuery(
            Code: "NTC-BTR-INC-01",
            Format: "invalid-format");

        var validation = await validator.ValidateAsync(query);

        validation.IsValid.Should().BeFalse();
        validation.Errors.Should().Contain(e => e.PropertyName == "Format");
    }

    [Fact]
    public async Task Handle_NtcAppSumEnt_NtcSheetFormat_ShouldIncludeOnlyCompletedApplications()
    {
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        StatutoryReportDocumentData? captured = null;

        _currentUser.SetupGet(x => x.UserId).Returns(userId.ToString());
        _tenantContext.Setup(x => x.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _tenantRepo.Setup(x => x.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Code = "07", Name = "Region VII" });
        _regionalConfig.Setup(x => x.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto { TenantId = tenantId, TenantName = "Region VII" });
        _fieldOfficeRepo.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FieldOffice>());
        _userRepo.Setup(x => x.ResolveCurrentUserAsync(_currentUser.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { Id = userId, FirstName = "Ana", LastName = "Evaluator" });

        var createdAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc);
        _appRepo.Setup(x => x.GetPagedApplicationSummaryDtosAsync(
                null, null, null, null, null,
                It.IsAny<int>(), It.IsAny<int>(),
                null, null, tenantId, null, null, null, null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedApplicationListDto
            {
                Items = new List<ApplicationSummaryDto>
                {
                    new() { Id = Guid.NewGuid(), Status = "Completed", PayorName = "Acme Telecom", CreatedAt = createdAt },
                    new() { Id = Guid.NewGuid(), Status = "Evaluating", PayorName = "Acme Telecom", CreatedAt = createdAt },
                    new() { Id = Guid.NewGuid(), Status = "Returned", PayorName = "Acme Telecom", CreatedAt = createdAt }
                },
                TotalCount = 3,
                PageNumber = 1,
                PageSize = 1000
            });
        _tenantRepo.Setup(x => x.GetTenantTransactionsAsync(
                tenantId, null, It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<TenantTransactionDto>(), 0));
        _receiptRepo.Setup(x => x.GetByTenantAsync(
                tenantId, null, null, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OfficialReceipt>());
        _pdfGenerator.Setup(x => x.GeneratePdf(It.IsAny<StatutoryReportDocumentData>()))
            .Callback<StatutoryReportDocumentData>(d => captured = d)
            .Returns(new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D });

        var handler = CreateHandler();
        var result = await handler.Handle(
            new GenerateStatutoryReportPdfQuery(
                Code: "NTC-APP-SUM-ENT",
                TenantId: tenantId,
                StartDate: new DateTime(2026, 3, 1),
                EndDate: new DateTime(2026, 3, 31),
                Format: "ntc-sheet"),
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        captured.Should().NotBeNull();
        captured!.Format.Should().Be("ntc-sheet");
        captured.Applications.Should().HaveCount(1);
        captured.Applications[0].Status.Should().Be("Completed");
        result.Data!.FileName.Should().Contain("_ntc-sheet_");
    }

    [Fact]
    public async Task Handle_NtcAppSumSvc_ShouldFilterByOptionalServiceType()
    {
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        StatutoryReportDocumentData? captured = null;

        _currentUser.SetupGet(x => x.UserId).Returns(userId.ToString());
        _tenantContext.Setup(x => x.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _tenantRepo.Setup(x => x.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Code = "07", Name = "Region VII" });
        _regionalConfig.Setup(x => x.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto { TenantId = tenantId, TenantName = "Region VII" });
        _fieldOfficeRepo.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FieldOffice>());
        _userRepo.Setup(x => x.ResolveCurrentUserAsync(_currentUser.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { Id = userId, FirstName = "Ana", LastName = "Evaluator" });

        var createdAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc);
        _appRepo.Setup(x => x.GetPagedApplicationSummaryDtosAsync(
                null, null, null, null, null,
                It.IsAny<int>(), It.IsAny<int>(),
                null, null, tenantId, null, null, null, null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedApplicationListDto
            {
                Items = new List<ApplicationSummaryDto>
                {
                    new() { Id = Guid.NewGuid(), ServiceName = "Dealer Permit", ServiceVariantType = "NEW", Status = "Completed", CreatedAt = createdAt },
                    new() { Id = Guid.NewGuid(), ServiceName = "Dealer Permit", ServiceVariantType = "RENEWAL", Status = "Completed", CreatedAt = createdAt }
                },
                TotalCount = 2,
                PageNumber = 1,
                PageSize = 1000
            });
        _tenantRepo.Setup(x => x.GetTenantTransactionsAsync(
                tenantId, null, It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<TenantTransactionDto>(), 0));
        _receiptRepo.Setup(x => x.GetByTenantAsync(
                tenantId, null, null, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OfficialReceipt>());
        _pdfGenerator.Setup(x => x.GeneratePdf(It.IsAny<StatutoryReportDocumentData>()))
            .Callback<StatutoryReportDocumentData>(d => captured = d)
            .Returns(new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D });

        var handler = CreateHandler();
        var result = await handler.Handle(
            new GenerateStatutoryReportPdfQuery(
                Code: "NTC-APP-SUM-SVC",
                TenantId: tenantId,
                StartDate: new DateTime(2026, 3, 1),
                EndDate: new DateTime(2026, 3, 31),
                SecondaryFilter: "Dealer Permit",
                Format: "ntc-sheet",
                ServiceType: "RENEWAL"),
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        captured.Should().NotBeNull();
        captured!.ServiceTypeFilter.Should().Be("RENEWAL");
        captured.Applications.Should().HaveCount(1);
        captured.Applications[0].ServiceVariantType.Should().Be("RENEWAL");
    }

    [Fact]
    public async Task Handle_SuperAdminAccount_ShouldUseRealFullNameWithMiddleName_AndReplacePlaceholderStaffNames()
    {
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var clerkMock = new Mock<IClerkUserService>();
        StatutoryReportDocumentData? captured = null;

        _currentUser.SetupGet(x => x.UserId).Returns("user_real_superadmin");
        _tenantContext.Setup(x => x.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _tenantRepo.Setup(x => x.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Code = "07", Name = "Region VII" });
        _regionalConfig.Setup(x => x.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto { TenantId = tenantId, TenantName = "Region VII" });
        _fieldOfficeRepo.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FieldOffice>());

        // DB still has seeded placeholder "Super Administrator", while user has MiddleName and real Clerk First/Last
        var dbSuperAdmin = new User
        {
            Id = userId,
            AuthUserId = "user_real_superadmin",
            Email = "superadmin@ntcedge.com",
            FirstName = "Super",
            MiddleName = "Reyes",
            LastName = "Administrator",
            IsSuperAdmin = true
        };
        _userRepo.Setup(x => x.ResolveCurrentUserAsync(_currentUser.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dbSuperAdmin);
        _memberRepo.Setup(x => x.GetByTenantAndUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantMember { UserId = userId, TenantId = tenantId, Position = "Super Administrator" });
        clerkMock.Setup(x => x.GetUserByIdAsync("user_real_superadmin"))
            .ReturnsAsync(new ClerkUserResponse { Id = "user_real_superadmin", FirstName = "Maria", LastName = "Santos" });

        // Note: because MiddleName="Reyes" makes DB full name "Super Reyes Administrator", also test pure "Super Administrator" DB record
        dbSuperAdmin.MiddleName = null;

        var createdAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc);
        _appRepo.Setup(x => x.GetPagedApplicationSummaryDtosAsync(
                null, null, null, null, null,
                It.IsAny<int>(), It.IsAny<int>(),
                null, null, tenantId, null, null, null, null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedApplicationListDto
            {
                Items = new List<ApplicationSummaryDto>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        Status = "Completed",
                        EvaluatingOfficer = "SuperAdmin",
                        CreatedAt = createdAt,
                        Histories = new List<ApplicationHistoryDto>
                        {
                            new()
                            {
                                Id = Guid.NewGuid(),
                                PerformedByUserId = userId,
                                StaffName = "SuperAdmin",
                                StaffRole = "Super Administrator",
                                Action = "Evaluation Completed",
                                Timestamp = createdAt
                            }
                        }
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        Status = "Submitted",
                        EvaluatingOfficer = null,
                        CreatedAt = createdAt
                    }
                },
                TotalCount = 2,
                PageNumber = 1,
                PageSize = 1000
            });
        _tenantRepo.Setup(x => x.GetTenantTransactionsAsync(
                tenantId, null, It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<TenantTransactionDto>(), 0));
        _receiptRepo.Setup(x => x.GetByTenantAsync(
                tenantId, null, null, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OfficialReceipt>());
        _pdfGenerator.Setup(x => x.GeneratePdf(It.IsAny<StatutoryReportDocumentData>()))
            .Callback<StatutoryReportDocumentData>(d => captured = d)
            .Returns(new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D });

        var handler = new GenerateStatutoryReportPdfQueryHandler(
            _appRepo.Object,
            _tenantRepo.Object,
            _fieldOfficeRepo.Object,
            _receiptRepo.Object,
            _depositRepo.Object,
            _feedbackRepo.Object,
            _tenantContext.Object,
            _currentUser.Object,
            _userRepo.Object,
            _memberRepo.Object,
            _regionalConfig.Object,
            _pdfGenerator.Object,
            clerkMock.Object);

        var result = await handler.Handle(
            new GenerateStatutoryReportPdfQuery(
                Code: "NTC-APP-SUM-EVAL",
                TenantId: tenantId,
                StartDate: new DateTime(2026, 3, 1),
                EndDate: new DateTime(2026, 3, 31)),
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        captured.Should().NotBeNull();
        captured!.GeneratedBy.Should().Be("Maria Santos");
        captured.GeneratedByTitle.Should().BeEmpty(); // Never stamps "Super Administrator"
        captured.Applications[0].EvaluatingOfficer.Should().Be("Maria Santos");
        captured.Applications[1].EvaluatingOfficer.Should().BeNull(); // Unassigned app never gets GeneratedBy stamped
    }

    [Fact]
    public async Task Handle_UserWithMiddleNameAndSuffix_ShouldDisplayCompleteRealNameInGeneratedBy()
    {
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        StatutoryReportDocumentData? captured = null;

        _currentUser.SetupGet(x => x.UserId).Returns(userId.ToString());
        _tenantContext.Setup(x => x.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _tenantRepo.Setup(x => x.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Code = "07", Name = "Region VII" });
        _regionalConfig.Setup(x => x.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto { TenantId = tenantId, TenantName = "Region VII" });
        _fieldOfficeRepo.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FieldOffice>());
        _userRepo.Setup(x => x.ResolveCurrentUserAsync(_currentUser.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User
            {
                Id = userId,
                FirstName = "Juan",
                MiddleName = "Reyes",
                LastName = "Dela Cruz",
                Suffix = "Jr.",
                IsSuperAdmin = true
            });
        _appRepo.Setup(x => x.GetPagedApplicationSummaryDtosAsync(
                null, null, null, null, null,
                It.IsAny<int>(), It.IsAny<int>(),
                null, null, tenantId, null, null, null, null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedApplicationListDto { Items = new List<ApplicationSummaryDto>(), TotalCount = 0, PageNumber = 1, PageSize = 1000 });
        _tenantRepo.Setup(x => x.GetTenantTransactionsAsync(
                tenantId, null, It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<TenantTransactionDto>(), 0));
        _receiptRepo.Setup(x => x.GetByTenantAsync(
                tenantId, null, null, It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OfficialReceipt>());
        _pdfGenerator.Setup(x => x.GeneratePdf(It.IsAny<StatutoryReportDocumentData>()))
            .Callback<StatutoryReportDocumentData>(d => captured = d)
            .Returns(new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D });

        var handler = CreateHandler();
        var result = await handler.Handle(
            new GenerateStatutoryReportPdfQuery(Code: "NTC-APP-VOL-01", TenantId: tenantId),
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        captured.Should().NotBeNull();
        captured!.GeneratedBy.Should().Be("Juan Reyes Dela Cruz Jr.");
    }
}

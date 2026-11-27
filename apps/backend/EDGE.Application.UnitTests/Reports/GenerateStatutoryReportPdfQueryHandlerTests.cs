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
}

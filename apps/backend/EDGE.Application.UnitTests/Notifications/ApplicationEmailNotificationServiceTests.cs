using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Constants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Options;
using EDGE.Infrastructure.Services;

namespace EDGE.Application.UnitTests.Notifications;

public class ApplicationEmailNotificationServiceTests
{
    private readonly Mock<IApplicationFullRepository> _mockAppRepo = new();
    private readonly Mock<INotificationTemplateRepository> _mockTemplateRepo = new();
    private readonly Mock<IRegionalConfigurationService> _mockRegionalConfigService = new();
    private readonly Mock<ITenantMemberRepository> _mockTenantMemberRepo = new();
    private readonly Mock<IUserRepository> _mockUserRepo = new();
    private readonly Mock<IUserNotificationRepository> _mockUserNotifRepo = new();
    private readonly Mock<IEmailService> _mockEmailService = new();
    private readonly Mock<ILogger<ApplicationEmailNotificationService>> _mockLogger = new();

    private ApplicationEmailNotificationService CreateService()
    {
        var emailOptions = Options.Create(new EmailOptions
        {
            Enabled = true,
            ClientPortalBaseUrl = "https://client.edge.ntc.gov.ph",
            InternalPortalBaseUrl = "https://internal.edge.ntc.gov.ph"
        });

        return new ApplicationEmailNotificationService(
            _mockAppRepo.Object,
            _mockTemplateRepo.Object,
            _mockRegionalConfigService.Object,
            _mockTenantMemberRepo.Object,
            _mockUserRepo.Object,
            _mockUserNotifRepo.Object,
            _mockEmailService.Object,
            emailOptions,
            _mockLogger.Object);
    }

    [Fact]
    public async Task SendApplicationSubmittedAsync_WhenInternalEmailsDisabledByRegionalAdmin_StillSendsEmailToClientAndSkipsInternalOfficers()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            ReferenceNumber = "REF-2026-0001",
            ApplicationNumber = "APP-20261125-0001",
            Status = ApplicationStatus.Submitted,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        Id = Guid.NewGuid(),
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "Maria",
                            LastName = "Santos",
                            EmailAddress = "maria.santos@client.ph"
                        },
                        Service = new Service
                        {
                            Id = Guid.NewGuid(),
                            Name = "Amateur Radio Station License",
                            Code = "NTC_LIC_01",
                            ServiceCategory = new ServiceCategory { Type = ServiceCategoryType.License }
                        }
                    }
                }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _mockTemplateRepo.Setup(t => t.GetByEventKeyAsync("External_ApplicationSubmitted", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NotificationTemplate
            {
                EventKey = "External_ApplicationSubmitted",
                Subject = "Application Received – {Service Name} ({Reference Number})",
                BodyHtml = "Hello {Applicant Name}, your application {Reference Number} for {{Service Name}} was received.",
                IsActive = true
            });

        // Regional Admin disabled internal officer email notifications
        _mockRegionalConfigService.Setup(c => c.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto
            {
                TenantId = tenantId,
                EnableInternalEmailNotifications = false,
                RequestAndComplaintRouting = "DirectToLegal"
            });

        var sut = CreateService();

        // Act
        await sut.SendApplicationSubmittedAsync(appId, CancellationToken.None);

        // Assert: Client email is ALWAYS sent
        _mockEmailService.Verify(e => e.SendEmailAsync(
            "maria.santos@client.ph",
            "Maria Santos",
            "Application Received – Amateur Radio Station License (APP-20261125-0001)",
            It.Is<string>(body => body.Contains("Hello Maria Santos") && body.Contains("APP-20261125-0001") && body.Contains("Amateur Radio Station License")),
            It.IsAny<CancellationToken>()), Times.Once);

        // Assert: Internal officers were NOT queried or emailed because EnableInternalEmailNotifications == false
        _mockTenantMemberRepo.Verify(m => m.GetMembersByTenantAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SendApplicationSubmittedAsync_WhenComplaintAndDirectToLegal_EmailsLegalOfficersDirectlyInsteadOfEvaluators()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            ReferenceNumber = "REF-COMP-8888",
            ApplicationNumber = "APP-20261125-8888",
            Status = ApplicationStatus.Submitted,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        Id = Guid.NewGuid(),
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "Juan",
                            LastName = "Dela Cruz",
                            EmailAddress = "juan@client.ph"
                        },
                        Service = new Service
                        {
                            Id = Guid.NewGuid(),
                            Name = "Text Spam / Scam Complaint (NTC 1-25)",
                            Code = "NTC_1_25",
                            ServiceCategory = new ServiceCategory { Type = ServiceCategoryType.RequestsAndComplaints }
                        }
                    }
                }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _mockRegionalConfigService.Setup(c => c.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto
            {
                TenantId = tenantId,
                EnableInternalEmailNotifications = true,
                RequestAndComplaintRouting = "DirectToLegal"
            });

        _mockTenantMemberRepo.Setup(m => m.GetMembersByTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>
            {
                new()
                {
                    TenantId = tenantId,
                    RoleId = SeedConstants.Roles.EvaluatorRoleId,
                    Role = new Role { Id = SeedConstants.Roles.EvaluatorRoleId, Key = "evaluator", Name = "Evaluator" },
                    User = new User { FirstName = "Eval", LastName = "Officer", Email = "evaluator.r10@ntc.gov.ph" }
                },
                new()
                {
                    TenantId = tenantId,
                    RoleId = SeedConstants.Roles.LegalRoleId,
                    Role = new Role { Id = SeedConstants.Roles.LegalRoleId, Key = "legal", Name = "Legal Officer" },
                    User = new User { FirstName = "Atty. Legal", LastName = "Counsel", Email = "legal.r10@ntc.gov.ph" }
                }
            });

        var sut = CreateService();

        // Act
        await sut.SendApplicationSubmittedAsync(appId, CancellationToken.None);

        // Assert: Client received submission email
        _mockEmailService.Verify(e => e.SendEmailAsync(
            "juan@client.ph",
            "Juan Dela Cruz",
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Once);

        // Assert: Legal Officer received internal assignment email directly
        _mockEmailService.Verify(e => e.SendEmailAsync(
            "legal.r10@ntc.gov.ph",
            "Atty. Legal Counsel",
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Once);

        // Assert: Evaluator was NOT emailed for this DirectToLegal complaint
        _mockEmailService.Verify(e => e.SendEmailAsync(
            "evaluator.r10@ntc.gov.ph",
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SendApplicationReadyForPaymentAsync_PopulatesFeeBreakdownAndTotalAmountInClientEmail()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var soaId = Guid.NewGuid();
        var opId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            ApplicationNumber = "APP-20261125-7777",
            Status = ApplicationStatus.PendingPayment,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "Clara",
                            LastName = "Reyes",
                            EmailAddress = "clara.reyes@client.ph"
                        },
                        Service = new Service { Name = "Radio Operator Examination" }
                    }
                }
            },
            StatementsOfAccount = new List<StatementOfAccount>
            {
                new()
                {
                    Id = soaId,
                    SoaNumber = "SOA-2026-0099",
                    TotalAmount = 1380m,
                    LineItems = new List<SoaLineItem>
                    {
                        new() { Particular = "Filing Fee (FF)", ItemCode = "FF", NoOfUnits = 1, ValidityYears = 1, FeeRate = 180m, Amount = 180m },
                        new() { Particular = "Construction Permit Fee (CPF)", ItemCode = "CPF", NoOfUnits = 1, ValidityYears = 1, FeeRate = 690m, Amount = 690m },
                        new() { Particular = "Radio Station License Fee (LF)", ItemCode = "LF", NoOfUnits = 1, ValidityYears = 1, FeeRate = 480m, Amount = 480m },
                        new() { Particular = "Documentary Stamp Tax (DST)", ItemCode = "DST", NoOfUnits = 1, ValidityYears = 1, FeeRate = 30m, Amount = 30m }
                    }
                }
            },
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new()
                {
                    Id = opId,
                    StatementOfAccountId = soaId,
                    OpNumber = "OP-2026-0012",
                    AmountDue = 1380m,
                    Status = OpStatus.Billed
                }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _mockRegionalConfigService.Setup(c => c.GetConfigurationAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalConfigurationDto
            {
                TenantId = tenantId,
                SupportEmail = "region7@ntc.gov.ph",
                EnableInternalEmailNotifications = true
            });

        _mockTemplateRepo.Setup(t => t.GetByEventKeyAsync("External_ApplicationApprovedReadyForPayment", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NotificationTemplate
            {
                EventKey = "External_ApplicationApprovedReadyForPayment",
                Subject = "Approved & Ready for Payment – {Service Name} ({Reference Number})",
                BodyHtml = "<table>{Fee Breakdown Rows}</table> | SOA: {SOA Number} | OP: {OP Number} | Total Due: ₱{Total} | Inquiries: {Tenant Email} | Link: {Application Link}",
                IsActive = true
            });

        var sut = CreateService();

        // Act
        await sut.SendApplicationReadyForPaymentAsync(appId, opId, CancellationToken.None);

        // Assert: All 4 fee line items from the Client UI SOA and the Regional Tenant Email are rendered accurately
        _mockEmailService.Verify(e => e.SendEmailAsync(
            "clara.reyes@client.ph",
            "Clara Reyes",
            "Approved & Ready for Payment – Radio Operator Examination (APP-20261125-7777)",
            It.Is<string>(body =>
                body.Contains("Filing Fee (FF)") &&
                body.Contains("180.00") &&
                body.Contains("Construction Permit Fee (CPF)") &&
                body.Contains("690.00") &&
                body.Contains("Radio Station License Fee (LF)") &&
                body.Contains("480.00") &&
                body.Contains("Documentary Stamp Tax (DST)") &&
                body.Contains("30.00") &&
                body.Contains("SOA: SOA-2026-0099") &&
                body.Contains("OP: OP-2026-0012") &&
                body.Contains("Total Due: ₱1,380.00") &&
                body.Contains("Inquiries: region7@ntc.gov.ph") &&
                body.Contains("https://client.edge.ntc.gov.ph/my-applications?applicationId=")),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public void RenderPlaceholders_WhenSingleFeeAndLegacyTemplateContainsFee2Row_OmitsPhantomFee2Row()
    {
        var templateHtml = @"
<table>
  <tr><td>{Fee 1}</td><td>₱{Amount}</td></tr>
  <tr><td>{Fee 2}</td><td>₱{Fee 2 Amount}</td></tr>
  <tr><td>Order of Payment No.</td><td>{OP Number}</td></tr>
  <tr><td>Total</td><td>₱{Total}</td></tr>
</table>";

        var placeholders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Fee 1"] = "Examination Fee",
            ["Amount"] = "50.00",
            ["Fee 2"] = string.Empty,
            ["Fee 2 Amount"] = string.Empty,
            ["OP Number"] = string.Empty,
            ["Total"] = "50.00"
        };

        var rendered = ApplicationEmailNotificationService.RenderPlaceholders(templateHtml, placeholders);

        rendered.Should().Contain("Examination Fee");
        rendered.Should().Contain("₱50.00");
        rendered.Should().NotContain("{Fee 2}");
        rendered.Should().NotContain("Order of Payment No.");
        rendered.Should().NotContain("₱</td>");
    }

    [Fact]
    public async Task SendApplicationReadyForPaymentAsync_WhenItemHasZeroValidityYears_DoesNotDisplayValidityInFeeRow()
    {
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var soaId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            ApplicationNumber = "APP-20261126-8800",
            Status = ApplicationStatus.PendingPayment,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "Paolo",
                            LastName = "Gomez",
                            EmailAddress = "paolo@client.ph"
                        },
                        Service = new Service { Name = "Radio Operator Examination" }
                    }
                }
            },
            StatementsOfAccount = new List<StatementOfAccount>
            {
                new()
                {
                    Id = soaId,
                    SoaNumber = "SOA-2026-0100",
                    TotalAmount = 50m,
                    LineItems = new List<SoaLineItem>
                    {
                        new() { Particular = "Examination Fee", ItemCode = "EXF", NoOfUnits = 1, ValidityYears = 0, FeeRate = 50m, Amount = 50m }
                    }
                }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _mockTemplateRepo.Setup(t => t.GetByEventKeyAsync("External_ApplicationApprovedReadyForPayment", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NotificationTemplate
            {
                EventKey = "External_ApplicationApprovedReadyForPayment",
                Subject = "Ready for Payment",
                BodyHtml = "<table><tr><td>OP</td><td>{OP Number}</td></tr>{Fee Breakdown Rows}</table>",
                IsActive = true
            });

        var sut = CreateService();

        await sut.SendApplicationReadyForPaymentAsync(appId, null, CancellationToken.None);

        _mockEmailService.Verify(e => e.SendEmailAsync(
            "paolo@client.ph",
            "Paolo Gomez",
            "Ready for Payment",
            It.Is<string>(body =>
                body.Contains("Examination Fee") &&
                body.Contains("Code: EXF") &&
                body.Contains("Units: 1") &&
                !body.Contains("Validity:") &&
                !body.Contains("<td>OP</td>")),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

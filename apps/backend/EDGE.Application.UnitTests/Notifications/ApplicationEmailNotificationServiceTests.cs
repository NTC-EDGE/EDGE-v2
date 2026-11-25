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
                    TotalAmount = 180m,
                    LineItems = new List<SoaLineItem>
                    {
                        new() { Description = "Examination Fee", Amount = 150m },
                        new() { Description = "Documentary Stamp Tax", Amount = 30m }
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
                    AmountDue = 180m,
                    Status = OpStatus.Billed
                }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _mockTemplateRepo.Setup(t => t.GetByEventKeyAsync("External_ApplicationApprovedReadyForPayment", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NotificationTemplate
            {
                EventKey = "External_ApplicationApprovedReadyForPayment",
                Subject = "Approved & Ready for Payment – {Service Name} ({Reference Number})",
                BodyHtml = "Fee: {Fee 1} | Total Due: ₱{Total} | Link: {Application Link}",
                IsActive = true
            });

        var sut = CreateService();

        // Act
        await sut.SendApplicationReadyForPaymentAsync(appId, opId, CancellationToken.None);

        // Assert
        _mockEmailService.Verify(e => e.SendEmailAsync(
            "clara.reyes@client.ph",
            "Clara Reyes",
            "Approved & Ready for Payment – Radio Operator Examination (APP-20261125-7777)",
            It.Is<string>(body => body.Contains("Total Due: ₱180.00") && body.Contains("https://client.edge.ntc.gov.ph/my-applications?applicationId=")),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

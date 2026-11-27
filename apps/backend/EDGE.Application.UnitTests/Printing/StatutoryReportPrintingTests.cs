using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FluentAssertions;
using Xunit;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Reports.Constants;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;

namespace EDGE.Application.UnitTests.Printing;

public class StatutoryReportPrintingTests
{
    private readonly FormPrintingService _printingService = new();

    public static IEnumerable<object[]> All10StatutoryReportCodes()
    {
        yield return new object[] { ReportConstants.MisOps.Code, ReportConstants.MisOps.Title };
        yield return new object[] { ReportConstants.CoaApp26Monthly.Code, ReportConstants.CoaApp26Monthly.Title };
        yield return new object[] { ReportConstants.CoaApp26Daily.Code, ReportConstants.CoaApp26Daily.Title };
        yield return new object[] { ReportConstants.BirDst01.Code, ReportConstants.BirDst01.Title };
        yield return new object[] { ReportConstants.BtrInc01.Code, ReportConstants.BtrInc01.Title };
        yield return new object[] { ReportConstants.AppSumEval.Code, ReportConstants.AppSumEval.Title };
        yield return new object[] { ReportConstants.AppSumSvc.Code, ReportConstants.AppSumSvc.Title };
        yield return new object[] { ReportConstants.AppSumEnt.Code, ReportConstants.AppSumEnt.Title };
        yield return new object[] { ReportConstants.AppVol01.Code, ReportConstants.AppVol01.Title };
        yield return new object[] { ReportConstants.ExamMst01.Code, ReportConstants.ExamMst01.Title };
    }

    [Theory]
    [MemberData(nameof(All10StatutoryReportCodes))]
    public void PrintStatutoryReport_ShouldGenerateValidPdf_ForAll10OfficialReports(string code, string title)
    {
        var model = BuildSampleModel(code, title, recordCount: 6);

        var pdfBytes = _printingService.PrintStatutoryReport(model);

        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1500);
        Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray()).Should().Be("%PDF-");
    }

    [Theory]
    [InlineData("NTC-COA-APP26-M")]
    [InlineData("NTC-BIR-DST-01")]
    [InlineData("NTC-BTR-INC-01")]
    [InlineData("NTC-APP-SUM-EVAL")]
    [InlineData("NTC-EXAM-MST-01")]
    public void PrintStatutoryReport_ShouldPaginateCleanly_WhenDatasetExceeds50Records(string code)
    {
        var model = BuildSampleModel(code, $"Large Dataset Report ({code})", recordCount: 65);

        var pdfBytes = _printingService.PrintStatutoryReport(model);

        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(3000);
        Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray()).Should().Be("%PDF-");
    }

    [Fact]
    public void PrintStatutoryReport_ShouldSupportCustomFundClusterAndRegionalOfficeAddress()
    {
        var model = BuildSampleModel("NTC-COA-APP26-M", ReportConstants.CoaApp26Monthly.Title, recordCount: 4);
        model.FundCluster = "01101101";
        model.RegionalOfficeAddress = "Kauswagan, Cagayan de Oro City, Misamis Oriental";

        var pdfBytes = _printingService.PrintStatutoryReport(model);

        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1500);
        Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray()).Should().Be("%PDF-");
    }

    [Theory]
    [MemberData(nameof(All10StatutoryReportCodes))]
    public void PrintStatutoryReport_ShouldRenderConfiguredSignatories_AcrossAll10Reports(string code, string title)
    {
        var model = BuildSampleModel(code, title, recordCount: 4);
        model.GeneratedBy = "Engr. Ramon Villanueva";
        model.GeneratedByTitle = "Engineer III / Licensing Evaluator";
        model.Signatories = new ReportSignatoriesDto
        {
            RegionalDirectorName = "ENGR. TEDDY E. BAUTISTA",
            RegionalDirectorTitle = "Regional Director",
            ChiefEodName = "ENGR. MARIA SANTOS",
            ChiefEodTitle = "Chief, Enforcement & Operations Division",
            RegionalAccountantName = "CPA ANA GARCIA",
            RegionalAccountantTitle = "Regional Accountant III",
            CollectingOfficerName = "JOSE RAMOS",
            CollectingOfficerTitle = "Collecting Officer / Cashier III",
            MisOfficerName = "CARLA MENDOZA",
            MisOfficerTitle = "MIS / Planning Officer",
            ExamProctorName = "ENGR. PEDRO REYES",
            ExamProctorTitle = "Chair, Regional Examination Committee"
        };

        var pdfBytes = _printingService.PrintStatutoryReport(model);

        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1500);
        Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray()).Should().Be("%PDF-");
    }

    [Fact]
    public void PrintStatutoryReport_ShouldFallbackGracefully_WhenSignatoriesAreUnconfigured()
    {
        var model = BuildSampleModel(ReportConstants.CoaApp26Monthly.Code, ReportConstants.CoaApp26Monthly.Title, recordCount: 3);
        model.GeneratedBy = "Engr. Ramon Villanueva";
        model.GeneratedByTitle = "Cashier II";
        model.Signatories = new ReportSignatoriesDto();

        var pdfBytes = _printingService.PrintStatutoryReport(model);

        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1500);
        Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray()).Should().Be("%PDF-");
    }

    private static StatutoryReportModel BuildSampleModel(string code, string title, int recordCount)
    {
        var now = new DateTime(2026, 4, 15, 9, 0, 0, DateTimeKind.Utc);
        var apps = new List<ApplicationSummaryDto>();
        var paidTx = new List<TenantTransactionDto>();
        var receipts = new List<OfficialReceipt>();

        var bankAccount = new AgencyBankAccount
        {
            Id = Guid.NewGuid(),
            BankName = "LandBank of the Philippines",
            AccountNumber = "0123-4567-89",
            FundCluster = "01101101"
        };

        var deposit = new BankDeposit
        {
            Id = Guid.NewGuid(),
            DepositDate = now,
            DepositSlipNumber = "DSLIP-2026-001",
            BankAccount = bankAccount,
            CashAmount = 15000m,
            CheckAmount = 5000m,
            TotalAmount = 20000m,
            Status = DepositStatus.Verified
        };

        for (int i = 1; i <= recordCount; i++)
        {
            var appId = Guid.NewGuid();
            var orNo = $"OR-2026-{i:D5}";
            var isExam = i % 3 == 0;
            var svcName = isExam
                ? "Admission Slip for Radio Operator Examination"
                : (i % 2 == 0 ? "Radio Station License" : "Permit to Purchase");

            apps.Add(new ApplicationSummaryDto
            {
                Id = appId,
                ApplicationNumber = $"APP-2026-{i:D5}",
                ReferenceNumber = $"REF-2026-{i:D5}",
                Status = i % 5 == 0 ? "Returned" : "Completed",
                ServiceCategory = isExam ? "Exams" : "Licenses",
                ServiceName = svcName,
                ServiceVariantName = isExam ? "Class C Amateur" : "New",
                EvaluatingOfficer = "Engr. Maria Santos",
                PayorName = $"Applicant Entity {i}",
                OfficialReceiptNumber = orNo,
                AmountPaid = 530m,
                TotalAmountDue = 530m,
                CreatedAt = now.AddDays(-(i % 25)),
                UpdatedAt = now
            });

            paidTx.Add(new TenantTransactionDto(
                Id: appId,
                RefNo: orNo,
                ApplicantName: $"Applicant Entity {i}",
                ServiceType: svcName,
                Amount: 530m,
                PaymentStatus: "Paid",
                Date: now.AddDays(-(i % 25))));

            receipts.Add(new OfficialReceipt
            {
                Id = Guid.NewGuid(),
                ApplicationId = appId,
                OfficialReceiptNumber = orNo,
                PayorName = $"Applicant Entity {i}",
                Amount = 530m,
                PaymentMethod = i % 4 == 0 ? PaymentMethod.Check : PaymentMethod.Cash,
                Status = i % 2 == 0 ? ReceiptStatus.Deposited : ReceiptStatus.Issued,
                DepositId = i % 2 == 0 ? deposit.Id : null,
                Deposit = i % 2 == 0 ? deposit : null,
                IssuedAt = now.AddDays(-(i % 25))
            });
        }

        return new StatutoryReportModel
        {
            Code = code,
            Title = title,
            Agency = "National Telecommunications Commission (NTC)",
            Frequency = "Monthly",
            LegalBasis = "COA Circular No. 2020-006 / RA 11032",
            TenantName = "NTC Region X - Northern Mindanao",
            Period = "2026-01-01 to 2026-04-30",
            StartDate = "2026-01-01",
            EndDate = "2026-04-30",
            GeneratedBy = "Engr. Juan Dela Cruz",
            GeneratedAt = now,
            FundCluster = "01101101",
            RegionalOfficeAddress = "Kauswagan, Cagayan de Oro City",
            Applications = apps,
            Transactions = paidTx,
            PaidTransactions = paidTx,
            OfficialReceipts = receipts,
            BankDeposits = new List<BankDeposit> { deposit },
            FeedbackCount = 12,
            AverageCsat = 4.85
        };
    }
}

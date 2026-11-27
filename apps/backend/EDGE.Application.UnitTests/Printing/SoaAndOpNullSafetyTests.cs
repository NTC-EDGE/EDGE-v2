using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FluentAssertions;
using Xunit;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Services;

namespace EDGE.Application.UnitTests.Printing;

public class SoaAndOpNullSafetyTests
{
    private readonly FormPrintingService _printingService = new();

    [Fact]
    public void PrintStatementOfAccount_ShouldNotThrow_WhenHistoriesOrLineItemsContainNullValues()
    {
        var app = new EDGE.Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "REF-2026-0001",
            Status = ApplicationStatus.ForAccountant,
            Histories = new List<ApplicationHistory>
            {
                new() { Id = Guid.NewGuid(), Action = "Chief Director Review", StaffRole = null!, StaffName = "Engr. Director" },
                new() { Id = Guid.NewGuid(), Action = null!, StaffRole = null!, StaffName = null! }
            }
        };

        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            SoaNumber = "61-2026-11-0001",
            TotalAmount = 530m,
            LineItems = new List<SoaLineItem>
            {
                new() { Id = Guid.NewGuid(), ItemCode = null!, Particular = null!, Amount = 500m, NoOfUnits = 1 },
                new() { Id = Guid.NewGuid(), ItemCode = "DST", Particular = "Documentary Stamp Tax", Amount = 30m, NoOfUnits = 1 }
            },
            Histories = new List<SoaHistory>
            {
                new() { Id = Guid.NewGuid(), Action = null!, StaffRole = null!, StaffName = null! }
            }
        };

        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            StatementOfAccountId = soa.Id,
            OpNumber = "PENDING APPROVAL",
            AmountDue = 530m,
            Status = OpStatus.Paid,
            Histories = new List<OpHistory>
            {
                new() { Id = Guid.NewGuid(), Action = null!, StaffRole = null!, StaffName = null! }
            }
        };

        var model = StatementOfAccountPrintMapper.MapToPrintModel(soa: soa, app: app, op: op);
        var pdfBytes = _printingService.PrintStatementOfAccount(model);

        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1500);
        Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray()).Should().Be("%PDF-");
    }

    [Fact]
    public void PrintOrderOfPayment_ShouldNotThrow_WhenSoaIsNullAndOpHistoryHasNullAction()
    {
        var app = new EDGE.Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "REF-2026-0002",
            Status = ApplicationStatus.PendingPayment
        };

        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            OpNumber = "61-2026-11-0002",
            AmountDue = 1200m,
            Status = OpStatus.Paid,
            Histories = new List<OpHistory>
            {
                new() { Id = Guid.NewGuid(), Action = null!, StaffRole = null!, StaffName = null! }
            }
        };

        var model = OrderOfPaymentPrintMapper.MapToPrintModel(op: op, soa: null, app: app);
        model.BankAccounts = null!;
        var pdfBytes = _printingService.PrintOrderOfPayment(model);

        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1500);
        Encoding.ASCII.GetString(pdfBytes.Take(5).ToArray()).Should().Be("%PDF-");
    }
}

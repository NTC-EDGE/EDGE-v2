using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using FluentAssertions;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class OfficialReceiptLandscapePrintingTests
{
    [Fact]
    public void MapToPrintModel_WithDetailedSoaLineItems_MapsGranularBreakdown()
    {
        // Arrange
        var soaId = Guid.NewGuid();
        var appId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationNumber = "APP-2026-RSL-00123",
            ReferenceNumber = "REF-2026-RSL-00123"
        };

        var soa = new StatementOfAccount
        {
            Id = soaId,
            ApplicationId = appId,
            SoaNumber = "SOA-2026-000456",
            IssuedToName = "GLOBE TELECOM, INC.",
            TotalAmount = 14500.00m,
            LineItems = new List<SoaLineItem>
            {
                new SoaLineItem
                {
                    Particular = "Filing Fee",
                    ItemCode = "FF",
                    NoOfUnits = 1,
                    ValidityYears = 0,
                    Amount = 500.00m
                },
                new SoaLineItem
                {
                    Particular = "Radio Station License",
                    ItemCode = "RSL",
                    NoOfUnits = 2,
                    ValidityYears = 3,
                    Amount = 12000.00m
                },
                new SoaLineItem
                {
                    Particular = "Documentary Stamp Tax",
                    ItemCode = "DST",
                    NoOfUnits = 1,
                    ValidityYears = 0,
                    Amount = 2000.00m
                }
            }
        };

        var receipt = new OfficialReceipt
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            OfficialReceiptNumber = "OR-1497771",
            IssuedAt = new DateTime(2026, 10, 21),
            Amount = 14500.00m,
            PaymentMethod = PaymentMethod.Cash
        };

        app.StatementsOfAccount.Add(soa);

        // Act
        var model = OfficialReceiptPrintMapper.MapToPrintModel(
            receipt: receipt,
            op: null,
            soa: soa,
            app: app,
            template: "landscape");

        // Assert
        model.Should().NotBeNull();
        model.Orientation.Should().Be(ReceiptOrientation.Landscape);
        model.ReceiptNo.Should().Be("OR-1497771");
        model.Payor.Should().Be("GLOBE TELECOM, INC.");
        model.TotalAmount.Should().Be(14500.00m);
        model.SelectedPaymentType.Should().Be(PaymentType.Cash);

        model.Items.Should().HaveCount(3);
        model.Items[0].NatureOfCollection.Should().Contain("Filing Fee");
        model.Items[0].Amount.Should().Be(500.00m);

        model.Items[1].NatureOfCollection.Should().Contain("Radio Station License");
        model.Items[1].NatureOfCollection.Should().Contain("2 units");
        model.Items[1].NatureOfCollection.Should().Contain("3 yrs");
        model.Items[1].Amount.Should().Be(12000.00m);

        model.Items[2].NatureOfCollection.Should().Contain("Documentary Stamp Tax");
        model.Items[2].Amount.Should().Be(2000.00m);
    }

    [Fact]
    public void FormPrintingService_PrintOfficialReceipt_Landscape_GeneratesValidPdf()
    {
        // Arrange
        var model = new OfficialReceiptModel
        {
            Orientation = ReceiptOrientation.Landscape,
            ReceiptNo = "1497771",
            Date = "10/21/2026",
            Payor = "ACME TELECOMS CORP.",
            SelectedPaymentType = PaymentType.Cash,
            Items = new List<OfficialReceiptItem>
            {
                new() { NatureOfCollection = "Filing Fee (FF)", Amount = 180.00m },
                new() { NatureOfCollection = "Permit to Purchase (PP • 1 unit)", Amount = 960.00m },
                new() { NatureOfCollection = "Radio Station License (RSL • 1 unit, 3 yrs)", Amount = 3600.00m },
                new() { NatureOfCollection = "Documentary Stamp Tax (DST)", Amount = 60.00m }
            },
            TotalAmount = 4800.00m,
            AmountInWords = "Four Thousand Eight Hundred Pesos Only",
            CollectingOfficer = "JUAN CASHIER"
        };

        var service = new FormPrintingService();

        // Act
        var pdfBytes = service.PrintOfficialReceipt(model);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(50000);
    }

    [Fact]
    public void FormPrintingService_PrintOfficialReceipt_Landscape_CheckPayment_GeneratesValidPdf()
    {
        // Arrange
        var model = new OfficialReceiptModel
        {
            Orientation = ReceiptOrientation.Landscape,
            ReceiptNo = "1497772",
            Date = "10/21/2026",
            Payor = "CONVERGE ICT SOLUTIONS",
            SelectedPaymentType = PaymentType.Check,
            TreasuryWarrantCheckMoneyOrderInfo = "LANDBANK #0001234567",
            DateOfTreasuryWarrantCheckMoneyOrder = "10/21/2026",
            Items = new List<OfficialReceiptItem>
            {
                new() { NatureOfCollection = "Inspection Fee", Amount = 1200.00m },
                new() { NatureOfCollection = "Spectrum User Fee", Amount = 8800.00m }
            },
            TotalAmount = 10000.00m,
            AmountInWords = "Ten Thousand Pesos Only",
            CollectingOfficer = "MARIA CASHIER"
        };

        var service = new FormPrintingService();

        // Act
        var pdfBytes = service.PrintOfficialReceipt(model);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(50000);
    }
}

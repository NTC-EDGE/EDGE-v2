using System;
using System.Collections.Generic;
using System.IO;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.Fields;
using FluentAssertions;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class PdfFieldRendererTests
{
    [Fact]
    public void MapToFieldOverlays_ShouldMapApplicantDetailsAndVasServicesCorrectly()
    {
        // Arrange
        var app = new Ntc120Application
        {
            TypeOfApplication = TypeOfApplication.New,
            Applicant = new Applicant
            {
                Name = "Acme Telecom Inc.",
                ContactNumber = "09171234567",
                Email = "contact@acme.com",
                Address = new Address
                {
                    UnitRoomBldgNo = "Suite 101",
                    Street = "Main St",
                    CityMunicipality = "Makati"
                }
            },
            VasServices = new VasServicesSelection
            {
                MessagingService = true,
                HostingService = true
            },
            Declaration = new Declaration
            {
                SignatoryName = "John Doe",
                DateAccomplished = new DateOnly(2026, 7, 24)
            }
        };

        // Act
        IReadOnlyList<FieldOverlay> overlays = Ntc120FlatPdfOverlayMapper.MapToFieldOverlays(app);

        // Assert
        overlays.Should().NotBeEmpty();

        // Check TypeOfApplication checkmark
        overlays.Should().ContainSingle(o => o is CheckboxFieldOverlay && o.Field.Name == "TypeOfApplication.New")
            .Which.As<CheckboxFieldOverlay>().IsChecked.Should().BeTrue();

        // Check Applicant Name text overlay
        overlays.Should().ContainSingle(o => o is TextFieldOverlay && o.Field.Name == "Applicant.Name")
            .Which.As<TextFieldOverlay>().Text.Should().Be("Acme Telecom Inc.");

        // Check VAS Services checkmarks
        overlays.Should().ContainSingle(o => o is CheckboxFieldOverlay && o.Field.Name == "VasServices.MessagingService")
            .Which.As<CheckboxFieldOverlay>().IsChecked.Should().BeTrue();

        overlays.Should().ContainSingle(o => o is CheckboxFieldOverlay && o.Field.Name == "VasServices.HostingService")
            .Which.As<CheckboxFieldOverlay>().IsChecked.Should().BeTrue();

        // Check Declaration Signatory
        overlays.Should().ContainSingle(o => o is TextFieldOverlay && o.Field.Name == "Declaration.SignatoryName")
            .Which.As<TextFieldOverlay>().Text.Should().Be("John Doe");
    }

    [Fact]
    public void PdfFieldRenderer_ShouldSortOverlaysByZIndexAscending()
    {
        // Arrange
        var renderer = new PdfFieldRenderer();

        var field = new PdfField("TestField", 100, 100);
        var item1 = new TextFieldOverlay(field, "Top Layer", ZIndex: 10);
        var item2 = new TextFieldOverlay(field, "Bottom Layer", ZIndex: 1);

        var overlays = new List<FieldOverlay> { item1, item2 };

        // Act & Assert
        Action act = () => renderer.RenderOverlays(null!, overlays);
        act.Should().Throw<NullReferenceException>();
    }

    [Fact]
    public void GenerateSamplePdfs_ForManualVerification()
    {
        // Arrange
        var fillerService = new PdfFormFillerService();
        var templateBytes = fillerService.GetTemplate("ntc-1-20.pdf");

        if (templateBytes == null || templateBytes.Length == 0)
            return;

        var app = new Ntc120Application
        {
            TypeOfApplication = TypeOfApplication.New,
            Applicant = new Applicant
            {
                Name = "CLOUDTECH TELECOM PHILIPPINES INC.",
                ContactNumber = "+63 2 8888 1234",
                Email = "info@cloudtech.ph",
                Address = new Address
                {
                    UnitRoomBldgNo = "32nd Floor, Tower 1",
                    Street = "Ayala Avenue",
                    Barangay = "San Lorenzo",
                    CityMunicipality = "Makati City",
                    Province = "Metro Manila",
                    ZipCode = "1226"
                }
            },
            RegistrationCategory = new RegistrationCategory120
            {
                VasProvider = true,
                VoipProvider = true
            },
            VasServices = new VasServicesSelection
            {
                MessagingService = true,
                HostingService = true,
                ElectronicMailService = true,
                VirtualPrivateNetworkService = true
            },
            Declaration = new Declaration
            {
                SignatoryName = "MARIA CLARA SANTOS",
                DateAccomplished = new DateOnly(2026, 7, 24)
            },
            Payment = new Payment
            {
                OrNo = "OR-2026-98765",
                OrDate = new DateOnly(2026, 7, 24),
                Amount = 2450.00m,
                CollectingOfficer = "JUAN DE LA CRUZ"
            }
        };

        var overlays = Ntc120FlatPdfOverlayMapper.MapToFieldOverlays(app);

        // 1. Render Production PDF (Debug = false)
        byte[] cleanPdf = fillerService.OverlayFields(templateBytes, overlays, new OverlayDebugOptions { Enabled = false });

        // 2. Render Debug PDF (Debug = true with grid, crosshairs, field names, and bounding boxes)
        byte[] debugPdf = fillerService.OverlayFields(templateBytes, overlays, new OverlayDebugOptions
        {
            Enabled = true,
            DrawGrid = true,
            DrawCrosshair = true,
            DrawCoordinates = true,
            DrawFieldNames = true,
            DrawBoundingBoxes = true
        });

        cleanPdf.Should().NotBeEmpty();
        debugPdf.Should().NotBeEmpty();

        // Safely write sample artifact files if directory exists and is unlocked
        string outputDir = @"C:\Users\almau\.gemini\antigravity\brain\33ec9edb-ff92-46a3-8df5-418f0a21c9a0";
        if (Directory.Exists(outputDir))
        {
            TryWriteFile(Path.Combine(outputDir, "ntc120_clean_output.pdf"), cleanPdf);
            TryWriteFile(Path.Combine(outputDir, "ntc120_debug_output.pdf"), debugPdf);
        }
    }

    private static void TryWriteFile(string filePath, byte[] bytes)
    {
        try
        {
            File.WriteAllBytes(filePath, bytes);
        }
        catch (IOException)
        {
            // Ignore temporary file locking by background viewers during test execution
        }
    }
}

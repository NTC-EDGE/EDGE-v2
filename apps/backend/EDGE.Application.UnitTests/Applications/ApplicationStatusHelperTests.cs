using FluentAssertions;
using Xunit;
using EDGE.Application.Applications.Helpers;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class ApplicationStatusHelperTests
{
    [Fact]
    public void DetermineQueueTab_ForAccountant_ShouldReturnPending_WhenStatusIsForAccountant()
    {
        var tab = ApplicationStatusHelper.DetermineQueueTab(ApplicationStatus.ForAccountant, "Accountant");
        tab.Should().Be("pending");
    }

    [Fact]
    public void DetermineQueueTab_ForAccountant_ShouldReturnHistory_WhenApplicationWasReturnedOrProcessed()
    {
        // When status is Evaluating but has SOA / accountant touched it
        var tabWithSoa = ApplicationStatusHelper.DetermineQueueTab(
            ApplicationStatus.Evaluating,
            "Accountant",
            hasSoa: true,
            remarks: "SOA returned by Accountant: Fix fee");

        tabWithSoa.Should().Be("history");

        // When status is PendingPayment
        var tabPendingPayment = ApplicationStatusHelper.DetermineQueueTab(
            ApplicationStatus.PendingPayment,
            "Accountant");

        tabPendingPayment.Should().Be("history");
    }

    [Fact]
    public void DetermineQueueTab_ForAccountant_ShouldReturnActivity_WhenFreshSubmittedApplicationNotTouchedByAccountant()
    {
        var tabFresh = ApplicationStatusHelper.DetermineQueueTab(
            ApplicationStatus.Submitted,
            "Accountant",
            hasSoa: false,
            hasAccountantHistory: false);

        tabFresh.Should().Be("activity");
    }

    [Fact]
    public void DetermineQueueTab_ForEvaluator_ShouldReturnPending_WhenStatusIsEvaluatingOrSubmitted()
    {
        var tabSubmitted = ApplicationStatusHelper.DetermineQueueTab(ApplicationStatus.Submitted, "Evaluator");
        tabSubmitted.Should().Be("pending");

        var tabEvaluating = ApplicationStatusHelper.DetermineQueueTab(ApplicationStatus.Evaluating, "Evaluator");
        tabEvaluating.Should().Be("pending");
    }

    [Fact]
    public void DetermineQueueTab_ForEvaluator_ShouldReturnHistory_WhenForwardedToAccountantOrBeyond()
    {
        var tabForAccountant = ApplicationStatusHelper.DetermineQueueTab(ApplicationStatus.ForAccountant, "Evaluator");
        tabForAccountant.Should().Be("history");

        var tabPendingPayment = ApplicationStatusHelper.DetermineQueueTab(ApplicationStatus.PendingPayment, "Evaluator");
        tabPendingPayment.Should().Be("history");

        var tabCompleted = ApplicationStatusHelper.DetermineQueueTab(ApplicationStatus.Completed, "Evaluator");
        tabCompleted.Should().Be("history");
    }

    [Fact]
    public void DetermineQueueTab_ForIssuance_ShouldReturnIssuanceTab()
    {
        var tab = ApplicationStatusHelper.DetermineQueueTab(ApplicationStatus.ForIssuance, "Evaluator");
        tab.Should().Be("issuance");
    }
}

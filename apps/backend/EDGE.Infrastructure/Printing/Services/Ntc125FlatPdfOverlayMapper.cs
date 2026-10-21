using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-25 (Complaint Form).
/// </summary>
public static class Ntc125FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc125Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. Complainant Particulars
        var comp = app.Complainant;
        if (!string.IsNullOrWhiteSpace(comp.Name))
            items.Add(new TextFieldOverlay(Ntc125Fields.Complainant.Name, comp.Name));

        var fullAddress = comp.ResidentialAddress?.ToSingleLine();
        if (!string.IsNullOrWhiteSpace(fullAddress))
            items.Add(new TextFieldOverlay(Ntc125Fields.Complainant.Address, fullAddress));

        if (!string.IsNullOrWhiteSpace(comp.Email))
            items.Add(new TextFieldOverlay(Ntc125Fields.Complainant.Email, comp.Email));

        if (!string.IsNullOrWhiteSpace(comp.ContactNumber))
            items.Add(new TextFieldOverlay(Ntc125Fields.Complainant.ContactNumber, comp.ContactNumber));

        // 2. Service Provider Particulars
        var sp = app.ServiceProvider;
        if (!string.IsNullOrWhiteSpace(sp.BusinessName))
            items.Add(new TextFieldOverlay(Ntc125Fields.ServiceProvider.BusinessName, sp.BusinessName));
        if (!string.IsNullOrWhiteSpace(sp.BusinessAddress))
            items.Add(new TextFieldOverlay(Ntc125Fields.ServiceProvider.BusinessAddress, sp.BusinessAddress));
        if (!string.IsNullOrWhiteSpace(sp.ContactNumber))
            items.Add(new TextFieldOverlay(Ntc125Fields.ServiceProvider.ContactNumber, sp.ContactNumber));

        // 3. Nature of Complaint
        var nat = app.NatureOfComplaint;
        var types = nat.ComplaintTypes ?? new List<string>();

        if (types.Any(t => t.Contains("billing", StringComparison.OrdinalIgnoreCase)))
            items.Add(new CheckboxFieldOverlay(Ntc125Fields.NatureOfComplaint.BillingComplaint, true));

        if (types.Any(t => t.Contains("spam", StringComparison.OrdinalIgnoreCase)))
            items.Add(new CheckboxFieldOverlay(Ntc125Fields.NatureOfComplaint.Spam, true));

        if (types.Any(t => t.Contains("scam", StringComparison.OrdinalIgnoreCase)))
            items.Add(new CheckboxFieldOverlay(Ntc125Fields.NatureOfComplaint.Scam, true));

        if (types.Any(t => t.Contains("fair use", StringComparison.OrdinalIgnoreCase)))
            items.Add(new CheckboxFieldOverlay(Ntc125Fields.NatureOfComplaint.FairUse, true));

        if (types.Any(t => t.Contains("poor", StringComparison.OrdinalIgnoreCase) || t.Contains("service", StringComparison.OrdinalIgnoreCase) || t.Contains("technical", StringComparison.OrdinalIgnoreCase) || t.Contains("customer", StringComparison.OrdinalIgnoreCase)))
            items.Add(new CheckboxFieldOverlay(Ntc125Fields.NatureOfComplaint.PoorService, true));

        if (types.Any(t => t.Contains("denial", StringComparison.OrdinalIgnoreCase) || t.Contains("subscription", StringComparison.OrdinalIgnoreCase)))
            items.Add(new CheckboxFieldOverlay(Ntc125Fields.NatureOfComplaint.DenialOfSubscription, true));

        if (types.Any(t => t.Contains("other", StringComparison.OrdinalIgnoreCase) || t.Contains("tape", StringComparison.OrdinalIgnoreCase) || t.Contains("preservation", StringComparison.OrdinalIgnoreCase)) || !string.IsNullOrWhiteSpace(nat.OthersSpecification))
        {
            items.Add(new CheckboxFieldOverlay(Ntc125Fields.NatureOfComplaint.Others, true));
            var spec = !string.IsNullOrWhiteSpace(nat.OthersSpecification)
                ? nat.OthersSpecification
                : types.FirstOrDefault(t => t.Contains("tape", StringComparison.OrdinalIgnoreCase) || t.Contains("preservation", StringComparison.OrdinalIgnoreCase) || t.Contains("other", StringComparison.OrdinalIgnoreCase)) ?? "Tape Preservation";
            items.Add(new TextFieldOverlay(Ntc125Fields.NatureOfComplaint.OthersSpecification, spec));
        }

        if (nat.DateOfIncident.HasValue && nat.DateOfIncident.Value != default)
        {
            items.Add(new TextFieldOverlay(Ntc125Fields.NatureOfComplaint.DateOfIncident, nat.DateOfIncident.Value.ToString("MM/dd/yyyy")));
        }

        if (!string.IsNullOrWhiteSpace(nat.TimeOfIncident))
        {
            items.Add(new TextFieldOverlay(Ntc125Fields.NatureOfComplaint.TimeOfIncident, nat.TimeOfIncident));
        }

        // 4. Details of Complaint
        if (!string.IsNullOrWhiteSpace(app.StateBrieflyDetails))
        {
            items.Add(new TextFieldOverlay(Ntc125Fields.Details.StateBriefly, app.StateBrieflyDetails));
        }

        // 5. Attached Proof / Supporting Documents
        if (app.AttachedProofDocuments != null && app.AttachedProofDocuments.Count > 0)
        {
            var docs = app.AttachedProofDocuments;
            PdfField[] slotFields =
            [
                Ntc125Fields.AttachedDocuments.Col1Row1,
                Ntc125Fields.AttachedDocuments.Col2Row1,
                Ntc125Fields.AttachedDocuments.Col1Row2,
                Ntc125Fields.AttachedDocuments.Col2Row2,
                Ntc125Fields.AttachedDocuments.Col1Row3,
                Ntc125Fields.AttachedDocuments.Col2Row3,
            ];

            for (int i = 0; i < Math.Min(docs.Count, slotFields.Length); i++)
            {
                var doc = docs[i];
                var label = !string.IsNullOrWhiteSpace(doc.DocumentDescription)
                    ? doc.DocumentDescription
                    : doc.AttachmentFileName;
                if (!string.IsNullOrWhiteSpace(label))
                {
                    items.Add(new TextFieldOverlay(slotFields[i], label));
                }
            }
        }

        // 6. Declaration
        var decl = app.Declaration;
        var signatory = !string.IsNullOrWhiteSpace(decl.SignatoryName) ? decl.SignatoryName : comp.Name;
        if (!string.IsNullOrWhiteSpace(signatory))
        {
            items.Add(new TextFieldOverlay(Ntc125Fields.Declaration.SignatoryName, signatory));
        }

        var declDate = decl.DateAccomplished != default ? decl.DateAccomplished.ToString("MM/dd/yyyy") : DateTime.Now.ToString("MM/dd/yyyy");
        items.Add(new TextFieldOverlay(Ntc125Fields.Declaration.DateAccomplished, declDate));

        return items;
    }
}

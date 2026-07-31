using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class NotificationTemplateDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var staticDate = new DateTime(2026, 1, 15, 8, 0, 0, DateTimeKind.Utc);

        var templates = new List<NotificationTemplate>
        {
            // -------------------------------------------------------------------
            // EXTERNAL EMAIL TEMPLATES (Applicant)
            // -------------------------------------------------------------------
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000001"),
                EventKey = "External_ApplicationSubmitted",
                Name = "Applicant - Application Submitted",
                Subject = "Application Submitted – {Service Name} ({Service Variant})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{Submission Date},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Applicant Name},</p>
<p>Thank you for submitting your application through the NTC EDGE Portal.</p>
<p>Your application has been successfully received and is currently undergoing validation. You will receive another notification once your application has been reviewed.</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Service: {Service Name}<br />
Variant: {Service Variant}<br />
Date Submitted: {Submission Date}</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>If you have any questions, please contact <a href=""mailto:edge@ntc.gov.ph"">edge@ntc.gov.ph</a>.<br />
Please do not share this email or any links contained within it. Protect your personal information by accessing the EDGE Portal only through official NTC channels.<br />
This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000002"),
                EventKey = "External_ApplicationReturnedForCompliance",
                Name = "Applicant - Application Returned for Compliance",
                Subject = "Application Returned for Compliance – {Service Name} ({Service Variant})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{Reasons / Remarks},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Applicant Name},</p>
<p>Your application has been reviewed and requires additional information or corrections before it can proceed.</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Service: {Service Name}<br />
Variant: {Service Variant}</p>
<p><strong>Compliance Required</strong><br />
{Reasons / Remarks}</p>
<p>Please review the remarks above, update the required information or upload the requested documents, and resubmit your application through the NTC EDGE Portal.</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>If you have any questions, please contact <a href=""mailto:edge@ntc.gov.ph"">edge@ntc.gov.ph</a>.<br />
Please do not share this email or any links contained within it. Protect your personal information by accessing the EDGE Portal only through official NTC channels.<br />
This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000003"),
                EventKey = "External_ApplicationApprovedReadyForPayment",
                Name = "Applicant - Application Approved and Ready for Payment",
                Subject = "Application Approved – Payment Required ({Reference Number})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{Exam Date},{Fee 1},{Amount},{Fee 2},{Total},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Applicant Name},</p>
<p>Congratulations!</p>
<p>Your application has been reviewed and approved. To continue processing your application, payment of the applicable fees is now required.</p>
<p>Please find the following documents attached to this email:<br />
- Order of Payment (OP)<br />
- Statement of Account (SOA)</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Service: {Service Name}<br />
Variant: {Service Variant}<br />
Exam Date: {Exam Date} (if applicable)</p>
<p><strong>Order of Payment</strong><br />
Particular | Amount<br />
{Fee 1} | ₱{Amount}<br />
{Fee 2} | ₱{Amount}<br />
Total | ₱{Total}</p>
<p><strong>Payment Instructions</strong><br />
1. Click View Application below and log in to the NTC EDGE Portal.<br />
2. Open your application and click Proceed to Payment.<br />
3. Select your preferred Payment Method.<br />
4. Follow the on-screen instructions to complete your payment.</p>
<p><strong>Important Reminder for Check Payments</strong><br />
If your selected payment method is Check, please upload separate check images for each applicable payment category:<br />
- SUF – Spectrum User Fee<br />
- UPLRF – UP Legal Research Fund<br />
- DST – Documentary Stamp Tax<br />
- All Other Fees<br />
Each payment category must have its own corresponding check. Uploading a single check that covers multiple payment categories may delay payment verification and processing.</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>If you have any questions, please contact <a href=""mailto:edge@ntc.gov.ph"">edge@ntc.gov.ph</a>.<br />
Please do not share this email or any links contained within it. Protect your personal information by accessing the EDGE Portal only through official NTC channels.<br />
This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000004"),
                EventKey = "External_ApplicationComplete",
                Name = "Applicant - Application Complete",
                Subject = "Application Completed – {Reference Number}",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{License / Permit / Certificate},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Applicant Name},</p>
<p>Congratulations!</p>
<p>Your application has been successfully completed.</p>
<p>The following documents are attached to this email:<br />
- Official Receipt (OR)<br />
- {License / Permit / Certificate}<br />
- Other applicable documents, if any</p>
<p>You may also access and download these documents anytime through the NTC EDGE Portal.</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Service: {Service Name}</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>If you have any questions, please contact <a href=""mailto:edge@ntc.gov.ph"">edge@ntc.gov.ph</a>.<br />
Please do not share this email or any links contained within it. Protect your personal information by accessing the EDGE Portal only through official NTC channels.<br />
This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000005"),
                EventKey = "External_ResetPassword",
                Name = "Applicant - Reset Password",
                Subject = "Reset Your EDGE Password",
                AvailablePlaceholders = "{User Name},{Reset Password Link},{Expiration Time}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {User Name},</p>
<p>We received a request to reset the password for your NTC EDGE account.</p>
<p>To create a new password, click the link below:<br />
<a href=""{Reset Password Link}"">Reset Password</a></p>
<p>For your security, this link will expire in {Expiration Time}.</p>
<p>If you did not request a password reset, you may safely disregard this email. No changes will be made to your account unless you complete the password reset process.</p>
<p>If you have any questions, please contact <a href=""mailto:edge@ntc.gov.ph"">edge@ntc.gov.ph</a>.<br />
Please do not share this email or any links contained within it. Protect your personal information by accessing the EDGE Portal only through official NTC channels.<br />
This is an automatically generated email. Please do not reply to this email.</p>"
            },

            // -------------------------------------------------------------------
            // INTERNAL EMAIL TEMPLATES (NTC Personnel)
            // -------------------------------------------------------------------
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000006"),
                EventKey = "Internal_ApplicationSubmitted",
                Name = "NTC Personnel - Application Submitted (Evaluator)",
                Subject = "New Application Submitted – {Reference Number}",
                AvailablePlaceholders = "{Evaluator Name},{Reference Number},{Applicant Name},{Service Name},{Service Variant},{Submission Date},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Evaluator Name},</p>
<p>A new application has been successfully submitted through the NTC EDGE Portal and is now awaiting validation.</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Applicant: {Applicant Name}<br />
Service: {Service Name}<br />
Variant: {Service Variant}<br />
Date Submitted: {Submission Date}</p>
<p>Please review and evaluate the application at your earliest convenience.</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000007"),
                EventKey = "Internal_ApplicationEndorsed",
                Name = "NTC Personnel - Application Endorsed (Approving Personnel)",
                Subject = "Application Endorsed for Approval – {Reference Number}",
                AvailablePlaceholders = "{Approving Personnel Name},{Reference Number},{Applicant Name},{Service Name},{Service Variant},{Evaluator Name},{Date Endorsed},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Approving Personnel Name},</p>
<p>An application has been reviewed by the assigned evaluator and has been endorsed for your approval.</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Applicant: {Applicant Name}<br />
Service: {Service Name}<br />
Variant: {Service Variant}<br />
Endorsed By: {Evaluator Name}<br />
Date Endorsed: {Date Endorsed}</p>
<p>Please review the application and proceed with the appropriate action.</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000008"),
                EventKey = "Internal_ApplicationApproved",
                Name = "NTC Personnel - Application Approved (Accountant)",
                Subject = "Application Approved – Generate SOA and OP ({Reference Number})",
                AvailablePlaceholders = "{Accountant Name},{Reference Number},{Applicant Name},{Service Name},{Service Variant},{Approving Personnel Name},{Approval Date},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Accountant Name},</p>
<p>An application has been approved and is now ready for billing.</p>
<p>Please generate the corresponding Statement of Account (SOA) and Order of Payment (OP).</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Applicant: {Applicant Name}<br />
Service: {Service Name}<br />
Variant: {Service Variant}<br />
Approved By: {Approving Personnel Name}<br />
Approval Date: {Approval Date}</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000009"),
                EventKey = "Internal_ApplicationProceededToPayment",
                Name = "NTC Personnel - Application Proceeded to Payment (Cashier)",
                Subject = "Payment Submitted for Verification – {Reference Number}",
                AvailablePlaceholders = "{Cashier Name},{Reference Number},{Applicant Name},{Service Name},{Service Variant},{Payment Method},{Payment Submission Date},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {Cashier Name},</p>
<p>The applicant has completed the Proceed to Payment process and submitted payment details through the NTC EDGE Portal.</p>
<p>The payment is now awaiting verification.</p>
<p><strong>Application Details</strong><br />
Reference Number: {Reference Number}<br />
Applicant: {Applicant Name}<br />
Service: {Service Name}<br />
Variant: {Service Variant}<br />
Payment Method: {Payment Method}<br />
Date Submitted: {Payment Submission Date}</p>
<p>Please verify the submitted payment and proceed with the appropriate action.</p>
<p>View Application:<br />
<a href=""{Application Link}"">{Application Link}</a></p>
<p>This is an automatically generated email. Please do not reply to this email.</p>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000010"),
                EventKey = "Internal_ResetPassword",
                Name = "NTC Personnel - Reset Password",
                Subject = "Reset Your EDGE Password",
                AvailablePlaceholders = "{User Name},{Reset Password Link},{Expiration Time}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<p>Hello {User Name},</p>
<p>We received a request to reset the password for your NTC EDGE account.</p>
<p>To create a new password, click the link below:<br />
<a href=""{Reset Password Link}"">Reset Password</a></p>
<p>For your security, this link will expire in {Expiration Time}.</p>
<p>If you did not request a password reset, you may safely disregard this email. No changes will be made to your account unless you complete the password reset process.</p>
<p>This is an automatically generated email. Please do not reply to this email.</p>"
            }
        };

        foreach (var template in templates)
        {
            var existing = await context.NotificationTemplates.FirstOrDefaultAsync(t => t.EventKey == template.EventKey);
            if (existing == null)
            {
                await context.NotificationTemplates.AddAsync(template);
            }
            else
            {
                existing.Name = template.Name;
                existing.Subject = template.Subject;
                existing.BodyHtml = template.BodyHtml;
                existing.AvailablePlaceholders = template.AvailablePlaceholders;
                existing.IsActive = template.IsActive;
                context.NotificationTemplates.Update(existing);
            }
        }

        await context.SaveChangesAsync();
    }
}

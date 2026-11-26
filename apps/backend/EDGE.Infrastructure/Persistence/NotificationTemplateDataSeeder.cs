using System;
using System.Collections.Generic;
using System.Linq;
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
                Subject = "Application Received – {Service Name} ({Reference Number})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{Submission Date},{Tenant Email},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);"">
    <!-- Header -->
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 26px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""58"" height=""58"" style=""display: block; width: 58px; height: 58px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;"">Republic of the Philippines</div>
        <div style=""font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px;"">National Telecommunications Commission</div>
        <div style=""font-size: 12px; font-weight: 500; color: #93c5fd; margin-top: 2px;"">EDGE Portal • Electronic Document &amp; Government Enterprise</div>
      </td>
    </tr>
    <!-- Gold Accent Line -->
    <tr>
      <td height=""4"" style=""background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);""></td>
    </tr>
    <!-- Content -->
    <tr>
      <td class=""ntc-body"" style=""padding: 28px 32px;"">
        <div style=""display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #065f46; margin-bottom: 16px;"">
          ✓ Application Received
        </div>
        <h2 style=""font-size: 19px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Hello {Applicant Name},</h2>
        <p style=""font-size: 14px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;"">
          Thank you for applying through the NTC EDGE Portal. Your application has been successfully submitted and queued for evaluation.
        </p>

        <!-- Details Card -->
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden; width: 100%; box-sizing: border-box;"">
          <tr>
            <td colspan=""2"" style=""background-color: #f1f5f9; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;"">
              Application Details
            </td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; width: 38%; border-bottom: 1px solid #f1f5f9;"">Reference No.</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; font-family: monospace; word-break: break-all; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Service Applied</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;"">{Service Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Variant</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9;"">{Service Variant}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b;"">Date Submitted</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #334155;"">{Submission Date}</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 22px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: #1e3a8a; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);"">
                View Application &amp; Track Status &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style=""background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 12px 14px; font-size: 12px; color: #1e40af; margin-bottom: 20px; line-height: 1.5;"">
          <strong>Next Steps:</strong> An NTC evaluator will review your requirements. You will receive an automated notification once your application is approved for payment or if additional compliance is needed.
        </div>

        <p style=""font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;"">
          For inquiries, email us at <a href=""mailto:{Tenant Email}"" style=""color: #2563eb; text-decoration: none; font-weight: 600;"">{Tenant Email}</a>.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style=""background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;"">
        <p style=""font-size: 11px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.4;"">
          <strong>Security Notice:</strong> Protect your account by accessing NTC services exclusively through official portals. Never share passwords or OTPs.
        </p>
        <p style=""font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.4;"">
          &copy; 2026 National Telecommunications Commission • Republic of the Philippines.<br />
          This is an automated system notification. Please do not reply directly to this email.
        </p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000002"),
                EventKey = "External_ApplicationReturnedForCompliance",
                Name = "Applicant - Application Returned for Compliance",
                Subject = "Action Required: Compliance Requested – {Service Name} ({Reference Number})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{Reasons / Remarks},{Tenant Email},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 26px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""58"" height=""58"" style=""display: block; width: 58px; height: 58px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;"">Republic of the Philippines</div>
        <div style=""font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px;"">National Telecommunications Commission</div>
        <div style=""font-size: 12px; font-weight: 500; color: #93c5fd; margin-top: 2px;"">EDGE Portal • Electronic Document &amp; Government Enterprise</div>
      </td>
    </tr>
    <tr><td height=""4"" style=""background: linear-gradient(90deg, #d97706, #f59e0b, #d97706);""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 28px 32px;"">
        <div style=""display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 16px;"">
          ⚠️ Action Required • Compliance Requested
        </div>
        <h2 style=""font-size: 19px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Hello {Applicant Name},</h2>
        <p style=""font-size: 14px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;"">
          Our evaluation team has reviewed your application and noted items requiring your compliance or document updates before we can proceed.
        </p>

        <!-- Compliance Remarks Box -->
        <div style=""background-color: #fefce8; border: 1px solid #fef08a; border-left: 4px solid #d97706; border-radius: 8px; padding: 14px; margin-bottom: 20px;"">
          <div style=""font-size: 11px; font-weight: 700; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;"">
            Evaluator Remarks &amp; Deficiencies:
          </div>
          <div style=""font-size: 13px; color: #713f12; line-height: 1.6; font-family: monospace; white-space: pre-wrap; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #fef08a; word-break: break-word;"">{Reasons / Remarks}</div>
        </div>

        <!-- Details Card -->
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden; width: 100%; box-sizing: border-box;"">
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; width: 38%; border-bottom: 1px solid #f1f5f9;"">Reference No.</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; font-family: monospace; word-break: break-all; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Service Applied</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;"">{Service Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b;"">Service Variant</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #334155;"">{Service Variant}</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 22px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: #d97706; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(217, 119, 6, 0.2);"">
                Submit Compliance &amp; Re-upload Files &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style=""font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;"">
          Need help? Contact the support desk at <a href=""mailto:{Tenant Email}"" style=""color: #2563eb; text-decoration: none; font-weight: 600;"">{Tenant Email}</a>.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style=""background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;"">
        <p style=""font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.4;"">
          &copy; 2026 National Telecommunications Commission • Republic of the Philippines.
        </p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000003"),
                EventKey = "External_ApplicationApprovedReadyForPayment",
                Name = "Applicant - Application Approved and Ready for Payment",
                Subject = "Approved & Ready for Payment – {Service Name} ({Reference Number})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{SOA Number},{OP Number},{Due Date},{Fee Breakdown Rows},{Total},{Tenant Email},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 26px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""58"" height=""58"" style=""display: block; width: 58px; height: 58px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;"">Republic of the Philippines</div>
        <div style=""font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px;"">National Telecommunications Commission</div>
        <div style=""font-size: 12px; font-weight: 500; color: #93c5fd; margin-top: 2px;"">EDGE Portal • Electronic Document &amp; Government Enterprise</div>
      </td>
    </tr>
    <tr><td height=""4"" style=""background: linear-gradient(90deg, #059669, #10b981, #059669);""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 28px 32px;"">
        <div style=""display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #065f46; margin-bottom: 16px;"">
          ★ Approved • Order of Payment Ready
        </div>
        <h2 style=""font-size: 19px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Congratulations {Applicant Name}!</h2>
        <p style=""font-size: 14px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;"">
          Your application has been reviewed and approved. Your Statement of Account (SOA) and Order of Payment (OP) have been issued. To complete processing and release your official document, please proceed with payment.
        </p>

        <!-- Order of Payment & Assessment Summary Table -->
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden; width: 100%; box-sizing: border-box;"">
          <tr>
            <td colspan=""2"" style=""background-color: #f1f5f9; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;"">
              Order of Payment (OP) &amp; Billing Summary
            </td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; width: 45%; border-bottom: 1px solid #f1f5f9;"">Reference No.</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; font-family: monospace; word-break: break-all; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Statement of Account No.</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 700; color: #0284c7; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{SOA Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Order of Payment No.</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 700; color: #059669; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{OP Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Service</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;"">{Service Name} ({Service Variant})</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b;"">Payment Due Date</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 700; color: #b45309;"">{Due Date}</td>
          </tr>
        </table>

        <!-- Assessment Fee Breakdown Table (Matches Client Portal UI) -->
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden; width: 100%; box-sizing: border-box;"">
          <tr>
            <td colspan=""2"" style=""background-color: #f0f9ff; padding: 10px 14px; border-bottom: 1px solid #bae6fd; font-size: 11px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.4px;"">
              Assessment Fee Breakdown
            </td>
          </tr>
          {Fee Breakdown Rows}
          <tr style=""background-color: #eff6ff;"">
            <td class=""ntc-table-cell"" style=""padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; border-top: 1px solid #cbd5e1;"">Total Amount Payable</td>
            <td class=""ntc-table-cell"" style=""padding: 12px 14px; font-size: 16px; font-weight: 800; color: #1e3a8a; text-align: right; border-top: 1px solid #cbd5e1;"">₱{Total}</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 22px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 700; color: #ffffff; background-color: #059669; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.25);"">
                Proceed to Payment &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; margin-bottom: 20px; line-height: 1.6;"">
          <strong>Payment Modes in Portal:</strong> Online / E-Payment (LandBank Link.BizPortal, GCash, Maya, Bank Transfer), Check Payment (Manager&rsquo;s / Corporate Check), Cashier Over-the-Counter (Walk-In Cash), or Combination / Split Payment.
        </div>

        <p style=""font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;"">
          Inquiries: <a href=""mailto:{Tenant Email}"" style=""color: #2563eb; text-decoration: none; font-weight: 600;"">{Tenant Email}</a>.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style=""background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;"">
        <p style=""font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.4;"">
          &copy; 2026 National Telecommunications Commission • Republic of the Philippines.
        </p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000004"),
                EventKey = "External_ApplicationComplete",
                Name = "Applicant - Application Complete",
                Subject = "Application Completed – Official Documents Ready ({Reference Number})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{License / Permit / Certificate},{Tenant Email},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 26px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""58"" height=""58"" style=""display: block; width: 58px; height: 58px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;"">Republic of the Philippines</div>
        <div style=""font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px;"">National Telecommunications Commission</div>
        <div style=""font-size: 12px; font-weight: 500; color: #93c5fd; margin-top: 2px;"">EDGE Portal • Electronic Document &amp; Government Enterprise</div>
      </td>
    </tr>
    <tr><td height=""4"" style=""background: linear-gradient(90deg, #1e3a8a, #f59e0b, #1e3a8a);""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 28px 32px;"">
        <div style=""display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #065f46; margin-bottom: 16px;"">
          ✓ Application Completed
        </div>
        <h2 style=""font-size: 19px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Congratulations {Applicant Name}!</h2>
        <p style=""font-size: 14px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;"">
          Your application has been successfully completed and approved. Your official license, permit, or certificate and Official Receipt (OR) are now ready for download.
        </p>

        <!-- Issuance Details -->
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden; width: 100%; box-sizing: border-box;"">
          <tr>
            <td colspan=""2"" style=""background-color: #f1f5f9; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;"">
              Issuance Details
            </td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; width: 38%; border-bottom: 1px solid #f1f5f9;"">Reference No.</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; font-family: monospace; word-break: break-all; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Service Name</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;"">{Service Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b;"">Issued Document</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 700; color: #059669;"">{License / Permit / Certificate}</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 22px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: #1e3a8a; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);"">
                Download Official Certificate &amp; OR &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style=""font-size: 13px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;"">
          Thank you for keeping Philippine telecommunications compliant and secure.
        </p>
        <p style=""font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;"">
          For inquiries, email us at <a href=""mailto:{Tenant Email}"" style=""color: #2563eb; text-decoration: none; font-weight: 600;"">{Tenant Email}</a>.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style=""background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;"">
        <p style=""font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.4;"">
          &copy; 2026 National Telecommunications Commission • Republic of the Philippines.
        </p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000012"),
                EventKey = "External_PaymentConfirmedForIssuance",
                Name = "Applicant - Payment Verified & Official Receipt Issued",
                Subject = "Payment Confirmed (OR #{OR Number}) – Processing Official Document ({Reference Number})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{SOA Number},{OP Number},{OR Number},{Fee Breakdown Rows},{Total},{Tenant Email},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 26px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""58"" height=""58"" style=""display: block; width: 58px; height: 58px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;"">Republic of the Philippines</div>
        <div style=""font-size: 18px; font-weight: 800; color: #ffffff;"">National Telecommunications Commission</div>
        <div style=""font-size: 12px; font-weight: 500; color: #93c5fd; margin-top: 2px;"">EDGE Portal • Electronic Document &amp; Government Enterprise</div>
      </td>
    </tr>
    <tr><td height=""4"" style=""background: linear-gradient(90deg, #059669, #10b981, #059669);""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 28px 32px;"">
        <div style=""display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #065f46; margin-bottom: 16px;"">
          ✓ Payment Verified • Official Receipt Issued
        </div>
        <h2 style=""font-size: 19px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Hello {Applicant Name},</h2>
        <p style=""font-size: 14px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;"">
          Your payment has been verified by the NTC Cashier and your Official Receipt (OR) has been generated. No further payment is required. Your application has been forwarded for final official document and license release.
        </p>
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;"">
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; width: 42%; border-bottom: 1px solid #f1f5f9;"">Reference No.</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Official Receipt (OR)</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 700; color: #059669; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">OR #{OR Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Statement of Account No.</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 600; color: #334155; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{SOA Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Order of Payment No.</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; font-weight: 600; color: #334155; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{OP Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #64748b;"">Next Step</td>
            <td class=""ntc-table-cell"" style=""padding: 11px 14px; font-size: 13px; color: #334155;"">Awaiting Final Permit / Certificate / License Release</td>
          </tr>
        </table>

        <!-- Paid Fee Particulars Table -->
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden;"">
          <tr>
            <td colspan=""2"" style=""background-color: #ecfdf5; padding: 10px 14px; border-bottom: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.4px;"">
              Official Receipt Fee Particulars
            </td>
          </tr>
          {Fee Breakdown Rows}
          <tr style=""background-color: #ecfdf5;"">
            <td class=""ntc-table-cell"" style=""padding: 12px 14px; font-size: 13px; font-weight: 700; color: #065f46; border-top: 1px solid #a7f3d0;"">Total Amount Paid</td>
            <td class=""ntc-table-cell"" style=""padding: 12px 14px; font-size: 16px; font-weight: 800; color: #047857; text-align: right; border-top: 1px solid #a7f3d0;"">₱{Total}</td>
          </tr>
        </table>

        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 22px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: #059669; text-decoration: none; border-radius: 8px;"">
                View Official Receipt &amp; Application &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style=""font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;"">
          For inquiries, email us at <a href=""mailto:{Tenant Email}"" style=""color: #2563eb; text-decoration: none; font-weight: 600;"">{Tenant Email}</a>.
        </p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },

            // -------------------------------------------------------------------
            // INTERNAL EMAIL TEMPLATES (NTC Personnel)
            // -------------------------------------------------------------------
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000006"),
                EventKey = "Internal_ApplicationSubmitted",
                Name = "NTC Personnel - Application Submitted (Evaluator)",
                Subject = "New Application for Evaluation – {Reference Number}",
                AvailablePlaceholders = "{Evaluator Name},{Reference Number},{Applicant Name},{Service Name},{Service Variant},{Submission Date},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""52"" height=""52"" style=""display: block; width: 52px; height: 52px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px;"">NTC EDGE Internal Notification</div>
        <div style=""font-size: 16px; font-weight: 700; color: #ffffff;"">Evaluation Queue Assignment</div>
      </td>
    </tr>
    <tr><td height=""3"" style=""background: #0284c7;""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 26px 32px;"">
        <h3 style=""font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Hello {Evaluator Name},</h3>
        <p style=""font-size: 13px; color: #334155; margin: 0 0 16px 0; line-height: 1.5;"">
          A new application has been submitted and is ready for document verification and technical evaluation.
        </p>

        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 20px; width: 100%; box-sizing: border-box;"">
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; width: 36%; border-bottom: 1px solid #f1f5f9;"">Ref Number</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0284c7; font-family: monospace; word-break: break-all; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Applicant</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;"">{Applicant Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Service</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #334155; border-bottom: 1px solid #f1f5f9;"">{Service Name} ({Service Variant})</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b;"">Date Submitted</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #334155;"">{Submission Date}</td>
          </tr>
        </table>

        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; color: #ffffff; background-color: #0f172a; text-decoration: none; border-radius: 6px;"">
                Open Evaluation Workspace &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style=""background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8;"">
        NTC Internal Operations Workflow • Automated Notification
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000008"),
                EventKey = "Internal_ApplicationApproved",
                Name = "NTC Personnel - Application Approved (Accountant)",
                Subject = "Action Required: Generate SOA & OP – {Reference Number}",
                AvailablePlaceholders = "{Accountant Name},{Reference Number},{Applicant Name},{Service Name},{Service Variant},{SOA Number},{Total},{Approving Personnel Name},{Approval Date},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""52"" height=""52"" style=""display: block; width: 52px; height: 52px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px;"">NTC EDGE Internal Notification</div>
        <div style=""font-size: 16px; font-weight: 700; color: #ffffff;"">Billing &amp; Order of Payment Queue</div>
      </td>
    </tr>
    <tr><td height=""3"" style=""background: #059669;""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 26px 32px;"">
        <h3 style=""font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Hello {Accountant Name},</h3>
        <p style=""font-size: 13px; color: #334155; margin: 0 0 16px 0; line-height: 1.5;"">
          An application has passed technical evaluation. Please review the Statement of Account (SOA) and approve/issue the Order of Payment (OP).
        </p>

        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 20px; width: 100%; box-sizing: border-box;"">
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; width: 36%; border-bottom: 1px solid #f1f5f9;"">Ref Number</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 700; color: #059669; font-family: monospace; word-break: break-all; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Applicant</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;"">{Applicant Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Service</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #334155; border-bottom: 1px solid #f1f5f9;"">{Service Name} ({Service Variant})</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">SOA Number / Total</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;"">{SOA Number} (₱{Total})</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Evaluated By</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #334155; border-bottom: 1px solid #f1f5f9;"">{Approving Personnel Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b;"">Approval Date</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #334155;"">{Approval Date}</td>
          </tr>
        </table>

        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; color: #ffffff; background-color: #059669; text-decoration: none; border-radius: 6px;"">
                Review SOA &amp; Issue OP &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style=""background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8;"">
        NTC Accounting Operations • Automated Notification
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000009"),
                EventKey = "Internal_ApplicationProceededToPayment",
                Name = "NTC Personnel - Application Proceeded to Payment (Cashier)",
                Subject = "Payment Verification Queue – {Reference Number}",
                AvailablePlaceholders = "{Cashier Name},{Reference Number},{Applicant Name},{Service Name},{Service Variant},{OP Number},{Total},{Payment Method},{Payment Submission Date},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""52"" height=""52"" style=""display: block; width: 52px; height: 52px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px;"">NTC EDGE Internal Notification</div>
        <div style=""font-size: 16px; font-weight: 700; color: #ffffff;"">Cashier Payment Verification</div>
      </td>
    </tr>
    <tr><td height=""3"" style=""background: #d97706;""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 26px 32px;"">
        <h3 style=""font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Hello {Cashier Name},</h3>
        <p style=""font-size: 13px; color: #334155; margin: 0 0 16px 0; line-height: 1.5;"">
          The applicant has submitted proof of payment through the portal. Please verify the transaction and issue the Official Receipt (OR).
        </p>

        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 20px; width: 100%; box-sizing: border-box;"">
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; width: 36%; border-bottom: 1px solid #f1f5f9;"">Ref Number</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 700; color: #d97706; font-family: monospace; word-break: break-all; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Order of Payment</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 700; color: #059669; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{OP Number} (₱{Total})</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Applicant</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;"">{Applicant Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Service</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #334155; border-bottom: 1px solid #f1f5f9;"">{Service Name}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Payment Channel</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; font-weight: 600; color: #1e3a8a; border-bottom: 1px solid #f1f5f9;"">{Payment Method}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #64748b;"">Date Submitted</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 12px; color: #334155;"">{Payment Submission Date}</td>
          </tr>
        </table>

        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; color: #ffffff; background-color: #d97706; text-decoration: none; border-radius: 6px;"">
                Verify Payment &amp; Issue OR &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style=""background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8;"">
        NTC Cashier Operations • Automated Notification
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000011"),
                EventKey = "External_ApplicationUnderAccountingReview",
                Name = "Applicant - Technical Evaluation Approved (Statement of Account & Fee Breakdown)",
                Subject = "Technical Evaluation Approved – Fee Assessment ({Reference Number})",
                AvailablePlaceholders = "{Applicant Name},{Reference Number},{Service Name},{Service Variant},{SOA Number},{Due Date},{Fee Breakdown Rows},{Total},{Next Step Notice},{Tenant Email},{Application Link}",
                IsActive = true,
                CreatedAt = staticDate,
                BodyHtml = @"<!DOCTYPE html>
<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
<meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
<style>
  @media only screen and (max-width: 620px) {
    .ntc-wrap { padding: 12px 8px !important; }
    .ntc-card { width: 100% !important; border-radius: 12px !important; }
    .ntc-header { padding: 20px 16px !important; }
    .ntc-body { padding: 20px 16px !important; }
    .ntc-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; }
    .ntc-table-cell { padding: 10px 12px !important; font-size: 12px !important; }
  }
</style>
</head>
<body style=""margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;"">
<div class=""ntc-wrap"" style=""background-color: #f1f5f9; padding: 28px 12px; width: 100%; box-sizing: border-box;"">
  <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" class=""ntc-card"" style=""max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;"">
    <tr>
      <td class=""ntc-header"" style=""background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 26px 32px; text-align: center;"">
        <img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""58"" height=""58"" style=""display: block; width: 58px; height: 58px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" />
        <div style=""font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;"">Republic of the Philippines</div>
        <div style=""font-size: 18px; font-weight: 800; color: #ffffff;"">National Telecommunications Commission</div>
        <div style=""font-size: 12px; font-weight: 500; color: #93c5fd; margin-top: 2px;"">EDGE Portal • Electronic Document &amp; Government Enterprise</div>
      </td>
    </tr>
    <tr><td height=""4"" style=""background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);""></td></tr>
    <tr>
      <td class=""ntc-body"" style=""padding: 28px 32px;"">
        <div style=""display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #1d4ed8; margin-bottom: 16px;"">
          ✓ Technical Evaluation Approved • Statement of Account (SOA)
        </div>
        <h2 style=""font-size: 19px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;"">Hello {Applicant Name},</h2>
        <p style=""font-size: 14px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;"">
          {Next Step Notice}
        </p>
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;"">
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; width: 42%; border-bottom: 1px solid #f1f5f9;"">Reference No.</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{Reference Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Statement of Account No.</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 700; color: #0284c7; font-family: monospace; border-bottom: 1px solid #f1f5f9;"">{SOA Number}</td>
          </tr>
          <tr>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; color: #64748b;"">Service</td>
            <td class=""ntc-table-cell"" style=""padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b;"">{Service Name} ({Service Variant})</td>
          </tr>
        </table>

        <!-- Assessment Fee Breakdown Table -->
        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden;"">
          <tr>
            <td colspan=""2"" style=""background-color: #f0f9ff; padding: 10px 14px; border-bottom: 1px solid #bae6fd; font-size: 11px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.4px;"">
              Statement of Account Fee Breakdown
            </td>
          </tr>
          {Fee Breakdown Rows}
          <tr style=""background-color: #eff6ff;"">
            <td class=""ntc-table-cell"" style=""padding: 12px 14px; font-size: 13px; font-weight: 700; color: #1e3a8a; border-top: 1px solid #cbd5e1;"">Total Assessment Amount</td>
            <td class=""ntc-table-cell"" style=""padding: 12px 14px; font-size: 16px; font-weight: 800; color: #1e3a8a; text-align: right; border-top: 1px solid #cbd5e1;"">₱{Total}</td>
          </tr>
        </table>

        <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 22px 0;"">
          <tr>
            <td align=""center"">
              <a href=""{Application Link}"" target=""_blank"" class=""ntc-btn"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: #1e3a8a; text-decoration: none; border-radius: 8px;"">
                View Statement of Account &amp; Application &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style=""font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;"">
          For inquiries, email us at <a href=""mailto:{Tenant Email}"" style=""color: #2563eb; text-decoration: none; font-weight: 600;"">{Tenant Email}</a>.
        </p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>"
            }
        };

        bool anyChange = false;
        var obsoleteEventKeys = new[]
        {
            "External_ResetPassword",
            "Internal_ResetPassword",
            "Internal_ApplicationEndorsed"
        };

        var obsoleteTemplates = await context.NotificationTemplates
            .IgnoreQueryFilters()
            .Where(t => obsoleteEventKeys.Contains(t.EventKey) && !t.IsDeleted)
            .ToListAsync();

        foreach (var obsolete in obsoleteTemplates)
        {
            obsolete.IsDeleted = true;
            obsolete.IsActive = false;
            anyChange = true;
        }

        foreach (var template in templates)
        {
            var existing = await context.NotificationTemplates.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.EventKey == template.EventKey || t.Id == template.Id);
            if (existing == null)
            {
                await context.NotificationTemplates.AddAsync(template);
                anyChange = true;
            }
            else
            {
                bool hasLegacyBrokenFees =
                    existing.BodyHtml.Contains("{Fee 2}", StringComparison.OrdinalIgnoreCase) &&
                    existing.BodyHtml.IndexOf("₱{Amount}", StringComparison.OrdinalIgnoreCase) !=
                    existing.BodyHtml.LastIndexOf("₱{Amount}", StringComparison.OrdinalIgnoreCase);

                bool missingNtcLogo = !existing.BodyHtml.Contains("ntc-official-seal", StringComparison.OrdinalIgnoreCase) &&
                                      !existing.BodyHtml.Contains("ntc-seal.png", StringComparison.OrdinalIgnoreCase);

                bool hasHardcodedGlobalInquiryEmail = existing.BodyHtml.Contains("edge@ntc.gov.ph", StringComparison.OrdinalIgnoreCase);

                bool isUnmodifiedByAdmin = !existing.LastModifiedAt.HasValue;

                if (existing.IsDeleted ||
                    existing.Name != template.Name ||
                    existing.AvailablePlaceholders != template.AvailablePlaceholders ||
                    hasLegacyBrokenFees ||
                    missingNtcLogo ||
                    hasHardcodedGlobalInquiryEmail ||
                    (isUnmodifiedByAdmin && (existing.Subject != template.Subject || existing.BodyHtml != template.BodyHtml)))
                {
                    existing.IsDeleted = false;
                    existing.IsDeletedBy = string.Empty;
                    existing.Name = template.Name;
                    existing.AvailablePlaceholders = template.AvailablePlaceholders;
                    if (hasLegacyBrokenFees || isUnmodifiedByAdmin)
                    {
                        existing.Subject = template.Subject;
                        existing.BodyHtml = template.BodyHtml;
                    }
                    else
                    {
                        if (missingNtcLogo)
                        {
                            existing.BodyHtml = existing.BodyHtml.Replace(
                                @"<div style=""font-size: 10px; font-weight: 700;",
                                @"<img src=""cid:ntc-official-seal"" alt=""NTC Official Seal"" width=""56"" height=""56"" style=""display: block; width: 56px; height: 56px; margin: 0 auto 10px auto; border-radius: 50%; background-color: #ffffff; padding: 3px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);"" /><div style=""font-size: 10px; font-weight: 700;");
                        }
                        if (hasHardcodedGlobalInquiryEmail)
                        {
                            existing.BodyHtml = existing.BodyHtml
                                .Replace("mailto:edge@ntc.gov.ph", "mailto:{Tenant Email}", StringComparison.OrdinalIgnoreCase)
                                .Replace(">edge@ntc.gov.ph<", ">{Tenant Email}<", StringComparison.OrdinalIgnoreCase);
                        }
                    }
                    anyChange = true;
                }
            }
        }

        if (anyChange)
        {
            await context.SaveChangesAsync();
        }
    }
}

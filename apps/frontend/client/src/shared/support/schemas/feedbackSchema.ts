import { z } from "zod";

export const FEEDBACK_CATEGORIES = [
  "Licensing & Permits",
  "Radio Operator Exam",
  "SOA & Payment / OP",
  "Technical / Portal UX",
  "General Inquiry / Suggestion",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const sendFeedbackSchema = z
  .object({
    tenantId: z.string().min(1, "Please select an NTC Regional Office."),
    category: z.string().min(1, "Please select a feedback category."),
    subject: z
      .string()
      .trim()
      .min(3, "Subject must be at least 3 characters.")
      .max(200, "Subject must not exceed 200 characters."),
    message: z
      .string()
      .trim()
      .min(10, "Please provide at least 10 characters of detail.")
      .max(2000, "Message must not exceed 2000 characters."),
    rating: z
      .number()
      .min(1, "Please select a rating from 1 to 5 stars.")
      .max(5, "Rating cannot exceed 5 stars."),
    isAnonymous: z.boolean(),
    senderName: z.string(),
    senderEmail: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.isAnonymous) {
      if (data.senderName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["senderName"],
          message: "Your name is required unless submitting anonymously.",
        });
      }
      const trimmedEmail = data.senderEmail.trim();
      if (trimmedEmail.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["senderEmail"],
          message: "Your email address is required unless submitting anonymously.",
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["senderEmail"],
          message: "Please enter a valid email address.",
        });
      }
    }
  });

export type SendFeedbackFormValues = z.infer<typeof sendFeedbackSchema>;

export interface HelpCenterGuideItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
}

export const HELP_CENTER_GUIDES: ReadonlyArray<HelpCenterGuideItem> = [
  {
    id: "filing-jurisdiction",
    title: "1. Selecting Your NTC Regional Office & Filing Applications",
    category: "Application Filing",
    summary:
      "Every application in NTC-EDGE is routed to the appropriate NTC Regional Office (Tenant) that holds jurisdiction over your station, examination, or business location.",
    steps: [
      "Sign in and open the Services catalog to choose from Examinations, Certificates, Licenses, Permits, Accreditations, or Consumer Requests.",
      "Select your target NTC Regional Office and application type (New, Renewal, Modification, or Duplicate) in Step 1 of the guided wizard.",
      "Complete the dynamic form fields (or use Bulk Spreadsheet Import for company/liaison filings) and upload clear documentary requirements.",
    ],
  },
  {
    id: "evaluation-compliance",
    title: "2. Technical Evaluation & Responding to Compliance Deficiencies",
    category: "Evaluation",
    summary:
      "An authorized NTC Evaluator in your selected Regional Office claims and reviews your submitted application and attachments.",
    steps: [
      "Track real-time progress in My Applications as your filing moves from Submitted to Under Evaluation.",
      "If the evaluator returns your application for compliance, review the highlighted deficiency remarks and re-upload corrected documents.",
      "Once all documentary and technical requirements are satisfied, the evaluator generates your Statement of Account (SOA).",
    ],
  },
  {
    id: "soa-op-payment",
    title: "3. Statement of Account (SOA), Order of Payment (OP) & Cashiering",
    category: "Billing & Payment",
    summary:
      "Understand how regulatory fees, surcharges, and documentary stamp taxes (DST) are assessed, approved, and receipted.",
    steps: [
      "After the Evaluator generates the SOA and forwards the application, the Regional Accountant reviews the assessment and issues the approved Order of Payment (OP).",
      "Once your application reaches Pending Payment, open My Applications to view or print your official SOA and Order of Payment.",
      "Pay through authorized NTC payment channels or the Regional Cashier window and submit your payment proof to receive your Official Receipt (OR).",
    ],
  },
  {
    id: "issuance-release",
    title: "4. Official Receipt (OR) Verification & Statutory Document Release",
    category: "Issuance",
    summary:
      "Download your official NTC Admission Slip, Certificate, Radio Station License, Permit, or Accreditation upon completion.",
    steps: [
      "After the Regional Cashier verifies payment and issues the Official Receipt (OR), the application proceeds to For Issuance / Releasing.",
      "Once released by the Regional Office, your status updates to Completed.",
      "Open My Applications to view and download your official NTC issuance and Official Receipt.",
    ],
  },
];

export type ClientPolicyKey =
  | "user-agreement"
  | "privacy-policy"
  | "cookie-policy"
  | "community-guidelines";

export interface FooterPolicyContent {
  key: ClientPolicyKey;
  title: string;
  intro: string;
  sections: { title: string; body: string; highlight?: string }[];
}

export const CLIENT_FOOTER_POLICIES: Record<ClientPolicyKey, FooterPolicyContent> = {
  "user-agreement": {
    key: "user-agreement",
    title: "User Agreement",
    intro:
      "Welcome to the NTC-EDGE Portal. This User Agreement governs your access to and use of all services provided by the National Telecommunications Commission (NTC) via this platform.",
    sections: [
      {
        title: "1. Acceptance of Terms",
        body: "By accessing or using the EDGE Portal, you agree to be bound by these terms and all official NTC circulars and policies incorporated herein.",
      },
      {
        title: "2. Applicant & Representative Obligations",
        body: "You certify that all information, technical parameters, and documentary attachments submitted for examinations, certificates, permits, licenses, accreditations, or requests are true, accurate, and authentic.",
      },
      {
        title: "3. Account Security & Termination",
        body: "You are responsible for maintaining the confidentiality of your account credentials. The NTC reserves the right to suspend or terminate access for falsification or breach of this agreement.",
      },
    ],
  },
  "privacy-policy": {
    key: "privacy-policy",
    title: "Privacy Policy",
    intro:
      "Your privacy is protected under Republic Act No. 10173 (Data Privacy Act of 2012). This policy outlines how the NTC collects, processes, and safeguards personal and corporate data across Regional Offices.",
    sections: [
      {
        title: "1. Data Collection & Purpose",
        body: "We collect personal, educational, technical, and transactional data strictly required to evaluate regulatory applications, assess Statement of Account (SOA) fees, issue Official Receipts, and release statutory NTC documents.",
      },
      {
        title: "2. Regional Tenant Isolation",
        body: "Your application records and feedback are isolated to the appropriate NTC Regional Office handling your transaction and are accessible only to authorized NTC personnel with role-based permissions.",
      },
      {
        title: "3. Data Protection & Retention",
        body: "We implement TLS encryption, strict role-based access controls, and immutable audit logs to protect your records against unauthorized access or disclosure.",
      },
    ],
  },
  "cookie-policy": {
    key: "cookie-policy",
    title: "Cookie Policy",
    intro:
      "The NTC-EDGE Portal uses essential session storage and cookies to ensure secure authentication and reliable multi-step application filing.",
    sections: [
      {
        title: "1. Essential Authentication Cookies",
        body: "Used to maintain your authenticated Clerk session, enforce multi-factor verification, and protect against cross-site request forgery.",
      },
      {
        title: "2. Regional & Draft Preferences",
        body: "Local storage is used to remember your selected NTC Regional Office, theme preference, and unsaved draft application progress.",
      },
      {
        title: "3. Managing Cookies",
        body: "You may clear browser cookies at any time; however, disabling essential session cookies will prevent signing in to the portal.",
      },
    ],
  },
  "community-guidelines": {
    key: "community-guidelines",
    title: "Community & Portal Guidelines",
    intro:
      "These guidelines ensure respectful, constructive, and accountable interaction between applicants, regional representatives, and NTC officers.",
    sections: [
      {
        title: "1. Respectful & Constructive Communication",
        body: "When submitting regional feedback, compliance explanations, or consumer requests, provide clear, accurate, and respectful details so regional officers can assist you effectively.",
      },
      {
        title: "2. Authentic Documentary Submissions",
        body: "Only upload clear, unaltered official documents. Submitting fraudulent receipts or tampered certificates is subject to administrative and legal penalties.",
      },
      {
        title: "3. Proper Regional Routing",
        body: "Address feedback and inquiries to the NTC Regional Office handling your application to ensure prompt review by the Regional Director and Chief of EOD.",
      },
    ],
  },
};


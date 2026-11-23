// @ts-expect-error - bun test runtime module
import { describe, expect, it } from "bun:test";
import {
  sendFeedbackSchema,
  HELP_CENTER_GUIDES,
} from "./feedbackSchema";

describe("sendFeedbackSchema & regional support directory", () => {
  it("validates a complete identified feedback addressed to an NTC Regional Office", () => {
    const result = sendFeedbackSchema.safeParse({
      tenantId: "00000000-0000-0000-0000-000000000007",
      category: "Licensing & Permits",
      subject: "Quick assessment for Radio Station License",
      message:
        "The regional evaluator in NTC Region VII processed our Statement of Account promptly.",
      rating: 5,
      isAnonymous: false,
      senderName: "Juan Dela Cruz",
      senderEmail: "juan.delacruz@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("allows anonymous feedback without requiring senderName or senderEmail", () => {
    const result = sendFeedbackSchema.safeParse({
      tenantId: "00000000-0000-0000-0000-000000000001",
      category: "SOA & Payment / OP",
      subject: "Suggestion on SOA printable view",
      message:
        "Adding a clearer breakdown of DST and surcharge on the mobile view would be helpful.",
      rating: 4,
      isAnonymous: true,
      senderName: "",
      senderEmail: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-anonymous feedback when senderName or valid senderEmail is missing", () => {
    const result = sendFeedbackSchema.safeParse({
      tenantId: "00000000-0000-0000-0000-000000000001",
      category: "Technical / Portal UX",
      subject: "Follow up request",
      message: "Please contact me regarding my radio operator exam schedule.",
      rating: 3,
      isAnonymous: false,
      senderName: "",
      senderEmail: "invalid-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("senderName");
      expect(paths).toContain("senderEmail");
    }
  });

  it("requires a target NTC Regional Office tenantId and minimum message length", () => {
    const result = sendFeedbackSchema.safeParse({
      tenantId: "",
      category: "Licensing & Permits",
      subject: "Hi",
      message: "Short",
      rating: 5,
      isAnonymous: true,
      senderName: "",
      senderEmail: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("tenantId");
      expect(paths).toContain("subject");
      expect(paths).toContain("message");
    }
  });

  it("provides self-service guides for regional workflow stages", () => {
    expect(HELP_CENTER_GUIDES.length).toBe(4);
  });
});

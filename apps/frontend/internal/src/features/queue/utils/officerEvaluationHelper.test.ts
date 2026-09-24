import {
  resolveUserIdentifiers,
  matchesUserIdentifier,
  isGenericOfficer,
  computeOfficerEvaluationState,
  resolveApplicantAuditHistory,
} from "./officerEvaluationHelper";
import { ApplicationData, ApplicantItem } from "../../../types/application";

describe("officerEvaluationHelper", () => {
  describe("resolveUserIdentifiers", () => {
    it("consolidates unique lowercased identifiers from user, clerkUser, and currentUserName", () => {
      const user = {
        id: "USR-001",
        email: "Officer.One@NTC.gov.ph",
        name: "Officer One",
        username: "officer1",
        firstName: "Officer",
        lastName: "One",
      };
      const clerkUser = {
        id: "user_2aBcDeFg",
        primaryEmailAddress: { emailAddress: "officer.one@ntc.gov.ph" },
        fullName: "Officer One",
        username: "officer1",
      };

      const ids = resolveUserIdentifiers(user, clerkUser, "Officer One");
      expect(ids).toContain("usr-001");
      expect(ids).toContain("user_2abcdefg");
      expect(ids).toContain("officer.one@ntc.gov.ph");
      expect(ids).toContain("officer one");
      expect(ids).toContain("officer1");
      expect(ids).toContain("officer");
      expect(ids).toContain("one");
    });

    it("handles null and undefined properties gracefully without throwing", () => {
      const ids = resolveUserIdentifiers(null, null, undefined);
      expect(ids).toEqual([]);
    });
  });

  describe("matchesUserIdentifier", () => {
    const identifiers = ["usr-001", "evaluator.jane@ntc.gov.ph", "jane doe"];

    it("matches exact identity case-insensitively", () => {
      expect(matchesUserIdentifier("USR-001", identifiers)).toBe(true);
      expect(matchesUserIdentifier("Jane Doe", identifiers)).toBe(true);
      expect(matchesUserIdentifier("EVALUATOR.JANE@NTC.GOV.PH", identifiers)).toBe(true);
    });

    it("matches substring identity", () => {
      expect(matchesUserIdentifier("Engr. Jane Doe (Evaluator)", identifiers)).toBe(true);
    });

    it("returns false for non-matching identities or empty inputs", () => {
      expect(matchesUserIdentifier("John Smith", identifiers)).toBe(false);
      expect(matchesUserIdentifier("", identifiers)).toBe(false);
      expect(matchesUserIdentifier(null, identifiers)).toBe(false);
      expect(matchesUserIdentifier(undefined, identifiers)).toBe(false);
    });
  });

  describe("isGenericOfficer", () => {
    it("returns true for generic placeholders or empty names", () => {
      expect(isGenericOfficer("")).toBe(true);
      expect(isGenericOfficer(null)).toBe(true);
      expect(isGenericOfficer(undefined)).toBe(true);
      expect(isGenericOfficer("unassigned")).toBe(true);
      expect(isGenericOfficer("Officer")).toBe(true);
      expect(isGenericOfficer("Authorized Officer")).toBe(true);
      expect(isGenericOfficer("Evaluating Officer")).toBe(true);
      expect(isGenericOfficer("NTC Officer")).toBe(true);
      expect(isGenericOfficer("Admin")).toBe(true);
      expect(isGenericOfficer("System Admin")).toBe(true);
      expect(isGenericOfficer("National Capital Region", "National Capital Region")).toBe(true);
    });

    it("returns false for specific person names", () => {
      expect(isGenericOfficer("Engr. Maria Santos", "National Capital Region")).toBe(false);
      expect(isGenericOfficer("Juan Dela Cruz", "Region VII")).toBe(false);
    });
  });

  describe("computeOfficerEvaluationState", () => {
    const baseApp: ApplicationData = {
      id: "app-101",
      referenceNumber: "REF-101",
      permitTitle: "Radio Station License",
      status: "Evaluating",
      applicant: "Acme Corp",
      applicantType: "Company",
      category: "Licenses",
      totalAmountDue: 1500,
      assignedTo: "Engr. Maria Santos",
      evaluatingOfficer: "Engr. Maria Santos",
      createdAt: "2026-09-20T10:00:00Z",
    };

    it("detects when application is evaluated by current user", () => {
      const state = computeOfficerEvaluationState({
        application: baseApp,
        identifiers: ["maria santos", "engr. maria santos"],
      });

      expect(state.isEvaluating).toBe(true);
      expect(state.isEvaluatedByMe).toBe(true);
      expect(state.isEvaluatedByOther).toBe(false);
    });

    it("detects when application is evaluated by another officer", () => {
      const state = computeOfficerEvaluationState({
        application: baseApp,
        identifiers: ["john doe"],
      });

      expect(state.isEvaluating).toBe(true);
      expect(state.isEvaluatedByMe).toBe(false);
      expect(state.isEvaluatedByOther).toBe(true);
    });

    it("allows any officer to evaluate generic/unassigned evaluating officer", () => {
      const genericApp: ApplicationData = {
        ...baseApp,
        assignedTo: "Authorized Officer",
        evaluatingOfficer: "Authorized Officer",
      };

      const state = computeOfficerEvaluationState({
        application: genericApp,
        identifiers: ["john doe"],
      });

      expect(state.isEvaluating).toBe(true);
      expect(state.isEvaluatedByMe).toBe(true);
      expect(state.isEvaluatedByOther).toBe(false);
    });

    it("handles endorsement states correctly for officers vs admins", () => {
      const endorsedApp: ApplicationData = {
        ...baseApp,
        endorsedTo: "Engr. Juan Dela Cruz",
      };

      const nonAdminState = computeOfficerEvaluationState({
        application: endorsedApp,
        identifiers: ["maria santos"],
        isAdmin: false,
      });
      expect(nonAdminState.isEndorsed).toBe(true);
      expect(nonAdminState.isEndorsedToMe).toBe(false);
      expect(nonAdminState.isEndorsedAwayFromMe).toBe(true);

      const adminState = computeOfficerEvaluationState({
        application: endorsedApp,
        identifiers: ["admin user"],
        isAdmin: true,
      });
      expect(adminState.isEndorsedAwayFromMe).toBe(false);
    });
  });

  describe("resolveApplicantAuditHistory", () => {
    it("returns full application history for single applications", () => {
      const app: ApplicationData = {
        id: "app-single",
        referenceNumber: "REF-S-1",
        permitTitle: "RROC Certificate",
        status: "Submitted",
        applicant: "Alice Wonderland",
        applicantType: "Individual",
        category: "Certificates",
        totalAmountDue: 300,
        createdAt: "2026-09-21T08:00:00Z",
        history: [
          {
            id: "hist-1",
            action: "Application Submitted",
            staff: "Alice Wonderland",
            role: "Applicant",
            timestamp: "Sep 21, 2026",
          },
        ],
      };

      const history = resolveApplicantAuditHistory(app, {
        id: "applicant-1",
        name: "Alice Wonderland",
        applicantType: "Individual",
        status: "Complete",
      });

      expect(history.length).toBe(1);
      expect(history[0]?.action).toBe("Application Submitted");
    });

    it("generates structured audit entries for bulk applications with evaluation verdicts", () => {
      const app: ApplicationData = {
        id: "app-bulk",
        referenceNumber: "REF-B-1",
        permitTitle: "Bulk Operator Exam",
        status: "Evaluating",
        applicationType: "BULK",
        applicant: "Telecom Training Center",
        applicantType: "Company",
        category: "Exams",
        totalAmountDue: 3000,
        createdAt: "2026-09-22T09:00:00Z",
        applicantsList: [
          { id: "app-1", name: "Candidate One", applicantType: "Individual", status: "Incomplete", evaluationRemarks: "Missing 2x2 Photo" },
          { id: "app-2", name: "Candidate Two", applicantType: "Individual", status: "Complete" },
        ],
      };

      const candidateOne = app.applicantsList?.[0] as ApplicantItem;
      const history = resolveApplicantAuditHistory(app, candidateOne);

      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0]?.action).toContain("Candidate One");
      expect(history[1]?.status).toBe("Incomplete");
      expect(history[1]?.remarks).toBe("Missing 2x2 Photo");
    });
  });
});

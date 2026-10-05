import {
  resolveUserIdentifiers,
  matchesUserIdentifier,
  isGenericOfficer,
  computeOfficerEvaluationState,
  resolveApplicantAuditHistory,
  getApprovingEvaluator,
} from "./officerEvaluationHelper";
import { ApplicationData, ApplicantItem } from "../../../types/application";

function createMockApplicant(overrides: Partial<ApplicantItem> = {}): ApplicantItem {
  return {
    id: overrides.id ?? "app-1",
    name: overrides.name ?? "Applicant Name",
    applicantType: overrides.applicantType ?? "Individual",
    status: overrides.status ?? "Complete",
    evaluationRemarks: overrides.evaluationRemarks,
    contactNumber: overrides.contactNumber ?? "09170000000",
    email: overrides.email ?? "applicant@example.com",
    address: overrides.address ?? "123 Main St",
    barangay: overrides.barangay ?? "Barangay 1",
    city: overrides.city ?? "Manila",
    province: overrides.province ?? "Metro Manila",
    zipCode: overrides.zipCode ?? "1000",
    ...overrides,
  };
}

function createMockApp(overrides: Partial<ApplicationData> = {}): ApplicationData {
  return {
    id: overrides.id ?? "app-101",
    referenceNumber: overrides.referenceNumber ?? "REF-101",
    applicationNumber: overrides.applicationNumber ?? "APP-101",
    applicant: overrides.applicant ?? "Acme Corp",
    applicantType: overrides.applicantType ?? "Company",
    permitTitle: overrides.permitTitle ?? "Radio Station License",
    category: overrides.category ?? "Licenses",
    status: overrides.status ?? "Evaluating",
    queueTab: overrides.queueTab ?? "pending",
    createdAt: overrides.createdAt ?? "2026-09-20T10:00:00Z",
    dateLabel: overrides.dateLabel ?? "Sep 20, 2026",
    assignedTo: overrides.assignedTo ?? "Engr. Maria Santos",
    evaluatingOfficer: overrides.evaluatingOfficer ?? "Engr. Maria Santos",
    applicationType: overrides.applicationType ?? "SINGLE",
    isBeingViewed: overrides.isBeingViewed ?? false,
    isUrgent: overrides.isUrgent ?? false,
    isPinned: overrides.isPinned ?? false,
    address: overrides.address ?? {
      barangay: "Barangay 1",
      city: "Manila",
      province: "Metro Manila",
      zipCode: "1000",
    },
    contactDetails: overrides.contactDetails ?? {
      contactNumber: "09170000000",
      email: "contact@example.com",
    },
    basicInfo: overrides.basicInfo ?? {
      lastName: "Santos",
      firstName: "Maria",
      middleName: "",
      extensionName: "",
      dob: "1990-01-01",
      placeOfBirth: "Manila",
      sex: "Female",
      weight: 55,
      height: 165,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Engineer",
    },
    applicationDetails: overrides.applicationDetails ?? {
      noOfYears: 1,
      permitCategory: "Radio",
      formType: "Standard",
      submittedAt: "2026-09-20T10:00:00Z",
    },
    requirements: overrides.requirements ?? [],
    forms: overrides.forms ?? [],
    soaItems: overrides.soaItems ?? [],
    totalAmountDue: overrides.totalAmountDue ?? 1500,
    dueDate: overrides.dueDate ?? "2026-10-20",
    payment: overrides.payment ?? {
      amountReceived: 0,
      method: "cash",
      orNumber: "",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: overrides.correctionAuditTrail ?? [],
    history: overrides.history ?? [],
    note: overrides.note ?? "",
    ...overrides,
  };
}

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
    const baseApp = createMockApp();

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
      const genericApp = createMockApp({
        assignedTo: "Authorized Officer",
        evaluatingOfficer: "Authorized Officer",
      });

      const state = computeOfficerEvaluationState({
        application: genericApp,
        identifiers: ["john doe"],
      });

      expect(state.isEvaluating).toBe(true);
      expect(state.isEvaluatedByMe).toBe(true);
      expect(state.isEvaluatedByOther).toBe(false);
    });

    it("handles endorsement states correctly for officers vs admins", () => {
      const endorsedApp = createMockApp({
        endorsedTo: "Engr. Juan Dela Cruz",
      });

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

    describe("Concurrent access & stage authority locking scenarios", () => {
      const officerAIdentifiers = ["officer-a@ntc.gov.ph", "engr. alice santos", "alice santos"];
      const officerBIdentifiers = ["officer-b@ntc.gov.ph", "engr. bob reyes", "bob reyes"];
      const adminIdentifiers = ["admin@ntc.gov.ph", "system administrator"];

      it("allows both Officer A and Officer B to see an application as unclaimed in Submitted state", () => {
        const submittedApp = createMockApp({
          status: "Submitted",
          assignedTo: "Authorized Officer",
          evaluatingOfficer: "Authorized Officer",
        });

        const stateA = computeOfficerEvaluationState({
          application: submittedApp,
          identifiers: officerAIdentifiers,
          isAdmin: false,
        });

        const stateB = computeOfficerEvaluationState({
          application: submittedApp,
          identifiers: officerBIdentifiers,
          isAdmin: false,
        });

        expect(stateA.isStageUnclaimed).toBe(true);
        expect(stateA.isStageClaimedByMe).toBe(false);
        expect(stateA.isStageClaimedByOther).toBe(false);

        expect(stateB.isStageUnclaimed).toBe(true);
        expect(stateB.isStageClaimedByMe).toBe(false);
        expect(stateB.isStageClaimedByOther).toBe(false);
      });

      it("locks out Officer B when Officer A claims the Evaluating stage", () => {
        // Officer A claims the application
        const claimedApp = createMockApp({
          status: "Evaluating",
          assignedTo: "Engr. Alice Santos",
          evaluatingOfficer: "Engr. Alice Santos",
        });

        // Officer A's perspective
        const stateA = computeOfficerEvaluationState({
          application: claimedApp,
          identifiers: officerAIdentifiers,
          isAdmin: false,
        });
        expect(stateA.isStageClaimedByMe).toBe(true);
        expect(stateA.isStageClaimedByOther).toBe(false);
        expect(stateA.isStageUnclaimed).toBe(false);
        expect(stateA.currentStageOfficer).toBe("Engr. Alice Santos");

        // Officer B concurrently views the same application
        const stateB = computeOfficerEvaluationState({
          application: claimedApp,
          identifiers: officerBIdentifiers,
          isAdmin: false,
        });
        expect(stateB.isStageClaimedByMe).toBe(false);
        expect(stateB.isStageClaimedByOther).toBe(true);
        expect(stateB.isStageUnclaimed).toBe(false);
        expect(stateB.currentStageOfficer).toBe("Engr. Alice Santos");
      });

      it("enforces stage locking during ForAccountant review", () => {
        const accountantA = ["accountant.ann@ntc.gov.ph", "ann accountant"];
        const accountantB = ["accountant.ben@ntc.gov.ph", "ben accountant"];

        // Unclaimed accountant review
        const unclaimedAcctApp = createMockApp({
          status: "ForAccountant",
          accountingOfficer: undefined,
          assignedTo: "Authorized Officer",
        });
        const unAcctState = computeOfficerEvaluationState({
          application: unclaimedAcctApp,
          identifiers: accountantA,
        });
        expect(unAcctState.isStageUnclaimed).toBe(true);
        expect(unAcctState.isStageClaimedByMe).toBe(false);
        expect(unAcctState.isStageClaimedByOther).toBe(false);

        // Accountant A claims it
        const claimedAcctApp = createMockApp({
          status: "ForAccountant",
          accountingOfficer: "Ann Accountant",
          assignedTo: "Ann Accountant",
        });

        const stateAcctA = computeOfficerEvaluationState({
          application: claimedAcctApp,
          identifiers: accountantA,
        });
        expect(stateAcctA.isStageClaimedByMe).toBe(true);
        expect(stateAcctA.isStageClaimedByOther).toBe(false);

        const stateAcctB = computeOfficerEvaluationState({
          application: claimedAcctApp,
          identifiers: accountantB,
        });
        expect(stateAcctB.isStageClaimedByMe).toBe(false);
        expect(stateAcctB.isStageClaimedByOther).toBe(true);
        expect(stateAcctB.currentStageOfficer).toBe("Ann Accountant");
      });

      it("enforces stage locking during PendingPayment / Cashier review", () => {
        const cashierA = ["cashier.cathy@ntc.gov.ph", "cathy cashier"];
        const cashierB = ["cashier.dan@ntc.gov.ph", "dan cashier"];

        const claimedCashierApp = createMockApp({
          status: "PendingPayment",
          cashierOfficer: "Cathy Cashier",
          assignedTo: "Cathy Cashier",
        });

        const stateCashierA = computeOfficerEvaluationState({
          application: claimedCashierApp,
          identifiers: cashierA,
        });
        expect(stateCashierA.isStageClaimedByMe).toBe(true);
        expect(stateCashierA.isStageClaimedByOther).toBe(false);

        const stateCashierB = computeOfficerEvaluationState({
          application: claimedCashierApp,
          identifiers: cashierB,
        });
        expect(stateCashierB.isStageClaimedByMe).toBe(false);
        expect(stateCashierB.isStageClaimedByOther).toBe(true);
        expect(stateCashierB.currentStageOfficer).toBe("Cathy Cashier");
      });

      it("enforces stage locking during ForIssuance / Releasing stage", () => {
        const issuerA = ["issuer.irene@ntc.gov.ph", "irene issuer"];
        const issuerB = ["issuer.ian@ntc.gov.ph", "ian issuer"];

        const claimedIssuanceApp = createMockApp({
          status: "ForIssuance",
          issuingOfficer: "Irene Issuer",
          assignedTo: "Irene Issuer",
        });

        const stateIssuerA = computeOfficerEvaluationState({
          application: claimedIssuanceApp,
          identifiers: issuerA,
        });
        expect(stateIssuerA.isStageClaimedByMe).toBe(true);
        expect(stateIssuerA.isStageClaimedByOther).toBe(false);

        const stateIssuerB = computeOfficerEvaluationState({
          application: claimedIssuanceApp,
          identifiers: issuerB,
        });
        expect(stateIssuerB.isStageClaimedByMe).toBe(false);
        expect(stateIssuerB.isStageClaimedByOther).toBe(true);
        expect(stateIssuerB.currentStageOfficer).toBe("Irene Issuer");
      });

      it("allows administrators to override stage locks held by other officers", () => {
        const lockedApp = createMockApp({
          status: "Evaluating",
          assignedTo: "Engr. Alice Santos",
          evaluatingOfficer: "Engr. Alice Santos",
        });

        const adminState = computeOfficerEvaluationState({
          application: lockedApp,
          identifiers: adminIdentifiers,
          isAdmin: true,
        });

        expect(adminState.isStageClaimedByMe).toBe(true);
        expect(adminState.isStageClaimedByOther).toBe(false);
      });

      it("returns application to unclaimed state if officer releases authority back to queue", () => {
        const releasedApp = createMockApp({
          status: "Evaluating",
          assignedTo: "Authorized Officer",
          evaluatingOfficer: "Authorized Officer",
        });

        const stateA = computeOfficerEvaluationState({
          application: releasedApp,
          identifiers: officerAIdentifiers,
          isAdmin: false,
        });

        expect(stateA.isStageUnclaimed).toBe(false);
        // Generic officer allows current viewing officer to evaluate
        expect(stateA.isStageClaimedByMe).toBe(true);
        expect(stateA.isStageClaimedByOther).toBe(false);
      });
    });
  });

  describe("resolveApplicantAuditHistory", () => {
    it("returns full application history for single applications", () => {
      const app = createMockApp({
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
      });

      const history = resolveApplicantAuditHistory(
        app,
        createMockApplicant({
          id: "applicant-1",
          name: "Alice Wonderland",
          applicantType: "Individual",
          status: "Complete",
        })
      );

      expect(history.length).toBe(1);
      expect(history[0]?.action).toBe("Application Submitted");
    });

    it("generates structured audit entries for bulk applications with evaluation verdicts", () => {
      const candidateOne = createMockApplicant({
        id: "app-1",
        name: "Candidate One",
        applicantType: "Individual",
        status: "Incomplete",
        evaluationRemarks: "Missing 2x2 Photo",
      });
      const candidateTwo = createMockApplicant({
        id: "app-2",
        name: "Candidate Two",
        applicantType: "Individual",
        status: "Complete",
      });

      const app = createMockApp({
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
        applicantsList: [candidateOne, candidateTwo],
      });

      const history = resolveApplicantAuditHistory(app, candidateOne);

      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0]?.action).toContain("Candidate One");
      expect(history[1]?.status).toBe("Incomplete");
      expect(history[1]?.remarks).toBe("Missing 2x2 Photo");
    });
  });

  describe("getApprovingEvaluator", () => {
    it("resolves evaluating officer from handoff to accountant history entry", () => {
      const app = createMockApp({
        status: "ForIssuance",
        history: [
          {
            id: "h-1",
            action: "Application Submitted",
            staff: "Client Applicant",
            timestamp: "2026-09-20T10:00:00Z",
          },
          {
            id: "h-2",
            action: "Forwarded to Accountant",
            staff: "Engr. Roberto Cruz",
            role: "Evaluating Officer",
            status: "ForAccountant",
            timestamp: "2026-09-21T11:00:00Z",
          },
          {
            id: "h-3",
            action: "SOA Approved",
            staff: "Accountant Jane",
            role: "Accountant",
            status: "PendingPayment",
            timestamp: "2026-09-21T14:00:00Z",
          },
          {
            id: "h-4",
            action: "Payment Verified (OR-12345)",
            staff: "Cashier Bob",
            role: "Cashier",
            status: "ForIssuance",
            timestamp: "2026-09-22T09:00:00Z",
          },
        ],
      });

      const evaluator = getApprovingEvaluator(app);
      expect(evaluator).toBe("Engr. Roberto Cruz");
    });

    it("falls back to evaluatingOfficer field if not found in history", () => {
      const app = createMockApp({
        status: "ForIssuance",
        evaluatingOfficer: "Engr. Maria Santos",
        history: [],
      });

      const evaluator = getApprovingEvaluator(app);
      expect(evaluator).toBe("Engr. Maria Santos");
    });

    it("returns null when no specific evaluating officer exists or name is generic", () => {
      const app = createMockApp({
        status: "Submitted",
        evaluatingOfficer: "Authorized Officer",
        office: "National Capital Region",
        history: [],
      });

      const evaluator = getApprovingEvaluator(app);
      expect(evaluator).toBeNull();
    });
  });

  describe("Officer Return Workflow & Mandatory Reason Validation", () => {
    it("strictly requires at least 5 characters for a return notice", () => {
      const isValidReason = (reason?: string | null): boolean => {
        if (!reason || typeof reason !== "string") return false;
        return reason.trim().length >= 5;
      };

      expect(isValidReason(null)).toBe(false);
      expect(isValidReason("")).toBe(false);
      expect(isValidReason("   ")).toBe(false);
      expect(isValidReason("bad")).toBe(false);
      expect(isValidReason("1234")).toBe(false);
      expect(isValidReason("12345")).toBe(true);
      expect(isValidReason("Missing photo attachment and unclear proof of billing.")).toBe(true);
    });

    it("allows Evaluator to return an application in Submitted status with notice", () => {
      const isReturnPermitted = (params: {
        status: string;
        isStageClaimedByMe: boolean;
        isStageUnclaimed: boolean;
        isEndorsedAway: boolean;
        isStageClaimedByOther: boolean;
        role: string;
      }): boolean => {
        const { status, isStageClaimedByMe, isStageUnclaimed, isEndorsedAway, isStageClaimedByOther, role } = params;
        if (isEndorsedAway || isStageClaimedByOther) return false;
        const isSubmitted = status.toLowerCase() === "submitted";
        const isEvaluating = status.toLowerCase() === "evaluating";
        const isEvaluator = role === "Evaluator" || role === "Admin" || role === "Chief";
        return (isSubmitted || isEvaluating) && (isStageClaimedByMe || isStageUnclaimed || isEvaluator);
      };

      expect(isReturnPermitted({
        status: "Submitted",
        isStageClaimedByMe: false,
        isStageUnclaimed: true,
        isEndorsedAway: false,
        isStageClaimedByOther: false,
        role: "Evaluator",
      })).toBe(true);

      expect(isReturnPermitted({
        status: "Submitted",
        isStageClaimedByMe: false,
        isStageUnclaimed: false,
        isEndorsedAway: true,
        isStageClaimedByOther: false,
        role: "Evaluator",
      })).toBe(false);
    });
  });
});

import { ApplicationData, ApplicantItem, AuditTrailEntry } from "../../../types/application";

export interface AuthUserLike {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface ClerkUserLike {
  id?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  fullName?: string | null;
  username?: string | null;
}

export function resolveUserIdentifiers(
  user?: AuthUserLike | null,
  clerkUser?: ClerkUserLike | null,
  currentUserName?: string
): string[] {
  const ids = new Set<string>();
  if (user?.id) ids.add(user.id.toLowerCase().trim());
  if (clerkUser?.id) ids.add(clerkUser.id.toLowerCase().trim());
  if (user?.email) ids.add(user.email.toLowerCase().trim());
  if (clerkUser?.primaryEmailAddress?.emailAddress) {
    ids.add(clerkUser.primaryEmailAddress.emailAddress.toLowerCase().trim());
  }
  if (user?.name) ids.add(user.name.toLowerCase().trim());
  if (clerkUser?.fullName) ids.add(clerkUser.fullName.toLowerCase().trim());
  if (user?.username) ids.add(user.username.toLowerCase().trim());
  if (clerkUser?.username) ids.add(clerkUser.username.toLowerCase().trim());
  if (user?.firstName) ids.add(user.firstName.toLowerCase().trim());
  if (user?.lastName) ids.add(user.lastName.toLowerCase().trim());
  if (currentUserName) ids.add(currentUserName.toLowerCase().trim());
  const fullNameCombined = [user?.firstName, user?.lastName].filter(Boolean).join(" ").toLowerCase().trim();
  if (fullNameCombined) ids.add(fullNameCombined);
  return Array.from(ids).filter((s) => s.length > 0);
}

export function matchesUserIdentifier(target?: string | null, identifiers: string[] = []): boolean {
  if (!target) return false;
  const t = target.trim().toLowerCase();
  if (!t) return false;

  for (const ident of identifiers) {
    if (t === ident || t.includes(ident) || ident.includes(t)) {
      return true;
    }
  }
  return false;
}

export function isGenericOfficer(name?: string | null, office?: string | null): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return (
    n.length === 0 ||
    n === "unassigned" ||
    n === "authorized officer" ||
    n === "officer" ||
    n === "evaluating officer" ||
    n === "ntc officer" ||
    n === "admin" ||
    n === "system admin" ||
    n === (office ?? "").toLowerCase()
  );
}

export interface OfficerEvaluationState {
  isEvaluating: boolean;
  evaluatingOfficer?: string;
  isEndorsed: boolean;
  isEndorsedToMe: boolean;
  isEndorsedAwayFromMe: boolean;
  isEvaluatedByMe: boolean;
  isEvaluatedByOther: boolean;
  currentStageOfficer?: string;
  isStageClaimedByMe: boolean;
  isStageClaimedByOther: boolean;
  isStageUnclaimed: boolean;
}

export function computeOfficerEvaluationState(params: {
  application: ApplicationData;
  identifiers: string[];
  isAdmin?: boolean;
}): OfficerEvaluationState {
  const { application, identifiers, isAdmin = false } = params;
  const isEvaluating = application.status.toLowerCase() === "evaluating";
  const isReturned = application.status.toLowerCase() === "returned";
  const evaluatingOfficer = application.evaluatingOfficer || ((isEvaluating || isReturned) ? application.assignedTo : undefined);

  const isEndorsed = Boolean(application.endorsedTo && application.endorsedTo.trim().length > 0);
  const isEndorsedToMe = Boolean(isEndorsed && matchesUserIdentifier(application.endorsedTo, identifiers));
  const isEndorsedAwayFromMe = isEndorsed && !isEndorsedToMe && !isAdmin;

  const isEvaluatedByMe = (isEvaluating || isReturned) && Boolean(
    isEndorsedToMe ||
    (evaluatingOfficer && !isGenericOfficer(evaluatingOfficer, application.office) && matchesUserIdentifier(evaluatingOfficer, identifiers)) ||
    (!isGenericOfficer(application.assignedTo, application.office) && matchesUserIdentifier(application.assignedTo, identifiers))
  );

  const isEvaluatedByOther = (isEvaluating || isReturned) && !isEndorsedToMe && Boolean(
    evaluatingOfficer &&
    !isGenericOfficer(evaluatingOfficer, application.office) &&
    !isEvaluatedByMe
  );

  const statusLower = application.status.toLowerCase();
  let currentStageOfficer: string | undefined;
  let isStageClaimedByMe = false;
  let isStageClaimedByOther = false;
  let isStageUnclaimed = false;

  if (statusLower === "submitted") {
    isStageUnclaimed = true;
  } else if (statusLower === "evaluating" || statusLower === "returned") {
    currentStageOfficer = evaluatingOfficer || (!isGenericOfficer(application.assignedTo, application.office) ? application.assignedTo : undefined);
    if (!currentStageOfficer || isGenericOfficer(currentStageOfficer, application.office)) {
      isStageUnclaimed = true;
    } else if (isEvaluatedByMe) {
      isStageClaimedByMe = true;
    } else {
      isStageClaimedByOther = true;
    }
  } else if (statusLower === "foraccountant") {
    currentStageOfficer = application.accountingOfficer;
    if (!currentStageOfficer || isGenericOfficer(currentStageOfficer, application.office)) {
      isStageUnclaimed = true;
    } else if (matchesUserIdentifier(currentStageOfficer, identifiers)) {
      isStageClaimedByMe = true;
    } else {
      isStageClaimedByOther = true;
    }
  } else if (statusLower === "pendingpayment") {
    currentStageOfficer = application.cashierOfficer;
    if (!currentStageOfficer || isGenericOfficer(currentStageOfficer, application.office)) {
      isStageUnclaimed = true;
    } else if (matchesUserIdentifier(currentStageOfficer, identifiers)) {
      isStageClaimedByMe = true;
    } else {
      isStageClaimedByOther = true;
    }
  } else if (statusLower === "forissuance") {
    currentStageOfficer = application.issuingOfficer;
    if (!currentStageOfficer || isGenericOfficer(currentStageOfficer, application.office)) {
      isStageUnclaimed = true;
    } else if (matchesUserIdentifier(currentStageOfficer, identifiers)) {
      isStageClaimedByMe = true;
    } else {
      isStageClaimedByOther = true;
    }
  } else {
    isStageClaimedByMe = true;
  }

  return {
    isEvaluating,
    evaluatingOfficer,
    isEndorsed,
    isEndorsedToMe,
    isEndorsedAwayFromMe,
    isEvaluatedByMe,
    isEvaluatedByOther,
    currentStageOfficer,
    isStageClaimedByMe,
    isStageClaimedByOther,
    isStageUnclaimed,
  };
}

export function resolveApplicantAuditHistory(
  app: ApplicationData,
  activeApplicant?: ApplicantItem | null
): AuditTrailEntry[] {
  if (activeApplicant === null || activeApplicant === undefined) return [];

  const isBulk = app.applicationType === "BULK" && (app.applicantsList && app.applicantsList.length > 1);

  // For single/regular applications, display the full application audit history
  if (!isBulk && app.history && app.history.length > 0) {
    return app.history;
  }

  if (activeApplicant.history !== null && activeApplicant.history !== undefined && activeApplicant.history.length > 0) {
    return activeApplicant.history;
  }

  const list: AuditTrailEntry[] = [];

  // 1. Initial Submission for this applicant
  const submitter = app.filingUser?.name || app.applicant || "Applicant";
  list.push({
    id: `applicant-sub-${activeApplicant.id}`,
    action: isBulk
      ? `Applicant Record Submitted (${activeApplicant.name})`
      : "Applicant Record Submitted",
    staff: submitter,
    role: "Filing Submitter",
    status: "Submitted",
    timestamp: app.createdAt
      ? new Date(app.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "",
  });

  // 2. Application-level history events that mention this applicant
  if (app.history !== null && app.history !== undefined && app.history.length > 0) {
    const applicantNameLower = typeof activeApplicant.name === "string" ? activeApplicant.name.toLowerCase() : "";
    for (const h of app.history) {
      if (
        h.id.startsWith("init-") ||
        (h.action.toLowerCase().includes("application submitted") &&
          (applicantNameLower.length === 0 || !h.action.toLowerCase().includes(applicantNameLower)))
      ) {
        continue;
      }

      const actionMatch = applicantNameLower.length > 0 && h.action.toLowerCase().includes(applicantNameLower);
      const remarksMatch = applicantNameLower.length > 0 && typeof h.remarks === "string" && h.remarks.toLowerCase().includes(applicantNameLower);

      if (!isBulk || actionMatch || remarksMatch) {
        list.push(h);
      }
    }
  }

  // 3. Current Applicant Evaluation Verdict / Status
  if (activeApplicant.status !== null && activeApplicant.status !== undefined) {
    if (activeApplicant.status === "Incomplete") {
      list.push({
        id: `applicant-eval-${activeApplicant.id}`,
        action: "Applicant Evaluation: Incomplete / Deficiencies Noted",
        staff: "Evaluating Officer",
        role: "Return Officer",
        status: "Incomplete",
        remarks: activeApplicant.evaluationRemarks && activeApplicant.evaluationRemarks.trim().length > 0
          ? activeApplicant.evaluationRemarks
          : "Discrepancy remarks or missing requirements noted during evaluation.",
        timestamp: "Current Evaluation State",
      });
    } else if (activeApplicant.status === "ForEndorsement") {
      list.push({
        id: `applicant-eval-${activeApplicant.id}`,
        action: "Applicant Evaluation: Recommended for Endorsement",
        staff: "Evaluating Officer",
        role: "Evaluating Officer",
        status: "ForEndorsement",
        remarks: activeApplicant.evaluationRemarks && activeApplicant.evaluationRemarks.trim().length > 0
          ? activeApplicant.evaluationRemarks
          : undefined,
        timestamp: "Current Evaluation State",
      });
    } else if (activeApplicant.status === "Complete") {
      list.push({
        id: `applicant-eval-${activeApplicant.id}`,
        action: "Applicant Evaluation: Complete & Verified",
        staff: "Evaluating Officer",
        role: "Evaluating Officer",
        status: "Complete",
        remarks: activeApplicant.evaluationRemarks && activeApplicant.evaluationRemarks.trim().length > 0
          ? activeApplicant.evaluationRemarks
          : undefined,
        timestamp: "Current Evaluation State",
      });
    }
  }

  return list;
}

/**
 * Resolves the approving evaluator (the technical evaluation engineer/officer who evaluated
 * the application before the accountant and cashier stages).
 */
export function getApprovingEvaluator(application: ApplicationData): string | null {
  // 1. Check history for explicit evaluation completion / forward to accountant
  if (application.history && application.history.length > 0) {
    const matchingEntry = [...application.history].reverse().find((h) => {
      const act = (h.action || '').toLowerCase();
      const rem = (h.remarks || '').toLowerCase();
      const stat = (h.status || '').toLowerCase();
      const role = (h.role || '').toLowerCase();

      // Exclude return entries and accountant/cashier entries
      const isDownstreamReturn =
        role.includes('accountant') ||
        role.includes('cashier') ||
        act.includes('soa return') ||
        act.includes('returned by accountant') ||
        act.includes('returned by cashier') ||
        rem.includes('returned by accountant') ||
        rem.includes('returned by cashier');

      if (isDownstreamReturn) return false;

      const isAccountantHandoff =
        (act.includes('forwarded to accountant') || act.includes('approved & forwarded') || stat === 'foraccountant') &&
        !act.includes('returned');

      const isEvaluationAction =
        act.includes('evaluated') ||
        act.includes('evaluation complete') ||
        act.includes('approved evaluation') ||
        act.includes('technical evaluation') ||
        act.includes('evaluation started');

      const isEvaluatorRole = role.includes('evaluator') || role.includes('engineer') || role.includes('chief') || role.includes('director');

      return (
        (isAccountantHandoff || isEvaluationAction || (isEvaluatorRole && (act.includes('forwarded') || act.includes('approved') || act.includes('evaluat')))) &&
        Boolean(h.staff && h.staff.trim().length > 0 && !isGenericOfficer(h.staff, application.office))
      );
    });

    if (matchingEntry && matchingEntry.staff && matchingEntry.staff.trim().length > 0) {
      return matchingEntry.staff.trim();
    }

    // Secondary fallback in history: any entry with an evaluator role that isn't generic and not a return
    const anyEvaluatorEntry = [...application.history].reverse().find(
      (h) =>
        !((h.role || '').toLowerCase().includes('accountant') || (h.role || '').toLowerCase().includes('cashier')) &&
        ((h.role || '').toLowerCase().includes('evaluat') || (h.action || '').toLowerCase().includes('evaluat')) &&
        !(h.action || '').toLowerCase().includes('return') &&
        Boolean(h.staff && h.staff.trim().length > 0 && !isGenericOfficer(h.staff, application.office))
    );
    if (anyEvaluatorEntry && anyEvaluatorEntry.staff && anyEvaluatorEntry.staff.trim().length > 0) {
      return anyEvaluatorEntry.staff.trim();
    }
  }

  // 2. Check evaluatingOfficer on application
  if (
    application.evaluatingOfficer &&
    application.evaluatingOfficer.trim().length > 0 &&
    !isGenericOfficer(application.evaluatingOfficer, application.office)
  ) {
    return application.evaluatingOfficer.trim();
  }

  return null;
}

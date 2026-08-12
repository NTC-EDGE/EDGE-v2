-- =============================================================================
-- Migration Script: Legacy ApplicationStatus Values Normalization
-- =============================================================================
-- Description: Maps deprecated ApplicationStatus enum values (ForApproval,
--              Endorsed, ForVerification, Declined) to the normalized state
--              machine schema (Draft, Submitted, Evaluating, Returned, Approved, Completed).
-- Usage: Run this script against PostgreSQL databases prior to deploying v2 endpoints.
-- =============================================================================

BEGIN;

-- Map legacy evaluation statuses to 'Evaluating'
UPDATE public."Applications"
SET "Status" = 'Evaluating'
WHERE "Status" IN ('ForApproval', 'Endorsed');

-- Map legacy verification statuses to 'Approved'
UPDATE public."Applications"
SET "Status" = 'Approved'
WHERE "Status" = 'ForVerification';

-- Map legacy declined statuses to 'Returned'
UPDATE public."Applications"
SET "Status" = 'Returned'
WHERE "Status" = 'Declined';

COMMIT;

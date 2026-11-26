import { Application } from './applicationModelTypes';

let configuredRenewalWindowDays = 60;

export function setConfiguredRenewalWindowDays(days: number): void {
  if (typeof days === 'number' && !Number.isNaN(days) && days >= 0) {
    configuredRenewalWindowDays = days;
  }
}

export function getConfiguredRenewalWindowDays(): number {
  return configuredRenewalWindowDays;
}

export function isEligibleForRenewal(app: Application, maxDaysBeforeExpiration?: number): boolean {
  if (app.hasActiveRenewal) return false;
  const docs = app.issuedDocumentDetails;
  if (!Array.isArray(docs) || docs.length === 0) return false;
  const docWithExpiry = docs.find((d) => d.expiryDate && d.expiryDate.trim().length > 0);
  if (!docWithExpiry || !docWithExpiry.expiryDate) return false;
  const expiry = new Date(docWithExpiry.expiryDate);
  const now = new Date();
  const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const threshold =
    typeof maxDaysBeforeExpiration === 'number' && !Number.isNaN(maxDaysBeforeExpiration)
      ? maxDaysBeforeExpiration
      : configuredRenewalWindowDays;
  return daysRemaining <= threshold;
}

export function getRenewalDaysRemaining(app: Application): number | null {
  const docs = app.issuedDocumentDetails;
  if (!Array.isArray(docs) || docs.length === 0) return null;
  const docWithExpiry = docs.find((d) => d.expiryDate && d.expiryDate.trim().length > 0);
  if (!docWithExpiry || !docWithExpiry.expiryDate) return null;
  const expiry = new Date(docWithExpiry.expiryDate);
  const now = new Date();
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

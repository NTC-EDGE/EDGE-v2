import { COLORS } from '@edge/ui';
import { TenantClientDto, TenantClientDetailsDto } from '@edge/api';
import { User, UserStatus, UserTransaction } from '../types';

/**
 * Maps a backend TenantClientDto into the frontend User (Permittee) domain model.
 */
export function mapTenantClientToUser(client: TenantClientDto, tenantName?: string): User {
  const clientName = client.name || 'Permittee';
  const clientId = client.id || '000000';
  const org = client.organization || '';

  const isCompany =
    (org.length > 0 &&
      org.toLowerCase() !== 'individual applicant' &&
      org.toLowerCase() !== 'individual') ||
    clientName.includes('Corp') ||
    clientName.includes('Inc') ||
    clientName.includes('Telecom') ||
    clientName.includes('Broadcast') ||
    clientName.includes('Communications') ||
    clientName.includes('Network') ||
    clientName.includes('Cooperative');

  const initials = clientName
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const brandColors = [
    COLORS.brand.royalBlue,
    COLORS.brand.primary,
    COLORS.brand.purpleDark,
    COLORS.brand.deepNavy,
  ];
  const charCodeSum = clientName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarBg = isCompany
    ? brandColors[charCodeSum % brandColors.length]
    : COLORS.brand.secondary;

  let validStatus: UserStatus = 'Under Review';
  if (
    client.status === 'Active License' ||
    client.status === 'Under Review' ||
    client.status === 'Returned for Correction' ||
    client.status === 'Draft' ||
    client.status === 'Active' ||
    client.status === 'Pending' ||
    client.status === 'Inactive'
  ) {
    validStatus = client.status;
  } else if (client.status === 'Complete') {
    validStatus = 'Active License';
  }

  let formattedDate = new Date().toISOString().split('T')[0];
  if (client.registeredDate) {
    try {
      const parsedDate = new Date(client.registeredDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toISOString().split('T')[0];
      }
    } catch {
      // fallback to formattedDate
    }
  }

  return {
    id: clientId,
    userId: client.userId,
    accountType: isCompany ? 'Company' : 'Individual',
    avatarType: isCompany ? 'initials' : 'icon',
    avatarInitials: initials.length > 0 ? initials : 'NT',
    avatarBgColor: avatarBg,
    name: clientName,
    email: client.email || 'permittee.desk@ntc.gov.ph',
    region: tenantName || 'Regional Regulatory District',
    tenantName: tenantName || 'Regional Regulatory District',
    organization: org || (isCompany ? clientName : 'Individual Radio Permittee'),
    licenseCategory: client.licenseCategory || 'Fixed & Land Mobile Radio Network',
    applicationsCount: client.applicationCount && client.applicationCount > 0 ? client.applicationCount : 1,
    status: validStatus,
    phone: '+63 (88) 856-4200',
    address: 'Regional Regulatory District, Cagayan de Oro City, Misamis Oriental',
    createdDate: formattedDate,
    description: `Registered NTC Permittee under ${tenantName || 'Regional Regulatory District'}.`,
    totalPaidAmount: (client.applicationCount || 1) * 3850,
    companyRegistrationNumber: isCompany ? `SEC-REG-2024-${clientId.slice(0, 6).toUpperCase()}` : undefined,
    taxIdentificationNumber: `TIN-402-${clientId.slice(0, 3)}-${clientId.slice(3, 6)}`,
  };
}

/**
 * Maps a full backend TenantClientDetailsDto into the User domain model.
 */
export function mapTenantClientDetailsToUser(details: TenantClientDetailsDto, tenantName?: string): User {
  const detailsName = details.name || 'Permittee';
  const detailsId = details.id || '000000';
  const org = details.organization || '';

  const isCompany =
    (org.length > 0 &&
      org.toLowerCase() !== 'individual applicant' &&
      org.toLowerCase() !== 'individual') ||
    detailsName.includes('Corp') ||
    detailsName.includes('Inc') ||
    detailsName.includes('Telecom') ||
    detailsName.includes('Broadcast') ||
    detailsName.includes('Communications') ||
    detailsName.includes('Network') ||
    detailsName.includes('Cooperative');

  const initials = detailsName
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const mappedTransactions: UserTransaction[] = (details.transactions || []).map((tx) => ({
    id: tx.id || `tx-${Math.random().toString().slice(2, 6)}`,
    refNo: tx.refNo || 'REF-NTC',
    type: tx.type || 'Radio Station Authorization Filing',
    serviceType: details.serviceType || 'Fixed & Land Mobile Radio Network',
    applicationNumber: tx.refNo || 'APP-NTC',
    amount: typeof tx.amount === 'number' ? tx.amount : 0,
    status: tx.status || 'Paid',
    date: tx.date ? new Date(tx.date).toLocaleDateString() : 'Recent',
  }));

  const totalCalculated = mappedTransactions.reduce((acc, t) => acc + t.amount, 0);

  let formattedDate = '2026-01-15';
  if (details.registeredDate) {
    try {
      const parsedDate = new Date(details.registeredDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toISOString().split('T')[0];
      }
    } catch {
      // fallback
    }
  }

  return {
    id: detailsId,
    userId: details.userId,
    accountType: isCompany ? 'Company' : 'Individual',
    avatarType: isCompany ? 'initials' : 'icon',
    avatarInitials: initials.length > 0 ? initials : 'NT',
    avatarBgColor: isCompany ? COLORS.brand.royalBlue : COLORS.brand.secondary,
    name: detailsName,
    email: details.email || 'permittee.desk@ntc.gov.ph',
    region: tenantName || 'Regional Regulatory District',
    tenantName: tenantName || 'Regional Regulatory District',
    organization: org || (isCompany ? detailsName : 'Individual Radio Permittee'),
    licenseCategory: details.serviceType || 'Fixed & Land Mobile Radio Network',
    applicationsCount: details.totalApplications || 1,
    status:
      details.status === 'Active License' ||
      details.status === 'Under Review' ||
      details.status === 'Returned for Correction' ||
      details.status === 'Draft' ||
      details.status === 'Active' ||
      details.status === 'Pending' ||
      details.status === 'Inactive'
        ? details.status
        : 'Active License',
    phone: details.contactNumber || '+63 (88) 856-4200',
    address: details.address || 'Regional Regulatory District, Cagayan de Oro City',
    createdDate: formattedDate,
    totalBilledAmount: totalCalculated,
    totalPaidAmount: totalCalculated,
    companyRegistrationNumber: details.companyRegistrationNumber || (isCompany ? `SEC-CS2020-${detailsId.slice(0, 6).toUpperCase()}` : undefined),
    taxIdentificationNumber: `TIN-402-${detailsId.slice(0, 3)}-${detailsId.slice(3, 6)}`,
    transactions: mappedTransactions,
  };
}

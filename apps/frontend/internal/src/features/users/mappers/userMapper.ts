import { COLORS } from '@edge/ui';
import { TenantClientDto, TenantClientDetailsDto } from '@edge/api';
import { User, UserStatus, UserTransaction } from '../types';

/**
 * Maps a backend TenantClientDto into the frontend User (Permittee) domain model.
 */
export function mapTenantClientToUser(client: TenantClientDto, tenantName?: string): User {
  const isCompany =
    (client.organization &&
      client.organization.toLowerCase() !== 'individual applicant' &&
      client.organization.toLowerCase() !== 'individual') ||
    client.name.includes('Corp') ||
    client.name.includes('Inc') ||
    client.name.includes('Telecom') ||
    client.name.includes('Broadcast') ||
    client.name.includes('Communications') ||
    client.name.includes('Network') ||
    client.name.includes('Cooperative');

  const initials = client.name
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
  const charCodeSum = client.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarBg = isCompany
    ? brandColors[charCodeSum % brandColors.length]
    : COLORS.brand.secondary;

  const validStatus: UserStatus =
    client.status === 'Active License' ||
    client.status === 'Under Review' ||
    client.status === 'Returned for Correction' ||
    client.status === 'Draft'
      ? (client.status as UserStatus)
      : client.status === 'Complete' || client.status === 'Active'
      ? 'Active License'
      : 'Under Review';

  return {
    id: client.id,
    userId: client.userId,
    accountType: isCompany ? 'Company' : 'Individual',
    avatarType: isCompany ? 'initials' : 'icon',
    avatarInitials: initials || 'NT',
    avatarBgColor: avatarBg,
    name: client.name,
    email: client.email || 'permittee.desk@ntc.gov.ph',
    region: tenantName || 'Regional Regulatory District',
    tenantName: tenantName || 'Regional Regulatory District',
    organization: client.organization || (isCompany ? client.name : 'Individual Radio Permittee'),
    licenseCategory: client.licenseCategory || 'Fixed & Land Mobile Radio Network',
    applicationsCount: client.applicationCount > 0 ? client.applicationCount : 1,
    status: validStatus,
    phone: '+63 (88) 856-4200',
    address: 'Regional Regulatory District, Cagayan de Oro City, Misamis Oriental',
    createdDate: client.registeredDate
      ? new Date(client.registeredDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    description: `Registered NTC Permittee under ${tenantName || 'Regional Regulatory District'}.`,
    totalPaidAmount: (client.applicationCount || 1) * 3850,
    companyRegistrationNumber: isCompany ? `SEC-REG-2024-${client.id.slice(0, 6).toUpperCase()}` : undefined,
    taxIdentificationNumber: `TIN-402-${client.id.slice(0, 3)}-${client.id.slice(3, 6)}`,
  };
}

/**
 * Maps a full backend TenantClientDetailsDto into the User domain model.
 */
export function mapTenantClientDetailsToUser(details: TenantClientDetailsDto, tenantName?: string): User {
  const isCompany =
    (details.organization &&
      details.organization.toLowerCase() !== 'individual applicant' &&
      details.organization.toLowerCase() !== 'individual') ||
    details.name.includes('Corp') ||
    details.name.includes('Inc') ||
    details.name.includes('Telecom') ||
    details.name.includes('Broadcast') ||
    details.name.includes('Communications') ||
    details.name.includes('Network') ||
    details.name.includes('Cooperative');

  const initials = details.name
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const mappedTransactions: UserTransaction[] = (details.transactions || []).map((tx) => ({
    id: tx.id,
    refNo: tx.refNo,
    type: tx.type || 'Radio Station Authorization Filing',
    serviceType: details.serviceType || 'Fixed & Land Mobile Radio Network',
    applicationNumber: tx.refNo,
    amount: tx.amount,
    status: tx.status,
    date: tx.date ? new Date(tx.date).toLocaleDateString() : 'Recent',
  }));

  const totalCalculated = mappedTransactions.reduce((acc, t) => acc + t.amount, 0);

  return {
    id: details.id,
    userId: details.userId,
    accountType: isCompany ? 'Company' : 'Individual',
    avatarType: isCompany ? 'initials' : 'icon',
    avatarInitials: initials || 'NT',
    avatarBgColor: isCompany ? COLORS.brand.royalBlue : COLORS.brand.secondary,
    name: details.name,
    email: details.email,
    region: tenantName || 'Regional Regulatory District',
    tenantName: tenantName || 'Regional Regulatory District',
    organization: details.organization || (isCompany ? details.name : 'Individual Radio Permittee'),
    licenseCategory: details.serviceType || 'Fixed & Land Mobile Radio Network',
    applicationsCount: details.totalApplications,
    status: (details.status as UserStatus) || 'Active License',
    phone: details.contactNumber || '+63 (88) 856-4200',
    address: details.address || 'Regional Regulatory District, Cagayan de Oro City',
    createdDate: details.registeredDate ? new Date(details.registeredDate).toISOString().split('T')[0] : '2026-01-15',
    totalBilledAmount: totalCalculated,
    totalPaidAmount: totalCalculated,
    companyRegistrationNumber: details.companyRegistrationNumber || (isCompany ? `SEC-CS2020-${details.id.slice(0, 6).toUpperCase()}` : undefined),
    taxIdentificationNumber: `TIN-402-${details.id.slice(0, 3)}-${details.id.slice(3, 6)}`,
    transactions: mappedTransactions,
  };
}

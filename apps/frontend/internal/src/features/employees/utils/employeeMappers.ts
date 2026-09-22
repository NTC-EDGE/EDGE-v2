import { COLORS } from '@edge/ui';
import { TenantMemberDto } from '@edge/api';
import { Employee, EmployeeRole, EmployeeStatus, ROLES_LIST } from '../data/mockEmployees';

export function mapTenantMemberToEmployee(member: TenantMemberDto): Employee {
  const roleName = member.roleName || 'Evaluator';
  const role = (ROLES_LIST.includes(roleName as EmployeeRole) ? roleName : 'Evaluator') as EmployeeRole;

  return {
    id: member.userId || member.id,
    firstName: member.userFirstName,
    lastName: member.userLastName,
    middleName: member.userMiddleName ?? '',
    suffix: member.userSuffix ?? '',
    email: member.userEmail,
    phone: member.userContactNumber ?? '+63 900 000 0000',
    role,
    fieldOffice: member.fieldOfficeName ?? 'Regional Main Office',
    region: member.tenantName || 'Central Office (Headquarters)',
    department: member.division || member.position || 'Operations',
    division: member.division || 'Operations',
    level: member.level || 'Rank & File',
    title: member.jobTitle || member.position || 'Staff',
    position: member.position || 'Staff',
    designation: member.designation || '',
    signatureDisplay: 'beside',
    signatureUri: member.userESignature || '',
    status: 'Active' as EmployeeStatus,
    avatarColor: COLORS.brand[700],
    dateJoined: member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Recent',
    location: member.fieldOfficeName || member.tenantName || 'Regional Office',
  };
}

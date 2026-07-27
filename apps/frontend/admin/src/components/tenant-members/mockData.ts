import { TenantMember, User, Role, FieldOffice } from "@edge/api";

export const MOCK_MEMBERS: TenantMember[] = [
  {
    id: "tm-1",
    tenantId: "t-101",
    tenantName: "NTC National Capital Region Regional Office",
    userId: "u-1",
    userEmail: "maria.santos@ntc.gov.ph",
    userFirstName: "Maria",
    userLastName: "Santos",
    roleId: "r-admin",
    fieldOfficeId: "fo-1",
    fieldOfficeName: "NTC Pampanga Extension Office",
    jobTitle: "Regional Executive Director",
    level: "SG-26",
    division: "Executive Office",
    position: "Director IV",
    designation: "Head of Regional Operations",
    createdAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "tm-2",
    tenantId: "t-101",
    tenantName: "NTC National Capital Region Regional Office",
    userId: "u-2",
    userEmail: "juan.dela.cruz@ntc.gov.ph",
    userFirstName: "Juan",
    userLastName: "Dela Cruz",
    roleId: "r-licensing",
    fieldOfficeId: "fo-2",
    fieldOfficeName: "NTC Bulacan Field Sub-Office",
    jobTitle: "Chief Licensing Officer",
    level: "SG-22",
    division: "Licensing & Permit Division",
    position: "Supervising Engineer",
    designation: "Lead Spectrum Regulator",
    createdAt: "2026-02-05T11:30:00Z",
  },
  {
    id: "tm-3",
    tenantId: "t-102",
    tenantName: "Central Luzon Field Operations Tenant",
    userId: "u-3",
    userEmail: "roberto.reyes@ntc.gov.ph",
    userFirstName: "Roberto",
    userLastName: "Reyes",
    roleId: "r-inspector",
    fieldOfficeId: "fo-3",
    fieldOfficeName: "NTC Cebu Extension Office",
    jobTitle: "Senior Field Inspector",
    level: "SG-18",
    division: "Enforcement & Inspection Division",
    position: "Engineer III",
    designation: "Field Enforcement Lead",
    createdAt: "2026-02-18T14:10:00Z",
  },
];

export const MOCK_USERS: User[] = [
  { id: "u-1", email: "maria.santos@ntc.gov.ph", firstName: "Maria", lastName: "Santos", isActive: true },
  { id: "u-2", email: "juan.dela.cruz@ntc.gov.ph", firstName: "Juan", lastName: "Dela Cruz", isActive: true },
  { id: "u-3", email: "roberto.reyes@ntc.gov.ph", firstName: "Roberto", lastName: "Reyes", isActive: true },
  { id: "u-4", email: "elena.torres@ntc.gov.ph", firstName: "Elena", lastName: "Torres", isActive: true },
  { id: "u-5", email: "carlos.gomez@ntc.gov.ph", firstName: "Carlos", lastName: "Gomez", isActive: true },
];

export const MOCK_ROLES: Role[] = [
  { id: "r-admin", name: "Tenant Administrator", key: "TENANT_ADMIN", isSystemRole: false, description: "Full tenant administration rights" },
  { id: "r-licensing", name: "Licensing Officer", key: "LICENSING_OFFICER", isSystemRole: false, description: "Process application and permit fees" },
  { id: "r-inspector", name: "Field Inspector", key: "FIELD_INSPECTOR", isSystemRole: false, description: "Perform frequency compliance and field audits" },
  { id: "r-member", name: "Tenant Member", key: "TENANT_MEMBER", isSystemRole: false, description: "General access tenant user" },
];

export const MOCK_FIELD_OFFICES: FieldOffice[] = [
  { id: "fo-1", tenantId: "t-101", name: "NTC Pampanga Extension Office", code: "NTC-FO-PAM", regionId: "reg-1", address: "", contactPhone: "", contactEmail: "", officerInChargeId: "m-101", officerInChargeName: "Maria Santos", isActive: true, allowSpectrumInspection: true, allowPermitIssuance: true, allowComplaintReception: true },
  { id: "fo-2", tenantId: "t-101", name: "NTC Bulacan Field Sub-Office", code: "NTC-FO-BUL", regionId: "reg-1", address: "", contactPhone: "", contactEmail: "", officerInChargeId: "m-102", officerInChargeName: "Juan Dela Cruz", isActive: true, allowSpectrumInspection: true, allowPermitIssuance: false, allowComplaintReception: true },
  { id: "fo-3", tenantId: "t-102", name: "NTC Cebu Extension Office", code: "NTC-FO-CEB", regionId: "reg-2", address: "", contactPhone: "", contactEmail: "", officerInChargeId: "m-103", officerInChargeName: "Roberto Reyes", isActive: true, allowSpectrumInspection: true, allowPermitIssuance: true, allowComplaintReception: true },
];

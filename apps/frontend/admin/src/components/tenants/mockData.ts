import { Tenant, TenantMember } from '@edge/api';

export interface ExternalUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  licenseCategory: string;
  status: string;
  registeredDate: string;
}

export interface RegionalTransaction {
  id: string;
  refNo: string;
  applicantName: string;
  serviceType: string;
  amount: number;
  paymentStatus: string;
  date: string;
}

export const MOCK_TENANTS: Tenant[] = [
  {
    id: "t-101",
    name: "NTC National Capital Region Regional Office",
    code: "NTC-NCR-01",
    description: "Primary regional administrative tenant for National Capital Region handling licensing, spectrum inspection, and public telecommunications.",
    isActive: true,
    regionId: "4570bda0-8fee-4c79-993c-7d73cfa29a0d",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "t-102",
    name: "Central Luzon Field Operations Tenant",
    code: "NTC-R3-01",
    description: "Regional office handling Region III frequency licensing, field enforcement, and broadcasting station inspection.",
    isActive: true,
    regionId: "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2",
    createdAt: "2026-02-01T09:30:00Z",
  },
  {
    id: "t-103",
    name: "Central Visayas Telecommunications Branch",
    code: "NTC-R7-01",
    description: "Region VII administrative and regulatory tenant branch overseeing maritime and commercial radio permits.",
    isActive: true,
    regionId: "7037536b-59d8-4786-8f92-fee3e0c78413",
    createdAt: "2026-03-10T10:15:00Z",
  },
];

export const MOCK_TENANT_MEMBERS: Record<string, TenantMember[]> = {
  "t-101": [
    {
      id: "tm-1",
      tenantId: "t-101",
      tenantName: "NTC National Capital Region Regional Office",
      userId: "u-1",
      userEmail: "maria.santos@ntc.gov.ph",
      userFirstName: "Maria",
      userLastName: "Santos",
      roleId: "r-admin",
      fieldOfficeName: "NTC Main Office",
      jobTitle: "Regional Executive Director",
      level: "SG-26",
      division: "Executive Office",
      position: "Director IV",
      designation: "Head of Regional Operations",
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
      fieldOfficeName: "NTC Pasig Extension Office",
      jobTitle: "Chief Licensing Officer",
      level: "SG-22",
      division: "Licensing & Permit Division",
      position: "Supervising Engineer",
      designation: "Lead Spectrum Regulator",
    },
  ],
  "t-102": [
    {
      id: "tm-3",
      tenantId: "t-102",
      tenantName: "Central Luzon Field Operations Tenant",
      userId: "u-3",
      userEmail: "roberto.reyes@ntc.gov.ph",
      userFirstName: "Roberto",
      userLastName: "Reyes",
      roleId: "r-inspector",
      fieldOfficeName: "NTC Pampanga Extension Office",
      jobTitle: "Senior Field Inspector",
      level: "SG-18",
      division: "Enforcement & Inspection Division",
      position: "Engineer III",
      designation: "Field Enforcement Lead",
    },
  ],
};

export const MOCK_EXTERNAL_USERS: Record<string, ExternalUser[]> = {
  "4570bda0-8fee-4c79-993c-7d73cfa29a0d": [
    { id: "eu-1", name: "Globe Telecom Inc.", email: "regulatory@globe.com.ph", organization: "Telecommunications Carrier", licenseCategory: "Public Telecommunications Entity (PTE)", status: "Active License", registeredDate: "2025-10-14" },
    { id: "eu-2", name: "Smart Communications Inc.", email: "licensing@smart.com.ph", organization: "Cellular Provider", licenseCategory: "Cellular Mobile Telephone System (CMTS)", status: "Active License", registeredDate: "2025-11-02" },
    { id: "eu-3", name: "Amateur Radio Club NCR", email: "info@ncr-hams.org", organization: "NCR Amateur Radio Society", licenseCategory: "Class A Amateur Radio Permit", status: "Active License", registeredDate: "2026-01-20" },
  ],
  "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2": [
    { id: "eu-4", name: "Central Luzon Broadcasting Network", email: "station@clbn.ph", organization: "Commercial Broadcast Network", licenseCategory: "FM Commercial Radio Station", status: "Active License", registeredDate: "2025-12-19" },
    { id: "eu-5", name: "Subic Bay Maritime Fleet Services", email: "radio@subicmaritime.com", organization: "Maritime Shipping Co.", licenseCategory: "Ship Radio Station License", status: "Active License", registeredDate: "2026-02-11" },
  ],
};

export const MOCK_TRANSACTIONS: Record<string, RegionalTransaction[]> = {
  "4570bda0-8fee-4c79-993c-7d73cfa29a0d": [
    { id: "tx-1", refNo: "TXN-NCR-2026-0091", applicantName: "Globe Telecom Inc.", serviceType: "Commercial Radio Frequency Permit Renewal", amount: 25000.0, paymentStatus: "Paid", date: "2026-07-15" },
    { id: "tx-2", refNo: "TXN-NCR-2026-0092", applicantName: "Amateur Radio Club NCR", serviceType: "Amateur Operator Permit Fee", amount: 1500.0, paymentStatus: "Paid", date: "2026-07-18" },
    { id: "tx-3", refNo: "TXN-NCR-2026-0093", applicantName: "Metro FM Broadcasters", serviceType: "Spectrum Inspection & Verification", amount: 3500.0, paymentStatus: "Pending", date: "2026-07-20" },
  ],
  "073b2085-fab9-4cfb-9a6a-ca93ccf1fee2": [
    { id: "tx-4", refNo: "TXN-R3-2026-0044", applicantName: "Subic Bay Maritime Fleet Services", serviceType: "Ship Radio Station License Fee", amount: 4800.0, paymentStatus: "Paid", date: "2026-07-14" },
    { id: "tx-5", refNo: "TXN-R3-2026-0045", applicantName: "Pampanga Cable Systems", serviceType: "CATV License Renewal & Inspection", amount: 12000.0, paymentStatus: "Paid", date: "2026-07-19" },
  ],
};

export const getRegionalExternalUsers = (regionId: string, regionCode: string): ExternalUser[] => {
  const base = MOCK_EXTERNAL_USERS[regionId] ?? [];
  const categories = [
    "Public Telecommunications Entity (PTE)",
    "Cellular Mobile Telephone System (CMTS)",
    "Class A Amateur Radio Permit",
    "FM Commercial Radio Station",
    "Ship Radio Station License",
    "Broadband Wireless Access (BWA)",
    "CATV Cable Television Network",
    "Aeronautical Ground Radio",
    "VSAT Satellite Earth Station",
  ];

  const generated: ExternalUser[] = Array.from({ length: 48 }, (_, i) => ({
    id: `gen-eu-${regionCode}-${i + 1}`,
    name: `${regionCode} Regional Operator / Operator #${i + 101}`,
    email: `contact.op${i + 101}@${regionCode.toLowerCase()}-telecom.ph`,
    organization: `Regional Commercial Licensee (${regionCode})`,
    licenseCategory: categories[i % categories.length],
    status: i % 7 === 0 ? "Under Renewal Review" : "Active License",
    registeredDate: `2026-0${(i % 5) + 1}-${10 + (i % 18)}`,
  }));

  return [...base, ...generated];
};


export interface IRequirementFile {
  name: string;
  mimeType: string;
  uri: string;
  index: number;
  uploading: boolean;
  uploaded: boolean;
  links: {
    original: string;
    thumb: string;
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
}

export interface IRequirement {
  key: string;
  title: string;
  description?: string;
  required: boolean;
  files?: IRequirementFile[];
  links?: any[];
}

export interface IApplicationType {
  label: string;
  elements?: string[];
  element?: string;
  formCode: string;
  requirements: IRequirement[];
  serviceCode: string;
  sequenceCode?: string;
  category?: string;
}

export interface IService {
  _id: string;
  name: string;
  serviceCode: string;
  applicationType: IApplicationType;
  [key: string]: any; // for dynamic form fields
}

export interface IApplicant {
  userId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  companyName?: string;
  address?: any;
  contact?: any;
  dateOfBirth?: {
    day: string;
    month: string;
    year: string;
  };
  [key: string]: any;
}

export interface IApplicationPayload {
  _id?: string;
  id?: string; // for bulk entries unique id
  applicant: IApplicant;
  service: IService;
  region: string;
  schedule?: any;
  soa: any[];
  totalFee: number;
  useDifferentAddress: boolean;
  isModified: boolean;
  renew?: any;
  renewApplication?: boolean;
  editApplication?: boolean;
}

export interface IFeePayload {
  typeOfBranch: string;
  channels: number;
  simplex: number;
  duplex: number;
  service: string;
  subService: string;
  types: string;
  category: string;
  classes: string;
  noOfYears: number;
  units: number;
  nos: number;
  noOfCopies: number;
  boundary: string;
  location: string;
  installedEquipment: string;
  power: number;
  transmission: string;
  frequency: string;
  frequencyTX: number;
  bandwidth: {
    bandwidth: number;
    unit: string;
    emission: string;
  };
  mode: string;
  frequencyRange: string[];
  frequencyRangeTotal: number;
  possessTotal: number;
  stationClassUnits: Record<string, number>;
  stationClassChannels: Record<string, number>;
  dateOfExpiry: string;
  stationCount: number;
  updatedAt: string;
  typeOfEquipmentDevice: Record<string, number>;
  natureOfService: string;
  isModified: boolean;
}

export interface ISOAResponse {
  statement_Of_Account: any[];
  totalFee: number;
}

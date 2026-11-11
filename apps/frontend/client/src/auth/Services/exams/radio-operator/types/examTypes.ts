export interface ExamApplicantData {
  id: number;
  examType: string;
  examineeType: string;
  selectedOption: string;
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  sex: string;
  nationality: string;
  regionName: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zipCode: string;
  schoolName: string;
  schoolAttended?: string;
  courseDegree: string;
  courseTaken?: string;
  yearGraduated: string;
  specialOrderNo: string;
  email: string;
  contactNo: string;
  signature?: string;
  uploads: Record<string, string | { name: string; uri: string; type?: string; file?: File | Blob }>; // Maps requirement index/key to filename or file object
  selectedVariantId?: string;
  selectedElementId?: string;
}

export const initialExamApplicant = (id: number): ExamApplicantData => ({
  id,
  examType: "",
  examineeType: "",
  selectedOption: "",
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  birthMonth: "",
  birthDay: "",
  birthYear: "",
  sex: "",
  nationality: "Filipino",
  regionName: "",
  province: "",
  city: "",
  barangay: "",
  street: "",
  zipCode: "",
  schoolName: "",
  courseDegree: "",
  yearGraduated: "",
  specialOrderNo: "",
  email: "",
  contactNo: "",
  signature: "",
  uploads: {},
});

export interface ScheduleItem {
  id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  maximumSlots?: number | null;
  availableSlots?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  startApplication?: string | null;
  endApplication?: string | null;
  applicationDeadline?: string | null;
  regionName?: string | null;
  tenantName?: string | null;
  serviceName?: string | null;
  title?: string | null;
  remarks?: string | null;
  description?: string | null;
}

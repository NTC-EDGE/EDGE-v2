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
  courseDegree: string;
  yearGraduated: string;
  specialOrderNo: string;
  email: string;
  contactNo: string;
  uploads: Record<string, string | { name: string; uri: string }>; // Maps requirement index/key to filename or file object
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
  birthMonth: "January",
  birthDay: "1",
  birthYear: "2000",
  sex: "Male",
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
  uploads: {},
});

export interface ScheduleItem {
  id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  maximumSlots?: number | null;
}

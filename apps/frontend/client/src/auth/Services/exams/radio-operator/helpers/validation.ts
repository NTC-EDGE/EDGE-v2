import { ExamApplicantData } from "../components/RadioOperatorExamWizard";

export const isExamApplicantComplete = (app: ExamApplicantData): boolean => {
  const emailVal = app.email;
  const contactNoVal = app.contactNo;

  // 1. Check Application Type Selection
  if (!app.selectedOption) return false;

  // 2. Check Form Details
  const formComplete = !!(
    app.lastName &&
    app.firstName &&
    app.birthMonth &&
    app.birthDay &&
    app.birthYear &&
    app.sex &&
    app.nationality &&
    app.province &&
    app.city &&
    app.barangay &&
    app.street &&
    app.zipCode &&
    app.schoolName &&
    app.courseDegree &&
    app.yearGraduated &&
    emailVal &&
    emailVal.includes("@") &&
    contactNoVal &&
    /^\d+$/.test(contactNoVal)
  );
  if (!formComplete) return false;

  // 3. Check Uploads Complete
  const totalRequired = app.examineeType === "Upgrader" ? 4 : 3;
  const uploadedCount = Object.keys(app.uploads).length;
  if (uploadedCount < totalRequired) return false;

  return true;
};

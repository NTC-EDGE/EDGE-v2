import { ExamApplicantData } from "../types/examTypes";
import { isValidContactNumber, isValidEmailAddress } from "../../../../../shared/helpers/fieldValidators";

export const isExamApplicantComplete = (app: ExamApplicantData): boolean => {
  // 1. Check Application Type Selection
  if (!app.selectedOption) return false;

  // 2. Check Form Details (Educational background is optional)
  const formComplete = Boolean(
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
    app.email &&
    isValidEmailAddress(app.email) &&
    app.contactNo &&
    isValidContactNumber(app.contactNo)
  );
  if (!formComplete) return false;

  // 3. Check Uploads Complete
  const totalRequired = app.examineeType === "Upgrader" ? 4 : 3;
  const uploadedCount = Object.keys(app.uploads || {}).length;
  if (uploadedCount < totalRequired) return false;

  return true;
};

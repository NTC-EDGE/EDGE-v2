import { Platform } from "react-native";

export interface ResolvedUserProfile {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  fullName: string;
  email: string;
  phone: string;
  sex: string;
  civilStatus: string;
  nationality: string;
  height: string;
  weight: string;
  schoolAttended: string;
  courseTaken: string;
  yearGraduated: string;
  unit: string;
  street: string;
  barangay: string;
  barangayId: string;
  city: string;
  municipalityId: string;
  province: string;
  provinceId: string;
  region: string;
  regionId: string;
  zipCode: string;
  formattedAddress: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  companyName: string;
  companyRegistration: string;
  companyTin: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  representativeFirstName: string;
  representativeMiddleName: string;
  representativeLastName: string;
  representativeSuffix: string;
  representativeName: string;
  designation: string;
  position: string;
  signature: string;
}

export function parseDateOfBirth(dobRaw?: string | null): { birthYear: string; birthMonth: string; birthDay: string } {
  const defaultDob = { birthYear: "2000", birthMonth: "January", birthDay: "1" };
  if (!dobRaw) return defaultDob;

  const parts = String(dobRaw).split("T")[0].split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const mNum = parseInt(parts[1], 10);
    const day = String(parseInt(parts[2], 10) || "1");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = !isNaN(mNum) && mNum >= 1 && mNum <= 12 ? months[mNum - 1] : "January";
    return { birthYear: year, birthMonth: month, birthDay: day };
  }

  return defaultDob;
}

export function extractUserProfile(
  clerkUser: unknown,
  dbUserData?: unknown
): ResolvedUserProfile {
  // 1. Try local storage on web (fastest & most up-to-date from Profile settings tab)
  let localProfile: Record<string, unknown> | null = null;
  if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem("ntc_user_profile_settings");
      if (stored) {
        localProfile = JSON.parse(stored) as Record<string, unknown>;
      }
    } catch {
      // Ignored
    }
  }

  const cUser = clerkUser as {
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    primaryEmailAddress?: { emailAddress?: string | null } | null;
    primaryPhoneNumber?: { phoneNumber?: string | null } | null;
    unsafeMetadata?: Record<string, unknown>;
  } | null;

  const metaProfile = (cUser?.unsafeMetadata?.profile || {}) as Record<string, unknown>;
  const metaAddr = (metaProfile.address || {}) as Record<string, unknown>;
  const metaComp = (metaProfile.company || {}) as Record<string, unknown>;

  const localAddr = (localProfile?.address || {}) as Record<string, unknown>;
  const localComp = (localProfile?.company || {}) as Record<string, unknown>;

  const db = (dbUserData || {}) as Record<string, unknown>;
  const dbAddr = (db.address || {}) as Record<string, unknown>;
  const dbComp = (db.company || {}) as Record<string, unknown>;

  const str = (val: unknown): string => (typeof val === "string" ? val : "");

  const firstName =
    str(localProfile?.firstName) ||
    str(db.firstName) ||
    cUser?.firstName ||
    str(metaProfile.firstName) ||
    "";

  const lastName =
    str(localProfile?.lastName) ||
    str(db.lastName) ||
    cUser?.lastName ||
    str(metaProfile.lastName) ||
    "";

  const middleName =
    str(localProfile?.middleName) ||
    str(db.middleName) ||
    str(metaProfile.middleName) ||
    "";

  const suffix =
    str(localProfile?.extensionName) ||
    str(db.suffix) ||
    str(metaProfile.extensionName) ||
    str(metaProfile.suffix) ||
    "";

  const fullName =
    [firstName, middleName, lastName, suffix].filter(Boolean).join(" ") ||
    cUser?.fullName ||
    "";

  const email =
    str(localProfile?.email) ||
    str(db.email) ||
    cUser?.primaryEmailAddress?.emailAddress ||
    str(metaProfile.email) ||
    "";

  const phone =
    str(localProfile?.phone) ||
    str(db.contactNumber) ||
    cUser?.primaryPhoneNumber?.phoneNumber ||
    str(metaProfile.phone) ||
    "";

  const sex =
    str(localProfile?.sex) ||
    str(db.sex) ||
    str(metaProfile.sex) ||
    "Male";

  const civilStatus =
    str(localProfile?.civilStatus) ||
    str(db.civilStatus) ||
    str(metaProfile.civilStatus) ||
    "";

  const nationality =
    str(localProfile?.nationality) ||
    str(db.nationality) ||
    str(metaProfile.nationality) ||
    "Filipino";

  const height =
    str(localProfile?.height) ||
    (db.height ? String(db.height) : "") ||
    str(metaProfile.height) ||
    "";

  const weight =
    str(localProfile?.weight) ||
    (db.weight ? String(db.weight) : "") ||
    str(metaProfile.weight) ||
    "";

  const schoolAttended =
    str(localProfile?.schoolAttended) ||
    str(db.schoolAttended) ||
    str(metaProfile.schoolAttended) ||
    "";

  const courseTaken =
    str(localProfile?.courseTaken) ||
    str(db.courseTaken) ||
    str(metaProfile.courseTaken) ||
    "";

  const yearGraduated =
    str(localProfile?.yearGraduated) ||
    str(db.yearGraduated) ||
    str(metaProfile.yearGraduated) ||
    "";

  // Address
  const unit =
    str(localAddr.unit) ||
    str(dbAddr.unit) ||
    str(db.unit) ||
    str(metaAddr.unit) ||
    "";

  const street =
    str(localAddr.street) ||
    str(dbAddr.street) ||
    str(db.street) ||
    str(metaAddr.street) ||
    "";

  const barangay =
    str(localAddr.barangay) ||
    str(dbAddr.barangay) ||
    str(db.barangay) ||
    str(metaAddr.barangay) ||
    "";

  const barangayId =
    str(localAddr.barangayId) ||
    str(dbAddr.barangayId) ||
    str(db.barangayId) ||
    str(metaAddr.barangayId) ||
    "";

  const city =
    str(localAddr.city) ||
    str(dbAddr.city) ||
    str(db.city) ||
    str(metaAddr.city) ||
    "";

  const municipalityId =
    str(localAddr.municipalityId) ||
    str(dbAddr.municipalityId) ||
    str(metaAddr.municipalityId) ||
    "";

  const province =
    str(localAddr.province) ||
    str(dbAddr.province) ||
    str(db.province) ||
    str(metaAddr.province) ||
    "";

  const provinceId =
    str(localAddr.provinceId) ||
    str(dbAddr.provinceId) ||
    str(metaAddr.provinceId) ||
    "";

  const region =
    str(localAddr.region) ||
    str(dbAddr.region) ||
    str(db.region) ||
    str(metaAddr.region) ||
    "";

  const regionId =
    str(localAddr.regionId) ||
    str(dbAddr.regionId) ||
    str(metaAddr.regionId) ||
    "";

  const zipCode =
    str(localAddr.zipCode) ||
    str(dbAddr.zipCode) ||
    str(db.zipCode) ||
    str(metaAddr.zipCode) ||
    "";

  const formattedAddress = [unit, street, barangay, city, province, region, zipCode]
    .filter(Boolean)
    .join(", ");

  // DOB
  const dobRaw =
    str(localProfile?.dob) ||
    str(db.dateOfBirth) ||
    str(db.dob) ||
    str(metaProfile.dob) ||
    "";
  const { birthYear, birthMonth, birthDay } = parseDateOfBirth(dobRaw);

  // Company
  const companyName =
    str(localComp.name) ||
    str(dbComp.name) ||
    str(metaComp.name) ||
    "";

  const companyRegistration =
    str(localComp.registrationNumber) ||
    str(dbComp.registrationNumber) ||
    str(metaComp.registrationNumber) ||
    "";

  const companyTin =
    str(localComp.tinNumber) ||
    str(dbComp.tinNumber) ||
    str(metaComp.tinNumber) ||
    "";

  const companyAddress =
    str(localComp.address) ||
    str(dbComp.address) ||
    str(metaComp.address) ||
    "";

  const companyPhone =
    str(localComp.contactNumber) ||
    str(dbComp.contactNumber) ||
    str(metaComp.contactNumber) ||
    "";

  const companyEmail =
    str(localComp.email) ||
    str(dbComp.email) ||
    str(metaComp.email) ||
    "";

  const designation =
    str(localProfile?.designation) ||
    str(localProfile?.position) ||
    str(localComp.position) ||
    str(localComp.designation) ||
    str(db.designation) ||
    str(db.position) ||
    str(dbComp.position) ||
    str(dbComp.designation) ||
    str(metaProfile.designation) ||
    str(metaProfile.position) ||
    str(metaComp.position) ||
    str(metaComp.designation) ||
    "";

  const representativeFirstName =
    str(localProfile?.representativeFirstName) ||
    str(localComp.representativeFirstName) ||
    str(db.representativeFirstName) ||
    str(dbComp.representativeFirstName) ||
    str(metaProfile.representativeFirstName) ||
    str(metaComp.representativeFirstName) ||
    "";

  const representativeMiddleName =
    str(localProfile?.representativeMiddleName) ||
    str(localComp.representativeMiddleName) ||
    str(db.representativeMiddleName) ||
    str(dbComp.representativeMiddleName) ||
    str(metaProfile.representativeMiddleName) ||
    str(metaComp.representativeMiddleName) ||
    "";

  const representativeLastName =
    str(localProfile?.representativeLastName) ||
    str(localComp.representativeLastName) ||
    str(db.representativeLastName) ||
    str(dbComp.representativeLastName) ||
    str(metaProfile.representativeLastName) ||
    str(metaComp.representativeLastName) ||
    "";

  const representativeSuffix =
    str(localProfile?.representativeSuffix) ||
    str(localComp.representativeSuffix) ||
    str(db.representativeSuffix) ||
    str(dbComp.representativeSuffix) ||
    str(metaProfile.representativeSuffix) ||
    str(metaComp.representativeSuffix) ||
    "";

  const representativeName =
    str(localProfile?.representativeName) ||
    str(localComp.representativeName) ||
    str(db.representativeName) ||
    str(dbComp.representativeName) ||
    str(metaProfile.representativeName) ||
    str(metaComp.representativeName) ||
    [representativeFirstName, representativeMiddleName, representativeLastName, representativeSuffix].filter(Boolean).join(" ") ||
    fullName ||
    "";

  return {
    firstName,
    middleName,
    lastName,
    suffix,
    fullName,
    email,
    phone,
    sex,
    civilStatus,
    nationality,
    height,
    weight,
    schoolAttended,
    courseTaken,
    yearGraduated,
    unit,
    street,
    barangay,
    barangayId,
    city,
    municipalityId,
    province,
    provinceId,
    region,
    regionId,
    zipCode,
    formattedAddress,
    birthYear,
    birthMonth,
    birthDay,
    companyName,
    companyRegistration,
    companyTin,
    companyAddress,
    companyPhone,
    companyEmail,
    representativeFirstName,
    representativeMiddleName,
    representativeLastName,
    representativeSuffix,
    representativeName,
    designation,
    position: designation,
    signature:
      str(cUser?.unsafeMetadata?.eSignature) ||
      str(cUser?.unsafeMetadata?.signature) ||
      str(metaProfile.eSignature) ||
      str(metaProfile.signature) ||
      (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem("ntc_user_saved_signature") ||
          window.localStorage.getItem("user_e_signature") ||
          ""
        : "") ||
      str(db.eSignature) ||
      str(db.signature) ||
      "",
  };
}

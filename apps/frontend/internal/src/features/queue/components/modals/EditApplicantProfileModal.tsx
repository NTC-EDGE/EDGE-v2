import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon, toast } from "@edge/ui";
import { applicationService } from "@edge/api";
import { ApplicantItem } from "../../../../types/application";

function extractError(err: unknown): string {
  if (typeof err === "object" && err !== null && Reflect.has(err, "message")) {
    return String(Reflect.get(err, "message"));
  }
  if (typeof err === "string") return err;
  return "An unexpected error occurred. Please try again.";
}

interface EditApplicantProfileModalProps {
  visible: boolean;
  onClose: () => void;
  applicationId: string;
  applicant: ApplicantItem | null;
  onSuccess: () => Promise<void> | void;
}

export function EditApplicantProfileModal({
  visible,
  onClose,
  applicationId,
  applicant,
  onSuccess,
}: EditApplicantProfileModalProps) {
  const { colors, isDark } = useTheme();

  const isCompany =
    applicant?.applicantType === "Company" ||
    Boolean(applicant?.companyDetails?.name);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [nationality, setNationality] = useState("");
  const [schoolAttended, setSchoolAttended] = useState("");
  const [courseTaken, setCourseTaken] = useState("");
  const [yearGraduated, setYearGraduated] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyContact, setCompanyContact] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (applicant) {
      const basic = applicant.basicInfo;
      setFirstName(basic?.firstName ?? "");
      setMiddleName(basic?.middleName ?? "");
      setLastName(basic?.lastName ?? "");
      setSuffix(basic?.extensionName ?? "");
      setEmail(applicant.email ?? "");
      setContactNumber(applicant.contactNumber ?? "");
      setAddress(applicant.streetAddress ?? applicant.address ?? "");
      setBarangay(applicant.barangay ?? "");
      setCity(applicant.city ?? "");
      setProvince(applicant.province ?? "");
      setRegion(applicant.region ?? "");
      setZipCode(applicant.zipCode ?? "");
      setDob(basic?.dob ?? "");
      setSex(basic?.sex ?? "");
      setCivilStatus(basic?.civilStatus ?? "");
      setNationality(basic?.nationality ?? "Filipino");
      setSchoolAttended(applicant.schoolAttended ?? "");
      setCourseTaken(applicant.courseTaken ?? "");
      setYearGraduated(applicant.yearGraduated ?? "");

      const comp = applicant.companyDetails;
      setCompanyName(comp?.name ?? "");
      setCompanyRegNo(comp?.registrationNumber ?? "");
      setCompanyAddress(comp?.address ?? "");
      setCompanyEmail(comp?.email ?? "");
      setCompanyContact(comp?.contactNumber ?? "");

      setErrorMessage(null);
    }
  }, [applicant]);

  const handleSave = async () => {
    if (!applicant) return;

    setIsSaving(true);
    setErrorMessage(null);

    const payload: Record<string, unknown> = {
      applicantType: isCompany ? "Company" : "Individual",
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      suffix: suffix.trim() || undefined,
      email: email.trim(),
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      zipCode: zipCode.trim() || undefined,
      dob: dob.trim() || undefined,
      sex: sex.trim() || undefined,
      nationality: nationality.trim() || undefined,
      schoolAttended: schoolAttended.trim() || undefined,
      courseTaken: courseTaken.trim() || undefined,
      yearGraduated: yearGraduated.trim() || undefined,
    };

    if (isCompany) {
      payload.companyName = companyName.trim() || undefined;
      payload.companyRegistrationNumber = companyRegNo.trim() || undefined;
      payload.companyAddress = companyAddress.trim() || undefined;
      payload.companyEmail = companyEmail.trim() || undefined;
      payload.companyContactNumber = companyContact.trim() || undefined;
    }

    try {
      const [, err] = await applicationService.adminUpdateApplicantProfile(
        applicationId,
        applicant.id,
        payload
      );

      if (err !== null) {
        setErrorMessage(extractError(err));
        return;
      }

      toast.success("Applicant Profile Updated");
      await onSuccess();
      onClose();
    } catch (e: unknown) {
      setErrorMessage(extractError(e));
    } finally {
      setIsSaving(false);
    }
  };

  if (!applicant) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View
          style={[
            modalStyles.container,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              modalStyles.header,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={modalStyles.titleRow}>
                <Icon name="edit-3" size={18} color="#1D4ED8" />
                <Text
                  style={[
                    modalStyles.title,
                    { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                >
                  Edit Applicant Profile
                </Text>
              </View>
              <Text
                style={[
                  modalStyles.subtitle,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Evaluator corrections for {applicant.name || "Applicant"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} disabled={isSaving}>
              <Icon name="x" size={18} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={modalStyles.errorBanner}>
              <Icon name="alert-circle" size={16} color="#DC2626" />
              <Text style={modalStyles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Fields Scroll */}
          <ScrollView style={modalStyles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Legal Name Section */}
            <Text
              style={[
                modalStyles.sectionHeader,
                { color: isDark ? colors.brand[400] : colors.brand[700] },
              ]}
            >
              1. Full Legal Name
            </Text>
            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  First Name
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Middle Name
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={middleName}
                  onChangeText={setMiddleName}
                  placeholder="Middle name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Last Name
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Suffix (e.g. Jr., III)
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={suffix}
                  onChangeText={setSuffix}
                  placeholder="Suffix"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* 2. Contact Information */}
            <Text
              style={[
                modalStyles.sectionHeader,
                { color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 16 },
              ]}
            >
              2. Contact Information
            </Text>
            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Email Address
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Mobile / Contact Number
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  placeholder="Mobile number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* 3. Address Particulars */}
            <Text
              style={[
                modalStyles.sectionHeader,
                { color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 16 },
              ]}
            >
              3. Address Details
            </Text>
            <View style={modalStyles.fieldGroup}>
              <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                Complete Address / Street
              </Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Unit, house number, street"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Barangay
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={barangay}
                  onChangeText={setBarangay}
                  placeholder="Barangay"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  City / Municipality
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Province
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={province}
                  onChangeText={setProvince}
                  placeholder="Province"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Zip Code
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="Zip code"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* 4. Demographic Details */}
            <Text
              style={[
                modalStyles.sectionHeader,
                { color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 16 },
              ]}
            >
              4. Demographics
            </Text>
            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Date of Birth (YYYY-MM-DD)
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Sex / Gender
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={sex}
                  onChangeText={setSex}
                  placeholder="Male / Female"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Civil Status
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={civilStatus}
                  onChangeText={setCivilStatus}
                  placeholder="Single / Married"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Nationality
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={nationality}
                  onChangeText={setNationality}
                  placeholder="Filipino"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* 5. Educational Background */}
            <Text
              style={[
                modalStyles.sectionHeader,
                { color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 16 },
              ]}
            >
              5. Educational Background
            </Text>
            <View style={modalStyles.fieldGroup}>
              <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                School / University Attended
              </Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                value={schoolAttended}
                onChangeText={setSchoolAttended}
                placeholder="School name"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={modalStyles.fieldRow}>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Course / Degree
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={courseTaken}
                  onChangeText={setCourseTaken}
                  placeholder="Degree program"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={modalStyles.fieldCol}>
                <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  Year Graduated
                </Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                  value={yearGraduated}
                  onChangeText={setYearGraduated}
                  placeholder="e.g. 2024"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* 6. Company Details (if Company) */}
            {isCompany && (
              <>
                <Text
                  style={[
                    modalStyles.sectionHeader,
                    { color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 16 },
                  ]}
                >
                  6. Corporate / Entity Information
                </Text>
                <View style={modalStyles.fieldGroup}>
                  <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                    Registered Business / Corporate Name
                  </Text>
                  <TextInput
                    style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Company name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={modalStyles.fieldGroup}>
                  <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                    SEC / DTI Registration Number
                  </Text>
                  <TextInput
                    style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                    value={companyRegNo}
                    onChangeText={setCompanyRegNo}
                    placeholder="SEC/DTI number"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={modalStyles.fieldGroup}>
                  <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                    Corporate Address
                  </Text>
                  <TextInput
                    style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                    value={companyAddress}
                    onChangeText={setCompanyAddress}
                    placeholder="Registered corporate address"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={modalStyles.fieldRow}>
                  <View style={modalStyles.fieldCol}>
                    <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                      Company Email
                    </Text>
                    <TextInput
                      style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                      value={companyEmail}
                      onChangeText={setCompanyEmail}
                      placeholder="company@domain.com"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={modalStyles.fieldCol}>
                    <Text style={[modalStyles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                      Company Contact
                    </Text>
                    <TextInput
                      style={[modalStyles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], color: isDark ? colors.neutral[100] : colors.neutral[900], borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                      value={companyContact}
                      onChangeText={setCompanyContact}
                      placeholder="Company phone"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={[
              modalStyles.footer,
              { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={[modalStyles.btnCancel, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
              disabled={isSaving}
            >
              <Text
                style={[
                  modalStyles.btnCancelText,
                  { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[modalStyles.btnSave, isSaving && { opacity: 0.7 }]}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="check" size={16} color="#FFFFFF" />
              )}
              <Text style={modalStyles.btnSaveText}>
                {isSaving ? "Saving Corrections..." : "Save Profile Corrections"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 640,
    maxHeight: "90%",
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  fieldCol: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnCancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  btnSave: {
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSaveText: {
    color: "#FFFFFF",
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});

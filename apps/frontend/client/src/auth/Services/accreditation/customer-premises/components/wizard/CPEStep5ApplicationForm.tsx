import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Select } from "../../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { ApplicantData } from "../../types/cpeTypes";

interface CPEStep5ApplicationFormProps {
  activeApplicant: ApplicantData;
  updateActiveApplicant: (fields: Partial<ApplicantData>) => void;
  handleFieldChange: (field: keyof ApplicantData, value: string) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleScrollToSection: (offset: number) => void;
  styles: any;
}

export function CPEStep5ApplicationForm({
  activeApplicant,
  updateActiveApplicant,
  handleFieldChange,
  errors,
  touched,
  handleScrollToSection,
  styles,
}: CPEStep5ApplicationFormProps) {
  return (
    <View>
      {/* Sticky/Header Section Navigation bar */}
      <View style={styles.formHeaderTabs}>
        <TouchableOpacity onPress={() => handleScrollToSection(0)} style={[styles.formTab, styles.formTabActive]}>
          <Text style={[styles.formTabText, styles.formTabTextActive]}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleScrollToSection(150)} style={styles.formTab}>
          <Text style={styles.formTabText}>Basic Info</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleScrollToSection(300)} style={styles.formTab}>
          <Text style={styles.formTabText}>Business</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleScrollToSection(480)} style={styles.formTab}>
          <Text style={styles.formTabText}>Address</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleScrollToSection(750)} style={styles.formTab}>
          <Text style={styles.formTabText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleScrollToSection(900)} style={styles.formTab}>
          <Text style={styles.formTabText}>Supervising Engineer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleScrollToSection(1050)} style={styles.formTab}>
          <Text style={styles.formTabText}>Technician</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleScrollToSection(1200)} style={styles.formTab}>
          <Text style={styles.formTabText}>Date of Expiry</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        {/* Details Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Details</Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol6}>
              <Text style={styles.selectLabel}>No. of Years*</Text>
              <Select
                value={activeApplicant.years}
                onValueChange={(val) => updateActiveApplicant({ years: val })}
                options={[
                  { label: "1 Year", value: "1" },
                  { label: "2 Years", value: "2" },
                  { label: "3 Years", value: "3" },
                ]}
              />
            </View>
            <View style={styles.formCol6}>
              <Text style={styles.selectLabel}>Variation (mobile/non-mobile)*</Text>
              <Select
                value={activeApplicant.variation}
                onValueChange={(val) => updateActiveApplicant({ variation: val })}
                options={[
                  { label: "Mobile", value: "Mobile" },
                  { label: "Non-Mobile", value: "Non-Mobile" },
                ]}
              />
            </View>
            {(activeApplicant.appType === "RENEWAL" || activeApplicant.appType === "MODIFICATION") && (
              <View style={styles.formCol12}>
                <ValidatedInput
                  label="Accreditation No."
                  placeholder="Accreditation Number"
                  value={activeApplicant.accreditationNo}
                  onChangeText={(val) => handleFieldChange("accreditationNo", val)}
                  error={errors.accreditationNo}
                  touched={touched.accreditationNo}
                  required
                />
              </View>
            )}
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Basic Info</Text>
          <ValidatedInput
            label="Application (Business Name)"
            placeholder="Enter business / sole owner name"
            value={activeApplicant.businessName}
            onChangeText={(val) => handleFieldChange("businessName", val)}
            error={errors.businessName}
            touched={touched.businessName}
            required
          />
        </View>

        {/* Business Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Business Details</Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol6}>
              <Select
                value={activeApplicant.entityType}
                onValueChange={(val) => updateActiveApplicant({ entityType: val })}
                options={[
                  { label: "Corporation", value: "Corporation" },
                  { label: "Partnership", value: "Partnership" },
                  { label: "Single Proprietorship", value: "Single Proprietorship" },
                ]}
                label="Type of Entity"
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="DTI/SEC Registration No."
                placeholder="Registration Number"
                value={activeApplicant.dtiNo}
                onChangeText={(val) => handleFieldChange("dtiNo", val)}
                error={errors.dtiNo}
                touched={touched.dtiNo}
                required
              />
            </View>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Address</Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Province"
                placeholder="Province"
                value={activeApplicant.province}
                onChangeText={(val) => handleFieldChange("province", val)}
                error={errors.province}
                touched={touched.province}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="City"
                placeholder="City"
                value={activeApplicant.city}
                onChangeText={(val) => handleFieldChange("city", val)}
                error={errors.city}
                touched={touched.city}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Barangay"
                placeholder="Barangay"
                value={activeApplicant.barangay}
                onChangeText={(val) => handleFieldChange("barangay", val)}
                error={errors.barangay}
                touched={touched.barangay}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Street"
                placeholder="Street"
                value={activeApplicant.street}
                onChangeText={(val) => handleFieldChange("street", val)}
                error={errors.street}
                touched={touched.street}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Zone / Code"
                placeholder="Zone"
                value={activeApplicant.zone}
                onChangeText={(val) => handleFieldChange("zone", val)}
                error={errors.zone}
                touched={touched.zone}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Unit/Bldg No."
                placeholder="Bldg No"
                value={activeApplicant.unitBldgNo}
                onChangeText={(val) => handleFieldChange("unitBldgNo", val)}
                error={errors.unitBldgNo}
                touched={touched.unitBldgNo}
                required
              />
            </View>
            <View style={styles.formCol12}>
              <ValidatedInput
                label="Zip Code"
                placeholder="Zip Code"
                value={activeApplicant.zipCode}
                onChangeText={(val) => handleFieldChange("zipCode", val)}
                error={errors.zipCode}
                touched={touched.zipCode}
                required
              />
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Contact Details</Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Contact Number"
                placeholder="e.g. 09171234567"
                value={activeApplicant.contactNo}
                onChangeText={(val) => handleFieldChange("contactNo", val)}
                error={errors.contactNo}
                touched={touched.contactNo}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Email Address"
                placeholder="e.g. support@domain.com"
                value={activeApplicant.email}
                onChangeText={(val) => handleFieldChange("email", val)}
                error={errors.email}
                touched={touched.email}
                required
              />
            </View>
          </View>
        </View>

        {/* Supervising Engineer Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Supervising Engineer</Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Engineer Full Name"
                placeholder="Supervising Engineer Name"
                value={activeApplicant.engineerName}
                onChangeText={(val) => handleFieldChange("engineerName", val)}
                error={errors.engineerName}
                touched={touched.engineerName}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="ECE/PECE License No."
                placeholder="ECE License Number"
                value={activeApplicant.eceNo}
                onChangeText={(val) => handleFieldChange("eceNo", val)}
                error={errors.eceNo}
                touched={touched.eceNo}
                required
              />
            </View>
          </View>
        </View>

        {/* Technician Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Technician Details</Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="Radio Technician Name"
                placeholder="Technician Name"
                value={activeApplicant.technicianName}
                onChangeText={(val) => handleFieldChange("technicianName", val)}
                error={errors.technicianName}
                touched={touched.technicianName}
                required
              />
            </View>
            <View style={styles.formCol6}>
              <ValidatedInput
                label="RCT/ECT License No."
                placeholder="ECT License Number"
                value={activeApplicant.ectNo}
                onChangeText={(val) => handleFieldChange("ectNo", val)}
                error={errors.ectNo}
                touched={touched.ectNo}
                required
              />
            </View>
          </View>
        </View>

        {/* Expiry Date Section */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionHeading}>Date of Expiry</Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol6}>
              <Text style={styles.selectLabel}>Month</Text>
              <Select
                value={activeApplicant.expiryMonth}
                onValueChange={(val) => updateActiveApplicant({ expiryMonth: val })}
                options={[
                  { label: "January", value: "January" },
                  { label: "February", value: "February" },
                  { label: "March", value: "March" },
                  { label: "April", value: "April" },
                  { label: "May", value: "May" },
                  { label: "June", value: "June" },
                  { label: "July", value: "July" },
                  { label: "August", value: "August" },
                  { label: "September", value: "September" },
                  { label: "October", value: "October" },
                  { label: "November", value: "November" },
                  { label: "December", value: "December" },
                ]}
              />
            </View>
            <View style={styles.formCol6}>
              <Text style={styles.selectLabel}>Date</Text>
              <Select
                value={activeApplicant.expiryDate}
                onValueChange={(val) => updateActiveApplicant({ expiryDate: val })}
                options={Array.from({ length: 31 }, (_, i) => ({
                  label: (i + 1).toString(),
                  value: (i + 1).toString(),
                }))}
              />
            </View>
            <View style={styles.formCol12}>
              <Text style={styles.selectLabel}>Year</Text>
              <Select
                value={activeApplicant.expiryYear}
                onValueChange={(val) => updateActiveApplicant({ expiryYear: val })}
                options={[
                  { label: "2026", value: "2026" },
                  { label: "2027", value: "2027" },
                  { label: "2028", value: "2028" },
                  { label: "2029", value: "2029" },
                  { label: "2030", value: "2030" },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ApplicantData } from "../../types/cpeTypes";
import { Select } from "../../../../../../shared/components/Select";

interface CPESteps1To3Props {
  step: number;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  tenants: any[];
  offices: any[];
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  activeApplicant: ApplicantData;
  updateActiveApplicant: (fields: Partial<ApplicantData>) => void;
  setApplicants: React.Dispatch<React.SetStateAction<ApplicantData[]>>;
  setCurrentApplicantIndex: (idx: number) => void;
  initialApplicant: (id: number) => ApplicantData;
  styles: any;
}

export function CPESteps1To3({
  step,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  offices,
  appMode,
  setAppMode,
  activeApplicant,
  updateActiveApplicant,
  setApplicants,
  setCurrentApplicantIndex,
  initialApplicant,
  styles,
}: CPESteps1To3Props) {
  if (step === 1) {
    return (
      <View>
        <Text style={styles.stepSubtitle}>Select from which region you intend to apply:</Text>
        <Text style={styles.selectLabel}>Region</Text>
        <Select
          placeholder="Region"
          value={selectedRegionId}
          onValueChange={(val) => {
            setSelectedRegionId(val);
            setSelectedOfficeId("");
          }}
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
        />
        <Text style={styles.selectLabel}>Select Office:</Text>
        <Select
          placeholder="Offices*"
          value={selectedOfficeId}
          onValueChange={setSelectedOfficeId}
          options={offices.map((o) => ({ label: o.name, value: o.id }))}
        />
      </View>
    );
  }

  if (step === 2) {
    return (
      <View>
        <Text style={styles.stepSubtitle}>Specify your application concern and view the required documents:</Text>
        <Text style={styles.selectLabel}>Application Mode</Text>
        <Select
          placeholder="Select Application Mode"
          value={appMode}
          onValueChange={(val) => {
            if (val === "SINGLE" || val === "BULK") {
              setAppMode(val);
              if (val === "SINGLE") {
                setApplicants([initialApplicant(1)]);
                setCurrentApplicantIndex(0);
              }
            }
          }}
          options={[
            { label: "Individual Filing (Single Application)", value: "SINGLE" },
            { label: "Bulk Multi-Filing (Multiple Applicants / Upload Excel)", value: "BULK" },
          ]}
        />

        <Text style={styles.selectLabel}>Application Type</Text>
        <Select
          placeholder="Select Application Type"
          value={activeApplicant.appType}
          onValueChange={(val) => {
            if (val === "NEW" || val === "RENEWAL" || val === "MODIFICATION") {
              updateActiveApplicant({ appType: val });
            }
          }}
          options={[
            { label: "New Application", value: "NEW" },
            { label: "Renewal of Accreditation", value: "RENEWAL" },
            { label: "Modification of Accreditation", value: "MODIFICATION" },
          ]}
        />
      </View>
    );
  }

  return null;
}

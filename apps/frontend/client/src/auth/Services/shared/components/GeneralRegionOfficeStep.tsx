import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { TenantInfo, OfficeInfo, ExamScheduleItem } from "../hooks/useGeneralServiceWizard";

interface GeneralRegionOfficeStepProps {
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  isExamService?: boolean;
  schedules?: ExamScheduleItem[];
  loadingSchedules?: boolean;
  selectedScheduleId?: string | null;
  onSelectSchedule?: (id: string) => void;
}

export function GeneralRegionOfficeStep({
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  offices,
  isExamService = false,
  schedules = [],
  loadingSchedules = false,
  selectedScheduleId = null,
  onSelectSchedule,
}: GeneralRegionOfficeStepProps) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderLeftWidth: 5,
        borderLeftColor: "#0F2C59",
        shadowColor: "#0F2C59",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
          <Icon name="map-pin" size={15} color="#0F2C59" />
        </View>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F2C59" }}>
          {isExamService ? "Region, Office & Exam Schedule Selection" : "Region & Field Office Selection"}
        </Text>
      </View>

      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginBottom: 16 }}>
        {isExamService
          ? "Select your target NTC Regional Office, Field Office, and examination schedule from the options below:"
          : "Select your target NTC Regional Office and processing Field Office from the options below:"}
      </Text>

      {/* Card Section 1: Region Selection */}
      <View
        style={{
          marginBottom: 16,
          backgroundColor: "#F8FAFC",
          padding: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          borderLeftWidth: 3,
          borderLeftColor: "#3B82F6",
        }}
      >
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
            Select NTC Region*
          </Text>
        </View>
        <Select
          placeholder="Select NTC Region..."
          value={selectedRegionId}
          onValueChange={(val: string) => {
            setSelectedRegionId(val);
            setSelectedOfficeId("");
          }}
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
          iconName="map-pin"
        />
      </View>

      {/* Card Section 2: Field Office Selection */}
      <View
        style={{
          marginBottom: isExamService ? 16 : 0,
          backgroundColor: "#F8FAFC",
          padding: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          borderLeftWidth: 3,
          borderLeftColor: "#F59E0B",
        }}
      >
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
            Select NTC Field Office*
          </Text>
        </View>
        <Select
          placeholder={selectedRegionId ? "Select NTC Field Office..." : "Select Region first..."}
          value={selectedOfficeId}
          onValueChange={setSelectedOfficeId}
          options={offices.map((o) => ({ label: o.name, value: o.id }))}
          iconName="home"
        />
      </View>

      {/* Card Section 3: Exam Schedules (For Examination Services) */}
      {isExamService && (
        <View
          style={{
            backgroundColor: "#F8FAFC",
            padding: 16,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderLeftWidth: 3,
            borderLeftColor: "#10B981",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name="calendar" size={16} color="#0F2C59" />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
                Scheduled Exam Dates*
              </Text>
            </View>
            {selectedScheduleId ? (
              <View
                style={{
                  backgroundColor: "#DCFCE7",
                  borderColor: "#16A34A",
                  borderWidth: 1,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="check" size={11} color="#16A34A" />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#16A34A" }}>
                  Schedule Selected
                </Text>
              </View>
            ) : (
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontStyle: "italic", color: "#E11D48" }}>
                * Selection required
              </Text>
            )}
          </View>

          {!selectedRegionId ? (
            <View
              style={{
                padding: 14,
                backgroundColor: "#F1F5F9",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, color: "#64748B" }}>
                Please select an NTC Region above to view available examination schedules.
              </Text>
            </View>
          ) : loadingSchedules ? (
            <View style={{ padding: 24, alignItems: "center", justifyContent: "center", gap: 8 }}>
              <ActivityIndicator size="small" color="#0F2C59" />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, color: "#64748B", fontSize: 13 }}>
                Checking available examination schedules...
              </Text>
            </View>
          ) : schedules.length === 0 ? (
            <View
              style={{
                padding: 16,
                backgroundColor: "#FFFBEB",
                borderWidth: 1,
                borderColor: "#FDE68A",
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <Icon name="calendar" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, color: "#92400E", fontSize: 14, fontWeight: "700", marginBottom: 4 }}>
                  No Open Examination Schedule
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, color: "#B45309", fontSize: 12.5, lineHeight: 18 }}>
                  There are currently no active or open exam slots for the selected Region/Office. Examination filing requires an open schedule date. You may switch to another Regional Office or check back soon for newly published exam dates.
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {schedules.map((sched, index) => {
                const isSelected = selectedScheduleId === sched.id;
                return (
                  <TouchableOpacity
                    key={sched.id || index}
                    onPress={() => onSelectSchedule?.(sched.id)}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? "#0F2C59" : "#CBD5E1",
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: isSelected ? "#0F2C59" : "#94A3B8",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: isSelected ? "#0F2C59" : "transparent",
                          }}
                        >
                          {isSelected && (
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "#FFFFFF",
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontFamily: TYPOGRAPHY.fonts.primary,
                            fontSize: 14,
                            fontWeight: "700",
                            color: isSelected ? "#0F2C59" : "#1E293B",
                          }}
                        >
                          {sched.scheduledDate}
                        </Text>
                      </View>

                      {sched.availableSlots !== undefined || sched.maximumSlots !== undefined ? (
                        <View
                          style={{
                            backgroundColor: isSelected ? "#DBEAFE" : "#F1F5F9",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: TYPOGRAPHY.fonts.primary,
                              fontSize: 11,
                              fontWeight: "600",
                              color: isSelected ? "#1D4ED8" : "#475569",
                            }}
                          >
                            {sched.availableSlots !== undefined
                              ? `${sched.availableSlots} Slots Available`
                              : `${sched.maximumSlots} Max Slots`}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={{ paddingLeft: 28, gap: 4 }}>
                      {(sched.startTime || sched.endTime) && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Icon name="clock" size={12} color="#64748B" />
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B" }}>
                            {[sched.startTime, sched.endTime].filter(Boolean).join(" - ")}
                          </Text>
                        </View>
                      )}
                      {sched.venue && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Icon name="map-pin" size={12} color="#64748B" />
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B" }}>
                            {sched.venue}
                          </Text>
                        </View>
                      )}
                      {sched.description && (
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>
                          {sched.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

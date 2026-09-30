import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, Icon as Lucide, useTheme, AnimatedCard, AlertToast } from "@edge/ui";
import {
  useRegions,
  useAdminFieldOffices,
  useAdminRequirements,
  useAdminFees,
  useAdminNotes,
  safeAsync,
  createFieldOffice,
  updateFieldOffice,
  deleteFieldOffice,
} from "@edge/api";

import {
  RegionalConfigCard,
  ApplicationRequirementItem,
  FeePaymentItem,
  NoteItem,
  BranchOffice,
} from "../types/adminSettingsTypes";
import { RegionalConfigTab } from "../components/RegionalConfigTab";
import { ServiceTreeConfigTab } from "../components/ServiceTreeConfigTab";
import {
  AdminSettingsModal,
  ModalType,
  ModalInitialData,
} from "../components/AdminSettingsModal";
import { DeleteAdminItemModal } from "../components/DeleteAdminItemModal";

export type AdminTabType = "regional" | "services";

interface TabItem {
  id: AdminTabType;
  label: string;
  icon: keyof typeof Lucide.glyphMap;
}

const TABS: TabItem[] = [
  { id: "regional", label: "Regional Configurations", icon: "sliders" },
  { id: "services", label: "Services & Prerequisites", icon: "layers" },
];

export function AdminSettingsScreen(): React.ReactElement {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTabType>("regional");

  // Live API Hooks
  const { regions } = useRegions();
  const { fieldOffices, refetch } = useAdminFieldOffices();
  const { requirements: apiRequirements, serviceVariantRequirements: apiSvrRequirements } = useAdminRequirements();
  const { fees: apiFees, serviceFees: apiServiceFees } = useAdminFees();
  const { notes: apiNotes } = useAdminNotes();

  // Edit Modal State
  const [modalType, setModalType] = useState<ModalType>("none");
  const [selectedItem, setSelectedItem] = useState<ModalInitialData | undefined>(undefined);

  // Toast State
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const showToast = (message: string, variant: "success" | "error" = "success") => {
    setToast({ message, variant });
  };

  // Delete Permission Dialog State
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    itemTitle: string;
    itemType: string;
    onConfirm: () => void;
  }>({
    visible: false,
    itemTitle: "",
    itemType: "Item",
    onConfirm: () => {},
  });

  // Map API Field Offices -> BranchOffice display interface
  const branchOffices: BranchOffice[] = fieldOffices.map((fo) => ({
    id: fo.id,
    name: fo.name,
    code: fo.code,
    type: fo.category === "Extension" ? "Field Office" : (fo.code.includes("MAIN") || fo.code.includes("001") ? "Main Office" : "Field Office"),
    address: fo.address,
    contactNumber: fo.contactPhone || "(088) 123-4567",
  }));

  const stats = {
    total: branchOffices.length,
    mainOffice: branchOffices.filter((b) => b.type === "Main Office").length,
    fieldOffice: branchOffices.filter((b) => b.type === "Field Office").length,
  };

  const activeRegion = regions.length > 0 ? regions[0] : null;
  const regionalConfigs: RegionalConfigCard[] = [
    {
      id: activeRegion ? activeRegion.id : "commissioner",
      category: activeRegion ? activeRegion.name : "Regional Office Configuration",
      subtitle: activeRegion ? `${activeRegion.name} Regional Office` : "Regional Office Configuration",
      name: activeRegion ? activeRegion.name : "NTC Region X - Northern Mindanao",
      rcCode: activeRegion ? `RC-${activeRegion.code || '10'}` : 'RC-10',
      officeCode: 'R10-MAIN',
      commissionerName: 'Comm. Ella Blanca B. Lopez',
      supportEmail: 'region10@ntc.gov.ph',
      supportPhone: '(088) 856-1234 / (02) 8924-4008',
      badge: {
        text: activeRegion?.isActive !== false ? "Active Region" : "Inactive",
        type: "active",
      },
      icon: "sliders",
      iconBg: isDark ? colors.neutral[800] : colors.brand.light,
      iconColor: isDark ? colors.brand.primary : colors.brand.secondary,
    },
  ];

  const appRequirements: ApplicationRequirementItem[] = apiSvrRequirements.length > 0
    ? apiSvrRequirements.map((svr) => ({
        id: svr.id,
        title: svr.requirement?.name || "Application Requirement",
        statusText: svr.isRequired ? "Mandatory Requirement" : "Optional Requirement",
        mappedCount: 1,
        requiredCount: svr.isRequired ? 1 : 0,
        optionalCount: svr.isRequired ? 0 : 1,
        mappedDocuments: [
          {
            id: svr.requirementId,
            name: svr.requirement?.name || "Required Document",
            isRequired: svr.isRequired,
          },
        ],
      }))
    : apiRequirements.map((r) => ({
        id: r.id,
        title: r.name,
        statusText: "Active Requirement",
        mappedCount: 1,
        requiredCount: 1,
        optionalCount: 0,
        mappedDocuments: [{ id: r.id, name: r.name, isRequired: true }],
      }));

  const feesPayments: FeePaymentItem[] = apiFees.map((fee) => {
    const matchingServiceFees = apiServiceFees.filter((sf) => sf.feeId === fee.id);
    const total = matchingServiceFees.reduce((acc, sf) => acc + sf.amount, 0);

    return {
      id: fee.id,
      title: fee.name,
      statusText: fee.isActive !== false ? "Active Fees" : "Inactive",
      configuredCount: matchingServiceFees.length || 1,
      totalAmount: total > 0 ? total : 160.0,
      feeBreakdown: matchingServiceFees.length > 0
        ? matchingServiceFees.map((sf) => ({ id: sf.id, name: fee.name, amount: sf.amount }))
        : [{ id: `fb-${fee.id}`, name: fee.name, amount: 160.0 }],
    };
  });

  const notes: NoteItem[] = apiNotes.map((n) => ({
    id: n.id,
    title: n.notes.length > 30 ? `${n.notes.substring(0, 30)}...` : n.notes,
    statusText: "Active Guidance Note",
    typeText: "Instruction Block",
    targetView: "Client & Internal View",
    instructions: n.notes,
  }));

  const handleEditConfig = (config: RegionalConfigCard) => {
    setSelectedItem({
      id: config.id,
      name: config.name,
      subLabel: config.commissionerName || config.subLabel,
      category: config.category,
    });
    setModalType("edit-config");
  };

  const handleDeleteConfig = (id: string, name: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: name,
      itemType: "Regional Configuration",
      onConfirm: () => {},
    });
  };

  const handleAddBranchOffice = () => {
    setSelectedItem(undefined);
    setModalType("add-branch");
  };

  const handleEditBranchOffice = (office: BranchOffice) => {
    setSelectedItem({
      id: office.id,
      name: office.name,
      code: office.code,
      branchType: office.type,
      branchCategory: office.type === "Field Office" ? "Extension" : "Main",
      address: office.address,
      contactPhone: office.contactNumber,
    });
    setModalType("add-branch");
  };

  const handleDeleteBranchOffice = (id: string, name: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: name,
      itemType: "Field Office",
      onConfirm: async () => {
        const [res, err] = await safeAsync(deleteFieldOffice(id));
        if (err !== null) {
          showToast(err, "error");
          setDeleteModal((prev) => ({ ...prev, visible: false }));
          return;
        }
        showToast("Field Office deleted successfully!", "success");
        refetch();
        setDeleteModal((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.badgeText, { color: isDark ? colors.brand.primary : colors.brand.secondary }]}>
              SYSTEM ADMINISTRATION
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Regional & Service Configs</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Configure regional office parameters, field office branches, and service catalog prerequisites.
            </Text>
          </View>

          {/* Navigation Bar */}
          <View
            style={[
              styles.tabsContainer,
              { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            {TABS.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setActiveTab(t.id)}
                  style={[
                    styles.tabBtn,
                    isActive && [
                      styles.tabBtnActive,
                      { backgroundColor: isDark ? colors.neutral[700] : colors.cardBg },
                    ],
                  ]}
                  activeOpacity={0.7}
                >
                  <Lucide
                    name={t.icon}
                    size={16}
                    color={isActive ? (isDark ? colors.brand.primary : colors.brand.secondary) : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabBtnText,
                      { color: isActive ? (isDark ? colors.brand.primary : colors.brand.secondary) : colors.textMuted },
                      isActive && styles.tabBtnTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Tab View */}
          {activeTab === "regional" ? (
            <AnimatedCard delay={0} padding={0} style={styles.tabContentCard}>
              <RegionalConfigTab
                configs={regionalConfigs}
                branchOffices={branchOffices}
                stats={stats}
                onEditConfig={handleEditConfig}
                onDeleteConfig={handleDeleteConfig}
                onAddBranchOffice={handleAddBranchOffice}
                onEditBranchOffice={handleEditBranchOffice}
                onDeleteBranchOffice={handleDeleteBranchOffice}
              />
            </AnimatedCard>
          ) : (
            <AnimatedCard delay={0} padding={0} style={styles.tabContentCard}>
              <ServiceTreeConfigTab />
            </AnimatedCard>
          )}
        </View>

        <AdminSettingsModal
          visible={modalType !== "none"}
          type={modalType}
          initialData={selectedItem}
          onClose={() => setModalType("none")}
          onSave={async (savedData) => {
            if (modalType === "add-branch") {
              const selectedRegionId = regions.length > 0 ? regions[0].id : "00000000-0000-0000-0000-000000000000";
              if (selectedItem?.id) {
                const [res, err] = await safeAsync(
                  updateFieldOffice(selectedItem.id, {
                    id: selectedItem.id,
                    name: savedData.name || savedData.title,
                    code: savedData.code,
                    category: savedData.branchCategory || (savedData.branchType === "Field Office" ? "Extension" : "Main"),
                    address: savedData.address,
                    contactPhone: savedData.contactPhone,
                    contactEmail: savedData.contactEmail,
                    description: savedData.description,
                    regionId: selectedRegionId,
                  })
                );
                if (err || !res) {
                  const errorMsg = err || "Failed to update regional field office.";
                  showToast(errorMsg, "error");
                  throw new Error(errorMsg);
                }
                showToast("Regional Field Office updated successfully!", "success");
              } else {
                const [res, err] = await safeAsync(
                  createFieldOffice({
                    name: savedData.name || savedData.title,
                    code: savedData.code,
                    category: savedData.branchCategory || (savedData.branchType === "Field Office" ? "Extension" : "Main"),
                    address: savedData.address,
                    contactPhone: savedData.contactPhone,
                    contactEmail: savedData.contactEmail,
                    description: savedData.description,
                    regionId: selectedRegionId,
                  })
                );
                if (err || !res) {
                  const errorMsg = err || "Failed to create regional field office.";
                  showToast(errorMsg, "error");
                  throw new Error(errorMsg);
                }
                showToast("Regional Field Office created successfully!", "success");
              }
              refetch();
            }
            setModalType("none");
          }}
        />

        {toast !== null && (
          <View style={styles.toastContainer}>
            <AlertToast
              message={toast.message}
              variant={toast.variant}
              onDismiss={() => setToast(null)}
            />
          </View>
        )}

        <DeleteAdminItemModal
          visible={deleteModal.visible}
          itemTitle={deleteModal.itemTitle}
          itemType={deleteModal.itemType}
          onClose={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
          onConfirm={deleteModal.onConfirm}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  container: {
    width: "100%",
  },
  header: {
    marginBottom: 20,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabBtnActive: {
    shadowColor: COLORS.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabBtnTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabContentCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  toastContainer: {
    position: "absolute",
    top: 20,
    right: 24,
    zIndex: 99999,
  },
});

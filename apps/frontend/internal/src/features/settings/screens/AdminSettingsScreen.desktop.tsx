import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, Icon as Lucide, useTheme, AnimatedCard } from "@edge/ui";
import {
  useRegions,
  useAdminFieldOffices,
  useAdminRequirements,
  useAdminFees,
  useAdminNotes,
} from "@edge/api";

import {
  RegionalConfigCard,
  ApplicationRequirementItem,
  FeePaymentItem,
  NoteItem,
  BranchOffice,
} from "../data/mockAdminSettings";
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
  const { fieldOffices } = useAdminFieldOffices();
  const { requirements: apiRequirements, serviceVariantRequirements: apiSvrRequirements } = useAdminRequirements();
  const { fees: apiFees, serviceFees: apiServiceFees } = useAdminFees();
  const { notes: apiNotes } = useAdminNotes();

  // Edit Modal State
  const [modalType, setModalType] = useState<ModalType>("none");
  const [selectedItem, setSelectedItem] = useState<ModalInitialData | undefined>(undefined);

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

  const branchOffices: BranchOffice[] = fieldOffices.map((fo) => ({
    id: fo.id,
    name: fo.name,
    code: fo.code,
    type: fo.code.includes("MAIN") || fo.code.includes("001") ? "Main Office" : "Field Office",
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
      subLabel: "Engr. Teodoro D. Buenavista Jr. · Regional Director",
      badge: {
        text: activeRegion?.isActive !== false ? "Active Region" : "Inactive",
        type: "active",
      },
      icon: "sliders",
      iconBg: isDark ? colors.neutral[800] : colors.brand.light,
      iconColor: isDark ? colors.brand.primary : colors.brand.secondary,
    },
  ];

  const handleEditConfig = (config: RegionalConfigCard) => {
    setSelectedItem({
      id: config.id,
      name: config.name,
      subLabel: config.subLabel,
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
    });
    setModalType("add-branch");
  };

  const handleDeleteBranchOffice = (id: string, name: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: name,
      itemType: "Branch Office",
      onConfirm: () => {},
    });
  };

  return (
    <ScrollView
      style={[styles.desktopShell, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.badgeText, { color: isDark ? colors.brand.primary : colors.brand.secondary }]}>
            SYSTEM ADMINISTRATION • DESKTOP WORKSTATION
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Regional & Service Configurations</Text>
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
                  size={18}
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
        onSave={() => setModalType("none")}
      />

      <DeleteAdminItemModal
        visible={deleteModal.visible}
        itemTitle={deleteModal.itemTitle}
        itemType={deleteModal.itemType}
        onClose={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={deleteModal.onConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 32,
    paddingBottom: 60,
  },
  container: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  header: {
    marginBottom: 24,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
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
    fontSize: 13,
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
});

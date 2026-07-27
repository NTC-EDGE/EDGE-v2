// Internal Admin Settings Screen — Core Regional Settings
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import {
  useRegions,
  useAdminFieldOffices,
  useAdminRequirements,
  useAdminFees,
  useAdminNotes,
} from '@edge/api';

import {
  RegionalConfigCard,
  ApplicationRequirementItem,
  FeePaymentItem,
  NoteItem,
  BranchOffice,
} from '../data/mockAdminSettings';
import { RegionalConfigTab } from '../components/RegionalConfigTab';
import { AppRequirementsTab } from '../components/AppRequirementsTab';
import { FeesPaymentsTab } from '../components/FeesPaymentsTab';
import { NotesTab } from '../components/NotesTab';
import {
  AdminSettingsModal,
  ModalType,
  ModalInitialData,
  MappedDocInput,
  FeeBreakdownItemInput,
} from '../components/AdminSettingsModal';
import { DeleteAdminItemModal } from '../components/DeleteAdminItemModal';

export type AdminTabType =
  | 'regional'
  | 'requirements'
  | 'fees'
  | 'notes';

interface TabItem {
  id: AdminTabType;
  label: string;
  icon: keyof typeof Lucide.glyphMap;
}

const TABS: TabItem[] = [
  { id: 'regional', label: 'Regional Configuration', icon: 'sliders' },
  { id: 'requirements', label: 'Application Requirements', icon: 'check-square' },
  { id: 'fees', label: 'Fees and Payments', icon: 'dollar-sign' },
  { id: 'notes', label: 'Notes', icon: 'file-text' },
];

export function AdminSettingsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Active Tab State
  const [activeTab, setActiveTab] = useState<AdminTabType>('regional');

  // Live API Hooks
  const { regions } = useRegions();
  const { fieldOffices } = useAdminFieldOffices();
  const { requirements: apiRequirements, serviceVariantRequirements: apiSvrRequirements } = useAdminRequirements();
  const { fees: apiFees, serviceFees: apiServiceFees } = useAdminFees();
  const { notes: apiNotes } = useAdminNotes();

  // Edit Modal State
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedItem, setSelectedItem] = useState<ModalInitialData | undefined>(undefined);

  // Delete Permission Dialog State
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    itemTitle: string;
    itemType: string;
    onConfirm: () => void;
  }>({
    visible: false,
    itemTitle: '',
    itemType: 'Item',
    onConfirm: () => {},
  });

  // Map API Field Offices -> BranchOffice display interface
  const branchOffices: BranchOffice[] = fieldOffices.map((fo) => ({
    id: fo.id,
    name: fo.name,
    code: fo.code,
    type: fo.code.includes('MAIN') || fo.code.includes('001') ? 'Main Office' : 'Field Office',
    address: fo.address,
    contactNumber: fo.contactPhone || '(088) 123-4567',
  }));

  // Derived Branch Stats
  const stats = {
    total: branchOffices.length,
    mainOffice: branchOffices.filter((b) => b.type === 'Main Office').length,
    fieldOffice: branchOffices.filter((b) => b.type === 'Field Office').length,
  };

  // Map API Regions -> RegionalConfigCard display interface
  const activeRegion = regions.length > 0 ? regions[0] : null;
  const regionalConfigs: RegionalConfigCard[] = [
    {
      id: activeRegion ? activeRegion.id : 'commissioner',
      category: activeRegion ? activeRegion.name : 'Regional Office Configuration',
      subtitle: activeRegion ? `${activeRegion.name} Regional Office` : 'Regional Office Configuration',
      name: activeRegion ? activeRegion.name : 'NTC Region X - Northern Mindanao',
      subLabel: 'Engr. Teodoro D. Buenavista Jr. · Regional Director',
      badge: {
        text: activeRegion?.isActive !== false ? 'Active Region' : 'Inactive',
        type: 'active',
      },
      icon: 'sliders',
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
    },
  ];

  // Map API Requirements -> ApplicationRequirementItem display interface
  const appRequirements: ApplicationRequirementItem[] = apiSvrRequirements.length > 0
    ? apiSvrRequirements.map((svr) => ({
        id: svr.id,
        title: svr.requirement?.name || 'Application Requirement',
        statusText: svr.isRequired ? 'Mandatory Requirement' : 'Optional Requirement',
        mappedCount: 1,
        requiredCount: svr.isRequired ? 1 : 0,
        optionalCount: svr.isRequired ? 0 : 1,
        mappedDocuments: [
          {
            id: svr.requirementId,
            name: svr.requirement?.name || 'Required Document',
            isRequired: svr.isRequired,
          },
        ],
      }))
    : apiRequirements.map((r) => ({
        id: r.id,
        title: r.name,
        statusText: 'Active Requirement',
        mappedCount: 1,
        requiredCount: 1,
        optionalCount: 0,
        mappedDocuments: [{ id: r.id, name: r.name, isRequired: true }],
      }));

  // Map API Fees -> FeePaymentItem display interface
  const feesPayments: FeePaymentItem[] = apiFees.map((fee) => {
    const matchingServiceFees = apiServiceFees.filter((sf) => sf.feeId === fee.id);
    const total = matchingServiceFees.reduce((acc, sf) => acc + sf.amount, 0);

    return {
      id: fee.id,
      title: fee.name,
      statusText: fee.isActive !== false ? 'Active Fees' : 'Inactive',
      configuredCount: matchingServiceFees.length || 1,
      totalAmount: total > 0 ? total : 160.0,
      feeBreakdown: matchingServiceFees.length > 0
        ? matchingServiceFees.map((sf) => ({ id: sf.id, name: fee.name, amount: sf.amount }))
        : [{ id: `fb-${fee.id}`, name: fee.name, amount: 160.0 }],
    };
  });

  // Map API Notes -> NoteItem display interface
  const notes: NoteItem[] = apiNotes.map((n) => ({
    id: n.id,
    title: n.notes.length > 30 ? `${n.notes.substring(0, 30)}...` : n.notes,
    statusText: 'Active Guidance Note',
    typeText: 'Instruction Block',
    targetView: 'Client & Internal View',
    instructions: n.notes,
  }));

  // Handlers for Regional Config
  const handleEditConfig = (config: RegionalConfigCard) => {
    setSelectedItem({
      id: config.id,
      name: config.name,
      subLabel: config.subLabel,
      category: config.category,
    });
    setModalType('edit-config');
  };

  const handleDeleteConfig = (id: string, name: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: name,
      itemType: 'Regional Configuration',
      onConfirm: () => {},
    });
  };

  const handleAddBranchOffice = () => {
    setSelectedItem(undefined);
    setModalType('add-branch');
  };

  const handleEditBranchOffice = (office: BranchOffice) => {
    setSelectedItem({
      id: office.id,
      name: office.name,
      code: office.code,
      branchType: office.type,
    });
    setModalType('add-branch');
  };

  const handleDeleteBranchOffice = (id: string, name: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: name,
      itemType: 'Branch Office',
      onConfirm: () => {},
    });
  };

  // Handlers for Requirements
  const handleAddRequirement = () => {
    setSelectedItem(undefined);
    setModalType('add-requirement');
  };

  const handleEditRequirement = (item: ApplicationRequirementItem) => {
    setSelectedItem({
      id: item.id,
      title: item.title,
      mappedDocuments: item.mappedDocuments,
    });
    setModalType('edit-requirement');
  };

  const handleDeleteRequirement = (id: string, title: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: title,
      itemType: 'Application Requirement',
      onConfirm: () => {},
    });
  };

  // Handlers for Fees
  const handleConfigureFees = () => {
    setSelectedItem(undefined);
    setModalType('add-fee');
  };

  const handleEditFee = (item: FeePaymentItem) => {
    setSelectedItem({
      id: item.id,
      title: item.title,
      feeBreakdown: item.feeBreakdown,
    });
    setModalType('edit-fee');
  };

  const handleDeleteFee = (id: string, title: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: title,
      itemType: 'Fee Configuration',
      onConfirm: () => {},
    });
  };

  // Handlers for Notes
  const handleAddNotes = () => {
    setSelectedItem(undefined);
    setModalType('add-note');
  };

  const handleEditNote = (item: NoteItem) => {
    setSelectedItem({
      id: item.id,
      title: item.title,
      instructions: item.instructions,
    });
    setModalType('edit-note');
  };

  const handleDeleteNote = (id: string, title: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: title,
      itemType: 'Guidance Note',
      onConfirm: () => {},
    });
  };

  // Save Modal Action
  const handleSaveModal = (data: {
    title: string;
    name: string;
    subLabel: string;
    code: string;
    branchType: 'Main Office' | 'Field Office';
    amount: number;
    instructions: string;
    isActive: boolean;
    mappedDocuments?: MappedDocInput[];
    feeBreakdown?: FeeBreakdownItemInput[];
  }) => {
    setModalType('none');
  };

  return (
    <View style={styles.container}>
      {/* Header Title Section */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Admin Settings</Text>
        <Text style={styles.pageSubtitle}>
          Manage regional configuration, application requirements, fees and payments, and guidance notes.
        </Text>
      </View>

      {/* Horizontal Tabs Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsNavContainer}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabItem,
                isActive ? styles.tabItemActive : styles.tabItemInactive,
              ]}
              onPress={() => setActiveTab(tab.id)}
              accessibilityLabel={`Switch to ${tab.label}`}
            >
              <Lucide
                name={tab.icon}
                size={16}
                color={isActive ? COLORS.neutral.white : COLORS.neutral[600]}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Active Tab View Body */}
      <View style={styles.tabContentArea}>
        {activeTab === 'regional' && (
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
        )}

        {activeTab === 'requirements' && (
          <AppRequirementsTab
            requirements={appRequirements}
            onAddRequirement={handleAddRequirement}
            onEditRequirement={handleEditRequirement}
            onDeleteRequirement={handleDeleteRequirement}
          />
        )}

        {activeTab === 'fees' && (
          <FeesPaymentsTab
            fees={feesPayments}
            onConfigureFees={handleConfigureFees}
            onEditFee={handleEditFee}
            onDeleteFee={handleDeleteFee}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            onAddNotes={handleAddNotes}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </View>

      {/* Admin Settings Modal for Create/Edit Operations */}
      <AdminSettingsModal
        visible={modalType !== 'none'}
        type={modalType}
        initialData={selectedItem}
        onClose={() => setModalType('none')}
        onSave={handleSaveModal}
      />

      {/* Delete Item Confirmation Dialog */}
      <DeleteAdminItemModal
        visible={deleteModal.visible}
        itemTitle={deleteModal.itemTitle}
        itemType={deleteModal.itemType}
        onClose={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={deleteModal.onConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[20],
  },
  headerSection: {
    gap: SPACING[4],
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },

  // Tabs Navigation Bar
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingBottom: SPACING[4],
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  tabItemActive: {
    backgroundColor: COLORS.brand[600],
    borderColor: COLORS.brand[600],
  },
  tabItemInactive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.neutral.white,
  },
  tabLabelInactive: {
    color: COLORS.neutral[700],
  },

  // Content Area
  tabContentArea: {
    marginTop: SPACING[4],
  },
});

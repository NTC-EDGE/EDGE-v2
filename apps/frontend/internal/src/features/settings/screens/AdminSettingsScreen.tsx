import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import {
  INITIAL_REGIONAL_CONFIGS,
  INITIAL_APP_REQUIREMENTS,
  INITIAL_FEES_PAYMENTS,
  INITIAL_NOTES,
  INITIAL_BRANCH_OFFICES,
  INITIAL_FORM_BUILDERS,
  INITIAL_FEEDBACK,
  RegionalConfigCard,
  ApplicationRequirementItem,
  FeePaymentItem,
  NoteItem,
  FormBuilderItem,
  FeedbackItem,
  BranchOffice,
} from '../data/mockAdminSettings';
import { RegionalConfigTab } from '../components/RegionalConfigTab';
import { AppRequirementsTab } from '../components/AppRequirementsTab';
import { FeesPaymentsTab } from '../components/FeesPaymentsTab';
import { NotesTab } from '../components/NotesTab';
import { FormBuilderTab } from '../components/FormBuilderTab';
import { FeedbackTab } from '../components/FeedbackTab';
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
  | 'notes'
  | 'form-builder'
  | 'feedback';

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
  { id: 'form-builder', label: 'Form Builder', icon: 'layout' },
  { id: 'feedback', label: 'Feedback', icon: 'message-square' },
];

export function AdminSettingsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Active Tab State
  const [activeTab, setActiveTab] = useState<AdminTabType>('regional');

  // Datasets State
  const [regionalConfigs, setRegionalConfigs] = useState<RegionalConfigCard[]>(INITIAL_REGIONAL_CONFIGS);
  const [appRequirements, setAppRequirements] = useState<ApplicationRequirementItem[]>(INITIAL_APP_REQUIREMENTS);
  const [feesPayments, setFeesPayments] = useState<FeePaymentItem[]>(INITIAL_FEES_PAYMENTS);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [branchOffices, setBranchOffices] = useState<BranchOffice[]>(INITIAL_BRANCH_OFFICES);
  const [formBuilders, setFormBuilders] = useState<FormBuilderItem[]>(INITIAL_FORM_BUILDERS);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);

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

  // Derived Branch Stats
  const stats = {
    total: branchOffices.length,
    mainOffice: branchOffices.filter((b) => b.type === 'Main Office').length,
    fieldOffice: branchOffices.filter((b) => b.type === 'Field Office').length,
  };

  // Handlers for Regional Config
  const handleEditConfig = (config: RegionalConfigCard) => {
    setSelectedItem({
      id: config.id,
      category: config.category,
      name: config.name,
      subLabel: config.subLabel,
      isActive: true,
    });
    setModalType('edit-config');
  };

  const handleDeleteConfig = (id: string, name: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: name,
      itemType: 'Configuration',
      onConfirm: () => setRegionalConfigs((prev) => prev.filter((c) => c.id !== id)),
    });
  };

  const handleAddBranchOffice = () => {
    setSelectedItem(undefined);
    setModalType('add-branch');
  };

  const handleEditBranchOffice = (branch: BranchOffice) => {
    setSelectedItem({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      branchType: branch.type,
      subLabel: branch.address,
    });
    setModalType('add-branch');
  };

  const handleDeleteBranchOffice = (id: string, name: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: name,
      itemType: 'Branch Office',
      onConfirm: () => setBranchOffices((prev) => prev.filter((b) => b.id !== id)),
    });
  };

  // Handlers for App Requirements
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
      itemType: 'Requirement',
      onConfirm: () => setAppRequirements((prev) => prev.filter((item) => item.id !== id)),
    });
  };

  // Handlers for Fees & Payments
  const handleConfigureFees = () => {
    setSelectedItem(undefined);
    setModalType('add-fee');
  };

  const handleEditFee = (item: FeePaymentItem) => {
    setSelectedItem({
      id: item.id,
      title: item.title,
      amount: item.totalAmount,
      feeBreakdown: item.feeBreakdown,
    });
    setModalType('edit-fee');
  };

  const handleDeleteFee = (id: string, title: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: title,
      itemType: 'Fee Configuration',
      onConfirm: () => setFeesPayments((prev) => prev.filter((item) => item.id !== id)),
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
      onConfirm: () => setNotes((prev) => prev.filter((item) => item.id !== id)),
    });
  };

  // Form Builder & Feedback handlers
  const handleCreateForm = () => {
    setSelectedItem(undefined);
    setModalType('add-form');
  };

  const handleEditForm = (item: FormBuilderItem) => {
    setSelectedItem({ id: item.id, title: item.title });
    setModalType('add-form');
  };

  const handleDeleteForm = (id: string, title: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: title,
      itemType: 'Form Template',
      onConfirm: () => setFormBuilders((prev) => prev.filter((item) => item.id !== id)),
    });
  };

  const handleDeleteFeedback = (id: string, subject: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: subject,
      itemType: 'Feedback Submission',
      onConfirm: () => setFeedbacks((prev) => prev.filter((item) => item.id !== id)),
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
    if (modalType === 'edit-config' && selectedItem?.id !== undefined) {
      setRegionalConfigs((prev) =>
        prev.map((c) =>
          c.id === selectedItem.id
            ? { ...c, name: data.name || c.name, subLabel: data.subLabel || c.subLabel }
            : c
        )
      );
    } else if (modalType === 'add-branch') {
      if (selectedItem?.id !== undefined) {
        setBranchOffices((prev) =>
          prev.map((b) =>
            b.id === selectedItem.id
              ? {
                  ...b,
                  name: data.name || b.name,
                  code: data.code || b.code,
                  type: data.branchType,
                  address: data.subLabel || b.address,
                }
              : b
          )
        );
      } else {
        const newBranch: BranchOffice = {
          id: `bo-${Date.now()}`,
          name: data.name || 'New Regional Field Office',
          code: data.code || `B5099-FO${branchOffices.length + 1}`,
          type: data.branchType || 'Field Office',
          address: data.subLabel || 'Regional Address',
          contactNumber: '(088) 123-4567',
        };
        setBranchOffices((prev) => [...prev, newBranch]);
      }
    } else if (modalType === 'add-requirement') {
      const docs = data.mappedDocuments && data.mappedDocuments.length > 0 ? data.mappedDocuments : [
        { id: 'doc-1', name: 'Valid Government Issued ID', isRequired: true },
        { id: 'doc-2', name: 'Barangay Clearance', isRequired: true },
      ];
      const reqCount = docs.filter((d) => d.isRequired).length;
      const optCount = docs.filter((d) => !d.isRequired).length;

      const newReq: ApplicationRequirementItem = {
        id: `req-${Date.now()}`,
        title: data.title || 'Aeronautical Station Permit to POSSESS',
        statusText: 'Active Requirements',
        mappedCount: docs.length,
        requiredCount: reqCount,
        optionalCount: optCount,
        mappedDocuments: docs,
      };
      setAppRequirements((prev) => [newReq, ...prev]);
    } else if (modalType === 'edit-requirement' && selectedItem?.id !== undefined) {
      setAppRequirements((prev) =>
        prev.map((item) => {
          if (item.id === selectedItem.id) {
            const docs = data.mappedDocuments && data.mappedDocuments.length > 0 ? data.mappedDocuments : item.mappedDocuments;
            const reqCount = docs.filter((d) => d.isRequired).length;
            const optCount = docs.filter((d) => !d.isRequired).length;
            return {
              ...item,
              title: data.title || item.title,
              mappedCount: docs.length,
              requiredCount: reqCount,
              optionalCount: optCount,
              mappedDocuments: docs,
            };
          }
          return item;
        })
      );
    } else if (modalType === 'add-fee') {
      const breakdown = data.feeBreakdown && data.feeBreakdown.length > 0 ? data.feeBreakdown : [
        { id: 'fb-1', name: 'Filing Fee', amount: data.amount || 160.0 },
      ];
      const total = breakdown.reduce((acc, curr) => acc + curr.amount, 0);

      const newFee: FeePaymentItem = {
        id: `fee-${Date.now()}`,
        title: data.title || 'Aeronautical Station Permit to POSSESS',
        statusText: 'Active Fees',
        configuredCount: breakdown.length,
        totalAmount: total > 0 ? total : (data.amount || 160.0),
        feeBreakdown: breakdown,
      };
      setFeesPayments((prev) => [newFee, ...prev]);
    } else if (modalType === 'edit-fee' && selectedItem?.id !== undefined) {
      setFeesPayments((prev) =>
        prev.map((item) => {
          if (item.id === selectedItem.id) {
            const breakdown = data.feeBreakdown && data.feeBreakdown.length > 0 ? data.feeBreakdown : item.feeBreakdown;
            const total = breakdown.reduce((acc, curr) => acc + curr.amount, 0);
            return {
              ...item,
              title: data.title || item.title,
              configuredCount: breakdown.length,
              totalAmount: total > 0 ? total : (data.amount || item.totalAmount),
              feeBreakdown: breakdown,
            };
          }
          return item;
        })
      );
    } else if (modalType === 'add-note') {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: data.title || 'New Service Guidance',
        statusText: 'Active Notes',
        typeText: 'Single Instructions Block',
        targetView: 'Client View',
        instructions: data.instructions || 'Standard verification guidelines applicable for this cycle.',
      };
      setNotes((prev) => [newNote, ...prev]);
    } else if (modalType === 'edit-note' && selectedItem?.id !== undefined) {
      setNotes((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                title: data.title || item.title,
                instructions: data.instructions || item.instructions,
              }
            : item
        )
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Title Section */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Admin Settings</Text>
        <Text style={styles.pageSubtitle}>
          Manage regional configuration, service requirements, notes, fees and build forms.
        </Text>
      </View>

      {/* Horizontal Tab Navigation Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabButton,
                isActive ? styles.tabButtonActive : styles.tabButtonInactive,
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

        {activeTab === 'form-builder' && (
          <FormBuilderTab
            forms={formBuilders}
            onCreateForm={handleCreateForm}
            onEditForm={handleEditForm}
            onDeleteForm={handleDeleteForm}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackTab
            feedback={feedbacks}
            onDeleteFeedback={handleDeleteFeedback}
          />
        )}
      </View>

      {/* Shared Interactive Add/Edit Modal */}
      <AdminSettingsModal
        visible={modalType !== 'none'}
        type={modalType}
        initialData={selectedItem}
        onClose={() => setModalType('none')}
        onSave={handleSaveModal}
      />

      {/* Delete Permission Dialog Modal */}
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
    width: '100%',
    gap: SPACING[20],
  },

  // Header
  headerSection: {
    gap: 4,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },

  // Tabs Row
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingVertical: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  tabButtonActive: {
    backgroundColor: COLORS.brand[600],
    ...SHADOWS.card,
  },
  tabButtonInactive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.body,
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

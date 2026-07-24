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
import { AdminSettingsModal, ModalType } from '../components/AdminSettingsModal';

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

  // Modal State
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedItem, setSelectedItem] = useState<{
    id?: string;
    title?: string;
    name?: string;
    subLabel?: string;
    amount?: number;
    instructions?: string;
  } | undefined>(undefined);

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
      name: config.name,
      subLabel: config.subLabel,
    });
    setModalType('edit-config');
  };

  const handleDeleteConfig = (id: string) => {
    setRegionalConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddBranchOffice = () => {
    setSelectedItem(undefined);
    setModalType('add-branch');
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
    });
    setModalType('edit-requirement');
  };

  const handleDeleteRequirement = (id: string) => {
    setAppRequirements((prev) => prev.filter((item) => item.id !== id));
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
    });
    setModalType('edit-fee');
  };

  const handleDeleteFee = (id: string) => {
    setFeesPayments((prev) => prev.filter((item) => item.id !== id));
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

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
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

  const handleDeleteForm = (id: string) => {
    setFormBuilders((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((item) => item.id !== id));
  };

  // Save Modal Action
  const handleSaveModal = (data: {
    title: string;
    name: string;
    subLabel: string;
    amount: number;
    instructions: string;
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
      const newBranch: BranchOffice = {
        id: `bo-${Date.now()}`,
        name: data.name || 'New Regional Field Office',
        code: `B5099-FO${branchOffices.length + 1}`,
        type: 'Field Office',
        address: data.subLabel || 'Regional Address',
        contactNumber: '(088) 123-4567',
      };
      setBranchOffices((prev) => [...prev, newBranch]);
    } else if (modalType === 'add-requirement') {
      const newReq: ApplicationRequirementItem = {
        id: `req-${Date.now()}`,
        title: data.title || 'New Service Requirement',
        statusText: 'Active Requirements',
        mappedCount: 2,
        requiredCount: 2,
        optionalCount: 0,
        mappedDocuments: [
          { id: `doc-new-1`, name: 'Government Issued Identification Document', isRequired: true },
          { id: `doc-new-2`, name: 'Official Examination Result Copy', isRequired: true },
        ],
      };
      setAppRequirements((prev) => [newReq, ...prev]);
    } else if (modalType === 'edit-requirement' && selectedItem?.id !== undefined) {
      setAppRequirements((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, title: data.title || item.title } : item
        )
      );
    } else if (modalType === 'add-fee') {
      const newFee: FeePaymentItem = {
        id: `fee-${Date.now()}`,
        title: data.title || 'New License Application Fee',
        statusText: 'Active Fees',
        configuredCount: 2,
        totalAmount: data.amount || 250.0,
        feeBreakdown: [
          { id: `fb-n1`, name: 'Filing & Processing Fee', amount: (data.amount || 250) * 0.4 },
          { id: `fb-n2`, name: 'License Issuance Fee', amount: (data.amount || 250) * 0.6 },
        ],
      };
      setFeesPayments((prev) => [newFee, ...prev]);
    } else if (modalType === 'edit-fee' && selectedItem?.id !== undefined) {
      setFeesPayments((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                title: data.title || item.title,
                totalAmount: data.amount > 0 ? data.amount : item.totalAmount,
              }
            : item
        )
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
    <View style={styles.outerWrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
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
                stats={stats}
                onEditConfig={handleEditConfig}
                onDeleteConfig={handleDeleteConfig}
                onAddBranchOffice={handleAddBranchOffice}
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
        </View>
      </ScrollView>

      {/* Shared Interactive Modal */}
      <AdminSettingsModal
        visible={modalType !== 'none'}
        type={modalType}
        initialData={selectedItem}
        onClose={() => setModalType('none')}
        onSave={handleSaveModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[24],
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 1320,
    alignSelf: 'center',
    gap: SPACING[24],
  },

  // Header
  headerSection: {
    gap: 4,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.sizes.heading,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '800',
    color: COLORS.neutral[900],
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
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

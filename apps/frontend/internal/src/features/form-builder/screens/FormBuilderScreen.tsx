import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { useAdminForms } from '@edge/api';
import { FormBuilderTab } from '../../settings/components/FormBuilderTab';
import { FormBuilderItem } from '../../settings/data/mockAdminSettings';
import { VisualFormBuilderModal } from '../../settings/components/VisualFormBuilderModal';
import { DeleteAdminItemModal } from '../../settings/components/DeleteAdminItemModal';
import {
  AdminSettingsModal,
  ModalType,
  ModalInitialData,
} from '../../settings/components/AdminSettingsModal';

export function FormBuilderScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { forms: apiForms, isLoading, isError, refetch } = useAdminForms();

  // Visual Builder Modal State
  const [isVisualBuilderVisible, setIsVisualBuilderVisible] = useState(false);
  const [visualBuilderFormTitle, setVisualBuilderFormTitle] = useState('Dynamic Form Schema');

  // Edit Modal State
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedItem, setSelectedItem] = useState<ModalInitialData | undefined>(undefined);

  // Delete Permission Dialog State
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    itemTitle: string;
    onConfirm: () => void;
  }>({
    visible: false,
    itemTitle: '',
    onConfirm: () => {},
  });

  // Map API Forms -> FormBuilderItem display interface
  const formBuilders: FormBuilderItem[] = apiForms.map((f) => ({
    id: f.formId,
    title: `Form Template v${f.version}`,
    code: `FORM-${f.formId.substring(0, 5).toUpperCase()}`,
    version: f.version,
    status: 'Published',
    fieldsCount: f.sections.reduce((acc, s) => acc + s.fields.length, 0),
  }));

  const handleOpenVisualBuilder = (item?: FormBuilderItem) => {
    setVisualBuilderFormTitle(item?.title || 'Dynamic Form Schema');
    setIsVisualBuilderVisible(true);
  };

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
      onConfirm: () => {},
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.pageTitle}>Form Builder</Text>
          <Text style={styles.pageSubtitle}>
            Configure drag-and-drop form schemas, field validations, and dynamic section layouts for NTC application services.
          </Text>
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleCreateForm}>
          <Lucide name="plus" size={16} color={COLORS.neutral.white} />
          <Text style={styles.primaryBtnText}>Create Form Template</Text>
        </Pressable>
      </View>

      {/* Main Tab View Component */}
      {isLoading && (
        <View style={styles.stateCenter}>
          <ActivityIndicator size="large" color={COLORS.brand[600]} />
          <Text style={styles.stateText}>Loading form templates from API...</Text>
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.stateCenter}>
          <Lucide name="alert-circle" size={32} color={COLORS.semantic.error} />
          <Text style={styles.stateText}>Failed to load form templates from server.</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && (
        <FormBuilderTab
          forms={formBuilders}
          onCreateForm={handleCreateForm}
          onEditForm={handleEditForm}
          onDeleteForm={handleDeleteForm}
          onOpenVisualBuilder={handleOpenVisualBuilder}
        />
      )}

      {/* Visual Drag & Drop Form Builder Modal */}
      <VisualFormBuilderModal
        visible={isVisualBuilderVisible}
        formTitle={visualBuilderFormTitle}
        onClose={() => setIsVisualBuilderVisible(false)}
        onSaveLayout={() => setIsVisualBuilderVisible(false)}
      />

      {/* Admin Settings Modal for Create/Edit */}
      <AdminSettingsModal
        visible={modalType !== 'none'}
        type={modalType}
        initialData={selectedItem}
        onClose={() => setModalType('none')}
        onSave={() => setModalType('none')}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAdminItemModal
        visible={deleteModal.visible}
        itemTitle={deleteModal.itemTitle}
        itemType="Form Template"
        onClose={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={deleteModal.onConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: SPACING[20],
    gap: SPACING[20],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 280,
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
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  primaryBtnText: {
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  stateCenter: {
    padding: SPACING[32],
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.button,
  },
  retryText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
});

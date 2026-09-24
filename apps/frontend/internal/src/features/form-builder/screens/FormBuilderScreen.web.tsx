import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { COLORS, useTheme, PageHeader, AnimatedCard, Button, SkeletonLoader, EmptyState, Icon as Lucide, SPACING } from '@edge/ui';
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
  const { colors } = useTheme();
  const { forms: apiForms, isLoading, isError, refetch } = useAdminForms();

  // Visual Builder Modal State
  const [isVisualBuilderVisible, setIsVisualBuilderVisible] = useState(false);
  const [visualBuilderFormTitle, setVisualBuilderFormTitle] = useState('Dynamic Form Schema');

  // Edit Modal State
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedItem, setSelectedItem] = useState<ModalInitialData | undefined>(undefined);

  // Delete Dialog State
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    itemTitle: string;
    onConfirm: () => void;
  }>({
    visible: false,
    itemTitle: '',
    onConfirm: () => {},
  });

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

  const handleDeleteForm = (_id: string, title: string) => {
    setDeleteModal({
      visible: true,
      itemTitle: title,
      onConfirm: () => {},
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.container}
    >
      <PageHeader
        title="Form Builder"
        subtitle="Configure drag-and-drop form schemas, field validations, and dynamic section layouts for NTC application services."
        action={
          <Button
            variant="primary"
            leftIcon={<Lucide name="plus" size={16} color={COLORS.neutral.white} />}
            onPress={handleCreateForm}
          >
            Create Form Template
          </Button>
        }
      />

      {isLoading && (
        <View style={styles.loadingStack}>
          <SkeletonLoader variant="rectangular" width="100%" height={120} borderRadius={12} />
          <SkeletonLoader variant="rectangular" width="100%" height={120} borderRadius={12} />
        </View>
      )}

      {isError && !isLoading && (
        <EmptyState
          icon="alert-circle"
          title="Failed to Load Forms"
          description="Could not connect to NTC API server to load form schema templates."
          actionLabel="Retry Connection"
          onActionPress={() => refetch()}
        />
      )}

      {!isLoading && !isError && (
        <AnimatedCard padding={16} style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <FormBuilderTab
            forms={formBuilders}
            onCreateForm={handleCreateForm}
            onEditForm={handleEditForm}
            onDeleteForm={handleDeleteForm}
            onOpenVisualBuilder={handleOpenVisualBuilder}
          />
        </AnimatedCard>
      )}

      <VisualFormBuilderModal
        visible={isVisualBuilderVisible}
        formTitle={visualBuilderFormTitle}
        onClose={() => setIsVisualBuilderVisible(false)}
        onSaveLayout={() => setIsVisualBuilderVisible(false)}
      />

      <AdminSettingsModal
        visible={modalType !== 'none'}
        type={modalType}
        initialData={selectedItem}
        onClose={() => setModalType('none')}
        onSave={() => setModalType('none')}
      />

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
  },
  container: {
    padding: SPACING[20],
    gap: SPACING[20],
    width: '100%',
  },
  loadingStack: {
    gap: SPACING[16],
  },
});

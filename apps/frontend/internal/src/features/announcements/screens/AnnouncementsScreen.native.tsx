import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, useTheme, PageHeader, AnimatedCard, Button, Icon as Lucide, SPACING } from '@edge/ui';
import { AnnouncementsTab } from '../../settings/components/AnnouncementsTab';
import { DeleteAdminItemModal } from '../../settings/components/DeleteAdminItemModal';

export function AnnouncementsScreen() {
  const { colors } = useTheme();

  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    itemTitle: string;
    onConfirm: () => void;
  }>({
    visible: false,
    itemTitle: '',
    onConfirm: () => {},
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title="Announcements"
          subtitle="Mobile Admin • Portal system banners and alerts"
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Lucide name="plus" size={14} color={COLORS.neutral.white} />}
              onPress={() => {}}
            >
              New
            </Button>
          }
        />

        <AnimatedCard padding={12} style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <AnnouncementsTab
            onAddAnnouncement={() => {}}
            onDeleteAnnouncement={(_id, title) => {
              setDeleteModal({
                visible: true,
                itemTitle: title,
                onConfirm: () => {},
              });
            }}
          />
        </AnimatedCard>

        <DeleteAdminItemModal
          visible={deleteModal.visible}
          itemTitle={deleteModal.itemTitle}
          itemType="System Announcement"
          onClose={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
          onConfirm={deleteModal.onConfirm}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[16],
    gap: SPACING[16],
  },
});

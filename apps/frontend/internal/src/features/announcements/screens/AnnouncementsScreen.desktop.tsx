import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.container}
    >
      <PageHeader
        title="System Announcements"
        subtitle="Desktop Control Shell • System banners, maintenance alerts, and portal announcements."
        action={
          <Button
            variant="primary"
            leftIcon={<Lucide name="plus" size={16} color={COLORS.neutral.white} />}
            onPress={() => {}}
          >
            Create Announcement
          </Button>
        }
      />

      <AnimatedCard padding={16} style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[24],
    gap: SPACING[20],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
});

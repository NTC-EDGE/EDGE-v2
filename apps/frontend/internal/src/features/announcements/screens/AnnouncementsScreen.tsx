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
import { AnnouncementsTab } from '../../settings/components/AnnouncementsTab';
import { DeleteAdminItemModal } from '../../settings/components/DeleteAdminItemModal';

export function AnnouncementsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Page Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.pageTitle}>System Announcements</Text>
          <Text style={styles.pageSubtitle}>
            Publish system banners, maintenance alerts, and operational updates across all regional portals.
          </Text>
        </View>
      </View>

      {/* Announcements Tab View Component */}
      <AnnouncementsTab
        onAddAnnouncement={() => {}}
        onDeleteAnnouncement={(id, title) => {
          setDeleteModal({
            visible: true,
            itemTitle: title,
            onConfirm: () => {},
          });
        }}
      />

      {/* Delete Modal */}
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
});

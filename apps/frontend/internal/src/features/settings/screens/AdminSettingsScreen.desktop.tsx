import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  Icon as Lucide,
  useTheme,
  PageHeader,
  AnimatedCard,
} from '@edge/ui';
import {
  useRegions,
  useAdminFieldOffices,
} from '@edge/api';

import {
  RegionalConfigCard,
  BranchOffice,
} from '../data/mockAdminSettings';
import { RegionalConfigTab } from '../components/RegionalConfigTab';
import { ServiceTreeConfigTab } from '../components/ServiceTreeConfigTab';
import {
  AdminSettingsModal,
  ModalType,
  ModalInitialData,
} from '../components/AdminSettingsModal';
import { DeleteAdminItemModal } from '../components/DeleteAdminItemModal';

export type AdminTabType = 'regional-details' | 'branch-directory' | 'services-studio';

interface TabItem {
  id: AdminTabType;
  label: string;
  subtitle: string;
  icon: keyof typeof Lucide.glyphMap;
}

const TABS: TabItem[] = [
  {
    id: 'regional-details',
    label: 'Regional Office Details',
    subtitle: 'Parameters & support contacts',
    icon: 'shield',
  },
  {
    id: 'branch-directory',
    label: 'Regional Branch Directory',
    subtitle: 'Field offices & locations',
    icon: 'map-pin',
  },
  {
    id: 'services-studio',
    label: 'Services & Prerequisites Studio',
    subtitle: 'Catalog, variants & fees tree',
    icon: 'layers',
  },
];

export function AdminSettingsScreen(): React.ReactElement {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState<AdminTabType>('regional-details');

  // Mouse Drag-to-Scroll Web Ref & Handlers
  const tabScrollRef = useRef<ScrollView>(null);
  const isDraggingTab = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingTab.current = true;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    dragStartX.current = pageX;
    const scrollNode = (tabScrollRef.current as any)?.getScrollableNode
      ? (tabScrollRef.current as any).getScrollableNode()
      : null;
    if (scrollNode) {
      dragScrollLeft.current = scrollNode.scrollLeft;
    }
  };

  const handleMouseLeaveOrUp = () => {
    isDraggingTab.current = false;
  };

  const handleMouseMove = (e: any) => {
    if (!isDraggingTab.current || Platform.OS !== 'web') return;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    const distance = (pageX - dragStartX.current) * 1.5;
    const scrollNode = (tabScrollRef.current as any)?.getScrollableNode
      ? (tabScrollRef.current as any).getScrollableNode()
      : null;
    if (scrollNode) {
      scrollNode.scrollLeft = dragScrollLeft.current - distance;
    }
  };

  // Live API Hooks
  const { regions } = useRegions();
  const { fieldOffices } = useAdminFieldOffices();

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

  const branchOffices: BranchOffice[] = fieldOffices.map((fo) => ({
    id: fo.id,
    name: fo.name,
    code: fo.code,
    type: fo.code.includes('MAIN') || fo.code.includes('001') ? 'Main Office' : 'Field Office',
    address: fo.address,
    contactNumber: fo.contactPhone || '(088) 123-4567',
  }));

  const stats = {
    total: branchOffices.length,
    mainOffice: branchOffices.filter((b) => b.type === 'Main Office').length,
    fieldOffice: branchOffices.filter((b) => b.type === 'Field Office').length,
  };

  const activeRegion = regions.length > 0 ? regions[0] : null;
  const regionalConfigs: RegionalConfigCard[] = [
    {
      id: activeRegion ? activeRegion.id : 'commissioner',
      category: activeRegion ? activeRegion.name : 'Regional Office Configuration',
      subtitle: activeRegion ? `${activeRegion.name} Regional Office` : 'Regional Office Configuration',
      name: activeRegion ? activeRegion.name : 'NTC Region X - Northern Mindanao',
      rcCode: activeRegion ? `RC-${activeRegion.code || '10'}` : 'RC-10',
      officeCode: 'R10-MAIN',
      commissionerName: 'Comm. Ella Blanca B. Lopez',
      supportEmail: 'region10@ntc.gov.ph',
      supportPhone: '(088) 856-1234 / (02) 8924-4008',
      badge: {
        text: activeRegion?.isActive !== false ? 'Active Region' : 'Inactive',
        type: 'active',
      },
      icon: 'shield',
      iconBg: isDark ? colors.neutral[800] : colors.brand.light,
      iconColor: isDark ? colors.brand[500] : colors.brand.primary,
    },
  ];

  const handleEditConfig = (config: RegionalConfigCard) => {
    setSelectedItem({
      id: config.id,
      name: config.name,
      subLabel: config.commissionerName || config.subLabel,
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

  return (
    <ScrollView
      style={[styles.webShell, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Page Header - override marginBottom to eliminate large spacing */}
        <PageHeader
          title="Admin Configurations Studio"
          subtitle="Configure regional office parameters, field office branch directories, and service catalog prerequisite trees."
          style={{ marginBottom: 0, paddingBottom: SPACING[8] }}
        />

        {/* Scrollable Top Horizontal Segmented Tab Bar with Mouse Drag-to-Scroll */}
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.topTabsScrollWrapper, Platform.select({ web: { cursor: 'grab' } }) as any]}
          contentContainerStyle={styles.topTabsScrollContent}
          {...Platform.select({
            web: {
              onMouseDown: handleMouseDown,
              onMouseLeave: handleMouseLeaveOrUp,
              onMouseUp: handleMouseLeaveOrUp,
              onMouseMove: handleMouseMove,
            },
            default: {},
          })}
        >
          <View
            style={[
              styles.topTabsContainer,
              { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100], borderColor: colors.border },
            ]}
          >
            {TABS.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setActiveTab(t.id)}
                  style={({ pressed }) => [
                    styles.topTabBtn,
                    isActive && [
                      styles.topTabBtnActive,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                      },
                    ],
                    pressed && { opacity: 0.8 },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                >
                  <Lucide
                    name={t.icon}
                    size={15}
                    color={isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.topTabBtnText,
                      { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      isActive && styles.topTabBtnTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Workspace Card */}
        {activeTab === 'regional-details' && (
          <AnimatedCard delay={0} padding={0} style={styles.tabContentCard}>
            <RegionalConfigTab
              mode="details"
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
        )}

        {activeTab === 'branch-directory' && (
          <AnimatedCard delay={0} padding={0} style={styles.tabContentCard}>
            <RegionalConfigTab
              mode="branches"
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
        )}

        {activeTab === 'services-studio' && (
          <AnimatedCard delay={0} padding={0} style={styles.tabContentCard}>
            <ServiceTreeConfigTab />
          </AnimatedCard>
        )}
      </View>

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
        itemType={deleteModal.itemType}
        onClose={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={deleteModal.onConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING[16],
    paddingBottom: SPACING[48],
  },
  container: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    gap: SPACING[12],
  },
  topTabsScrollWrapper: {
    width: '100%',
  },
  topTabsScrollContent: {
    flexGrow: 1,
  },
  topTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.button,
    padding: 4,
    borderWidth: 1,
    gap: SPACING[6],
    minWidth: '100%',
  },
  topTabBtn: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[8],
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topTabBtnActive: {
    borderWidth: 1,
  },
  topTabBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
      },
    }),
  },
  topTabBtnTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabContentCard: {
    width: '100%',
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
});

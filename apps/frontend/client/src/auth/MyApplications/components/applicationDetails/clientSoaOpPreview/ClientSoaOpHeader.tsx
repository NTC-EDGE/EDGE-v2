import React from 'react';
import { View, Text, TouchableOpacity, Platform, GestureResponderEvent, useWindowDimensions } from 'react-native';
import { Icon } from '@edge/ui';
import { ClientSoaOpHeaderProps } from './clientSoaOpPreviewTypes';
import { headerStyles } from './styles/clientSoaOpHeaderStyles';

interface Props extends ClientSoaOpHeaderProps {
  dropdownMenu?: React.ReactNode;
}

export function ClientSoaOpHeader({
  activeTab,
  refNum,
  applicantName,
  viewFormat,
  showActionMenu,
  onToggleActionMenu,
  onCloseActionMenu,
  onSelectViewFormat,
  onPrint,
  onClose,
  dropdownMenu,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const iconBg = activeTab === 'or'
    ? { backgroundColor: '#ECFDF5' }
    : activeTab === 'op'
    ? { backgroundColor: '#F0FDF4' }
    : { backgroundColor: '#E0F2FE' };

  const iconName = activeTab === 'or' ? 'check-circle' : activeTab === 'op' ? 'credit-card' : 'file-text';
  const iconColor = activeTab === 'or' ? '#059669' : activeTab === 'op' ? '#047857' : '#0284C7';

  const tabTitle = activeTab === 'or'
    ? 'Official Receipt (OR)'
    : activeTab === 'op'
    ? 'Order of Payment (OP)'
    : 'Statement of Account (SOA)';

  const printBg = activeTab === 'or'
    ? { backgroundColor: '#10B981' }
    : activeTab === 'op'
    ? { backgroundColor: '#059669' }
    : { backgroundColor: '#0284C7' };

  const handleMenuTriggerPress = (e: GestureResponderEvent) => {
    if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    onToggleActionMenu();
  };

  return (
    <View style={headerStyles.modalHeader}>
      <View style={[headerStyles.headerLeft, isMobile && { minWidth: 0, flex: 1 }]}>
        <View style={[headerStyles.headerIconCircle, iconBg]}>
          <Icon name={iconName} size={20} color={iconColor} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={headerStyles.modalTitle} numberOfLines={1}>Application Reports • {tabTitle}</Text>
          <Text style={headerStyles.modalSubtitle} numberOfLines={1}>
            Ref #{refNum} • {applicantName}
          </Text>
        </View>
      </View>

      <View style={headerStyles.headerActions}>
        {Platform.OS === 'web' && !isMobile && (
          <View style={headerStyles.formatSwitcher}>
            <TouchableOpacity
              style={[headerStyles.formatBtn, viewFormat === 'pdf' && headerStyles.formatBtnActive]}
              onPress={() => {
                onSelectViewFormat('pdf');
                onCloseActionMenu();
              }}
              activeOpacity={0.8}
            >
              <Icon name="file-text" size={13} color={viewFormat === 'pdf' ? '#0369A1' : '#64748B'} />
              <Text style={[headerStyles.formatBtnText, viewFormat === 'pdf' && headerStyles.formatBtnTextActive]}>
                PDF Template
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[headerStyles.formatBtn, viewFormat === 'grid' && headerStyles.formatBtnActive]}
              onPress={() => {
                onSelectViewFormat('grid');
                onCloseActionMenu();
              }}
              activeOpacity={0.8}
            >
              <Icon name="layout" size={13} color={viewFormat === 'grid' ? '#0369A1' : '#64748B'} />
              <Text style={[headerStyles.formatBtnText, viewFormat === 'grid' && headerStyles.formatBtnTextActive]}>
                Data View
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[headerStyles.printBtn, printBg, isMobile && { paddingHorizontal: 8 }]}
          onPress={() => {
            onCloseActionMenu();
            onPrint();
          }}
          activeOpacity={0.75}
          accessibilityLabel="Print report"
        >
          <Icon name="printer" size={15} color="#FFFFFF" />
          {!isMobile && <Text style={headerStyles.printBtnText}>Print</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMenuTriggerPress}
          style={[headerStyles.menuTriggerBtn, showActionMenu && headerStyles.menuTriggerBtnActive]}
          activeOpacity={0.8}
          accessibilityLabel="More options"
        >
          <Icon name="more-vertical" size={17} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity
          style={headerStyles.closeBtn}
          onPress={() => {
            onCloseActionMenu();
            onClose();
          }}
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Icon name="x" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {dropdownMenu}
    </View>
  );
}

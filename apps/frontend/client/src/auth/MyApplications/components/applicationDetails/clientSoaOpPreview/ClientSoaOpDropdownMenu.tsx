import React from 'react';
import { View, Text, TouchableOpacity, Platform, GestureResponderEvent } from 'react-native';
import { Icon } from '@edge/ui';
import { ClientSoaOpDropdownMenuProps } from './clientSoaOpPreviewTypes';
import { headerStyles } from './styles/clientSoaOpHeaderStyles';

export function ClientSoaOpDropdownMenu({
  visible,
  isPaid,
  soaNum,
  opNum,
  orNum,
  orList,
  onDownloadDoc,
  onReloadTemplate,
  onClose,
}: ClientSoaOpDropdownMenuProps) {
  if (!visible) return null;

  const handleContainerTouch = (e: GestureResponderEvent) => {
    if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
  };

  return (
    <View style={headerStyles.dropdownMenu} onTouchStart={handleContainerTouch}>
      <View style={headerStyles.dropdownSectionHeader}>
        <Text style={headerStyles.dropdownSectionTitle}>DOWNLOAD OFFICIAL PDF</Text>
      </View>

      <TouchableOpacity
        style={headerStyles.dropdownMenuItem}
        onPress={() => {
          onClose();
          onDownloadDoc('soa');
        }}
        activeOpacity={0.7}
      >
        <Icon name="file-text" size={15} color="#0369A1" />
        <View style={headerStyles.dropdownMenuTextContainer}>
          <Text style={headerStyles.dropdownMenuItemText}>Statement of Account (SOA)</Text>
          <Text style={headerStyles.dropdownMenuItemSubtext}>Official Vector PDF • #{soaNum}</Text>
        </View>
        <Icon name="download" size={13} color="#94A3B8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={headerStyles.dropdownMenuItem}
        onPress={() => {
          onClose();
          onDownloadDoc('op');
        }}
        activeOpacity={0.7}
      >
        <Icon name="credit-card" size={15} color="#047857" />
        <View style={headerStyles.dropdownMenuTextContainer}>
          <Text style={headerStyles.dropdownMenuItemText}>Order of Payment (OP)</Text>
          <Text style={headerStyles.dropdownMenuItemSubtext}>Official Vector PDF • #{opNum}</Text>
        </View>
        <Icon name="download" size={13} color="#94A3B8" />
      </TouchableOpacity>

      {isPaid && (
        <>
          {orList.length > 1 ? (
            orList.map((token, idx) => {
              const label = token.startsWith('#') ? token : `#${token}`;
              return (
                <TouchableOpacity
                  key={token}
                  style={headerStyles.dropdownMenuItem}
                  onPress={() => {
                    onClose();
                    onDownloadDoc('or', token);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="check-circle" size={15} color="#059669" />
                  <View style={headerStyles.dropdownMenuTextContainer}>
                    <Text style={headerStyles.dropdownMenuItemText}>Official Receipt {label}</Text>
                    <Text style={headerStyles.dropdownMenuItemSubtext}>
                      Accountable Form 51 • Receipt {idx + 1} of {orList.length}
                    </Text>
                  </View>
                  <Icon name="download" size={13} color="#94A3B8" />
                </TouchableOpacity>
              );
            })
          ) : (
            <TouchableOpacity
              style={headerStyles.dropdownMenuItem}
              onPress={() => {
                onClose();
                onDownloadDoc('or');
              }}
              activeOpacity={0.7}
            >
              <Icon name="check-circle" size={15} color="#059669" />
              <View style={headerStyles.dropdownMenuTextContainer}>
                <Text style={headerStyles.dropdownMenuItemText}>Official Receipt (OR)</Text>
                <Text style={headerStyles.dropdownMenuItemSubtext}>
                  Accountable Form 51 • #{orNum !== null ? orNum : ''}
                </Text>
              </View>
              <Icon name="download" size={13} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </>
      )}

      {Platform.OS === 'web' && (
        <>
          <View style={headerStyles.dropdownDivider} />
          <TouchableOpacity
            style={headerStyles.dropdownMenuItem}
            onPress={() => {
              onClose();
              onReloadTemplate();
            }}
            activeOpacity={0.7}
          >
            <Icon name="refresh-cw" size={14} color="#64748B" />
            <View style={headerStyles.dropdownMenuTextContainer}>
              <Text style={headerStyles.dropdownMenuItemText}>Reload Current Template</Text>
              <Text style={headerStyles.dropdownMenuItemSubtext}>Fetch fresh template from server</Text>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

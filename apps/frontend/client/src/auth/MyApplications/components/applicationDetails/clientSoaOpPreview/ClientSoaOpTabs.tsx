import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@edge/ui';
import { ClientSoaOpTabsProps } from './clientSoaOpPreviewTypes';
import { tabsStyles } from './styles/clientSoaOpTabsStyles';

export function ClientSoaOpTabs({
  activeTab,
  onSelectTab,
  soaNum,
  opNum,
  orNum,
  isPaid,
  orList,
  effectiveSelectedOr,
  onSelectOrNumber,
}: ClientSoaOpTabsProps) {
  const orBadgeLabel = orList.length > 1
    ? `${orList.length} ORs Issued`
    : (orList.length > 0 ? orList[0] : (orNum !== null ? orNum : ''));

  return (
    <>
      <View style={tabsStyles.tabBar}>
        <TouchableOpacity
          style={[tabsStyles.tabItem, activeTab === 'soa' && tabsStyles.tabItemActiveSoa]}
          onPress={() => onSelectTab('soa')}
          activeOpacity={0.75}
        >
          <Icon name="file-text" size={15} color={activeTab === 'soa' ? '#0369A1' : '#64748B'} />
          <Text style={[tabsStyles.tabText, activeTab === 'soa' && tabsStyles.tabTextActiveSoa]}>
            Statement of Account (SOA)
          </Text>
          <View style={[tabsStyles.tabBadge, activeTab === 'soa' ? tabsStyles.tabBadgeActiveSoa : tabsStyles.tabBadgeInactive]}>
            <Text style={[tabsStyles.tabBadgeText, activeTab === 'soa' ? tabsStyles.tabBadgeTextActiveSoa : tabsStyles.tabBadgeTextInactive]}>
              {soaNum}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[tabsStyles.tabItem, activeTab === 'op' && tabsStyles.tabItemActiveOp]}
          onPress={() => onSelectTab('op')}
          activeOpacity={0.75}
        >
          <Icon name="credit-card" size={15} color={activeTab === 'op' ? '#047857' : '#64748B'} />
          <Text style={[tabsStyles.tabText, activeTab === 'op' && tabsStyles.tabTextActiveOp]}>
            Order of Payment (OP)
          </Text>
          <View style={[tabsStyles.tabBadge, activeTab === 'op' ? tabsStyles.tabBadgeActiveOp : tabsStyles.tabBadgeInactive]}>
            <Text style={[tabsStyles.tabBadgeText, activeTab === 'op' ? tabsStyles.tabBadgeTextActiveOp : tabsStyles.tabBadgeTextInactive]}>
              {opNum}
            </Text>
          </View>
        </TouchableOpacity>

        {isPaid && (
          <TouchableOpacity
            style={[tabsStyles.tabItem, activeTab === 'or' && tabsStyles.tabItemActiveOr]}
            onPress={() => onSelectTab('or')}
            activeOpacity={0.75}
          >
            <Icon name="check-circle" size={15} color={activeTab === 'or' ? '#059669' : '#64748B'} />
            <Text style={[tabsStyles.tabText, activeTab === 'or' && tabsStyles.tabTextActiveOr]}>
              Official Receipt (OR)
            </Text>
            <View style={[tabsStyles.tabBadge, activeTab === 'or' ? tabsStyles.tabBadgeActiveOr : tabsStyles.tabBadgeInactive]}>
              <Text style={[tabsStyles.tabBadgeText, activeTab === 'or' ? tabsStyles.tabBadgeTextActiveOr : tabsStyles.tabBadgeTextInactive]}>
                {orBadgeLabel}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {activeTab === 'or' && orList.length > 1 && (
        <View style={tabsStyles.multiOrSelectorBar}>
          <View style={tabsStyles.multiOrSelectorHeader}>
            <Icon name="layers" size={14} color="#059669" />
            <Text style={tabsStyles.multiOrSelectorLabel}>
              MULTIPLE RECEIPTS ISSUED ({orList.length} OFFICIAL RECEIPTS):
            </Text>
          </View>
          <View style={tabsStyles.multiOrChipsRow}>
            {orList.map((token, idx) => {
              const isSelected = effectiveSelectedOr === token;
              const label = token.startsWith('#') ? token : `#${token}`;
              return (
                <TouchableOpacity
                  key={token}
                  style={[tabsStyles.multiOrChip, isSelected && tabsStyles.multiOrChipActive]}
                  onPress={() => onSelectOrNumber(token)}
                  activeOpacity={0.8}
                >
                  <Icon name="check-circle" size={13} color={isSelected ? '#059669' : '#64748B'} />
                  <Text style={[tabsStyles.multiOrChipText, isSelected && tabsStyles.multiOrChipTextActive]}>
                    OR {label} {idx === 0 ? '(Part 1)' : `(Part ${idx + 1})`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </>
  );
}

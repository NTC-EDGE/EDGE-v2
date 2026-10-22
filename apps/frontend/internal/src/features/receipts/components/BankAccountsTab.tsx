import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { AgencyBankAccountDto } from '@edge/api';

interface BankAccountsTabProps {
  bankAccounts: AgencyBankAccountDto[];
  isLoading: boolean;
  onOpenAccountModal: () => void;
  onEditAccount: (acc: AgencyBankAccountDto) => void;
}

export function BankAccountsTab({
  bankAccounts,
  isLoading,
  onOpenAccountModal,
  onEditAccount,
}: BankAccountsTabProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Top Banner & Quick Action */}
      <View style={[styles.bannerRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Authorized Government Depositary Banks (AGDB)</Text>
          <Text style={[styles.infoSubtitle, { color: colors.textMuted }]}>
            Treasury depository accounts configured for direct revenue remissions and bank deposit slips.
          </Text>
        </View>

        <TouchableOpacity
          onPress={onOpenAccountModal}
          style={[styles.addAccountBtn, { backgroundColor: colors.brand.primary }]}
        >
          <Lucide name="plus" size={18} color="#fff" />
          <Text style={styles.addAccountBtnText}>Add Bank Account</Text>
        </TouchableOpacity>
      </View>

      {/* Account Cards */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading Bank Accounts...</Text>
        </View>
      ) : bankAccounts.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="credit-card" size={40} color={colors.neutral[400]} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bank Accounts Registered</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>Register Land Bank, DBP, or other AGDB depository accounts.</Text>
          <TouchableOpacity
            onPress={onOpenAccountModal}
            style={[styles.emptyActionBtn, { backgroundColor: colors.brand.primary }]}
          >
            <Text style={styles.emptyActionBtnText}>Register First Bank Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.accountGrid} showsVerticalScrollIndicator={false}>
          {bankAccounts.map((acc) => (
            <View key={acc.id} style={[styles.accountCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.cardHeader, { borderBottomColor: colors.neutral[100] }]}>
                <View style={[styles.bankIconCircle, { backgroundColor: colors.brand.indigoLight }]}>
                  <Lucide name="credit-card" size={20} color={colors.brand.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bankName, { color: colors.text }]}>{acc.bankName}</Text>
                  <Text style={[styles.branchName, { color: colors.textMuted }]}>{acc.branch ?? 'Main Branch'}</Text>
                </View>
                <TouchableOpacity onPress={() => onEditAccount(acc)} style={styles.editBtn}>
                  <Lucide name="edit-2" size={16} color={colors.neutral[700]} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Account Name:</Text>
                  <Text style={[styles.fieldValue, { color: colors.neutral[800] }]}>{acc.accountName}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Account Number:</Text>
                  <Text style={[styles.fieldValue, { fontWeight: '700', fontFamily: 'monospace', color: colors.neutral[800] }]}>
                    {acc.accountNumber}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Fund Cluster:</Text>
                  <Text style={[styles.fieldValue, { color: colors.neutral[800] }]}>
                    {acc.fundCluster} (Regular Agency Fund)
                  </Text>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: colors.neutral[100] }]}>
                <View style={[styles.statusBadge, acc.isActive ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, acc.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                    {acc.isActive ? 'ACTIVE FOR REMITTANCE' : 'INACTIVE'}
                  </Text>
                </View>
                {acc.remarks && (
                  <Text style={[styles.remarksText, { color: colors.neutral[400] }]} numberOfLines={1}>
                    {acc.remarks}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  infoBox: {
    flex: 1,
    minWidth: 260,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  infoSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addAccountBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 8,
  },
  emptyBox: {
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  emptyActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 24,
  },
  accountCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
  },
  bankIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 13,
    fontWeight: '800',
  },
  branchName: {
    fontSize: 11,
  },
  editBtn: {
    padding: 6,
  },
  cardBody: {
    gap: 6,
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 11,
  },
  fieldValue: {
    fontSize: 11,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#15803D',
  },
  statusTextInactive: {
    color: '#64748B',
  },
  remarksText: {
    fontSize: 11,
    maxWidth: 160,
  },
});

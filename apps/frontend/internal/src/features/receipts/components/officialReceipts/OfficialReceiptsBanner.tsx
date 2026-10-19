import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { OfficialReceiptDto, NextAvailableOrDto } from '@edge/api';
import { styles } from './officialReceiptsStyles';

interface OfficialReceiptsBannerProps {
  receipts: OfficialReceiptDto[];
  nextOr?: NextAvailableOrDto;
  canIssueReceipt: boolean;
  onOpenIssueModal: () => void;
}

const isReceiptIssued = (status: unknown): boolean => status === 'Issued' || status === 0;
const isReceiptDeposited = (status: unknown): boolean => status === 'Deposited' || status === 1;
const isReceiptCancelled = (status: unknown): boolean => status === 'Cancelled' || status === 2;

export function OfficialReceiptsBanner({
  receipts,
  nextOr,
  canIssueReceipt,
  onOpenIssueModal,
}: OfficialReceiptsBannerProps) {
  const { colors } = useTheme();

  const totalCollections = receipts
    .filter((r) => !isReceiptCancelled(r.status))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const issuedCount = receipts.filter((r) => isReceiptIssued(r.status)).length;
  const depositedCount = receipts.filter((r) => isReceiptDeposited(r.status)).length;
  const cancelledCount = receipts.filter((r) => isReceiptCancelled(r.status)).length;

  return (
    <View style={styles.bannerRow}>
      <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL REVENUE COLLECTED</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          ₱{(totalCollections ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.statBadges}>
          <Text style={[styles.statSubText, { color: colors.neutral[600] }]}>{receipts.length} total receipts</Text>
          <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
          <Text style={[styles.statSubText, { color: '#D97706' }]}>{issuedCount} on-hand</Text>
          <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
          <Text style={[styles.statSubText, { color: '#059669' }]}>{depositedCount} deposited</Text>
          {cancelledCount > 0 && (
            <>
              <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
              <Text style={[styles.statSubText, { color: '#DC2626' }]}>{cancelledCount} void</Text>
            </>
          )}
        </View>
      </View>

      {/* Active Booklet Series Card */}
      {nextOr && nextOr.hasActiveBooklet ? (
        <View style={[styles.bookletStatusCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
          <View style={styles.bookletCardHeader}>
            <Lucide name="layers" size={16} color={colors.brand.primary} />
            <Text style={[styles.bookletCardTitle, { color: colors.brand.primary }]}>Active Booklet Series</Text>
            {nextOr.isShared && (
              <View style={[styles.sharedBadge, { backgroundColor: colors.brand.indigoLight }]}>
                <Text style={[styles.sharedBadgeText, { color: colors.brand.primary }]}>
                  Shared ({nextOr.assignedUserNames?.length ?? 2})
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bookletNextOr, { color: colors.text }]}>
            Next OR: <Text style={{ color: colors.brand.primary, fontWeight: '800' }}>#{nextOr.formattedOrNumber}</Text>
          </Text>
          <Text style={[styles.bookletMeta, { color: colors.neutral[600] }]}>
            Booklet #{nextOr.bookletNumber} • Series: {nextOr.formattedStartNumber}–{nextOr.formattedEndNumber} ({nextOr.remainingCount} forms left)
          </Text>
        </View>
      ) : (
        <View style={[styles.bookletStatusCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <View style={styles.bookletCardHeader}>
            <Lucide name="alert-triangle" size={16} color={colors.semantic.error} />
            <Text style={[styles.bookletCardTitle, { color: colors.semantic.error }]}>No Active Booklet</Text>
          </View>
          <Text style={[styles.bookletMeta, { color: colors.neutral[600], marginTop: 4 }]}>
            Please register an Accountable Form 51 booklet before collecting payments.
          </Text>
        </View>
      )}

      {canIssueReceipt && (
        <TouchableOpacity
          onPress={onOpenIssueModal}
          style={[styles.issueOrBtn, { backgroundColor: colors.brand.primary }]}
        >
          <View style={styles.issueIconCircle}>
            <Lucide name="plus" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.issueBtnTitle}>Issue Walk-in OR</Text>
            <Text style={styles.issueBtnSubtitle}>Direct Cashier Entry</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

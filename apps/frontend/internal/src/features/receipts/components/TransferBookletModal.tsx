import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { OrBookletDto, receiptService, useTenantMembers } from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';

interface TransferBookletModalProps {
  visible: boolean;
  tenantId: string;
  booklet: OrBookletDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferBookletModal({
  visible,
  tenantId,
  booklet,
  onClose,
  onSuccess,
}: TransferBookletModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthContext();
  const { members, isLoading: isLoadingMembers } = useTenantMembers(tenantId);

  const [targetUserId, setTargetUserId] = useState<string>('');
  const [additionalUserIds, setAdditionalUserIds] = useState<string[]>([]);
  const [transferReason, setTransferReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCashierMember = (m: (typeof members)[0]) => {
    if (m.isDeleted) return false;

    // 1. Primary RBAC check: Does the user's role have permission to issue receipts or collect fees?
    if (Array.isArray(m.permissions) && m.permissions.length > 0) {
      if (
        m.permissions.includes('receipts.issue') ||
        m.permissions.includes('billing.collect') ||
        m.permissions.includes('receipts.bundle_entry')
      ) {
        return true;
      }
    }

    // 2. Secondary check: Role key / name matching
    const roleKey = (m.roleKey || '').toLowerCase();
    const roleName = (m.roleName || '').toLowerCase();
    const position = (m.position || '').toLowerCase();
    const jobTitle = (m.jobTitle || '').toLowerCase();
    const designation = (m.designation || '').toLowerCase();

    // Explicitly reject non-cashier roles (Accountant, Evaluator, Legal, Records)
    if (
      roleKey.includes('accountant') ||
      roleName.includes('accountant') ||
      position.includes('accountant') ||
      jobTitle.includes('accountant') ||
      roleKey.includes('evaluat') ||
      roleName.includes('evaluat') ||
      roleKey.includes('legal') ||
      roleName.includes('legal') ||
      roleKey.includes('record') ||
      roleName.includes('record')
    ) {
      return false;
    }

    return (
      roleKey === 'cashier' ||
      roleKey.includes('cashier') ||
      roleName.includes('cashier') ||
      position.includes('cashier') ||
      jobTitle.includes('cashier') ||
      designation.includes('cashier') ||
      roleKey.includes('collect') ||
      roleName.includes('collect')
    );
  };

  const availableCashiers = members.filter(isCashierMember);

  useEffect(() => {
    if (visible && booklet) {
      // Default primary cashier to existing assignedUserId (if cashier) or first available cashier
      const validAssignedId = booklet.assignedUserId && availableCashiers.some((c) => c.userId === booklet.assignedUserId)
        ? booklet.assignedUserId
        : (availableCashiers.length > 0 ? availableCashiers[0].userId : '');
      setTargetUserId(validAssignedId);

      const coCashierIds = booklet.assignedUserIds
        ? booklet.assignedUserIds.filter((id) => id !== validAssignedId && availableCashiers.some((c) => c.userId === id))
        : (booklet.assignedCashiers
            ? booklet.assignedCashiers
                .filter((c) => !c.isPrimary && availableCashiers.some((ac) => ac.userId === c.userId))
                .map((c) => c.userId)
            : []);
      setAdditionalUserIds(coCashierIds);
      setTransferReason('');
      setErrorMsg(null);
    }
  }, [visible, booklet, members]);

  if (!booklet) return null;

  const currentAssigneeName = booklet.assignedUserNames && booklet.assignedUserNames.length > 0
    ? booklet.assignedUserNames.join(', ')
    : booklet.assignedUserName || 'All Cashiers (Unassigned)';
  const targetMember = availableCashiers.find((m) => m.userId === targetUserId);

  const toggleAdditionalUser = (userId: string) => {
    if (userId === targetUserId) return;
    setAdditionalUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!targetUserId) {
      setErrorMsg('Please select a primary cashier / custodian.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const [res, err] = await receiptService.transferOrBooklet({
      id: booklet.id,
      tenantId: booklet.tenantId,
      newAssignedUserId: targetUserId,
      additionalUserIds: additionalUserIds,
      transferReason: transferReason.trim().length > 0 ? transferReason.trim() : null,
    });

    setIsSubmitting(false);

    if (err !== null) {
      setErrorMsg(err);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="repeat" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Add / Transfer Booklet Custodians</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Assign primary custodian, add co-cashiers for booklet sharing, or transfer custody
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Lucide name="x" size={20} color={colors.neutral[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg !== null && (
              <View style={styles.errorBox}>
                <Lucide name="alert-circle" size={16} color={colors.semantic.error} />
                <Text style={[styles.errorText, { color: colors.semantic.error }]}>{errorMsg}</Text>
              </View>
            )}

            {/* Booklet Info summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.neutral[50], borderColor: colors.neutral[200] }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Booklet Number:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{booklet.bookletNumber}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Serial Range:</Text>
                <Text style={[styles.summaryValue, { color: colors.text, fontFamily: 'monospace' }]}>
                  {booklet.formattedStartNumber} → {booklet.formattedEndNumber}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Issued / Remaining:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {booklet.issuedCount} issued / {booklet.remainingCount} remaining
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Current Custodians:</Text>
                <Text style={[styles.summaryValue, { color: colors.brand.primary, fontWeight: '700' }]}>
                  {currentAssigneeName}
                </Text>
              </View>
            </View>

            {/* Primary Custodian Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Primary Custodian / Cashier *</Text>
              {isLoadingMembers ? (
                <ActivityIndicator size="small" color={colors.brand.primary} />
              ) : availableCashiers.length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.textMuted }}>No cashier accounts found in this regional office.</Text>
              ) : (
                <View style={styles.memberList}>
                  {availableCashiers.map((m) => {
                    const isSelected = targetUserId === m.userId;
                    const isCurrent = m.userId === booklet.assignedUserId;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        activeOpacity={0.7}
                        onPress={() => setTargetUserId(m.userId)}
                        style={[
                          styles.memberItem,
                          { borderColor: colors.neutral[300], backgroundColor: '#fff' },
                          isSelected && { borderColor: colors.brand.primary, backgroundColor: colors.brand.indigoLight },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                          <View
                            style={[
                              styles.radioCircle,
                              { borderColor: isSelected ? colors.brand.primary : colors.neutral[400] },
                              isSelected && { backgroundColor: colors.brand.primary },
                            ]}
                          />
                          <View>
                            <Text style={[styles.memberName, { color: colors.text }, isSelected && { fontWeight: '700', color: colors.brand.primary }]}>
                              {m.userFirstName} {m.userLastName} {m.userId === user?.id ? '(You)' : ''}
                            </Text>
                            <Text style={[styles.memberRole, { color: colors.textMuted }]}>
                              {m.roleName || m.position || 'Cashiering Officer'}{m.fieldOfficeName ? ` • ${m.fieldOfficeName}` : ''}
                            </Text>
                          </View>
                        </View>
                        {isCurrent && (
                          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>Primary Holder</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Additional Co-Assigned Cashiers (Multi-Cashier Checkbox Selection) */}
            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.label, { color: colors.neutral[700], marginBottom: 0 }]}>
                  Co-Assigned Cashiers (Checkboxes)
                </Text>
                {additionalUserIds.length > 0 && (
                  <Text style={{ fontSize: 11, color: colors.brand.primary, fontWeight: '700' }}>
                    +{additionalUserIds.length} shared
                  </Text>
                )}
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8 }}>
                Check all additional Cashiers authorized to draw Official Receipts concurrently from this booklet:
              </Text>
              <View style={styles.checkboxList}>
                {availableCashiers
                  .filter((m) => m.userId !== targetUserId)
                  .map((m) => {
                    const isCoSelected = additionalUserIds.includes(m.userId);
                    return (
                      <TouchableOpacity
                        key={m.id}
                        activeOpacity={0.7}
                        onPress={() => toggleAdditionalUser(m.userId)}
                        style={[
                          styles.checkboxItem,
                          { borderColor: colors.neutral[300], backgroundColor: '#fff' },
                          isCoSelected && { borderColor: colors.brand.primary, backgroundColor: colors.brand.indigoLight },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                          <View
                            style={[
                              styles.checkboxSquare,
                              { borderColor: isCoSelected ? colors.brand.primary : colors.neutral[400] },
                              isCoSelected && { backgroundColor: colors.brand.primary },
                            ]}
                          >
                            {isCoSelected && <Lucide name="check" size={12} color="#fff" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.memberName,
                                { color: colors.text },
                                isCoSelected && { fontWeight: '700', color: colors.brand.primary },
                              ]}
                            >
                              {m.userFirstName} {m.userLastName} {m.userId === user?.id ? '(You)' : ''}
                            </Text>
                            <Text style={[styles.memberRole, { color: colors.textMuted }]}>
                              {m.roleName || m.position || 'Cashiering Officer'}{m.fieldOfficeName ? ` • ${m.fieldOfficeName}` : ''}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </View>

            {/* Transfer Reason / Notes */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Assignment / Handover Remarks (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top', borderColor: colors.neutral[300], color: colors.text }]}
                multiline
                placeholder="e.g. Cashier shift handover / Station sharing / Counter rotation"
                placeholderTextColor={colors.neutral[400]}
                value={transferReason}
                onChangeText={setTransferReason}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.neutral[100] }]}>
              <Text style={[styles.cancelBtnText, { color: colors.neutral[700] }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !targetUserId}
              style={[
                styles.submitBtn,
                { backgroundColor: colors.brand.primary },
                (isSubmitting || !targetUserId) && { opacity: 0.6 },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Lucide name="save" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>Save Custody & Cashiers</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  memberList: {
    gap: 6,
    maxHeight: 180,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 11,
  },
  checkboxList: {
    gap: 6,
    maxHeight: 180,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

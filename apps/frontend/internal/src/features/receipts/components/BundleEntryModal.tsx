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
import { receiptService, useTenantMembers } from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';

interface BundleEntryModalProps {
  visible: boolean;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BundleEntryModal({ visible, tenantId, onClose, onSuccess }: BundleEntryModalProps) {
  const { colors } = useTheme();
  const { user } = useAuthContext();
  const { members, isLoading: isLoadingMembers } = useTenantMembers(tenantId);

  const [bookletNumber, setBookletNumber] = useState('');
  const [prefix, setPrefix] = useState('NTC-');
  const [startNumber, setStartNumber] = useState('');
  const [totalCount, setTotalCount] = useState('50');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize selectedUserIds with current user when opening
  useEffect(() => {
    if (visible && user?.id) {
      setSelectedUserIds([user.id]);
    }
  }, [visible, user?.id]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        // Don't allow empty if at least 1 is required, or allow toggle
        const next = prev.filter((id) => id !== userId);
        return next;
      } else {
        return [...prev, userId];
      }
    });
  };

  const parsedStart = parseInt(startNumber, 10);
  const parsedCount = parseInt(totalCount, 10) || 50;
  const calculatedEnd = !isNaN(parsedStart) && parsedStart > 0 ? parsedStart + parsedCount - 1 : null;

  const handleSubmit = async () => {
    if (!bookletNumber.trim()) {
      setErrorMsg('Booklet number / ID is required.');
      return;
    }
    if (isNaN(parsedStart) || parsedStart <= 0) {
      setErrorMsg('Start number must be a valid positive number.');
      return;
    }

    const effectiveUserIds = selectedUserIds.length > 0 ? selectedUserIds : (user?.id ? [user.id] : []);

    setIsSubmitting(true);
    setErrorMsg(null);

    const [res, err] = await receiptService.createOrBooklet({
      tenantId,
      bookletNumber: bookletNumber.trim(),
      prefix: prefix.trim().length > 0 ? prefix.trim() : null,
      startNumber: parsedStart,
      endNumber: calculatedEnd,
      totalCount: parsedCount,
      assignedUserId: effectiveUserIds[0] ?? null,
      assignedUserIds: effectiveUserIds,
      remarks: remarks.trim().length > 0 ? remarks.trim() : null,
    });

    setIsSubmitting(false);

    if (err !== null) {
      setErrorMsg(err);
    } else {
      setBookletNumber('');
      setStartNumber('');
      setRemarks('');
      onSuccess();
      onClose();
    }
  };

  const selectedMemberNames = members
    .filter((m) => selectedUserIds.includes(m.userId))
    .map((m) => `${m.userFirstName} ${m.userLastName}${m.userId === user?.id ? ' (You)' : ''}`);

  const assignedDisplay = selectedMemberNames.length > 0
    ? selectedMemberNames.join(', ')
    : user?.name
    ? `${user.name} (You - Current User)`
    : 'All Cashiers (Unassigned Pool)';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="book" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Register Accountable Form 51 (OR Booklet)</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter booklet series bundle for government receipt issuance</Text>
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

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Booklet Number / Serial Tag *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. BKT-2026-001 or Series #12"
                placeholderTextColor={colors.neutral[400]}
                value={bookletNumber}
                onChangeText={setBookletNumber}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Prefix (Optional)</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  placeholder="e.g. NTC-"
                  placeholderTextColor={colors.neutral[400]}
                  value={prefix}
                  onChangeText={setPrefix}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Total Pieces (Bundle Count) *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  keyboardType="numeric"
                  placeholder="50"
                  placeholderTextColor={colors.neutral[400]}
                  value={totalCount}
                  onChangeText={setTotalCount}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Starting Serial Number *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  keyboardType="numeric"
                  placeholder="e.g. 1000001"
                  placeholderTextColor={colors.neutral[400]}
                  value={startNumber}
                  onChangeText={setStartNumber}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Ending Serial Number</Text>
                <TextInput
                  style={[styles.input, styles.readOnlyInput, { borderColor: colors.neutral[300] }]}
                  editable={false}
                  value={calculatedEnd !== null ? calculatedEnd.toString().padStart(7, '0') : '-'}
                />
              </View>
            </View>

            {calculatedEnd !== null && (
              <View style={styles.previewBox}>
                <Lucide name="info" size={16} color={colors.semantic.info} />
                <Text style={[styles.previewText, { color: colors.semantic.infoText }]}>
                  Series Range:{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {prefix}
                    {startNumber.padStart(7, '0')}
                  </Text>{' '}
                  to{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {prefix}
                    {calculatedEnd.toString().padStart(7, '0')}
                  </Text>{' '}
                  ({parsedCount} receipts)
                </Text>
              </View>
            )}

            {/* Assigned Custodian / Cashier (Multi-Cashier Sharing) */}
            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.label, { color: colors.neutral[700], marginBottom: 0 }]}>Assigned Cashier(s) *</Text>
                <Text style={{ fontSize: 11, color: colors.brand.primary, fontWeight: '600' }}>
                  {selectedUserIds.length > 1 ? `Shared with ${selectedUserIds.length} Cashiers` : 'Single Assignee'}
                </Text>
              </View>
              <View style={[styles.assignedBox, { borderColor: colors.neutral[300], backgroundColor: colors.neutral[50] }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Lucide name="users" size={16} color={colors.brand.primary} />
                  <Text style={[styles.assignedText, { color: colors.text }]}>
                    {assignedDisplay}
                  </Text>
                </View>
                {selectedUserIds.length > 1 && (
                  <View style={[styles.autoBadge, { backgroundColor: colors.brand.indigoLight }]}>
                    <Text style={[styles.autoBadgeText, { color: colors.brand.primary }]}>Multi-Cashier Shared</Text>
                  </View>
                )}
              </View>
              {members.length > 0 && (
                <View style={styles.memberSelector}>
                  <Text style={[styles.selectorHelp, { color: colors.textMuted }]}>
                    Click cashiers to assign/unassign (multi-cashier sharing):
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberChips}>
                    {members.map((m) => {
                      const isSelected = selectedUserIds.includes(m.userId);
                      return (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => toggleUserSelection(m.userId)}
                          style={[
                            styles.chip,
                            { borderColor: colors.neutral[300], backgroundColor: '#fff' },
                            isSelected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                          ]}
                        >
                          {isSelected && <Lucide name="check" size={12} color="#fff" style={{ marginRight: 4 }} />}
                          <Text
                            style={[
                              styles.chipText,
                              { color: colors.neutral[700] },
                              isSelected && { color: '#fff', fontWeight: '700' },
                            ]}
                          >
                            {m.userFirstName} {m.userLastName} {m.userId === user?.id ? '(You)' : ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Remarks / Receiving Custodian</Text>
              <TextInput
                style={[styles.input, { height: 64, textAlignVertical: 'top', borderColor: colors.neutral[300], color: colors.text }]}
                multiline
                placeholder="Received from National Printing Office / General Services"
                placeholderTextColor={colors.neutral[400]}
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.neutral[100] }]}>
              <Text style={[styles.cancelBtnText, { color: colors.neutral[700] }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitBtn, { backgroundColor: colors.brand.primary }, isSubmitting && { opacity: 0.7 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Lucide name="check" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>Register Booklet</Text>
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
    maxWidth: 560,
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
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 12,
    flex: 1,
  },
  assignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  assignedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  autoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  autoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberSelector: {
    marginTop: 8,
  },
  selectorHelp: {
    fontSize: 11,
    marginBottom: 6,
  },
  memberChips: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
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

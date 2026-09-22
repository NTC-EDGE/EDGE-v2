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
import { OrBookletDto, receiptService } from '@edge/api';

interface EditBookletModalProps {
  visible: boolean;
  booklet: OrBookletDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBookletModal({ visible, booklet, onClose, onSuccess }: EditBookletModalProps) {
  const { colors } = useTheme();

  const [bookletNumber, setBookletNumber] = useState('');
  const [prefix, setPrefix] = useState('');
  const [startNumber, setStartNumber] = useState('');
  const [totalCount, setTotalCount] = useState('50');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (booklet) {
      setBookletNumber(booklet.bookletNumber || '');
      setPrefix(booklet.prefix || '');
      setStartNumber(booklet.startNumber ? String(booklet.startNumber) : '');
      setTotalCount(booklet.totalCount ? String(booklet.totalCount) : '50');
      setRemarks(booklet.remarks || '');
      setErrorMsg(null);
    }
  }, [booklet]);

  if (!booklet) return null;

  const parsedStart = parseInt(startNumber, 10);
  const parsedCount = parseInt(totalCount, 10) || 50;
  const calculatedEnd = !isNaN(parsedStart) && parsedStart > 0 ? parsedStart + parsedCount - 1 : null;
  const isEditable = booklet.issuedCount === 0;

  const handleSubmit = async () => {
    if (!isEditable) {
      setErrorMsg('Cannot edit booklet series because Official Receipts have already been issued.');
      return;
    }
    if (!bookletNumber.trim()) {
      setErrorMsg('Booklet number / ID is required.');
      return;
    }
    if (isNaN(parsedStart) || parsedStart <= 0) {
      setErrorMsg('Start number must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const [res, err] = await receiptService.updateOrBooklet({
      id: booklet.id,
      tenantId: booklet.tenantId,
      bookletNumber: bookletNumber.trim(),
      prefix: prefix.trim().length > 0 ? prefix.trim() : null,
      startNumber: parsedStart,
      endNumber: calculatedEnd,
      totalCount: parsedCount,
      remarks: remarks.trim().length > 0 ? remarks.trim() : null,
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
                <Lucide name="edit-3" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Edit OR Booklet Series</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {isEditable ? 'Modify registered booklet series before issuance' : 'Booklet series is locked (transactions exist)'}
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

            {!isEditable && (
              <View style={[styles.warningBox, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
                <Lucide name="alert-triangle" size={16} color="#D97706" />
                <Text style={{ fontSize: 12, color: '#B45309', flex: 1 }}>
                  This booklet has already issued {booklet.issuedCount} receipt(s). Its serial sequence cannot be modified.
                </Text>
              </View>
            )}

            {isEditable && (
              <View style={[styles.infoNotice, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="check-circle" size={16} color={colors.brand.primary} />
                <Text style={[styles.infoNoticeText, { color: colors.brand.primary }]}>
                  No receipts have been issued from this booklet yet. You can freely adjust the booklet ID, prefix, count, or serial sequence.
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Booklet Number / Serial Tag *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }, !isEditable && styles.readOnlyInput]}
                editable={isEditable}
                value={bookletNumber}
                onChangeText={setBookletNumber}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Prefix (Optional)</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }, !isEditable && styles.readOnlyInput]}
                  editable={isEditable}
                  placeholder="e.g. NTC-"
                  value={prefix}
                  onChangeText={setPrefix}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Total Pieces (Bundle Count) *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }, !isEditable && styles.readOnlyInput]}
                  editable={isEditable}
                  keyboardType="numeric"
                  value={totalCount}
                  onChangeText={setTotalCount}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Starting Serial Number *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }, !isEditable && styles.readOnlyInput]}
                  editable={isEditable}
                  keyboardType="numeric"
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

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Remarks / Receiving Notes</Text>
              <TextInput
                style={[styles.input, { height: 64, textAlignVertical: 'top', borderColor: colors.neutral[300], color: colors.text }]}
                multiline
                placeholder="Receiving notes or series remarks"
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
            {isEditable && (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[styles.submitBtn, { backgroundColor: colors.brand.primary }, isSubmitting && { opacity: 0.7 }]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Lucide name="save" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  infoNoticeText: {
    fontSize: 12,
    fontWeight: '600',
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

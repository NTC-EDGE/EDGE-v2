import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
  toast,
} from '@edge/ui';
import { applicationService, IssueApplicationRequest } from '@edge/api';
import { ApplicationData } from '../../../../types/application';

interface IssueDocumentModalProps {
  visible: boolean;
  app: ApplicationData;
  currentOfficerName: string;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export function IssueDocumentModal({
  visible,
  app,
  currentOfficerName,
  onClose,
  onSuccess,
}: IssueDocumentModalProps) {
  const { colors, isDark } = useTheme();

  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [documentType, setDocumentType] = useState<string>('Certificate');
  const [formNumber, setFormNumber] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [callSign, setCallSign] = useState<string>('');
  const [stationClass, setStationClass] = useState<string>('');
  const [frequencyBand, setFrequencyBand] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? ''
  );
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Auto-loaded metadata
  const [officialReceiptNumber, setOfficialReceiptNumber] = useState<string>('');
  const [originalEvaluatorName, setOriginalEvaluatorName] = useState<string>('');
  const [isAlternateIssuer, setIsAlternateIssuer] = useState<boolean>(false);

  const isLicenseCategory =
    app.category === 'Licenses' ||
    (typeof app.serviceCategory === 'string' &&
      app.serviceCategory.toLowerCase().includes('license'));

  // Load recommended sequential control numbers
  useEffect(() => {
    if (!visible || !app.id) return;

    let isMounted = true;
    setIsLoadingDefaults(true);

    const loadRecommendations = async () => {
      const [res, err] = await applicationService.getNextDocumentNumbers(app.id);
      if (!isMounted) return;
      setIsLoadingDefaults(false);

      if (err === null && res?.data) {
        const d = res.data;
        setFormNumber(d.recommendedFormNumber ?? '');
        setLicenseNumber(d.recommendedLicenseNumber ?? '');
        setOfficialReceiptNumber(d.officialReceiptNumber ?? app.payment?.orNumber ?? '');
        setOriginalEvaluatorName(d.originalEvaluatorName ?? app.evaluatingOfficer ?? '');

        // Set default expiry date (e.g. 3 years for licenses, 1 year for certificates)
        const issue = new Date();
        const expiry = new Date();
        if (isLicenseCategory) {
          expiry.setFullYear(issue.getFullYear() + 3);
        } else {
          expiry.setFullYear(issue.getFullYear() + 1);
        }
        setExpiryDate(expiry.toISOString().split('T')[0] ?? '');

        // Detect alternate issuer status
        const orig = (d.originalEvaluatorName ?? app.evaluatingOfficer ?? '').trim().toLowerCase();
        const curr = currentOfficerName.trim().toLowerCase();
        if (orig.length > 0 && curr.length > 0 && orig !== curr) {
          setIsAlternateIssuer(true);
        } else {
          setIsAlternateIssuer(false);
        }
      } else {
        // Fallback default format
        const year = new Date().getFullYear();
        const officeCode = app.office ?? 'R07';
        setFormNumber(`NTC-${officeCode}-${year}-FORM-1001`);
        if (isLicenseCategory) {
          setLicenseNumber(`NTC-${officeCode}-${year}-LIC-1001`);
        }
        setOfficialReceiptNumber(app.payment?.orNumber ?? '');
      }
    };

    void loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [visible, app.id, app.office, app.payment?.orNumber, app.evaluatingOfficer, isLicenseCategory, currentOfficerName]);

  const canSubmit = formNumber.trim().length > 0 && !isSubmitting && !isLoadingDefaults;

  const handleConfirm = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    const payload: IssueApplicationRequest = {
      formNumber: formNumber.trim(),
      documentType: documentType.trim() || 'Certificate',
      licenseNumber: licenseNumber.trim().length > 0 ? licenseNumber.trim() : undefined,
      callSign: callSign.trim().length > 0 ? callSign.trim().toUpperCase() : undefined,
      stationClass: stationClass.trim().length > 0 ? stationClass.trim() : undefined,
      frequencyBand: frequencyBand.trim().length > 0 ? frequencyBand.trim() : undefined,
      issueDate: new Date(issueDate || Date.now()).toISOString(),
      expiryDate: expiryDate.trim().length > 0 ? new Date(expiryDate).toISOString() : undefined,
      remarks: remarks.trim().length > 0 ? remarks.trim() : undefined,
    };

    const [, err] = await applicationService.issueApplication(app.id, payload);
    setIsSubmitting(false);

    if (err !== null) {
      const errMsg =
        typeof err === 'object' && err !== null && Reflect.has(err, 'message')
          ? String(Reflect.get(err, 'message'))
          : 'Failed to issue document.';
      toast.error(errMsg);
      return;
    }

    toast.success('Statutory document and license issued successfully.');
    await onSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: isDark ? '#064E3B' : COLORS.semantic.successBg },
              ]}
            >
              <Lucide
                name="check-circle"
                size={26}
                color={isDark ? '#34D399' : COLORS.semantic.success}
              />
            </View>
            <View style={styles.headerText}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? colors.neutral[100] : COLORS.neutral[900] },
                ]}
              >
                Issue Statutory Document & License
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? colors.neutral[400] : COLORS.neutral[500] },
                ]}
              >
                Sign off and finalize issuance for{' '}
                <Text
                  style={[
                    styles.highlightName,
                    { color: isDark ? colors.neutral[200] : COLORS.neutral[800] },
                  ]}
                >
                  {app.applicant}
                </Text>
              </Text>
            </View>
          </View>

          {/* Alternate Evaluator Disclaimer Banner */}
          {isAlternateIssuer && (
            <View
              style={[
                styles.alternateBanner,
                {
                  backgroundColor: isDark ? '#422006' : '#FEF3C7',
                  borderColor: isDark ? '#B45309' : '#F59E0B',
                },
              ]}
            >
              <Lucide name="alert-triangle" size={16} color={isDark ? '#FBBF24' : '#D97706'} />
              <Text
                style={[
                  styles.alternateBannerText,
                  { color: isDark ? '#FEF3C7' : '#92400E' },
                ]}
              >
                You are issuing as an <Text style={{ fontWeight: '700' }}>Alternate Issuing Officer</Text> on behalf of{' '}
                <Text style={{ fontWeight: '700' }}>{originalEvaluatorName || 'Primary Evaluator'}</Text>.
                Both officers will be logged in the permanent statutory audit trail.
              </Text>
            </View>
          )}

          {/* Form Scroll Content */}
          {isLoadingDefaults ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand[600]} />
              <Text
                style={[
                  styles.loadingText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Generating sequential form & license numbers...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
              <View style={styles.fields}>
                {/* Official Receipt Cross-Reference */}
                {officialReceiptNumber.length > 0 && (
                  <View
                    style={[
                      styles.receiptBadge,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      },
                    ]}
                  >
                    <Lucide name="file-text" size={14} color={isDark ? colors.brand[400] : COLORS.brand[700]} />
                    <Text
                      style={[
                        styles.receiptBadgeText,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      Payment Verified: <Text style={{ fontWeight: '700' }}>OR #{officialReceiptNumber}</Text>
                    </Text>
                  </View>
                )}

                {/* Document Type & Form Number */}
                <View style={styles.row}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                      ]}
                    >
                      Document Type <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                          borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                          color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                        },
                      ]}
                      value={documentType}
                      onChangeText={setDocumentType}
                      placeholder="e.g. Radio Station License"
                      placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1.2 }]}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                      ]}
                    >
                      Form Control Number <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.monoInput,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                          borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                          color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                        },
                      ]}
                      value={formNumber}
                      onChangeText={setFormNumber}
                      placeholder="NTC-R07-2026-XXXX"
                      placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* License Number & Call Sign (if license or permit) */}
                <View style={styles.row}>
                  <View style={[styles.fieldGroup, { flex: 1.2 }]}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                      ]}
                    >
                      License / Permit Number
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.monoInput,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                          borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                          color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                        },
                      ]}
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                      placeholder="e.g. NTC-R07-2026-LIC-0012"
                      placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 0.8 }]}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                      ]}
                    >
                      Call Sign
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.monoInput,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                          borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                          color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                        },
                      ]}
                      value={callSign}
                      onChangeText={setCallSign}
                      placeholder="e.g. DWXX"
                      placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* Station Class & Frequency Band */}
                {isLicenseCategory && (
                  <View style={styles.row}>
                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                      <Text
                        style={[
                          styles.label,
                          { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                        ]}
                      >
                        Station Class
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                            borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                            color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                          },
                        ]}
                        value={stationClass}
                        onChangeText={setStationClass}
                        placeholder="e.g. Fixed (FX) / Mobile (MO)"
                        placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                      />
                    </View>

                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                      <Text
                        style={[
                          styles.label,
                          { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                        ]}
                      >
                        Frequency / Band
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                            borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                            color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                          },
                        ]}
                        value={frequencyBand}
                        onChangeText={setFrequencyBand}
                        placeholder="e.g. 144 - 146 MHz"
                        placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                      />
                    </View>
                  </View>
                )}

                {/* Dates: Issue Date & Expiry Date */}
                <View style={styles.row}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                      ]}
                    >
                      Issue Date <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                          borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                          color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                        },
                      ]}
                      value={issueDate}
                      onChangeText={setIssueDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                      ]}
                    >
                      Validity Expiration Date
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                          borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                          color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                        },
                      ]}
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                    />
                  </View>
                </View>

                {/* Remarks */}
                <View style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                    ]}
                  >
                    Issuance Remarks / Endorsement Notes
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
                        borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
                        color: isDark ? colors.neutral[100] : COLORS.neutral[900],
                      },
                    ]}
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Optional sign-off remarks or condition specifications..."
                    placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </ScrollView>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.cancelBtn,
                { borderColor: isDark ? colors.neutral[600] : COLORS.neutral[300] },
              ]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.cancelText,
                  { color: isDark ? colors.neutral[300] : COLORS.neutral[700] },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmBtn,
                !canSubmit && styles.confirmBtnDisabled,
                {
                  backgroundColor: canSubmit
                    ? isDark
                      ? '#166534'
                      : '#15803D'
                    : isDark
                      ? colors.neutral[700]
                      : COLORS.neutral[300],
                },
              ]}
              onPress={() => void handleConfirm()}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.neutral.white} />
              ) : (
                <>
                  <Lucide name="check-circle" size={16} color={COLORS.neutral.white} />
                  <Text style={styles.confirmText}>Sign & Issue Document</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[20],
  },
  container: {
    borderRadius: RADIUS.dialog,
    padding: SPACING[24],
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[16],
    marginBottom: SPACING[16],
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 18,
  },
  highlightName: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  alternateBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[8],
    padding: SPACING[10],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    marginBottom: SPACING[12],
  },
  alternateBannerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    paddingVertical: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[12],
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  scrollArea: {
    maxHeight: 380,
    marginBottom: SPACING[16],
  },
  fields: {
    gap: SPACING[12],
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  receiptBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  fieldGroup: {
    gap: SPACING[6],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  required: {
    color: COLORS.semantic.error,
  },
  input: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  monoInput: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontWeight: '600',
  },
  textArea: {
    minHeight: 52,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[12],
    marginTop: SPACING[8],
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[8],
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});

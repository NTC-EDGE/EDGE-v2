import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  COLORS,
  useTheme,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  Button,
  Icon as Lucide,
} from '@edge/ui';
import {
  scheduleService,
  ScheduleItemDto,
  ExamAdmissionVerificationDto,
} from '@edge/api';

interface ExamAdmissionScannerModalProps {
  visible: boolean;
  schedule?: ScheduleItemDto | null;
  tenantId?: string;
  onClose: () => void;
  onAdmitted?: (examinee: ExamAdmissionVerificationDto) => void;
}

type ScannerTabMode = 'scanner' | 'roster';

function isObjectRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

export function ExamAdmissionScannerModal({
  visible,
  schedule,
  tenantId,
  onClose,
  onAdmitted,
}: ExamAdmissionScannerModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;

  const [activeTab, setActiveTab] = useState<ScannerTabMode>('scanner');
  const [codeInput, setCodeInput] = useState('');
  const [admissionRemarks, setAdmissionRemarks] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAdmitting, setIsAdmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [verifiedExaminee, setVerifiedExaminee] = useState<ExamAdmissionVerificationDto | null>(null);

  // Roster state
  const [examinees, setExaminees] = useState<ExamAdmissionVerificationDto[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');

  // Camera state (web)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStatusMessage, setCameraStatusMessage] = useState<string | null>(null);
  const cameraHostId = useRef(`edge-qr-cam-${Math.random().toString(36).slice(2, 9)}`).current;
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current !== null) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (mediaStreamRef.current !== null) {
      const tracks = mediaStreamRef.current.getTracks();
      for (const track of tracks) {
        try {
          track.stop();
        } catch {
          // ignore
        }
      }
      mediaStreamRef.current = null;
    }
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const container = document.getElementById(cameraHostId);
      if (container !== null) {
        container.innerHTML = '';
      }
    }
    setIsCameraActive(false);
  }, [cameraHostId]);

  const loadRoster = useCallback(async () => {
    setIsLoadingRoster(true);
    const [data, err] = await scheduleService.getScheduleExaminees({
      scheduleId: schedule?.id,
      tenantId: schedule?.tenantId || tenantId,
    });
    setIsLoadingRoster(false);
    if (err === null && Array.isArray(data)) {
      setExaminees(data);
    }
  }, [schedule?.id, schedule?.tenantId, tenantId]);

  useEffect(() => {
    if (visible) {
      setErrorMessage(null);
      setSuccessBanner(null);
      void loadRoster();
    } else {
      stopCamera();
      setVerifiedExaminee(null);
      setCodeInput('');
      setAdmissionRemarks('');
      setErrorMessage(null);
      setSuccessBanner(null);
    }
    return () => {
      stopCamera();
    };
  }, [visible, loadRoster, stopCamera]);

  const handleVerifyCode = useCallback(
    async (overrideCode?: string) => {
      const targetCode = (overrideCode !== undefined ? overrideCode : codeInput).trim();
      if (targetCode.length === 0) {
        setErrorMessage('Please scan a QR code or enter an Admission Verification Code / Control Number.');
        return;
      }

      setIsVerifying(true);
      setErrorMessage(null);
      setSuccessBanner(null);

      const [result, err] = await scheduleService.verifyAdmissionQr({
        code: targetCode,
        scheduleId: schedule?.id,
        tenantId: schedule?.tenantId || tenantId,
      });

      setIsVerifying(false);

      if (err !== null || result === null || result === undefined) {
        setVerifiedExaminee(null);
        setErrorMessage(err || `No Exam Admission Slip found matching "${targetCode}".`);
        return;
      }

      setVerifiedExaminee(result);
      setCodeInput(result.qrVerificationCode);
      setActiveTab('scanner');
    },
    [codeInput, schedule?.id, schedule?.tenantId, tenantId]
  );

  const startCamera = useCallback(async () => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setCameraStatusMessage('Camera streaming is unavailable in this environment. Use QR image upload or manual code input below.');
      return;
    }

    stopCamera();
    setErrorMessage(null);
    setCameraStatusMessage('Initializing camera...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      setCameraStatusMessage(null);

      setTimeout(() => {
        if (typeof document === 'undefined') return;
        const host = document.getElementById(cameraHostId);
        if (host === null) return;
        host.innerHTML = '';

        const videoEl = document.createElement('video');
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('autoplay', 'true');
        videoEl.muted = true;
        videoEl.srcObject = stream;
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoEl.style.objectFit = 'cover';
        videoEl.style.borderRadius = '12px';
        host.appendChild(videoEl);
        void videoEl.play().catch(() => {
          // ignore autoplay block
        });

        const BarcodeDetectorCtor =
          typeof window !== 'undefined' && Reflect.has(window, 'BarcodeDetector')
            ? Reflect.get(window, 'BarcodeDetector')
            : null;

        if (typeof BarcodeDetectorCtor === 'function') {
          let detector: unknown = null;
          try {
            detector = Reflect.construct(BarcodeDetectorCtor, [{ formats: ['qr_code'] }]);
          } catch {
            detector = null;
          }

          if (isObjectRecord(detector) && typeof detector.detect === 'function') {
            const detectFn = detector.detect.bind(detector);
            scanIntervalRef.current = setInterval(async () => {
              if (videoEl.readyState < 2) return;
              try {
                const rawBarcodes: unknown = await detectFn(videoEl);
                if (Array.isArray(rawBarcodes) && rawBarcodes.length > 0) {
                  const first = rawBarcodes[0];
                  if (isObjectRecord(first) && typeof first.rawValue === 'string' && first.rawValue.trim().length > 0) {
                    const scannedValue = first.rawValue.trim();
                    stopCamera();
                    setCodeInput(scannedValue);
                    void handleVerifyCode(scannedValue);
                  }
                }
              } catch {
                // ignore frame decode error
              }
            }, 350);
          } else {
            setCameraStatusMessage('Camera active. Point at QR code or use USB scanner / manual input below.');
          }
        } else {
          setCameraStatusMessage('Camera active. If your browser does not support automatic QR detection, use "Scan QR Image" or enter the code below.');
        }
      }, 80);
    } catch {
      setIsCameraActive(false);
      setCameraStatusMessage('Camera permission denied or no camera detected. You can upload a QR image or use a USB scanner / manual code below.');
    }
  }, [cameraHostId, handleVerifyCode, stopCamera]);

  const handlePickQrImage = useCallback(async () => {
    setErrorMessage(null);
    try {
      const pickerRes = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      if (pickerRes.canceled || !pickerRes.assets || pickerRes.assets.length === 0) {
        return;
      }

      const asset = pickerRes.assets[0];
      if (!asset) return;

      if (Platform.OS === 'web' && typeof window !== 'undefined' && Reflect.has(window, 'BarcodeDetector')) {
        const BarcodeDetectorCtor = Reflect.get(window, 'BarcodeDetector');
        if (typeof BarcodeDetectorCtor === 'function') {
          const detector: unknown = Reflect.construct(BarcodeDetectorCtor, [{ formats: ['qr_code'] }]);
          if (isObjectRecord(detector) && typeof detector.detect === 'function') {
            const resp = await fetch(asset.uri);
            const blob = await resp.blob();
            const bitmap = await createImageBitmap(blob);
            const barcodes: unknown = await detector.detect.call(detector, bitmap);
            if (Array.isArray(barcodes) && barcodes.length > 0) {
              const first = barcodes[0];
              if (isObjectRecord(first) && typeof first.rawValue === 'string' && first.rawValue.trim().length > 0) {
                const decoded = first.rawValue.trim();
                setCodeInput(decoded);
                await handleVerifyCode(decoded);
                return;
              }
            }
          }
        }
      }

      // Fallback: check if the filename itself contains NTC-VERIFY or a control number
      const fileNameMatch = asset.name.match(/(NTC-VERIFY-[A-Z0-9-]+|ADM-[A-Z0-9-]+|REF-[A-Z0-9-]+)/i);
      if (fileNameMatch && fileNameMatch[1]) {
        setCodeInput(fileNameMatch[1].toUpperCase());
        await handleVerifyCode(fileNameMatch[1].toUpperCase());
        return;
      }

      setErrorMessage('Could not decode a QR code from the selected image. Please enter the NTC-VERIFY code printed below the QR box or select the examinee from the Roster tab.');
    } catch {
      setErrorMessage('Failed to process the selected QR image.');
    }
  }, [handleVerifyCode]);

  const handleConfirmAdmission = useCallback(async () => {
    if (verifiedExaminee === null) return;

    setIsAdmitting(true);
    setErrorMessage(null);
    setSuccessBanner(null);

    const [updated, err] = await scheduleService.admitExaminee({
      code: verifiedExaminee.qrVerificationCode,
      issuedDocumentId: verifiedExaminee.issuedDocumentId,
      applicationId: verifiedExaminee.applicationId,
      applicantId: verifiedExaminee.applicantId,
      scheduleId: schedule?.id ?? verifiedExaminee.scheduleId,
      tenantId: schedule?.tenantId ?? verifiedExaminee.tenantId,
      remarks: admissionRemarks.trim().length > 0 ? admissionRemarks.trim() : undefined,
    });

    setIsAdmitting(false);

    if (err !== null || updated === null || updated === undefined) {
      setErrorMessage(err || 'Failed to record examinee admission.');
      return;
    }

    setVerifiedExaminee(updated);
    setSuccessBanner(`Examinee ${updated.examineeName} (${updated.formNumber}) has been officially admitted!`);
    setAdmissionRemarks('');
    void loadRoster();
    if (onAdmitted !== undefined) {
      onAdmitted(updated);
    }
  }, [admissionRemarks, loadRoster, onAdmitted, schedule?.id, schedule?.tenantId, verifiedExaminee]);

  const handleResetForNextScan = useCallback(() => {
    setVerifiedExaminee(null);
    setCodeInput('');
    setAdmissionRemarks('');
    setErrorMessage(null);
    setSuccessBanner(null);
  }, []);

  const rosterStats = useMemo(() => {
    let admitted = 0;
    for (const item of examinees) {
      if (item.isAdmitted) admitted++;
    }
    return {
      total: examinees.length,
      admitted,
      pending: Math.max(0, examinees.length - admitted),
    };
  }, [examinees]);

  const filteredExaminees = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    if (q.length === 0) return examinees;
    return examinees.filter(
      (item) =>
        item.examineeName.toLowerCase().includes(q) ||
        item.qrVerificationCode.toLowerCase().includes(q) ||
        item.formNumber.toLowerCase().includes(q) ||
        item.referenceNumber.toLowerCase().includes(q) ||
        (item.examElements?.toLowerCase().includes(q) ?? false)
    );
  }, [examinees, rosterSearch]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
              width: isNarrow ? '96%' : '90%',
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.headerIconBox,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                ]}
              >
                <Lucide
                  name="maximize"
                  size={18}
                  color={isDark ? colors.brand[500] : colors.brand.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Exam Admission Slip QR Scanner
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {schedule
                    ? `${schedule.serviceName || 'Examination'} • ${schedule.venue || 'Testing Center'}`
                    : 'Scan or verify Examinee Admission Slip QR codes to record exam attendance'}
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={onClose}
            >
              <Lucide name="x" size={16} color={colors.text} />
            </Pressable>
          </View>

          {/* Attendance Summary Strip & Mode Switcher */}
          <View
            style={[
              styles.subHeaderBar,
              {
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                borderBottomColor: colors.border,
                flexDirection: isNarrow ? 'column' : 'row',
              },
            ]}
          >
            <View style={styles.tabGroup}>
              <Pressable
                style={[
                  styles.tabPill,
                  activeTab === 'scanner' && {
                    backgroundColor: isDark ? colors.brand[600] : colors.brand.primary,
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => setActiveTab('scanner')}
              >
                <Lucide
                  name="camera"
                  size={14}
                  color={activeTab === 'scanner' ? COLORS.neutral.white : colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabPillText,
                    { color: activeTab === 'scanner' ? COLORS.neutral.white : colors.textMuted },
                  ]}
                >
                  QR Scanner &amp; Verification
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tabPill,
                  activeTab === 'roster' && {
                    backgroundColor: isDark ? colors.brand[600] : colors.brand.primary,
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => setActiveTab('roster')}
              >
                <Lucide
                  name="users"
                  size={14}
                  color={activeTab === 'roster' ? COLORS.neutral.white : colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabPillText,
                    { color: activeTab === 'roster' ? COLORS.neutral.white : colors.textMuted },
                  ]}
                >
                  Examinee Roster ({rosterStats.admitted}/{rosterStats.total} Admitted)
                </Text>
              </Pressable>
            </View>

            <View style={styles.kpiPillsRow}>
              <View style={[styles.kpiBadge, { backgroundColor: COLORS.semantic.successBg, borderColor: COLORS.semantic.successBorder }]}>
                <View style={[styles.kpiDot, { backgroundColor: COLORS.semantic.success }]} />
                <Text style={[styles.kpiBadgeText, { color: COLORS.semantic.successText }]}>
                  Admitted: {rosterStats.admitted}
                </Text>
              </View>
              <View style={[styles.kpiBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border }]}>
                <Text style={[styles.kpiBadgeText, { color: colors.textMuted }]}>
                  Awaiting: {rosterStats.pending}
                </Text>
              </View>
            </View>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'scanner' ? (
              <>
                {/* Scanner Input & Camera Section */}
                <View
                  style={[
                    styles.scannerSectionCard,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.scannerTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Scan or Enter Admission Slip QR Code
                      </Text>
                      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                        Use your camera, a handheld USB QR scanner, upload a QR image, or enter the NTC-VERIFY code printed on the Exam Admission Slip.
                      </Text>
                    </View>

                    <View style={styles.cameraActionsRow}>
                      {Platform.OS === 'web' && (
                        <Button
                          variant={isCameraActive ? 'danger' : 'secondary'}
                          size="sm"
                          fullWidth={false}
                          leftIcon={
                            <Lucide
                              name={isCameraActive ? 'video-off' : 'camera'}
                              size={14}
                              color={isCameraActive ? COLORS.neutral.white : colors.text}
                            />
                          }
                          onPress={isCameraActive ? stopCamera : startCamera}
                        >
                          {isCameraActive ? 'Stop Camera' : 'Use Camera'}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth={false}
                        leftIcon={<Lucide name="upload" size={14} color={colors.text} />}
                        onPress={handlePickQrImage}
                      >
                        Scan QR Image
                      </Button>
                    </View>
                  </View>

                  {/* Live Camera Viewfinder (when enabled on Web) */}
                  {isCameraActive && (
                    <View style={styles.cameraViewfinderWrap}>
                      <View nativeID={cameraHostId} style={styles.cameraVideoBox} />
                      <View style={styles.viewfinderFrameOverlay} pointerEvents="none">
                        <View style={styles.viewfinderTargetBox} />
                        <Text style={styles.viewfinderHintText}>
                          Align the Admission Slip QR code inside the frame
                        </Text>
                      </View>
                    </View>
                  )}

                  {cameraStatusMessage !== null && (
                    <View
                      style={[
                        styles.infoBanner,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.semantic.infoBg,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Lucide name="info" size={15} color={COLORS.semantic.info} />
                      <Text style={[styles.infoBannerText, { color: colors.text }]}>
                        {cameraStatusMessage}
                      </Text>
                    </View>
                  )}

                  {/* USB Hardware Scanner / Manual Code Input */}
                  <View style={[styles.inputRow, { flexDirection: isNarrow ? 'column' : 'row' }]}>
                    <View
                      style={[
                        styles.codeInputBox,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Lucide name="search" size={16} color={colors.textMuted} />
                      <TextInput
                        value={codeInput}
                        onChangeText={setCodeInput}
                        onSubmitEditing={() => {
                          void handleVerifyCode();
                        }}
                        placeholder="e.g. NTC-VERIFY-A1B2C3D4E5F6, Form No., or Reference No."
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        style={[styles.codeTextInput, { color: colors.text }]}
                      />
                      {codeInput.length > 0 && (
                        <Pressable
                          onPress={() => setCodeInput('')}
                          style={Platform.select({ web: { cursor: 'pointer' } })}
                        >
                          <Lucide name="x-circle" size={16} color={colors.textMuted} />
                        </Pressable>
                      )}
                    </View>

                    <Button
                      variant="primary"
                      size="md"
                      fullWidth={isNarrow}
                      isDisabled={isVerifying}
                      leftIcon={
                        isVerifying ? (
                          <ActivityIndicator size="small" color={COLORS.neutral.white} />
                        ) : (
                          <Lucide name="check-circle" size={16} color={COLORS.neutral.white} />
                        )
                      }
                      onPress={() => {
                        void handleVerifyCode();
                      }}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Admission Slip'}
                    </Button>
                  </View>
                </View>

                {/* Error Message */}
                {errorMessage !== null && (
                  <View
                    style={[
                      styles.alertBanner,
                      {
                        backgroundColor: COLORS.semantic.errorBg,
                        borderColor: COLORS.semantic.errorBorder,
                      },
                    ]}
                  >
                    <Lucide name="alert-circle" size={18} color={COLORS.semantic.error} />
                    <Text style={[styles.alertBannerText, { color: COLORS.semantic.errorText }]}>
                      {errorMessage}
                    </Text>
                  </View>
                )}

                {/* Success Banner */}
                {successBanner !== null && (
                  <View
                    style={[
                      styles.alertBanner,
                      {
                        backgroundColor: COLORS.semantic.successBg,
                        borderColor: COLORS.semantic.successBorder,
                      },
                    ]}
                  >
                    <Lucide name="check-circle" size={18} color={COLORS.semantic.success} />
                    <Text style={[styles.alertBannerText, { color: COLORS.semantic.successText }]}>
                      {successBanner}
                    </Text>
                  </View>
                )}

                {/* Verified Examinee Card */}
                {verifiedExaminee !== null && (
                  <View
                    style={[
                      styles.examineeCard,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: verifiedExaminee.isAdmitted
                          ? COLORS.semantic.success
                          : verifiedExaminee.isValidForAdmission
                          ? colors.brand.primary
                          : COLORS.semantic.warning,
                      },
                    ]}
                  >
                    {/* Examinee Card Header */}
                    <View
                      style={[
                        styles.examineeHeader,
                        {
                          backgroundColor: verifiedExaminee.isAdmitted
                            ? COLORS.semantic.successBg
                            : isDark
                            ? colors.neutral[800]
                            : colors.brand.light,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.examineeIdentityRow}>
                        <View
                          style={[
                            styles.avatarCircle,
                            {
                              backgroundColor: verifiedExaminee.isAdmitted
                                ? COLORS.semantic.success
                                : colors.brand.primary,
                            },
                          ]}
                        >
                          <Lucide
                            name={verifiedExaminee.isAdmitted ? 'user-check' : 'user'}
                            size={22}
                            color={COLORS.neutral.white}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.examineeName, { color: colors.text }]}>
                            {verifiedExaminee.examineeName}
                          </Text>
                          <Text style={[styles.examineeSubCode, { color: colors.textMuted }]}>
                            QR: {verifiedExaminee.qrVerificationCode} • Slip No: {verifiedExaminee.formNumber}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: verifiedExaminee.isAdmitted
                              ? COLORS.semantic.success
                              : verifiedExaminee.isValidForAdmission
                              ? colors.brand.primary
                              : COLORS.semantic.warning,
                          },
                        ]}
                      >
                        <Lucide
                          name={
                            verifiedExaminee.isAdmitted
                              ? 'check-circle'
                              : verifiedExaminee.isValidForAdmission
                              ? 'shield'
                              : 'alert-triangle'
                          }
                          size={13}
                          color={COLORS.neutral.white}
                        />
                        <Text style={styles.statusPillText}>
                          {verifiedExaminee.isAdmitted
                            ? 'ADMITTED TO EXAM'
                            : verifiedExaminee.isValidForAdmission
                            ? 'VERIFIED • READY TO ADMIT'
                            : 'NOT YET ISSUED'}
                        </Text>
                      </View>
                    </View>

                    {/* Examinee & Exam Particulars Grid */}
                    <View style={styles.particularsGrid}>
                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          EXAMINATION TITLE
                        </Text>
                        <Text style={[styles.particularValue, { color: colors.text }]}>
                          {verifiedExaminee.examTitle}
                        </Text>
                      </View>

                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          EXAM ELEMENTS / SUBJECTS
                        </Text>
                        <Text style={[styles.particularValue, { color: isDark ? colors.brand[400] : colors.brand.primary }]}>
                          {verifiedExaminee.examElements || 'Standard Elements'}
                        </Text>
                      </View>

                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          TESTING VENUE
                        </Text>
                        <Text style={[styles.particularValue, { color: colors.text }]}>
                          {verifiedExaminee.examVenue || 'NTC Examination Center'}
                        </Text>
                      </View>

                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          EXAM DATE &amp; TIME
                        </Text>
                        <Text style={[styles.particularValue, { color: colors.text }]}>
                          {verifiedExaminee.examDate || 'Scheduled Date'}{' '}
                          {verifiedExaminee.examTime ? `(${verifiedExaminee.examTime})` : ''}
                        </Text>
                      </View>

                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          APPLICATION REFERENCE
                        </Text>
                        <Text style={[styles.particularValue, { color: colors.text }]}>
                          #{verifiedExaminee.referenceNumber}
                        </Text>
                      </View>

                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          OFFICIAL RECEIPT NO.
                        </Text>
                        <Text style={[styles.particularValue, { color: COLORS.semantic.success }]}>
                          {verifiedExaminee.officialReceiptNumber || 'Verified'}
                        </Text>
                      </View>

                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          SEX / BIRTH DATE
                        </Text>
                        <Text style={[styles.particularValue, { color: colors.text }]}>
                          {[verifiedExaminee.sex, verifiedExaminee.birthDate].filter(Boolean).join(' • ') || 'On Record'}
                        </Text>
                      </View>

                      <View style={styles.particularItem}>
                        <Text style={[styles.particularLabel, { color: colors.textMuted }]}>
                          CONTACT / EMAIL
                        </Text>
                        <Text style={[styles.particularValue, { color: colors.text }]} numberOfLines={1}>
                          {[verifiedExaminee.contactNumber, verifiedExaminee.email].filter(Boolean).join(' • ') || 'On Record'}
                        </Text>
                      </View>
                    </View>

                    {/* Admission Action or Admitted Audit Box */}
                    {verifiedExaminee.isAdmitted ? (
                      <View
                        style={[
                          styles.admittedAuditBox,
                          {
                            backgroundColor: COLORS.semantic.successBg,
                            borderColor: COLORS.semantic.successBorder,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                          <Lucide name="check-circle" size={20} color={COLORS.semantic.success} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.admittedAuditTitle, { color: COLORS.semantic.successText }]}>
                              Examinee Admitted to Examination Room
                            </Text>
                            <Text style={[styles.admittedAuditSub, { color: COLORS.semantic.successText }]}>
                              Admitted by {verifiedExaminee.admittedByStaffName || 'Examination Officer'}
                              {verifiedExaminee.admittedAt
                                ? ` on ${new Date(verifiedExaminee.admittedAt).toLocaleString()}`
                                : ''}
                            </Text>
                          </View>
                        </View>

                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth={false}
                          leftIcon={<Lucide name="maximize" size={14} color={COLORS.neutral.white} />}
                          onPress={handleResetForNextScan}
                        >
                          Scan Next Examinee
                        </Button>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.admissionActionFooter,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                            borderTopColor: colors.border,
                          },
                        ]}
                      >
                        <TextInput
                          value={admissionRemarks}
                          onChangeText={setAdmissionRemarks}
                          placeholder="Optional seat number, room assignment, or proctor remarks..."
                          placeholderTextColor={colors.textMuted}
                          style={[
                            styles.remarksInput,
                            {
                              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                              borderColor: colors.border,
                              color: colors.text,
                            },
                          ]}
                        />

                        <View style={styles.admissionButtonsRow}>
                          <Button
                            variant="outline"
                            size="md"
                            fullWidth={false}
                            onPress={handleResetForNextScan}
                          >
                            Clear
                          </Button>

                          <Button
                            variant="primary"
                            size="md"
                            fullWidth={false}
                            isDisabled={!verifiedExaminee.isValidForAdmission || isAdmitting}
                            leftIcon={
                              isAdmitting ? (
                                <ActivityIndicator size="small" color={COLORS.neutral.white} />
                              ) : (
                                <Lucide name="user-check" size={16} color={COLORS.neutral.white} />
                              )
                            }
                            onPress={() => {
                              void handleConfirmAdmission();
                            }}
                          >
                            {isAdmitting ? 'Admitting Examinee...' : 'Admit Examinee to Exam'}
                          </Button>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            ) : (
              /* Roster Tab */
              <View style={styles.rosterContainer}>
                <View
                  style={[
                    styles.rosterSearchBox,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Lucide name="search" size={16} color={colors.textMuted} />
                  <TextInput
                    value={rosterSearch}
                    onChangeText={setRosterSearch}
                    placeholder="Filter examinees by name, QR code, control number, or elements..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.codeTextInput, { color: colors.text }]}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Lucide name="refresh-cw" size={13} color={colors.text} />}
                    onPress={() => {
                      void loadRoster();
                    }}
                  >
                    Refresh
                  </Button>
                </View>

                {isLoadingRoster ? (
                  <View style={styles.emptyRosterBox}>
                    <ActivityIndicator size="large" color={colors.brand.primary} />
                    <Text style={[styles.emptyRosterText, { color: colors.textMuted }]}>
                      Loading scheduled examinees...
                    </Text>
                  </View>
                ) : filteredExaminees.length === 0 ? (
                  <View style={styles.emptyRosterBox}>
                    <Lucide name="users" size={32} color={colors.textMuted} />
                    <Text style={[styles.emptyRosterTitle, { color: colors.text }]}>
                      No Examinees Found
                    </Text>
                    <Text style={[styles.emptyRosterText, { color: colors.textMuted }]}>
                      Issued Exam Admission Slips will appear here automatically for quick check-in and verification.
                    </Text>
                  </View>
                ) : (
                  filteredExaminees.map((item) => (
                    <View
                      key={item.issuedDocumentId}
                      style={[
                        styles.rosterRowCard,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                          borderColor: item.isAdmitted ? COLORS.semantic.successBorder : colors.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Text style={[styles.rosterName, { color: colors.text }]}>
                            {item.examineeName}
                          </Text>
                          <View
                            style={[
                              styles.rosterBadge,
                              {
                                backgroundColor: item.isAdmitted
                                  ? COLORS.semantic.successBg
                                  : isDark
                                  ? colors.neutral[700]
                                  : colors.neutral[100],
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.rosterBadgeText,
                                {
                                  color: item.isAdmitted
                                    ? COLORS.semantic.successText
                                    : colors.textMuted,
                                },
                              ]}
                            >
                              {item.isAdmitted ? 'ADMITTED' : 'AWAITING CHECK-IN'}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.rosterMeta, { color: colors.textMuted }]}>
                          QR: {item.qrVerificationCode} • Form: {item.formNumber} • Ref: #{item.referenceNumber}
                        </Text>
                        <Text style={[styles.rosterMeta, { color: isDark ? colors.brand[400] : colors.brand.primary }]}>
                          {item.examTitle} ({item.examElements || 'All Elements'})
                        </Text>
                        {item.isAdmitted && item.admittedAt && (
                          <Text style={[styles.rosterMeta, { color: COLORS.semantic.success }]}>
                            Admitted at {new Date(item.admittedAt).toLocaleTimeString()} by {item.admittedByStaffName || 'Proctor'}
                          </Text>
                        )}
                      </View>

                      <Button
                        variant={item.isAdmitted ? 'outline' : 'primary'}
                        size="sm"
                        fullWidth={false}
                        leftIcon={
                          <Lucide
                            name={item.isAdmitted ? 'eye' : 'user-check'}
                            size={14}
                            color={item.isAdmitted ? colors.text : COLORS.neutral.white}
                          />
                        }
                        onPress={() => {
                          setVerifiedExaminee(item);
                          setCodeInput(item.qrVerificationCode);
                          setActiveTab('scanner');
                        }}
                      >
                        {item.isAdmitted ? 'View Slip' : 'Verify & Admit'}
                      </Button>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              {
                borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100],
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
              },
            ]}
          >
            <Button variant="outline" size="md" fullWidth={false} onPress={onClose}>
              Close Scanner
            </Button>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    maxWidth: 860,
    maxHeight: '92%',
    alignSelf: 'center',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeaderBar: {
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING[12],
  },
  tabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
  },
  tabPillText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  kpiPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  kpiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  kpiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  kpiBadgeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  scrollBody: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: SPACING[24],
    gap: SPACING[16],
  },
  scannerSectionCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
  },
  scannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
    lineHeight: 18,
  },
  cameraActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  cameraViewfinderWrap: {
    width: '100%',
    height: 260,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraVideoBox: {
    width: '100%',
    height: '100%',
  },
  viewfinderFrameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  viewfinderTargetBox: {
    width: 170,
    height: 170,
    borderWidth: 2.5,
    borderColor: '#38BDF8',
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  viewfinderHintText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  infoBannerText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    flex: 1,
  },
  inputRow: {
    alignItems: 'center',
    gap: SPACING[12],
  },
  codeInputBox: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  codeTextInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    height: '100%',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  alertBannerText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  examineeCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  examineeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: SPACING[16],
    borderBottomWidth: 1,
    gap: SPACING[12],
  },
  examineeIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examineeName: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  examineeSubCode: {
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  particularsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING[16],
    gap: SPACING[16],
  },
  particularItem: {
    minWidth: 210,
    flex: 1,
    gap: 3,
  },
  particularLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.6,
  },
  particularValue: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  admittedAuditBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: SPACING[16],
    borderTopWidth: 1,
    gap: SPACING[12],
  },
  admittedAuditTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  admittedAuditSub: {
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  admissionActionFooter: {
    padding: SPACING[16],
    borderTopWidth: 1,
    gap: SPACING[12],
  },
  remarksInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: 12,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  admissionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING[12],
  },
  rosterContainer: {
    gap: SPACING[12],
  },
  rosterSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  emptyRosterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyRosterTitle: {
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyRosterText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    textAlign: 'center',
    maxWidth: 420,
  },
  rosterRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
  },
  rosterName: {
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  rosterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  rosterBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  rosterMeta: {
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
  },
});

import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '@edge/ui';
import { styles } from './applicationDetailsStyles';

interface ApplicationProgressStepperProps {
  currentStepIndex: number;
  serviceCategory?: string;
  serviceName?: string;
  status?: string;
  remarks?: string;
}

function getServiceDocumentType(category?: string, serviceName?: string): string {
  const text = `${category || ''} ${serviceName || ''}`.toLowerCase();
  if (text.includes('exam')) return 'Admission Slip';
  if (text.includes('cert')) return 'Certificate';
  if (text.includes('permit')) return 'Permit';
  if (text.includes('license')) return 'License';
  return 'Document';
}

export function ApplicationProgressStepper({
  currentStepIndex,
  serviceCategory,
  serviceName,
  remarks,
}: ApplicationProgressStepperProps) {
  const docLabel = getServiceDocumentType(serviceCategory, serviceName);

  const isPaymentSubmitted =
    typeof remarks === 'string' &&
    remarks.toLowerCase().includes('payment submitted');

  const paymentSubLabel =
    currentStepIndex > 3
      ? 'Payment verified'
      : isPaymentSubmitted
        ? 'Verification in progress'
        : currentStepIndex === 3
          ? 'Ready for payment'
          : 'Fee assessment';

  const STEPS = [
    { step: 1, label: 'Submitted', subLabel: 'Application received' },
    { step: 2, label: 'Evaluation', subLabel: 'Technical review' },
    { step: 3, label: 'Payment', subLabel: paymentSubLabel },
    { step: 4, label: 'Issuance', subLabel: `${docLabel} processing` },
    { step: 5, label: 'Completed', subLabel: `${docLabel} ready` },
  ];

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.progressHeaderTitle}>APPLICATION PROGRESS</Text>
      <View style={styles.stepperRow}>
        {STEPS.map((s, idx) => {
          const isDone = currentStepIndex > s.step;
          const isActive = currentStepIndex === s.step;
          const isLineDone = currentStepIndex >= s.step;

          return (
            <React.Fragment key={s.step}>
              {idx > 0 && (
                <View
                  style={[
                    styles.stepLine,
                    isLineDone ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />
              )}
              <View style={styles.stepNode}>
                <View
                  style={[
                    styles.stepCircle,
                    isDone
                      ? styles.stepCircleDone
                      : isActive
                        ? { backgroundColor: '#1D4ED8', borderColor: '#93C5FD', borderWidth: 2 }
                        : styles.stepCirclePending,
                  ]}
                >
                  {isDone ? (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isActive ? { color: '#FFFFFF' } : null,
                      ]}
                    >
                      {s.step}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive ? { color: '#1D4ED8' } : null,
                  ]}
                >
                  {s.label}
                </Text>
                <Text style={styles.stepSubLabel}>{s.subLabel}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

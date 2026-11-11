import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { Icon } from '@edge/ui';
import { styles } from './applicationDetailsStyles';

interface ApplicationProgressStepperProps {
  currentStepIndex: number;
  serviceCategory?: string;
  serviceName?: string;
  status?: string;
  remarks?: string;
  isAssessmentOnly?: boolean;
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
  status,
  remarks,
  isAssessmentOnly = false,
}: ApplicationProgressStepperProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const docLabel = getServiceDocumentType(serviceCategory, serviceName);

  const remarksLower = (typeof remarks === 'string' ? remarks : '').toLowerCase();
  const statusLower = (typeof status === 'string' ? status : '').toLowerCase();

  const isUnderAccountantReview =
    !isAssessmentOnly &&
    (statusLower === 'foraccountant' ||
      statusLower === 'for_accountant' ||
      remarksLower.includes('accountant'));

  const isPaymentSubmitted =
    !remarksLower.includes('order of payment returned') &&
    (
      statusLower === 'payment_submitted' ||
      statusLower === 'payment_processing' ||
      statusLower === 'verification_in_progress' ||
      remarksLower.includes('payment submitted') ||
      remarksLower.includes('waiting for cashier verification') ||
      remarksLower.includes('awaiting cashier verification') ||
      remarksLower.includes('verification in progress')
    );

  const paymentSubLabel =
    currentStepIndex > 3
      ? 'Payment verified'
      : isPaymentSubmitted
        ? 'Verification in progress'
        : isUnderAccountantReview
          ? 'Accountant review'
          : currentStepIndex === 3
            ? 'For payment'
            : 'Fee assessment';

  const STEPS = isAssessmentOnly
    ? [
        { step: 1, label: 'Submitted', subLabel: 'Request received' },
        { step: 2, label: 'Evaluation', subLabel: currentStepIndex > 2 ? 'Fee assessed' : 'Fee assessment' },
        { step: 3, label: 'Complete', subLabel: currentStepIndex === 3 ? 'SOA released' : 'SOA pending' },
      ]
    : [
        { step: 1, label: 'Submitted', subLabel: 'Application received' },
        { step: 2, label: 'Evaluation', subLabel: 'Technical review' },
        { step: 3, label: 'Payment', subLabel: paymentSubLabel },
        { step: 4, label: 'Issuance', subLabel: currentStepIndex > 4 ? `${docLabel} issued` : `${docLabel} processing` },
        { step: 5, label: 'Complete', subLabel: `${docLabel} ready` },
      ];

  const maxStep = isAssessmentOnly ? 3 : 5;

  const stepperNodes = (
    <View style={[styles.stepperRow, isMobile ? { minWidth: 520, paddingHorizontal: 4 } : null]}>
        {STEPS.map((s, idx) => {
          const isDone = currentStepIndex > s.step || (s.step === maxStep && currentStepIndex === maxStep);
          const isActive = currentStepIndex === s.step && currentStepIndex < maxStep;
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
                        ? {
                            backgroundColor: isAssessmentOnly ? '#7C3AED' : '#1D4ED8',
                            borderColor: isAssessmentOnly ? '#DDD6FE' : '#93C5FD',
                            borderWidth: 2,
                          }
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
                    isDone
                      ? { color: '#15803D', fontWeight: '700' }
                      : isActive
                        ? { color: isAssessmentOnly ? '#7C3AED' : '#1D4ED8', fontWeight: '700' }
                        : null,
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
  );

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.progressHeaderTitle}>APPLICATION PROGRESS</Text>
      {isMobile ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stepperNodes}
        </ScrollView>
      ) : (
        stepperNodes
      )}
    </View>
  );
}

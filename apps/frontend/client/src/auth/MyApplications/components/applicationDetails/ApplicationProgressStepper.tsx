import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '@edge/ui';
import { styles } from './applicationDetailsStyles';

interface ApplicationProgressStepperProps {
  currentStepIndex: number;
}

const STEPS = [
  { step: 1, label: 'Submitted', subLabel: 'Application received' },
  { step: 2, label: 'Evaluation', subLabel: 'Under review' },
  { step: 3, label: 'For Approval', subLabel: 'Awaiting decision' },
  { step: 4, label: 'Approved & Issued', subLabel: 'License ready' },
];

export function ApplicationProgressStepper({ currentStepIndex }: ApplicationProgressStepperProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.progressHeaderTitle}>APPLICATION PROGRESS</Text>
      <View style={styles.stepperRow}>
        {STEPS.map((s, idx) => {
          const isDone = currentStepIndex >= s.step;
          return (
            <React.Fragment key={s.step}>
              {idx > 0 && (
                <View
                  style={[
                    styles.stepLine,
                    isDone ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />
              )}
              <View style={styles.stepNode}>
                <View
                  style={[
                    styles.stepCircle,
                    isDone ? styles.stepCircleDone : styles.stepCirclePending,
                  ]}
                >
                  {isDone ? (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.stepNumber}>{s.step}</Text>
                  )}
                </View>
                <Text style={styles.stepLabel}>{s.label}</Text>
                <Text style={styles.stepSubLabel}>{s.subLabel}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

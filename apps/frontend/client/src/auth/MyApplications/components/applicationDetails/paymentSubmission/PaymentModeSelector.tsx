import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@edge/ui';
import { ModeOfPayment } from './paymentSubmissionTypes';
import { styles } from './paymentSubmissionStyles';

interface PaymentModeSelectorProps {
  selectedMode: ModeOfPayment;
  onSelectMode: (mode: ModeOfPayment) => void;
}

interface ModeConfig {
  mode: ModeOfPayment;
  icon: 'globe' | 'file-text' | 'dollar-sign' | 'layers';
  title: string;
  subtitle: string;
  badge?: string;
}

const MODES: ModeConfig[] = [
  {
    mode: 'Online',
    icon: 'globe',
    title: 'Online / E-Payment (LandBank, GCash, Maya, Bank Transfer)',
    subtitle: 'Enter transaction reference / e-receipt number and upload payment confirmation proof',
  },
  {
    mode: 'Check',
    icon: 'file-text',
    title: 'Check Payment (Manager’s / Corporate Check)',
    subtitle: 'Provide Check Number, Drawee Bank, Check Date, and check photo / scanned proof',
  },
  {
    mode: 'CashierOTC',
    icon: 'dollar-sign',
    title: 'Cashier Over-the-Counter (Walk-In Cash)',
    subtitle: 'Pay cash in-person at the NTC Regional Office Cashier using your Order of Payment',
  },
  {
    mode: 'Combination',
    icon: 'layers',
    title: 'Combination / Split Payment',
    subtitle: 'Split total amount across multiple payment methods (Cash, Check, and/or Online)',
    badge: 'Flexible',
  },
];

export function PaymentModeSelector({ selectedMode, onSelectMode }: PaymentModeSelectorProps) {
  return (
    <View style={styles.modeList}>
      {MODES.map((item) => {
        const isSelected = selectedMode === item.mode;
        return (
          <TouchableOpacity
            key={item.mode}
            style={[styles.modeCard, isSelected && styles.modeCardSelected]}
            onPress={() => onSelectMode(item.mode)}
            activeOpacity={0.8}
          >
            <View style={[styles.modeRadio, isSelected && styles.modeRadioSelected]}>
              {isSelected && <View style={styles.modeRadioInner} />}
            </View>
            <View style={[styles.modeIconBadge, isSelected && styles.modeIconBadgeSelected]}>
              <Icon name={item.icon} size={15} color={isSelected ? '#1D4ED8' : '#64748B'} />
            </View>
            <View style={styles.modeInfo}>
              <View style={styles.modeTitleRow}>
                <Text style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>
                  {item.title}
                </Text>
                {item.badge && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.modeSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ModeOfPayment } from './paymentSubmissionTypes';
import { styles } from './paymentSubmissionStyles';

interface PaymentModeSelectorProps {
  selectedMode: ModeOfPayment;
  onSelectMode: (mode: ModeOfPayment) => void;
}

interface ModeConfig {
  mode: ModeOfPayment;
  title: string;
  subtitle: string;
  badge?: string;
}

const MODES: ModeConfig[] = [
  {
    mode: 'LandBank',
    title: 'LandBank Link.BizPortal',
    subtitle: 'Pay via LandBank e-Payment Gateway with automated receipt generation',
  },
  {
    mode: 'GCashMaya',
    title: 'GCash / Maya (E-Wallet)',
    subtitle: 'Upload proof of payment and transaction reference number',
  },
  {
    mode: 'BankTransfer',
    title: 'Direct Bank Transfer / Deposit',
    subtitle: 'Transfer directly to NTC Designated Account via Pesonet / InstaPay',
  },
  {
    mode: 'CashierOTC',
    title: 'Cashier Over-the-Counter (Cash)',
    subtitle: 'Pay cash in-person at NTC Regional Office Cashier',
  },
  {
    mode: 'Check',
    title: 'Check Payment (Manager’s / Corporate)',
    subtitle: 'Submit Check details (Check #, Drawee Bank, Date) payable to NTC',
  },
  {
    mode: 'Combination',
    title: 'Combination / Split Payment (Check + Cash + Online)',
    subtitle: 'Split fees across multiple payment methods (e.g., Check portion + Cash portion)',
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

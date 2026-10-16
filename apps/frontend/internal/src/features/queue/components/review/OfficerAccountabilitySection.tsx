import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme, COLORS, Icon as Lucide } from '@edge/ui';
import { ApplicationData } from '../../../../types/application';
import {
  isGenericOfficer,
  getApprovingEvaluator,
} from '../../utils/officerEvaluationHelper';
import { officerStyles as styles } from './officerAccountabilityStyles';

interface OfficerAccountabilitySectionProps {
  app: ApplicationData;
}

interface StageOfficerInfo {
  stage: string;
  role: string;
  officerName: string;
  statusBadge: {
    label: string;
    bg: string;
    text: string;
    border: string;
  };
  iconName: 'user-check' | 'file-text' | 'credit-card' | 'award';
  isCurrentStage: boolean;
}

export function OfficerAccountabilitySection({ app }: OfficerAccountabilitySectionProps) {
  const { colors, isDark } = useTheme();

  const stages = useMemo<StageOfficerInfo[]>(() => {
    const approvingEval = getApprovingEvaluator(app);
    const evalOfficer =
      app.evaluatingOfficer ||
      approvingEval ||
      (!isGenericOfficer(app.assignedTo, app.office) && (app.status === 'Evaluating' || app.status === 'Submitted')
        ? app.assignedTo
        : undefined);

    const acctOfficer =
      app.accountingOfficer ||
      (!isGenericOfficer(app.assignedTo, app.office) && app.status === 'ForAccountant'
        ? app.assignedTo
        : undefined);

    const cashOfficer =
      app.cashierOfficer ||
      (!isGenericOfficer(app.assignedTo, app.office) && app.status === 'PendingPayment'
        ? app.assignedTo
        : undefined);

    const issueOfficer =
      app.issuingOfficer ||
      (!isGenericOfficer(app.assignedTo, app.office) && (app.status === 'ForIssuance' || app.status === 'Completed')
        ? app.assignedTo
        : undefined);

    const isSubmitted = app.status === 'Submitted';
    const isEvaluating = app.status === 'Evaluating' || app.status === 'Returned';
    const isForAccountant = app.status === 'ForAccountant';
    const isPendingPayment = app.status === 'PendingPayment';
    const isForIssuance = app.status === 'ForIssuance';
    const isCompleted = app.status === 'Completed' || app.status === 'Approved';

    // 1. Evaluator
    let evalStatus = { label: 'Completed', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
    if (isSubmitted) {
      evalStatus = { label: 'Unassigned', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    } else if (isEvaluating) {
      evalStatus = { label: 'In Progress', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    }

    // 2. Accountant
    let acctStatus = { label: 'Approved', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
    if (isSubmitted || isEvaluating) {
      acctStatus = { label: 'Pending Evaluation', bg: '#F8FAFC', text: '#94A3B8', border: '#E2E8F0' };
    } else if (isForAccountant) {
      acctStatus = { label: 'In Review', bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
    }

    // 3. Cashier
    let cashStatus = { label: 'Pending SOA', bg: '#F8FAFC', text: '#94A3B8', border: '#E2E8F0' };
    if (app.payment?.orNumber && app.payment.orNumber.trim().length > 0) {
      cashStatus = { label: `OR #${app.payment.orNumber}`, bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
    } else if (isPendingPayment) {
      cashStatus = { label: 'Awaiting Payment', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    } else if (isForIssuance || isCompleted) {
      cashStatus = { label: 'Payment Verified', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
    }

    // 4. Issuing Officer
    let issueStatus = { label: 'Pending Payment', bg: '#F8FAFC', text: '#94A3B8', border: '#E2E8F0' };
    if (isCompleted) {
      issueStatus = { label: 'Document Issued', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
    } else if (isForIssuance) {
      issueStatus = { label: 'Ready for Issuance', bg: '#EDE9FE', text: '#6D28D9', border: '#DDD6FE' };
    }

    return [
      {
        stage: 'Evaluation',
        role: 'Evaluator',
        officerName: evalOfficer || 'Unassigned',
        statusBadge: evalStatus,
        iconName: 'user-check',
        isCurrentStage: isSubmitted || isEvaluating,
      },
      {
        stage: 'Financial Review',
        role: 'Accountant',
        officerName: acctOfficer || 'Unassigned',
        statusBadge: acctStatus,
        iconName: 'file-text',
        isCurrentStage: isForAccountant,
      },
      {
        stage: 'Payment Collection',
        role: 'Cashier',
        officerName: cashOfficer || 'Unassigned',
        statusBadge: cashStatus,
        iconName: 'credit-card',
        isCurrentStage: isPendingPayment,
      },
      {
        stage: 'Permit / License',
        role: 'Issuing Officer',
        officerName: issueOfficer || 'Unassigned',
        statusBadge: issueStatus,
        iconName: 'award',
        isCurrentStage: isForIssuance || isCompleted,
      },
    ];
  }, [app]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Lucide name="shield" size={14} color={isDark ? colors.brand[400] : colors.brand[700]} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
            OFFICER ACCOUNTABILITY & STAGE ATTRIBUTION
          </Text>
        </View>
      </View>

      {Boolean(app.endorsedTo) && (
        <View
          style={[
            styles.endorsementBanner,
            {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
              borderColor: isDark ? '#6366F1' : '#C7D2FE',
            },
          ]}
        >
          <Lucide name="share-2" size={14} color={isDark ? '#A5B4FC' : '#4F46E5'} />
          <Text style={[styles.endorsementText, { color: isDark ? '#C7D2FE' : '#3730A3' }]}>
            Actively endorsed to <Text style={styles.bold}>{app.endorsedTo}</Text>
            {app.endorsedBy ? ` by ${app.endorsedBy}` : ''}
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        {stages.map((st, idx) => {
          const isAssigned = st.officerName !== 'Unassigned';
          return (
            <View
              key={idx}
              style={[
                styles.stageCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  borderColor: st.isCurrentStage
                    ? (isDark ? colors.brand[500] : colors.brand[600])
                    : (isDark ? colors.neutral[700] : colors.neutral[200]),
                  borderWidth: st.isCurrentStage ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconAndRole}>
                  <Lucide
                    name={st.iconName}
                    size={12}
                    color={st.isCurrentStage ? (isDark ? colors.brand[400] : colors.brand[700]) : colors.neutral[400]}
                  />
                  <Text style={[styles.roleLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    {st.role}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : st.statusBadge.bg,
                      borderColor: isDark ? colors.neutral[700] : st.statusBadge.border,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: st.statusBadge.text }]}>
                    {st.statusBadge.label}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.officerName,
                  {
                    color: isAssigned
                      ? (isDark ? colors.neutral[100] : colors.neutral[900])
                      : (isDark ? colors.neutral[500] : colors.neutral[400]),
                    fontStyle: isAssigned ? 'normal' : 'italic',
                  },
                ]}
                numberOfLines={1}
              >
                {st.officerName}
              </Text>
              <Text style={[styles.stageSubtitle, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                {st.stage}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

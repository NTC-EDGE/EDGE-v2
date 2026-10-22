import React, { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useTheme, COLORS, SPACING, Icon as Lucide } from "@edge/ui";
import { ApplicantItem, ApplicationData } from "../../../../types/application";
import { BulkMetricsGrid } from "../BulkMetricsGrid";
import { SectionHeader } from "./reviewComponents";
import { reviewStyles as styles } from "./reviewStyles";
import { ApplicantVerdictModal, ApplicantVerdictType } from "../modals/ApplicantVerdictModal";
import { BatchConfirmationModal, BatchActionType } from "../modals/BatchConfirmationModal";

export interface BulkApplicantsRosterSectionProps {
  app: ApplicationData;
  localApplicants: ApplicantItem[];
  isEditable: boolean;
  onInspectApplicant?: (index: number) => void;
  onUpdateApplicantVerdict: (index: number, verdict: ApplicantVerdictType, remarks?: string) => void;
  onBatchAction: (action: BatchActionType) => void;
}

export function BulkApplicantsRosterSection({
  localApplicants,
  isEditable,
  onInspectApplicant,
  onUpdateApplicantVerdict,
  onBatchAction,
}: BulkApplicantsRosterSectionProps) {
  const { colors, isDark } = useTheme();
  const [rosterSearch, setRosterSearch] = useState('');
  const [verdictModalState, setVerdictModalState] = useState<{
    applicantIndex: number;
    applicantName: string;
    targetVerdict: ApplicantVerdictType;
    initialRemarks?: string;
  } | null>(null);
  const [batchModalAction, setBatchModalAction] = useState<BatchActionType | null>(null);

  const bulkTotal = localApplicants.length;
  const bulkApproved = localApplicants.filter((a) => a.status === 'Complete').length;
  const bulkDeclined = localApplicants.filter((a) => a.status === 'Incomplete').length;
  const bulkPending = localApplicants.filter((a) => a.status === 'ForEndorsement' || !a.status).length;

  const filteredApplicants = useMemo(() => {
    if (!rosterSearch.trim()) return localApplicants;
    const q = rosterSearch.toLowerCase().trim();
    return localApplicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.applicantType.toLowerCase().includes(q) ||
        (a.status && a.status.toLowerCase().includes(q))
    );
  }, [localApplicants, rosterSearch]);

  return (
    <View style={{ paddingHorizontal: SPACING[16], marginTop: SPACING[12] }}>
      <BulkMetricsGrid
        totalSubmitted={bulkTotal}
        approvedCount={bulkApproved}
        declinedCount={bulkDeclined}
        pendingCount={bulkPending}
      />

      <SectionHeader
        title={`APPLICANTS BATCH ROSTER (${localApplicants.length} APPLICANTS)`}
        rightAction={
          isEditable ? (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Pressable
                style={[styles.inspectBtn, { backgroundColor: isDark ? '#166534' : '#15803D', paddingHorizontal: 10 }]}
                onPress={() => setBatchModalAction('MarkAllComplete')}
              >
                <Lucide name="check-circle" size={13} color={COLORS.neutral.white} />
                <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '600' }]}>Mark All Complete</Text>
              </Pressable>
              <Pressable
                style={[styles.inspectBtn, { backgroundColor: isDark ? '#6B21A8' : '#7E22CE', paddingHorizontal: 10 }]}
                onPress={() => setBatchModalAction('MarkAllForEndorsement')}
              >
                <Lucide name="send" size={12} color={COLORS.neutral.white} />
                <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '600' }]}>Mark All Endorse</Text>
              </Pressable>
            </View>
          ) : null
        }
      />

      <TextInput
        style={[
          styles.rosterSearchInput,
          {
            color: isDark ? colors.neutral[100] : colors.neutral[900],
            backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          },
        ]}
        placeholder="Search roster applicants by name, type, or status..."
        placeholderTextColor={colors.neutral[400]}
        value={rosterSearch}
        onChangeText={setRosterSearch}
      />

      <View
        style={[
          styles.denseTableContainer,
          {
            backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          },
        ]}
      >
        <View
          style={[
            styles.denseTableHeader,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
              borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          <Text style={[styles.denseHeaderCell, { width: 35, textAlign: 'center', color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>#</Text>
          <Text style={[styles.denseHeaderCell, { flex: 2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>APPLICANT NAME</Text>
          <Text style={[styles.denseHeaderCell, { flex: 1, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>TYPE</Text>
          <Text style={[styles.denseHeaderCell, { flex: 1.2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>STATUS VERDICT</Text>
          <Text style={[styles.denseHeaderCell, { flex: 2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>EVALUATION REMARKS</Text>
          <Text style={[styles.denseHeaderCell, { width: 100, textAlign: 'right', color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>ACTION</Text>
        </View>

        {filteredApplicants.map((item, idx) => (
          <View
            key={item.id || idx}
            style={[
              styles.denseTableRow,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <Text style={[styles.denseRowIndex, { width: 35, textAlign: 'center', color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>#{idx + 1}</Text>
            <View style={{ flex: 2 }}>
              <Text style={[styles.denseRowName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.email ? <Text style={[styles.denseRowSub, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]} numberOfLines={1}>{item.email}</Text> : null}
            </View>
            <Text style={[styles.denseRowType, { flex: 1, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
              {item.applicantType}
            </Text>
            <View style={{ flex: 1.2 }}>
              <Pressable
                disabled={!isEditable}
                onPress={() => {
                  if (!isEditable) return;
                  const nextVerdict: ApplicantVerdictType =
                    item.status === 'Complete' ? 'Incomplete' : item.status === 'Incomplete' ? 'ForEndorsement' : 'Complete';
                  setVerdictModalState({
                    applicantIndex: idx,
                    applicantName: item.name,
                    targetVerdict: nextVerdict,
                    initialRemarks: item.evaluationRemarks || '',
                  });
                }}
              >
                {item.status === 'Incomplete' ? (
                  <View style={[styles.miniStatusBadge, { backgroundColor: '#FEE2E2', alignSelf: 'flex-start' }]}>
                    <Text style={[styles.miniStatusText, { color: '#991B1B' }]}>INCOMPLETE</Text>
                  </View>
                ) : item.status === 'ForEndorsement' ? (
                  <View style={[styles.miniStatusBadge, { backgroundColor: '#F3E8FF', alignSelf: 'flex-start' }]}>
                    <Text style={[styles.miniStatusText, { color: '#6B21A8' }]}>FOR ENDORSEMENT</Text>
                  </View>
                ) : (
                  <View style={[styles.miniStatusBadge, { backgroundColor: '#DCFCE7', alignSelf: 'flex-start' }]}>
                    <Text style={[styles.miniStatusText, { color: '#166534' }]}>COMPLETE</Text>
                  </View>
                )}
              </Pressable>
            </View>
            <Text style={[styles.denseRowRemarks, { flex: 2, color: isDark ? colors.neutral[400] : colors.neutral[600] }]} numberOfLines={1}>
              {item.evaluationRemarks || '—'}
            </Text>
            <View style={{ width: 100, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Pressable
                style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] }]}
                onPress={() => onInspectApplicant?.(idx)}
              >
                <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>
                  Inspect ►
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {verdictModalState !== null && (
        <ApplicantVerdictModal
          visible={verdictModalState !== null}
          applicantName={verdictModalState.applicantName}
          targetVerdict={verdictModalState.targetVerdict}
          initialRemarks={verdictModalState.initialRemarks}
          onConfirm={(verdict, remarks) => {
            const targetIdx = verdictModalState.applicantIndex;
            setVerdictModalState(null);
            onUpdateApplicantVerdict(targetIdx, verdict, remarks);
          }}
          onCancel={() => setVerdictModalState(null)}
        />
      )}

      {batchModalAction !== null && (
        <BatchConfirmationModal
          visible={batchModalAction !== null}
          actionType={batchModalAction}
          applicantCount={localApplicants.length}
          onConfirm={() => {
            const action = batchModalAction;
            setBatchModalAction(null);
            onBatchAction(action);
          }}
          onCancel={() => setBatchModalAction(null)}
        />
      )}
    </View>
  );
}

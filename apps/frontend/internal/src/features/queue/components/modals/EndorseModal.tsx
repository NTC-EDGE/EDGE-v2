import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  ConfirmationModal,
  useTheme,
  Icon as Lucide,
} from '@edge/ui';
import { apiClient, safeAsync, TenantMemberDto } from '@edge/api';
import { useAuthContext } from '../../../auth/context/AuthContext';

export interface EndorsePerson {
  id: string;
  name: string;
  role: string;
  position?: string;
  department?: string;
  division?: string;
  email?: string;
  fieldOffice?: string;
  avatarColor?: string;
}

export interface EndorsementSubmission {
  person: EndorsePerson;
  notes?: string;
}

interface EndorseModalProps {
  visible: boolean;
  applicantName: string;
  tenantId?: string;
  appliedFieldOffice?: string;
  onConfirm: (submission: EndorsementSubmission) => void;
  onCancel: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'ST';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function normalizeOfficeName(name: string): string {
  return name
    .replace(/^ntc\s*(field\s*office)?\s*[•\-]\s*/i, '')
    .trim()
    .toLowerCase();
}

function matchesFieldOffice(member: TenantMemberDto, targetOffice?: string): boolean {
  if (!targetOffice || targetOffice.trim().length === 0) {
    return true;
  }
  const cleanTarget = normalizeOfficeName(targetOffice);
  if (!cleanTarget) return true;

  const memberOffice = normalizeOfficeName(member.fieldOfficeName ?? '');
  const memberTenant = normalizeOfficeName(member.tenantName ?? '');

  if (!memberOffice) {
    return memberTenant.includes(cleanTarget) || cleanTarget.includes(memberTenant);
  }

  return (
    memberOffice === cleanTarget ||
    memberOffice.includes(cleanTarget) ||
    cleanTarget.includes(memberOffice) ||
    memberTenant.includes(cleanTarget)
  );
}

function mapTenantMemberToPerson(member: TenantMemberDto): EndorsePerson {
  const firstName = member.userFirstName || '';
  const lastName = member.userLastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || member.userEmail || 'NTC Staff';

  return {
    id: member.userId || member.id,
    name: fullName,
    role: member.roleName || 'Evaluator',
    position: member.position || member.jobTitle || undefined,
    department: member.division || undefined,
    division: member.division || undefined,
    email: member.userEmail || undefined,
    fieldOffice: member.fieldOfficeName ?? member.tenantName ?? undefined,
    avatarColor: COLORS.brand.secondary,
  };
}

export function EndorseModal({
  visible,
  applicantName,
  tenantId,
  appliedFieldOffice,
  onConfirm,
  onCancel,
}: EndorseModalProps) {
  const { colors, isDark } = useTheme();
  const { user } = useAuthContext();

  const [members, setMembers] = useState<TenantMemberDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<EndorsePerson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [endorsementNotes, setEndorsementNotes] = useState('');

  // ── Fetch Tenant Members strictly when the modal is opened ───────────────────
  useEffect(() => {
    if (!visible) {
      setMembers([]);
      setSelectedPerson(null);
      setSearchQuery('');
      setEndorsementNotes('');
      return;
    }

    let isCancelled = false;

    const fetchMembers = async () => {
      setIsLoading(true);
      const effectiveTenantId =
        tenantId && tenantId.trim().length > 0
          ? tenantId
          : '00000000-0000-0000-0000-000000000001';

      const [res, err] = await safeAsync(async () => {
        const response = await apiClient.get<TenantMemberDto[]>(
          `/api/v2/tenants/${effectiveTenantId}/members`
        );
        return response.data;
      });

      if (!isCancelled) {
        setIsLoading(false);
        if (err === null && Array.isArray(res)) {
          setMembers(res);
        } else {
          setMembers([]);
        }
      }
    };

    fetchMembers();

    return () => {
      isCancelled = true;
    };
  }, [visible, tenantId]);

  // ── Filter to Tenant Members belonging to the applied Field Office ──────────
  const officePersons = useMemo<EndorsePerson[]>(() => {
    const list: EndorsePerson[] = [];
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();

    const currentEmail = user?.email?.toLowerCase().trim();
    const currentId = user?.id;

    for (const m of members) {
      if (m.isDeleted) continue;

      // Filter by applied field office
      if (!matchesFieldOffice(m, appliedFieldOffice)) continue;

      // Exclude current logged in user
      if (currentId && (m.userId === currentId || m.id === currentId)) continue;
      if (currentEmail && m.userEmail && m.userEmail.toLowerCase().trim() === currentEmail) continue;

      const p = mapTenantMemberToPerson(m);
      if (!seenIds.has(p.id) && (!p.email || !seenEmails.has(p.email.toLowerCase()))) {
        seenIds.add(p.id);
        if (p.email) seenEmails.add(p.email.toLowerCase());
        list.push(p);
      }
    }

    return list;
  }, [members, appliedFieldOffice, user]);

  const filteredPersons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return officePersons;
    return officePersons.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchRole = p.role.toLowerCase().includes(q);
      const matchPosition = p.position ? p.position.toLowerCase().includes(q) : false;
      const matchEmail = p.email ? p.email.toLowerCase().includes(q) : false;
      const matchDept = p.department ? p.department.toLowerCase().includes(q) : false;
      return matchName || matchRole || matchPosition || matchEmail || matchDept;
    });
  }, [officePersons, searchQuery]);

  const canSubmit = selectedPerson !== null;

  const handleConfirm = () => {
    if (selectedPerson !== null) {
      onConfirm({
        person: selectedPerson,
        notes: endorsementNotes.trim() ? endorsementNotes.trim() : undefined,
      });
      setSelectedPerson(null);
      setSearchQuery('');
      setEndorsementNotes('');
    }
  };

  const handleCancel = () => {
    setSelectedPerson(null);
    setSearchQuery('');
    setEndorsementNotes('');
    onCancel();
  };

  const displayOfficeName = appliedFieldOffice?.trim() || 'Applied Field Office';

  return (
    <ConfirmationModal
      visible={visible}
      title="Endorse Application"
      variant="purple"
      maxWidth={540}
      confirmText={selectedPerson !== null ? `Endorse to ${selectedPerson.name}` : 'Select a Person'}
      subtitle={
        <View style={{ alignItems: 'center', marginBottom: SPACING[16] }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 13.5,
              color: isDark ? colors.neutral[400] : COLORS.neutral[500],
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Select a tenant member from{' '}
            <Text
              style={{
                fontWeight: TYPOGRAPHY.weights.semibold,
                color: isDark ? colors.neutral[200] : COLORS.neutral[700],
              }}
            >
              {displayOfficeName}
            </Text>{' '}
            to pass{' '}
            <Text
              style={{
                fontWeight: TYPOGRAPHY.weights.semibold,
                color: isDark ? colors.neutral[200] : COLORS.neutral[700],
              }}
            >
              {applicantName}
            </Text>
            &apos;s application to.
          </Text>
        </View>
      }
      onConfirm={() => {
        if (canSubmit) {
          handleConfirm();
        }
      }}
      onCancel={handleCancel}
    >
      <View style={styles.container}>
        {/* Search Field */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          <Lucide
            name="search"
            size={16}
            color={isDark ? colors.neutral[400] : colors.neutral[500]}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? colors.neutral[100] : colors.neutral[900] },
            ]}
            placeholder="Search tenant member by name, title, division, or email..."
            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Lucide
                name="x"
                size={14}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          )}
        </View>

        {/* Personnel List */}
        <View style={styles.listWrapper}>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={colors.brand[500]} />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Fetching tenant members for {displayOfficeName}...
              </Text>
            </View>
          ) : officePersons.length === 0 ? (
            <View style={styles.emptyState}>
              <Lucide
                name="user-x"
                size={22}
                color={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                No active tenant members found for {displayOfficeName}.
              </Text>
            </View>
          ) : filteredPersons.length === 0 ? (
            <View style={styles.emptyState}>
              <Lucide
                name="user-x"
                size={22}
                color={isDark ? colors.neutral[500] : colors.neutral[400]}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                No matching members found for &quot;{searchQuery}&quot;
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollList}
              contentContainerStyle={styles.scrollContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {filteredPersons.map((person) => {
                const isSelected = selectedPerson?.id === person.id;
                const initials = getInitials(person.name);
                const titleLabel = person.position || person.role || 'Evaluator';

                return (
                  <Pressable
                    key={person.id}
                    style={[
                      styles.personCard,
                      {
                        borderColor: isSelected
                          ? (isDark ? colors.brand[500] : colors.brand[600])
                          : (isDark ? colors.neutral[700] : colors.neutral[200]),
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(168, 85, 247, 0.16)' : '#FAF5FF')
                          : (isDark ? colors.neutral[900] : COLORS.neutral.white),
                      },
                    ]}
                    onPress={() => setSelectedPerson(person)}
                  >
                    {/* Avatar Initials */}
                    <View
                      style={[
                        styles.avatarCircle,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? colors.brand[500] : colors.brand[700])
                            : (isDark ? colors.neutral[800] : '#EFF6FF'),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          {
                            color: isSelected
                              ? COLORS.neutral.white
                              : (isDark ? colors.brand[400] : colors.brand[700]),
                          },
                        ]}
                      >
                        {initials}
                      </Text>
                    </View>

                    {/* Person Information */}
                    <View style={styles.personDetails}>
                      <View style={styles.nameRow}>
                        <Text
                          style={[
                            styles.personName,
                            {
                              color: isSelected
                                ? (isDark ? colors.brand[300] : colors.brand[900])
                                : (isDark ? colors.neutral[100] : colors.neutral[900]),
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {person.name}
                        </Text>
                        <View
                          style={[
                            styles.roleBadge,
                            {
                              backgroundColor: isDark ? colors.neutral[800] : '#F1F5F9',
                              borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleBadgeText,
                              { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                            ]}
                          >
                            {person.role}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.personSubtitle,
                          { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                        ]}
                        numberOfLines={1}
                      >
                        {titleLabel} {person.department ? `• ${person.department}` : ''}
                      </Text>

                      {person.fieldOffice && (
                        <Text
                          style={[
                            styles.personOffice,
                            { color: isDark ? colors.brand[400] : colors.brand[700] },
                          ]}
                          numberOfLines={1}
                        >
                          📍 {person.fieldOffice}
                        </Text>
                      )}

                      {person.email && (
                        <Text
                          style={[
                            styles.personEmail,
                            { color: isDark ? colors.neutral[500] : colors.neutral[400] },
                          ]}
                          numberOfLines={1}
                        >
                          {person.email}
                        </Text>
                      )}
                    </View>

                    {/* Selection Indicator */}
                    <View style={styles.selectionIndicator}>
                      <Lucide
                        name={isSelected ? 'check-circle' : 'circle'}
                        size={18}
                        color={
                          isSelected
                            ? (isDark ? colors.brand[400] : colors.brand[700])
                            : (isDark ? colors.neutral[600] : colors.neutral[300])
                        }
                      />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Endorsement Notes / Instructions */}
        <View style={styles.notesSection}>
          <Text
            style={[
              styles.notesLabel,
              { color: isDark ? colors.neutral[300] : colors.neutral[700] },
            ]}
          >
            Instructions / Handover Remarks (Optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                color: isDark ? colors.neutral[100] : colors.neutral[900],
              },
            ]}
            placeholder="e.g. Please verify frequency coordination and applicant engineering specs..."
            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
            value={endorsementNotes}
            onChangeText={setEndorsementNotes}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>
    </ConfirmationModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: SPACING[12],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: Platform.OS === 'ios' ? SPACING[10] : SPACING[6],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    padding: 0,
  },
  listWrapper: {
    width: '100%',
    minHeight: 140,
    maxHeight: 240,
  },
  scrollList: {
    maxHeight: 240,
  },
  scrollContent: {
    gap: SPACING[8],
    paddingVertical: 2,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    gap: SPACING[10],
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  personDetails: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  personName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  personSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    marginTop: 1,
  },
  personOffice: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
  personEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 1,
  },
  selectionIndicator: {
    paddingLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[24],
    gap: SPACING[8],
  },
  emptyStateText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    textAlign: 'center',
  },
  notesSection: {
    width: '100%',
    gap: 6,
    marginTop: 2,
  },
  notesLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  notesInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    minHeight: 52,
    textAlignVertical: 'top',
  },
});

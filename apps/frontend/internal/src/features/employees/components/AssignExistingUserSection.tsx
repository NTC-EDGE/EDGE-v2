import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { useUsers, useTenantMembers, useAdminRoles, useAdminFieldOffices, tenantMemberService } from '@edge/api';
import { fieldStyles } from '../styles/employeeFieldStyles';

interface AssignExistingUserSectionProps {
  tenantId?: string;
  isMobile: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
}

export function AssignExistingUserSection({
  tenantId,
  isMobile,
  onSuccess,
  onCancel,
  onError,
}: AssignExistingUserSectionProps) {
  const { users, isLoading: isUsersLoading, refetch: refetchUsers } = useUsers({ pageSize: 100 });
  const { members: tenantMembers, isLoading: isMembersLoading, refetch: refetchMembers } = useTenantMembers(tenantId);
  const { roles, isLoading: isRolesLoading } = useAdminRoles(tenantId);
  const { fieldOffices, isLoading: isOfficesLoading } = useAdminFieldOffices(tenantId);

  useEffect(() => {
    void refetchUsers();
    void refetchMembers();
  }, [refetchUsers, refetchMembers]);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedFieldOfficeId, setSelectedFieldOfficeId] = useState<string>('');
  const [division, setDivision] = useState('');
  const [position, setPosition] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [level, setLevel] = useState('');
  const [designation, setDesignation] = useState('');

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isOfficeDropdownOpen, setIsOfficeDropdownOpen] = useState(false);
  const [userSearchText, setUserSearchText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set of user IDs who are already members of this tenant
  const existingMemberUserIds = useMemo(() => {
    return new Set(tenantMembers.map((m) => m.userId));
  }, [tenantMembers]);

  // Filter available users: excludes existing tenant members and applies search query
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    const query = userSearchText.trim().toLowerCase();
    return users
      .filter((u) => !existingMemberUserIds.has(u.id))
      .filter((u) => {
        if (!query) return true;
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      });
  }, [users, existingMemberUserIds, userSearchText]);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) ?? null;
  }, [users, selectedUserId]);

  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) ?? null;
  }, [roles, selectedRoleId]);

  const selectedOffice = useMemo(() => {
    return fieldOffices.find((f) => f.id === selectedFieldOfficeId) ?? null;
  }, [fieldOffices, selectedFieldOfficeId]);

  const handleSubmit = async () => {
    if (!tenantId) {
      onError('Active tenant not found.');
      return;
    }
    if (!selectedUserId) {
      onError('Please select an existing user account.');
      return;
    }
    if (!selectedRoleId) {
      onError('Please select a security role.');
      return;
    }
    if (!division.trim()) {
      onError('Division is required.');
      return;
    }
    if (!position.trim()) {
      onError('Position is required.');
      return;
    }

    setIsSubmitting(true);
    const [res, err] = await tenantMemberService.assignUserToTenant(tenantId, {
      tenantId,
      userId: selectedUserId,
      roleId: selectedRoleId,
      fieldOfficeId: selectedFieldOfficeId || null,
      jobTitle: jobTitle.trim() || null,
      level: level.trim() || null,
      division: division.trim(),
      position: position.trim(),
      designation: designation.trim() || null,
    });

    setIsSubmitting(false);

    if (err !== null || res === null || res === undefined) {
      const message = typeof err === 'string' ? err : 'Failed to assign user to regional office.';
      onError(message);
    } else {
      onSuccess();
    }
  };

  return (
    <ScrollView
      style={assignStyles.scrollBody}
      contentContainerStyle={assignStyles.formContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. User Account Selection */}
      <View
        style={[
          fieldStyles.cardSection,
          { zIndex: isUserDropdownOpen ? 300 : 3, elevation: isUserDropdownOpen ? 30 : 3 },
        ]}
      >
        <View style={fieldStyles.sectionHeaderRow}>
          <Lucide name="user-check" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
          <Text style={fieldStyles.cardSectionTitle}>Select Existing User Account</Text>
        </View>

        <View
          style={[
            fieldStyles.inputGroup,
            { zIndex: isUserDropdownOpen ? 310 : 3, elevation: isUserDropdownOpen ? 35 : 3 },
          ]}
        >
          <Text style={fieldStyles.label}>
            Platform User <Text style={fieldStyles.requiredStar}>*</Text>
          </Text>

          <Pressable
            style={[
              fieldStyles.dropdownTrigger,
              isUserDropdownOpen && fieldStyles.dropdownTriggerActive,
            ]}
            onPress={() => {
              setIsUserDropdownOpen((prev) => !prev);
              setIsRoleDropdownOpen(false);
              setIsOfficeDropdownOpen(false);
            }}
          >
            <View style={fieldStyles.dropdownValueWrapper}>
              <View style={fieldStyles.roleBadgeIcon}>
                <Lucide name="user" size={13} color={COLORS.brand[700]} />
              </View>
              <Text style={fieldStyles.dropdownTriggerText} numberOfLines={1}>
                {selectedUser !== null
                  ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`
                  : 'Search & select existing user account...'}
              </Text>
            </View>
            {isUsersLoading ? (
              <ActivityIndicator size="small" color={COLORS.brand[700]} />
            ) : (
              <Lucide
                name={isUserDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.neutral[500]}
              />
            )}
          </Pressable>

          {isUserDropdownOpen && (
            <View style={[fieldStyles.dropdownMenu, SHADOWS.modal]}>
              <View style={assignStyles.searchBox}>
                <Lucide name="search" size={14} color={COLORS.neutral[400]} style={{ marginRight: 6 }} />
                <TextInput
                  style={assignStyles.searchInput}
                  placeholder="Filter users by name or email..."
                  placeholderTextColor={COLORS.neutral[400]}
                  value={userSearchText}
                  onChangeText={setUserSearchText}
                />
              </View>

              <ScrollView
                style={{ maxHeight: 200, backgroundColor: '#FFFFFF' }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {filteredUsers.length === 0 && !isUsersLoading ? (
                  <View style={{ padding: 14 }}>
                    <Text style={fieldStyles.dropdownOptionText}>No matching users found.</Text>
                  </View>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User';
                    return (
                      <Pressable
                        key={u.id}
                        style={[
                          fieldStyles.dropdownOption,
                          isSelected && fieldStyles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedUserId(u.id);
                          setIsUserDropdownOpen(false);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              fieldStyles.dropdownOptionText,
                              isSelected && fieldStyles.dropdownOptionTextActive,
                            ]}
                          >
                            {fullName}
                          </Text>
                          <Text style={{ fontSize: 11, color: COLORS.neutral[400], marginTop: 2 }}>
                            {u.email}
                          </Text>
                        </View>
                        {isSelected && <Lucide name="check" size={14} color={COLORS.brand[700]} />}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* 2. System Role & Access Level */}
      <View
        style={[
          fieldStyles.cardSection,
          { zIndex: isRoleDropdownOpen ? 200 : 2, elevation: isRoleDropdownOpen ? 25 : 2 },
        ]}
      >
        <View style={fieldStyles.sectionHeaderRow}>
          <Lucide name="shield" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
          <Text style={fieldStyles.cardSectionTitle}>Assigned Role</Text>
        </View>

        <View
          style={[
            fieldStyles.inputGroup,
            { zIndex: isRoleDropdownOpen ? 210 : 2, elevation: isRoleDropdownOpen ? 30 : 2 },
          ]}
        >
          <Text style={fieldStyles.label}>
            Security Role <Text style={fieldStyles.requiredStar}>*</Text>
          </Text>
          <Pressable
            style={[
              fieldStyles.dropdownTrigger,
              isRoleDropdownOpen && fieldStyles.dropdownTriggerActive,
            ]}
            onPress={() => {
              setIsRoleDropdownOpen((prev) => !prev);
              setIsUserDropdownOpen(false);
              setIsOfficeDropdownOpen(false);
            }}
          >
            <View style={fieldStyles.dropdownValueWrapper}>
              <View style={fieldStyles.roleBadgeIcon}>
                <Lucide name="shield" size={13} color={COLORS.brand[700]} />
              </View>
              <Text style={fieldStyles.dropdownTriggerText}>
                {selectedRole !== null ? selectedRole.name : 'Select Role'}
              </Text>
            </View>
            {isRolesLoading ? (
              <ActivityIndicator size="small" color={COLORS.brand[700]} />
            ) : (
              <Lucide
                name={isRoleDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.neutral[500]}
              />
            )}
          </Pressable>

          {isRoleDropdownOpen && (
            <View style={[fieldStyles.dropdownMenu, SHADOWS.modal]}>
              <ScrollView
                style={{ maxHeight: 180, backgroundColor: '#FFFFFF' }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {roles.map((r) => {
                  const isSelected = selectedRoleId === r.id;
                  const isStandard = r.tenantId === null || r.tenantId === undefined || Boolean(r.isSystemRole);
                  return (
                    <Pressable
                      key={r.id}
                      style={[
                        fieldStyles.dropdownOption,
                        isSelected && fieldStyles.dropdownOptionActive,
                        { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
                      ]}
                      onPress={() => {
                        setSelectedRoleId(r.id);
                        setIsRoleDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          fieldStyles.dropdownOptionText,
                          isSelected && fieldStyles.dropdownOptionTextActive,
                        ]}
                      >
                        {r.name}
                      </Text>
                      <View
                        style={[
                          assignStyles.badgePill,
                          { backgroundColor: isStandard ? '#FEF3C7' : '#E0F2FE' },
                        ]}
                      >
                        <Text
                          style={[
                            assignStyles.badgeText,
                            { color: isStandard ? '#92400E' : '#0369A1' },
                          ]}
                        >
                          {isStandard ? 'STANDARD' : 'CUSTOM'}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* 3. Field Office & Assignment Details */}
      <View
        style={[
          fieldStyles.cardSection,
          { zIndex: isOfficeDropdownOpen ? 300 : 1, elevation: isOfficeDropdownOpen ? 25 : 1 },
        ]}
      >
        <View style={fieldStyles.sectionHeaderRow}>
          <Lucide name="briefcase" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
          <Text style={fieldStyles.cardSectionTitle}>Deployment & Workstation</Text>
        </View>

        {/* Field Office Dropdown */}
        <View
          style={[
            fieldStyles.inputGroup,
            { zIndex: isOfficeDropdownOpen ? 350 : 1, elevation: isOfficeDropdownOpen ? 30 : 1 },
          ]}
        >
          <Text style={fieldStyles.label}>Field Office Assignment</Text>
          <Pressable
            style={[
              fieldStyles.dropdownTrigger,
              isOfficeDropdownOpen && fieldStyles.dropdownTriggerActive,
            ]}
            onPress={() => {
              setIsOfficeDropdownOpen((prev) => !prev);
              setIsUserDropdownOpen(false);
              setIsRoleDropdownOpen(false);
            }}
          >
            <Text style={fieldStyles.dropdownTriggerText} numberOfLines={1}>
              {selectedOffice !== null ? selectedOffice.name : 'Select Field Office (Optional)...'}
            </Text>
            {isOfficesLoading ? (
              <ActivityIndicator size="small" color={COLORS.brand[700]} />
            ) : (
              <Lucide
                name={isOfficeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.neutral[500]}
              />
            )}
          </Pressable>

          {isOfficeDropdownOpen && (
            <View style={[fieldStyles.dropdownMenu, SHADOWS.modal]}>
              <ScrollView
                style={{ maxHeight: 180, backgroundColor: '#FFFFFF' }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                <Pressable
                  style={[
                    fieldStyles.dropdownOption,
                    !selectedFieldOfficeId && fieldStyles.dropdownOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedFieldOfficeId('');
                    setIsOfficeDropdownOpen(false);
                  }}
                >
                  <Text style={fieldStyles.dropdownOptionText}>None (Regional Main Office)</Text>
                </Pressable>
                {fieldOffices.map((fo) => (
                  <Pressable
                    key={fo.id}
                    style={[
                      fieldStyles.dropdownOption,
                      selectedFieldOfficeId === fo.id && fieldStyles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedFieldOfficeId(fo.id);
                      setIsOfficeDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        fieldStyles.dropdownOptionText,
                        selectedFieldOfficeId === fo.id && fieldStyles.dropdownOptionTextActive,
                      ]}
                    >
                      {fo.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Division & Position */}
        <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile, { zIndex: 1 }]}>
          <View style={[fieldStyles.inputGroupFlex, { zIndex: 1 }]}>
            <Text style={fieldStyles.label}>
              Division <Text style={fieldStyles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={fieldStyles.input}
              placeholder="e.g. Licensing & Enforcement"
              placeholderTextColor={COLORS.neutral[400]}
              value={division}
              onChangeText={setDivision}
            />
          </View>

          <View style={[fieldStyles.inputGroupFlex, { zIndex: 1 }]}>
            <Text style={fieldStyles.label}>
              Position <Text style={fieldStyles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={fieldStyles.input}
              placeholder="e.g. Engineer II"
              placeholderTextColor={COLORS.neutral[400]}
              value={position}
              onChangeText={setPosition}
            />
          </View>
        </View>

        {/* Title & Level */}
        <View style={[fieldStyles.formGridRow, isMobile && fieldStyles.formGridRowMobile, { zIndex: 1 }]}>
          <View style={[fieldStyles.inputGroupFlex, { zIndex: 1 }]}>
            <Text style={fieldStyles.label}>Job Title</Text>
            <TextInput
              style={fieldStyles.input}
              placeholder="e.g. Senior Evaluator"
              placeholderTextColor={COLORS.neutral[400]}
              value={jobTitle}
              onChangeText={setJobTitle}
            />
          </View>

          <View style={[fieldStyles.inputGroupFlex, { zIndex: 1 }]}>
            <Text style={fieldStyles.label}>Salary Grade Level</Text>
            <TextInput
              style={fieldStyles.input}
              placeholder="e.g. SG-16"
              placeholderTextColor={COLORS.neutral[400]}
              value={level}
              onChangeText={setLevel}
            />
          </View>
        </View>

        {/* Designation */}
        <View style={[fieldStyles.inputGroup, { zIndex: 1 }]}>
          <Text style={fieldStyles.label}>Designation</Text>
          <TextInput
            style={fieldStyles.input}
            placeholder="e.g. Officer-in-Charge"
            placeholderTextColor={COLORS.neutral[400]}
            value={designation}
            onChangeText={setDesignation}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[assignStyles.buttonRow, { zIndex: 1 }]}>
        <Pressable style={assignStyles.cancelBtn} onPress={onCancel} disabled={isSubmitting}>
          <Text style={assignStyles.cancelBtnText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[assignStyles.submitBtn, isSubmitting && assignStyles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : (
            <Lucide name="user-plus" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text style={assignStyles.submitBtnText}>
            {isSubmitting ? 'Assigning...' : 'Assign User as Employee'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const assignStyles = StyleSheet.create({
  scrollBody: {
    maxHeight: 520,
  },
  formContent: {
    padding: SPACING[24],
    gap: SPACING[20],
    paddingBottom: 220,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.neutral[900],
    padding: 0,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[700],
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.neutral[400],
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
});

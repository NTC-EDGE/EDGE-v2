import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { Employee } from '../data/mockEmployees';

interface EmployeeDetailsPageProps {
  employee: Employee;
  onBack: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeDetailsPage({
  employee,
  onBack,
  onEdit,
  onDelete,
}: EmployeeDetailsPageProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const getInitials = (first: string, last: string): string => {
    const f = first.trim().length > 0 ? first.trim().charAt(0) : '';
    const l = last.trim().length > 0 ? last.trim().charAt(0) : '';
    return `${f}${l}`.toUpperCase();
  };

  const initials = getInitials(employee.firstName, employee.lastName);
  const fullName = [
    employee.firstName,
    employee.middleName,
    employee.lastName,
    employee.suffix,
  ]
    .filter((s) => s !== undefined && s !== null && s.trim().length > 0)
    .join(' ');

  return (
    <View style={styles.container}>
      {/* Top Back Navigation Bar & Breadcrumb */}
      <View style={styles.topNavRow}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Lucide name="arrow-left" size={16} color={COLORS.brand[700]} style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>Back to Employee List</Text>
        </Pressable>

        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Admin</Text>
          <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
          <Text style={styles.breadcrumbText}>Dashboard</Text>
          <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
          <Text style={styles.breadcrumbText}>Employee Accounts</Text>
          <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
          <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Employee Details</Text>
        </View>
      </View>

      {/* Main Scrollable Content Page */}
      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Hero Card */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <View style={[styles.heroContent, isMobile && styles.heroContentMobile]}>
            {/* Avatar */}
            <View style={[styles.heroAvatar, { backgroundColor: employee.avatarColor }]}>
              <Text style={styles.heroAvatarText}>{initials}</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.heroInfoSection}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroName}>{fullName}</Text>
              </View>

              <Text style={styles.heroId}>{employee.id}</Text>

              <View style={styles.heroBadgesRow}>
                <View style={styles.heroRoleBadge}>
                  <Lucide name="shield" size={12} color={COLORS.brand[500]} style={{ marginRight: 4 }} />
                  <Text style={styles.heroRoleBadgeText}>{employee.role}</Text>
                </View>

                <Text style={styles.heroBadgeDivider}>•</Text>

                <Text style={styles.heroDeptText}>{employee.department}</Text>
              </View>
            </View>

            {/* Right Action Buttons */}
            <View style={[styles.heroActions, isMobile && styles.heroActionsMobile]}>
              <Pressable style={styles.editBtn} onPress={() => onEdit(employee)}>
                <Lucide name="edit-2" size={15} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </Pressable>

              <Pressable style={styles.deleteBtn} onPress={() => onDelete(employee)}>
                <Lucide name="trash-2" size={15} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Vertical Stack of Full-Width Section Cards */}
        <View style={styles.detailsStack}>
          {/* Section 1: Basic & Personal Information */}
          <View style={[styles.detailSectionCard, SHADOWS.card]}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBadge}>
                <Lucide name="user" size={16} color={COLORS.brand[700]} />
              </View>
              <Text style={styles.sectionTitle}>Basic & Personal Information</Text>
            </View>

            <View style={[styles.fieldsGrid, isMobile && styles.fieldsGridMobile]}>
              <View style={styles.gridColumn}>
                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>First Name:</Text>
                  <Text style={styles.fieldValue}>{employee.firstName}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Middle Name:</Text>
                  <Text style={styles.fieldValue}>
                    {employee.middleName.length > 0 ? employee.middleName : 'N/A'}
                  </Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Last Name:</Text>
                  <Text style={styles.fieldValue}>{employee.lastName}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Suffix:</Text>
                  <Text style={styles.fieldValue}>
                    {employee.suffix.length > 0 ? employee.suffix : 'None'}
                  </Text>
                </View>
              </View>

              <View style={styles.gridColumn}>
                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Email Address:</Text>
                  <Text style={styles.fieldValueAccent}>{employee.email}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Phone Number:</Text>
                  <Text style={styles.fieldValue}>{employee.phone}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Date Onboarded:</Text>
                  <Text style={styles.fieldValue}>{employee.dateJoined}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 2: Organizational Assignment (Below Basic Information) */}
          <View style={[styles.detailSectionCard, SHADOWS.card]}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBadge}>
                <Lucide name="briefcase" size={16} color={COLORS.brand[700]} />
              </View>
              <Text style={styles.sectionTitle}>Organizational Assignment</Text>
            </View>

            <View style={[styles.fieldsGrid, isMobile && styles.fieldsGridMobile]}>
              <View style={styles.gridColumn}>
                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Region:</Text>
                  <Text style={styles.fieldValue}>{employee.region}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Division / Dept:</Text>
                  <Text style={styles.fieldValue}>{employee.division}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>System Role:</Text>
                  <Text style={styles.fieldValueAccent}>{employee.role}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Position Level:</Text>
                  <Text style={styles.fieldValue}>{employee.level}</Text>
                </View>
              </View>

              <View style={styles.gridColumn}>
                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Official Title:</Text>
                  <Text style={styles.fieldValue}>{employee.title}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Position Rank:</Text>
                  <Text style={styles.fieldValue}>{employee.position}</Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Designation:</Text>
                  <Text style={styles.fieldValue}>
                    {employee.designation.length > 0 ? employee.designation : 'N/A'}
                  </Text>
                </View>

                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Station Location:</Text>
                  <Text style={styles.fieldValue}>{employee.location}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 3: Signature & Security Settings (Below Organizational Assignment) */}
          <View style={[styles.detailSectionCard, SHADOWS.card]}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBadge}>
                <Lucide name="edit-3" size={16} color={COLORS.brand[700]} />
              </View>
              <Text style={styles.sectionTitle}>Signature & Security Settings</Text>
            </View>

            <View style={[styles.fieldsGrid, isMobile && styles.fieldsGridMobile]}>
              <View style={styles.gridColumn}>
                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Signature Placement:</Text>
                  <Text style={styles.fieldValue}>
                    {employee.signatureDisplay === 'above'
                      ? 'Signature above employee name'
                      : 'SGD beside employee name'}
                  </Text>
                </View>
              </View>

              <View style={styles.gridColumn}>
                <View style={styles.signaturePreviewBox}>
                  <Lucide name="file-text" size={24} color={COLORS.brand[700]} style={{ marginBottom: 6 }} />
                  <Text style={styles.signaturePreviewTitle}>Digital Signature File</Text>
                  <Text style={styles.signaturePreviewSub}>
                    {employee.signatureUri.length > 0
                      ? `Verified Signature: ${employee.signatureUri}`
                      : 'No signature file uploaded'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 4: Security & Access Log (Below Signature Settings) */}
          <View style={[styles.detailSectionCard, SHADOWS.card]}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconBadge}>
                <Lucide name="shield" size={16} color={COLORS.brand[700]} />
              </View>
              <Text style={styles.sectionTitle}>Security & Access Log</Text>
            </View>

            <View style={[styles.fieldsGrid, isMobile && styles.fieldsGridMobile]}>
              <View style={styles.gridColumn}>
                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Access Credentials:</Text>
                  <Text style={styles.fieldValue}>Internal SSO Verified</Text>
                </View>
              </View>

              <View style={styles.gridColumn}>
                <View style={styles.infoFieldRow}>
                  <Text style={styles.fieldLabel}>Last Audit Verification:</Text>
                  <Text style={styles.fieldValue}>Verified Today (Compliant)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[20],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[16],
    paddingVertical: 9,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breadcrumbDivider: {
    marginHorizontal: 8,
  },
  breadcrumbActive: {
    color: COLORS.brand[700],
  },
  scrollBody: {
    width: '100%',
  },
  scrollContent: {
    gap: SPACING[20],
    paddingBottom: SPACING[40],
  },
  heroCard: {
    backgroundColor: COLORS.brand[900],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.brand[800],
    padding: SPACING[24],
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[20],
  },
  heroContentMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  heroAvatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  heroInfoSection: {
    flex: 1,
    gap: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  heroName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  heroId: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[500],
  },
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  heroRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  heroRoleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  heroBadgeDivider: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  heroDeptText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[200],
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  heroActionsMobile: {
    width: '100%',
    marginTop: SPACING[12],
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[700],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  editBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  deleteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#EF4444',
  },
  detailsStack: {
    flexDirection: 'column',
    gap: SPACING[20],
    width: '100%',
  },
  detailSectionCard: {
    width: '100%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingBottom: SPACING[12],
    gap: SPACING[12],
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  fieldsGrid: {
    flexDirection: 'row',
    gap: SPACING[24],
    width: '100%',
  },
  fieldsGridMobile: {
    flexDirection: 'column',
    gap: SPACING[12],
  },
  gridColumn: {
    flex: 1,
    gap: SPACING[12],
  },
  infoFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  fieldValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
  },
  fieldValueAccent: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  signaturePreviewBox: {
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.button,
    padding: SPACING[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePreviewTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  signaturePreviewSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
});

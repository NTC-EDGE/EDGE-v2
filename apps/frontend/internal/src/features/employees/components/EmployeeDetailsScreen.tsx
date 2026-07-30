import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { Employee } from '../data/mockEmployees';

interface EmployeeDetailsScreenProps {
  employee: Employee;
  onBack: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeDetailsScreen({
  employee,
  onBack,
  onEdit,
  onDelete,
}: EmployeeDetailsScreenProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [isSignaturePreviewOpen, setIsSignaturePreviewOpen] = useState(false);

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
                <Lucide name="trash-2" size={15} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
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
                <Pressable
                  style={styles.signaturePreviewBox}
                  onPress={() => {
                    if (employee.signatureUri && employee.signatureUri.length > 0) {
                      setIsSignaturePreviewOpen(true);
                    }
                  }}
                >
                  <Lucide name="file-text" size={24} color={COLORS.brand[700]} style={{ marginBottom: 6 }} />
                  <Text style={styles.signaturePreviewTitle}>Digital Signature File</Text>
                  <Text style={styles.signaturePreviewSub}>
                    {employee.signatureUri.length > 0
                      ? `Verified Signature: ${employee.signatureUri}`
                      : 'No signature file uploaded'}
                  </Text>
                </Pressable>
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

      {/* Signature Preview Modal */}
      <Modal
        visible={isSignaturePreviewOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSignaturePreviewOpen(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={[styles.previewContainer, SHADOWS.modal]}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Signature Preview</Text>
              <Pressable onPress={() => setIsSignaturePreviewOpen(false)} style={styles.previewCloseBtn}>
                <Lucide name="x" size={20} color={COLORS.neutral[700]} />
              </Pressable>
            </View>

            <View style={styles.previewBody}>
              {/* Mock Signature Canvas Display */}
              <View style={styles.signatureCanvas}>
                <Text style={styles.handwrittenSignature}>
                  {employee.firstName} {employee.lastName}
                </Text>
                <View style={styles.signatureUnderline} />
              </View>

              <View style={styles.fileDetailsRow}>
                <Lucide name="file-text" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
                <Text style={styles.fileNameLabel}>File Name: </Text>
                <Text style={styles.fileNameValue} numberOfLines={1}>
                  {employee.signatureUri}
                </Text>
              </View>
            </View>

            <View style={styles.previewFooter}>
              <Pressable style={styles.previewCloseFooterBtn} onPress={() => setIsSignaturePreviewOpen(false)}>
                <Text style={styles.previewCloseFooterText}>Close Preview</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    color: COLORS.semantic.error,
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
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
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
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  previewContainer: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[20],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    paddingBottom: 12,
  },
  previewTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewBody: {
    alignItems: 'center',
    gap: SPACING[16],
    width: '100%',
  },
  signatureCanvas: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
    position: 'relative',
  },
  handwrittenSignature: {
    fontFamily: Platform.OS === 'web' ? 'cursive' : 'sans-serif',
    fontSize: 32,
    fontWeight: 'normal',
    color: COLORS.brand[900],
    textAlign: 'center',
  },
  signatureUnderline: {
    width: '80%',
    height: 1,
    backgroundColor: COLORS.neutral[300],
    position: 'absolute',
    bottom: 30,
  },
  fileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderRadius: 6,
    width: '100%',
  },
  fileNameLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
  fileNameValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    flex: 1,
  },
  previewFooter: {
    marginTop: SPACING[20],
    alignItems: 'flex-end',
    width: '100%',
  },
  previewCloseFooterBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  previewCloseFooterText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
});

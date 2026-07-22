import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, StatusBadge } from '@edge/ui';
import { Employee } from '../data/mockEmployees';

interface EmployeeDetailModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeDetailModal({
  visible,
  employee,
  onClose,
  onEdit,
  onDelete,
}: EmployeeDetailModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!visible || employee === null || employee === undefined) {
    return null;
  }

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
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isMobile && styles.modalCardMobile, SHADOWS.modal]}>
          {/* Header Banner */}
          <View style={styles.headerBanner}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Lucide name="x" size={18} color={COLORS.neutral.white} />
            </Pressable>

            <View style={styles.profileHeaderContent}>
              <View style={[styles.avatarCircle, { backgroundColor: employee.avatarColor }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>

              <View style={styles.profileHeaderInfo}>
                <View style={styles.nameHeaderRow}>
                  <Text style={styles.fullName}>{fullName}</Text>
                  <StatusBadge status={employee.status} />
                </View>
                <Text style={styles.employeeId}>{employee.id}</Text>
                <View style={styles.roleTagBanner}>
                  <Lucide name="shield" size={12} color={COLORS.brand[500]} style={{ marginRight: 4 }} />
                  <Text style={styles.roleTagBannerText}>{employee.role}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody} contentContainerStyle={styles.bodyContent}>
            {/* Section 1: Organizational Assignment & Region */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Organizational Assignment</Text>

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Lucide name="map" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Region</Text>
                    <Text style={styles.detailValue}>{employee.region}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Lucide name="briefcase" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Division / Department</Text>
                    <Text style={styles.detailValue}>
                      {employee.division ?? employee.department}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Lucide name="award" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Position & Level</Text>
                    <Text style={styles.detailValue}>
                      {employee.position ?? 'Evaluator'} ({employee.level ?? 'Level II'})
                    </Text>
                  </View>
                </View>

                {employee.title !== undefined && employee.title.length > 0 && (
                  <View style={styles.detailItem}>
                    <Lucide name="user-check" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                    <View>
                      <Text style={styles.detailLabel}>Official Title</Text>
                      <Text style={styles.detailValue}>{employee.title}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Section 2: Contact & Personal Credentials */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Contact & Credentials</Text>

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Lucide name="mail" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Official Email</Text>
                    <Text style={styles.detailValue}>{employee.email}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Lucide name="phone" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{employee.phone}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Lucide name="file-text" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Signature Display Setting</Text>
                    <Text style={styles.detailValue}>
                      {employee.signatureDisplay === 'above'
                        ? 'Signature above employee name'
                        : 'SGD beside employee name'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 3: System Access & Audit */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>System Info & Status</Text>

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Lucide name="calendar" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Date Onboarded</Text>
                    <Text style={styles.detailValue}>{employee.dateJoined}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Lucide name="clock" size={16} color={COLORS.brand[700]} style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Last Audit Verification</Text>
                    <Text style={styles.detailValue}>Verified Today (Role Active)</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <Pressable
              style={styles.deleteActionBtn}
              onPress={() => {
                onClose();
                onDelete(employee);
              }}
            >
              <Lucide name="trash-2" size={15} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
              <Text style={styles.deleteActionText}>Delete</Text>
            </Pressable>

            <View style={styles.rightFooterBtns}>
              <Pressable style={styles.closeFooterBtn} onPress={onClose}>
                <Text style={styles.closeFooterText}>Close</Text>
              </Pressable>
              <Pressable
                style={styles.editFooterBtn}
                onPress={() => {
                  onClose();
                  onEdit(employee);
                }}
              >
                <Lucide name="edit-2" size={15} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
                <Text style={styles.editFooterText}>Edit Profile</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    width: '100%',
    maxWidth: 640,
    maxHeight: '92%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  modalCardMobile: {
    maxWidth: '100%',
    maxHeight: '96%',
  },
  headerBanner: {
    backgroundColor: COLORS.brand[900],
    paddingHorizontal: SPACING[24],
    paddingTop: SPACING[20],
    paddingBottom: SPACING[24],
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[20],
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  avatarInitials: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  profileHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  fullName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  employeeId: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.brand[500],
  },
  roleTagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 2,
  },
  roleTagBannerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  modalBody: {
    maxHeight: 460,
  },
  bodyContent: {
    padding: SPACING[24],
    gap: SPACING[16],
  },
  sectionCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING[12],
  },
  detailGrid: {
    gap: SPACING[12],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[12],
  },
  detailIcon: {
    marginTop: 2,
  },
  detailLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  detailValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
    marginTop: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
    backgroundColor: COLORS.semantic.errorBg,
  },
  deleteActionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  rightFooterBtns: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  closeFooterBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 9,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
  },
  closeFooterText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  editFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: 9,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[800],
  },
  editFooterText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, useWindowDimensions, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, Icon as Lucide, AlertToast } from '@edge/ui';
import { Employee } from '../types/employeeTypes';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { EmployeeForm } from '../forms/EmployeeForm';
import { AssignExistingUserSection } from './AssignExistingUserSection';
import { SignatureCameraModal } from './SignatureCameraModal';
import { SignatureUploadModal } from './SignatureUploadModal';
import { modalStyles } from '../styles/employeeModalStyles';

interface EmployeeFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => Promise<void> | void;
  initialEmployee?: Employee | null;
  tenantId?: string;
}

export function EmployeeFormModal({
  visible,
  onClose,
  onSave,
  initialEmployee = null,
  tenantId,
}: EmployeeFormModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [addMode, setAddMode] = useState<'create' | 'assign'>('create');

  const formState = useEmployeeForm({
    visible,
    initialEmployee,
    onSave,
  });

  const {
    form,
    isCameraActive,
    setIsCameraActive,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    errorMessage,
    setErrorMessage,
    handleNativeFileUpload,
    handleCaptureSignature,
    onSubmit,
  } = formState;

  if (!visible) {
    return null;
  }

  const isEditing = initialEmployee !== null && initialEmployee !== undefined;
  const isSubmitting = form.formState.isSubmitting;
  const isFormValid = form.formState.isValid;

  const handleAssignSuccess = async () => {
    await onSave({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View
          style={[
            modalStyles.modalCard,
            isMobile && modalStyles.modalCardMobile,
            SHADOWS.modal,
          ]}
        >
          {/* Top Decorative Header Accent */}
          <View style={modalStyles.headerGradientAccent} />

          {/* Modal Header */}
          <View style={modalStyles.modalHeader}>
            <View style={modalStyles.headerIconContainer}>
              <Lucide
                name={isEditing ? 'user-check' : addMode === 'assign' ? 'user-check' : 'user-plus'}
                size={20}
                color={COLORS.brand[700]}
              />
            </View>
            <View style={modalStyles.headerTitleGroup}>
              <Text style={modalStyles.modalTitle}>
                {isEditing
                  ? 'Edit Employee Account'
                  : addMode === 'assign'
                  ? 'Assign Existing User'
                  : 'Add New Employee'}
              </Text>
              <Text style={modalStyles.modalSubtitle}>
                {isEditing
                  ? 'Update employee record and assigned system permissions.'
                  : addMode === 'assign'
                  ? 'Deploy an existing platform user account as an employee in this regional office.'
                  : 'Create a new employee account and assign system permissions.'}
              </Text>
            </View>

            <Pressable
              style={modalStyles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Close Modal"
            >
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </Pressable>
          </View>

          {/* Mode Switcher Tabs (Only when creating, not editing) */}
          {!isEditing && (
            <View style={tabStyles.tabContainer}>
              <View style={tabStyles.tabPillsRow}>
                <Pressable
                  style={[tabStyles.tabPill, addMode === 'create' && tabStyles.tabPillActive]}
                  onPress={() => setAddMode('create')}
                >
                  <Lucide
                    name="user-plus"
                    size={14}
                    color={addMode === 'create' ? COLORS.brand[700] : COLORS.neutral[500]}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[tabStyles.tabPillText, addMode === 'create' && tabStyles.tabPillTextActive]}>
                    Create New Account
                  </Text>
                </Pressable>

                <Pressable
                  style={[tabStyles.tabPill, addMode === 'assign' && tabStyles.tabPillActive]}
                  onPress={() => setAddMode('assign')}
                >
                  <Lucide
                    name="user-check"
                    size={14}
                    color={addMode === 'assign' ? COLORS.brand[700] : COLORS.neutral[500]}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[tabStyles.tabPillText, addMode === 'assign' && tabStyles.tabPillTextActive]}>
                    Assign Existing User
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Form Inline Error Alert */}
          {errorMessage !== null && (
            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
              <AlertToast
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
                variant="error"
              />
            </View>
          )}

          {/* Form Body: Either Assign Existing User or Full Employee Creation/Edit Form */}
          {!isEditing && addMode === 'assign' ? (
            <AssignExistingUserSection
              tenantId={tenantId}
              isMobile={isMobile}
              onSuccess={handleAssignSuccess}
              onCancel={onClose}
              onError={(msg) => setErrorMessage(msg)}
            />
          ) : (
            <>
              {/* Form Scrollable Body */}
              <EmployeeForm
                formState={formState}
                isMobile={isMobile}
                tenantId={tenantId}
                isEditing={isEditing}
              />

              {/* Modal Sticky Footer Actions */}
              <View style={modalStyles.modalFooter}>
                <Pressable
                  style={modalStyles.cancelBtn}
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    modalStyles.submitBtn,
                    isSubmitting && modalStyles.submitBtnDisabled,
                  ]}
                  onPress={onSubmit}
                  disabled={isSubmitting}
                >
                  <Lucide
                    name={isSubmitting ? 'loader' : 'check'}
                    size={16}
                    color={COLORS.neutral.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={modalStyles.submitBtnText}>
                    {isSubmitting
                      ? 'Saving...'
                      : isEditing
                      ? 'Save Changes'
                      : 'Add Employee'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Camera Capture Sub-Modal */}
      <SignatureCameraModal
        visible={isCameraActive}
        onClose={() => setIsCameraActive(false)}
        onCapture={handleCaptureSignature}
      />

      {/* Signature Upload Dialog Sub-Modal */}
      <SignatureUploadModal
        visible={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onFileUpload={handleNativeFileUpload}
        onOpenCamera={() => {
          setIsUploadDialogOpen(false);
          setIsCameraActive(true);
        }}
      />

      {/* Floating Bottom-Right Toast inside Modal */}
      {errorMessage !== null && (
        <View style={modalStyles.modalToastContainer}>
          <Lucide
            name="alert-circle"
            size={18}
            color={COLORS.semantic.error}
            style={{ marginRight: 8 }}
          />
          <Text style={modalStyles.modalToastText}>{errorMessage}</Text>
          <Pressable onPress={() => setErrorMessage(null)} style={{ marginLeft: 12, padding: 4 }}>
            <Lucide name="x" size={14} color={COLORS.neutral[500]} />
          </Pressable>
        </View>
      )}
    </Modal>
  );
}

const tabStyles = StyleSheet.create({
  tabContainer: {
    paddingHorizontal: SPACING[24],
    paddingTop: SPACING[16],
    paddingBottom: SPACING[4],
  },
  tabPillsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.button,
    padding: 3,
    gap: 4,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.button - 2,
  },
  tabPillActive: {
    backgroundColor: COLORS.neutral.white,
    ...SHADOWS.card,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  tabPillTextActive: {
    color: COLORS.brand[700],
    fontWeight: '700',
  },
});

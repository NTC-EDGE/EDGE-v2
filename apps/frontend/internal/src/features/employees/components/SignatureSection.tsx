import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { COLORS, Icon as Lucide } from '@edge/ui';
import { fieldStyles } from '../styles/employeeFieldStyles';
import { signatureStyles } from '../styles/employeeSignatureStyles';

interface SignatureSectionProps {
  signatureDisplay: 'beside' | 'above';
  onChangeSignatureDisplay: (val: 'beside' | 'above') => void;
  signatureFileName: string | null;
  onOpenUploadDialog: () => void;
  onDeleteSignature: () => void;
}

export function SignatureSection({
  signatureDisplay,
  onChangeSignatureDisplay,
  signatureFileName,
  onOpenUploadDialog,
  onDeleteSignature,
}: SignatureSectionProps) {
  return (
    <View style={fieldStyles.cardSection}>
      <View style={fieldStyles.sectionHeaderRow}>
        <Lucide
          name="edit-3"
          size={16}
          color={COLORS.brand[700]}
          style={{ marginRight: 8 }}
        />
        <Text style={fieldStyles.cardSectionTitle}>
          Signature Display & Authentication
        </Text>
      </View>

      <View style={signatureStyles.signatureRadioGrid}>
        <Pressable
          style={[
            signatureStyles.radioCard,
            signatureDisplay === 'beside' && signatureStyles.radioCardActive,
          ]}
          onPress={() => onChangeSignatureDisplay('beside')}
        >
          <View
            style={[
              signatureStyles.radioOuterCircle,
              signatureDisplay === 'beside' && signatureStyles.radioOuterCircleActive,
            ]}
          >
            {signatureDisplay === 'beside' && (
              <View style={signatureStyles.radioInnerCircle} />
            )}
          </View>
          <View style={signatureStyles.radioTextWrapper}>
            <Text style={signatureStyles.radioTitle}>SGD Beside Name</Text>
            <Text style={signatureStyles.radioSubtitle}>
              Display SGD tag next to full name
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[
            signatureStyles.radioCard,
            signatureDisplay === 'above' && signatureStyles.radioCardActive,
          ]}
          onPress={() => onChangeSignatureDisplay('above')}
        >
          <View
            style={[
              signatureStyles.radioOuterCircle,
              signatureDisplay === 'above' && signatureStyles.radioOuterCircleActive,
            ]}
          >
            {signatureDisplay === 'above' && (
              <View style={signatureStyles.radioInnerCircle} />
            )}
          </View>
          <View style={signatureStyles.radioTextWrapper}>
            <Text style={signatureStyles.radioTitle}>Signature Above Name</Text>
            <Text style={signatureStyles.radioSubtitle}>
              Display signature image above name line
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Upload or Preview Box */}
      {signatureFileName !== null ? (
        <View style={signatureStyles.uploadedFileContainer}>
          <View style={signatureStyles.uploadedFileInfo}>
            <Lucide
              name="image"
              size={20}
              color={COLORS.brand[700]}
              style={{ marginRight: 10 }}
            />
            <View>
              <Text style={signatureStyles.uploadedFileName} numberOfLines={1}>
                {signatureFileName}
              </Text>
              <Text style={signatureStyles.uploadedFileSize}>
                Verified & loaded successfully
              </Text>
            </View>
          </View>

          <View style={signatureStyles.uploadedFileActions}>
            <Pressable style={signatureStyles.replaceBtn} onPress={onOpenUploadDialog}>
              <Lucide
                name="refresh-cw"
                size={13}
                color={COLORS.brand[700]}
                style={{ marginRight: 6 }}
              />
              <Text style={signatureStyles.replaceBtnText}>Replace</Text>
            </Pressable>

            <Pressable style={signatureStyles.deleteFileBtn} onPress={onDeleteSignature}>
              <Lucide
                name="trash-2"
                size={13}
                color={COLORS.semantic.error}
                style={{ marginRight: 6 }}
              />
              <Text style={signatureStyles.deleteFileBtnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={signatureStyles.uploadPlaceholderCard}
          onPress={onOpenUploadDialog}
        >
          <Lucide
            name="upload-cloud"
            size={28}
            color={COLORS.brand[700]}
            style={{ marginBottom: 8 }}
          />
          <Text style={signatureStyles.uploadPlaceholderText}>
            Upload or Capture Signature
          </Text>
          <Text style={signatureStyles.uploadPlaceholderSubtext}>
            Click to add digital signature file
          </Text>
        </Pressable>
      )}
    </View>
  );
}

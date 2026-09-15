import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';
import { NTCService } from '../../../data/servicesData';
import { GeneralApplicantData, ServiceRequirementItem } from '../../hooks/useGeneralServiceWizard';
import { isPreviewFileObject, SectionCard, PreviewFileTarget } from '../../../../../shared/formPreview';
import { getRequirementLabel } from './generalReviewFormatters';

interface UploadedDocumentsReviewCardProps {
  activeApplicant: GeneralApplicantData;
  variantRequirements?: Array<ServiceRequirementItem | string>;
  service: NTCService;
  onPreviewFile: (file: PreviewFileTarget, label: string) => void;
}

function checkFileAvailable(file: unknown): boolean {
  if (file === null || file === undefined) return false;
  if (typeof file === 'string') {
    const trimmed = file.trim().toLowerCase();
    return trimmed !== '' && trimmed !== 'none' && trimmed !== 'null' && trimmed !== 'undefined';
  }
  if (isPreviewFileObject(file)) {
    const hasName = typeof file.name === 'string' && file.name.trim() !== '' && file.name.trim().toLowerCase() !== 'none';
    const hasUri = typeof file.uri === 'string' && file.uri.trim() !== '' && file.uri.trim().toLowerCase() !== 'none';
    return hasName || hasUri;
  }
  return false;
}

export function UploadedDocumentsReviewCard({
  activeApplicant,
  variantRequirements = [],
  service,
  onPreviewFile,
}: UploadedDocumentsReviewCardProps) {
  const uploadedEntries = Object.entries(activeApplicant.uploads || {});
  const uploadCount = uploadedEntries.length;
  const availableCount = uploadedEntries.filter(([, file]) => checkFileAvailable(file)).length;
  const unavailableCount = uploadCount - availableCount;

  return (
    <SectionCard icon="paperclip" title="Uploaded Supporting Documents" accentColor="#059669">
      {uploadCount === 0 ? (
        <View
          style={{
            backgroundColor: '#FEF9C3',
            borderColor: '#FDE047',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="alert-triangle" size={14} color="#92400E" />
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              color: '#92400E',
              flex: 1,
            }}
          >
            No documents attached. Please upload the required attachments before submitting.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {uploadedEntries.map(([key, file], idx) => {
            const fileName =
              typeof file === 'string'
                ? file
                : isPreviewFileObject(file)
                ? file.name
                : 'Document';

            const requirementLabel = getRequirementLabel(key, variantRequirements, service);

            const previewTarget: PreviewFileTarget =
              typeof file === 'string'
                ? file
                : isPreviewFileObject(file)
                ? file
                : null;

            const hasFile = checkFileAvailable(file);

            return (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: hasFile ? '#F0FDF4' : '#FFFDF5',
                  borderWidth: 1,
                  borderColor: hasFile ? '#BBF7D0' : '#FED7AA',
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: hasFile ? '#DCFCE7' : '#FFEDD5',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      fontWeight: '800',
                      color: hasFile ? '#166534' : '#9A3412',
                    }}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 12,
                      fontWeight: '700',
                      color: hasFile ? '#166534' : '#9A3412',
                    }}
                    numberOfLines={1}
                  >
                    {fileName}
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      color: hasFile ? '#15803D' : '#C2410C',
                      marginTop: 2,
                      lineHeight: 15,
                    }}
                  >
                    {requirementLabel}
                  </Text>
                </View>

                {hasFile ? (
                  <>
                    <Icon name="check-circle" size={16} color="#16A34A" />
                    <TouchableOpacity
                      onPress={() => onPreviewFile(previewTarget, requirementLabel)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#EFF6FF',
                        borderWidth: 1,
                        borderColor: '#BFDBFE',
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        marginLeft: 4,
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon name="eye" size={13} color="#1D4ED8" style={{ marginRight: 4 }} />
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
                        View
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FEF2F2',
                      borderWidth: 1,
                      borderColor: '#FECACA',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 6,
                      gap: 4,
                    }}
                  >
                    <Icon name="alert-circle" size={12} color="#DC2626" />
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 11,
                        fontWeight: '700',
                        color: '#DC2626',
                      }}
                    >
                      Requirement not available
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            <View
              style={{
                backgroundColor: unavailableCount === 0 ? '#DCFCE7' : '#FEF3C7',
                borderColor: unavailableCount === 0 ? '#86EFAC' : '#FDE047',
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="paperclip" size={11} color={unavailableCount === 0 ? '#166534' : '#92400E'} />
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 11,
                  fontWeight: '700',
                  color: unavailableCount === 0 ? '#166534' : '#92400E',
                }}
              >
                {unavailableCount === 0
                  ? `${uploadCount} document${uploadCount !== 1 ? 's' : ''} attached & verified`
                  : `${availableCount} attached · ${unavailableCount} not available`}
              </Text>
            </View>
          </View>
        </View>
      )}
    </SectionCard>
  );
}

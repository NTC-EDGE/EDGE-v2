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

export function UploadedDocumentsReviewCard({
  activeApplicant,
  variantRequirements = [],
  service,
  onPreviewFile,
}: UploadedDocumentsReviewCardProps) {
  const uploadedEntries = Object.entries(activeApplicant.uploads || {});
  const uploadCount = uploadedEntries.length;

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

            return (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: '#DCFCE7',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      fontWeight: '800',
                      color: '#166534',
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
                      color: '#166534',
                    }}
                    numberOfLines={1}
                  >
                    {fileName}
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11,
                      color: '#15803D',
                      marginTop: 2,
                      lineHeight: 15,
                    }}
                  >
                    {requirementLabel}
                  </Text>
                </View>
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
                backgroundColor: '#DCFCE7',
                borderColor: '#86EFAC',
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="paperclip" size={11} color="#166534" />
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#166534',
                }}
              >
                {uploadCount} document{uploadCount !== 1 ? 's' : ''} attached & verified
              </Text>
            </View>
          </View>
        </View>
      )}
    </SectionCard>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { useTheme, COLORS, Icon as Lucide, toast } from "@edge/ui";
import {
  applicationService,
  storageService,
  ApplicantRequirementItemDto,
  mutateApplications,
  resolveEffectiveTenantId,
} from "@edge/api";
import { DocumentPreviewFile } from "../../../../shared/components/DocumentPreviewModal";
import { ApplicantItem, ApplicationData } from "../../../../types/application";
import { isAllowedRequirementFileType } from "../../../../utils/fileValidation";
import { SectionHeader } from "./reviewComponents";
import { reviewStyles as styles } from "./reviewStyles";

export interface ApplicantRequirementsSectionProps {
  app: ApplicationData;
  activeApplicant?: ApplicantItem;
  isEditable: boolean;
  onPreviewFile?: (file: DocumentPreviewFile | string, label?: string) => void;
}

export function ApplicantRequirementsSection({
  app,
  activeApplicant,
  isEditable,
  onPreviewFile,
}: ApplicantRequirementsSectionProps) {
  const { colors, isDark } = useTheme();
  const [requirements, setRequirements] = useState<ApplicantRequirementItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadingReqId, setUploadingReqId] = useState<string | null>(null);
  const [previewLoadingReqId, setPreviewLoadingReqId] = useState<string | null>(null);
  const [activeReqMenuId, setActiveReqMenuId] = useState<string | null>(null);

  const fetchRequirements = useCallback(async () => {
    if (!app?.id || !activeApplicant?.id) return;
    setIsLoading(true);
    const [res] = await applicationService.getApplicantRequirements(app.id, activeApplicant.id);
    setIsLoading(false);
    if (res?.data) {
      setRequirements(res.data);
    }
  }, [app?.id, activeApplicant?.id]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  useEffect(() => {
    setActiveReqMenuId(null);
  }, [activeApplicant?.id]);

  const uploadAndAttach = async (
    fileData: Blob | File,
    fileName: string,
    reqItem: ApplicantRequirementItemDto
  ) => {
    if (!app?.id || !activeApplicant?.id) return;
    const tenantId = app.tenantId;
    if (!tenantId?.trim()) {
      toast.error('Tenant ID is missing on current application context.');
      return;
    }

    setUploadingReqId(reqItem.requirementId);
    try {
      const [storageRes, storageErr] = await storageService.uploadFile(
        fileData,
        fileName,
        'requirements',
        tenantId
      );

      if (storageErr !== null || !storageRes?.data) {
        toast.error('Failed to upload document to storage.');
        return;
      }

      const storedFileId = storageRes.data.id;
      const [reqRes, reqErr] = await applicationService.uploadApplicantRequirement(
        app.id,
        activeApplicant.id,
        {
          requirementId: reqItem.requirementId,
          serviceVariantRequirementId: reqItem.serviceVariantRequirementId ?? undefined,
          storedFileId: storedFileId,
        }
      );

      if (reqErr !== null || !reqRes?.succeeded) {
        toast.error('Failed to save requirement attachment.');
        return;
      }

      toast.success('Requirement document attached successfully.');
      await fetchRequirements();
      if (typeof app.id === 'string') {
        await mutateApplications(app.id);
      }
    } catch {
      toast.error('An error occurred during file upload.');
    } finally {
      setUploadingReqId(null);
    }
  };

  const handleUploadOrReplace = async (reqItem: ApplicantRequirementItemDto) => {
    if (!app?.id || !activeApplicant?.id) return;

    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,application/pdf';

      input.onchange = async (e: Event) => {
        try {
          const target = e.target;
          if (!(target instanceof HTMLInputElement)) return;
          const files = target.files;
          if (!files || files.length === 0) return;
          const selectedFile = files[0];
          if (!selectedFile) return;

          if (!isAllowedRequirementFileType(selectedFile?.name, selectedFile?.type)) {
            toast.error('Only image files and PDF documents are allowed.');
            return;
          }
          await uploadAndAttach(selectedFile, selectedFile?.name || 'attachment', reqItem);
        } finally {
          if (typeof document !== 'undefined' && document.body && document.body.contains(input)) {
            document.body.removeChild(input);
          }
        }
      };

      if (typeof document !== 'undefined' && document.body) {
        document.body.appendChild(input);
      }
      input.click();
    }
  };

  const handlePreview = async (reqItem: ApplicantRequirementItemDto) => {
    const tenantId = resolveEffectiveTenantId(app.tenantId, app.address?.region) || undefined;

    let fileUrl = '';
    if (typeof reqItem.storedFileId === 'string' && reqItem.storedFileId.trim() !== '' && reqItem.storedFileId !== 'null') {
      fileUrl = storageService.getFileDownloadUrl(reqItem.storedFileId, tenantId);
    } else if (typeof reqItem.url === 'string' && reqItem.url.trim() !== '' && reqItem.url !== 'null') {
      fileUrl = reqItem.url.trim();
    }

    const fileName = reqItem.fileName || reqItem.requirementName || 'Requirement Document';
    const isPdf = Boolean(reqItem.contentType?.includes('pdf') || fileName.toLowerCase().endsWith('.pdf'));

    const docObj: DocumentPreviewFile = {
      uri: fileUrl,
      name: fileName,
      category: reqItem.requirementName,
      type: isPdf ? 'PDF' : 'IMAGE',
      referenceNumber: app.referenceNumber || 'NTC-REQ',
      serviceName: app.serviceName || app.permitTitle || 'Licensing Service',
      applicantName: activeApplicant?.name || app.applicant,
      uploadedAt: reqItem.uploadedAt ?? undefined,
    };

    if (fileUrl !== '') {
      setPreviewLoadingReqId(reqItem.requirementId);
      try {
        const [blobData, blobErr] = await storageService.downloadFileByUrl(fileUrl);
        if (blobErr === null && blobData instanceof Blob) {
          const objectUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
            ? URL.createObjectURL(blobData)
            : fileUrl;
          onPreviewFile?.({ ...docObj, uri: objectUrl }, reqItem.requirementName);
        } else {
          onPreviewFile?.(docObj, reqItem.requirementName);
        }
      } catch {
        onPreviewFile?.(docObj, reqItem.requirementName);
      } finally {
        setPreviewLoadingReqId(null);
      }
    }
  };

  return (
    <>
      <SectionHeader title={`REQUIREMENTS CHECKLIST (${requirements.length})`} />
      <View style={styles.infoBlock}>
        {requirements.length === 0 ? (
          <View style={styles.emptyReqs}>
            <Lucide name="folder" size={24} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
            <Text style={[styles.emptyReqsText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {isLoading ? "Loading requirements..." : "No specific requirements registered."}
            </Text>
          </View>
        ) : (
          requirements.map((reqItem) => {
            const isAttached = Boolean(reqItem.fileName || reqItem.storedFileId);
            const isUploading = uploadingReqId === reqItem.requirementId;
            const isPreviewLoading = previewLoadingReqId === reqItem.requirementId;
            const isMenuOpen = activeReqMenuId === reqItem.requirementId;

            return (
              <View key={reqItem.requirementId} style={[styles.reqItem, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[styles.reqLabel, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>
                    {reqItem.requirementName}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: isAttached ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7') : (isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3') }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: isAttached ? '#22C55E' : (isDark ? '#EAB308' : '#CA8A04') }}>
                        {isAttached ? 'ATTACHED' : 'PENDING'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.reqFileRow, { position: 'relative', zIndex: isMenuOpen ? 100 : 1 }]}>
                  <Lucide name={reqItem.contentType?.includes('pdf') || reqItem.fileName?.endsWith('.pdf') ? 'file-text' : 'image'} size={14} color={isDark ? colors.brand[400] : colors.brand[700]} />
                  <Text style={[styles.reqFilename, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]} numberOfLines={1}>
                    {reqItem.fileName || 'No document file attached'}
                  </Text>
                  {isAttached && (
                    <Pressable disabled={isPreviewLoading} onPress={() => handlePreview(reqItem)}>
                      <Text style={[styles.reqViewLink, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                        {isPreviewLoading ? 'Loading...' : 'View'}
                      </Text>
                    </Pressable>
                  )}
                  {isEditable && (
                    <Pressable disabled={isUploading} onPress={() => handleUploadOrReplace(reqItem)}>
                      <Text style={[styles.reqViewLink, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                        {isUploading ? 'Uploading...' : isAttached ? 'Replace' : 'Upload'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </>
  );
}

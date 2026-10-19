import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { applicationService } from '@edge/api';
import { Application } from '../../../data/applicationsData';
import { ClientReportTab, PreviewViewFormat } from './clientSoaOpPreviewTypes';
import {
  getPreviewApplicationMetadata,
  handlePrintDocument,
  handleDownloadSpecificDocument,
} from './clientSoaOpPreviewHelpers';

export function useClientSoaOpPreview(
  app: Application,
  visible: boolean,
  initialTab: ClientReportTab = 'soa'
) {
  const [activeTab, setActiveTab] = useState<ClientReportTab>(initialTab);
  const [viewFormat, setViewFormat] = useState<PreviewViewFormat>('pdf');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);

  const meta = getPreviewApplicationMetadata(app);
  const [selectedOrNumber, setSelectedOrNumber] = useState<string | null>(null);
  const effectiveSelectedOr = selectedOrNumber !== null && meta.orList.includes(selectedOrNumber)
    ? selectedOrNumber
    : (meta.orList.length > 0 ? meta.orList[0] : null);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setViewFormat('pdf');
      setShowActionMenu(false);
      setSelectedOrNumber(meta.orList.length > 0 ? meta.orList[0] : null);
    }
  }, [visible, initialTab]);

  useEffect(() => {
    if (!showActionMenu) return;
    const handleOutsideClick = () => setShowActionMenu(false);
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('blur', handleOutsideClick);
      }, 50);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('blur', handleOutsideClick);
      };
    }
  }, [showActionMenu]);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (Platform.OS === 'web' && viewFormat === 'pdf' && typeof app.id === 'string' && app.id.trim().length > 0) {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      const loadBlob = async () => {
        try {
          const selectedOr = effectiveSelectedOr !== null ? effectiveSelectedOr : undefined;
          const [blob, err] = activeTab === 'soa'
            ? await applicationService.previewSoaPdf(app.id)
            : activeTab === 'op'
              ? await applicationService.previewOpPdf(app.id)
              : await applicationService.previewOrPdf(app.id, selectedOr);

          if (!active) return;
          if (err !== null || blob === null) {
            const errDetail = typeof err === 'string' && err.trim().length > 0
              ? err
              : `Unable to load official ${activeTab.toUpperCase()} PDF template.`;
            setPdfError(errDetail);
            setIsLoadingPdf(false);
            return;
          }

          if (typeof window !== 'undefined') {
            createdUrl = window.URL.createObjectURL(blob);
            setPdfBlobUrl(createdUrl);
            setIsLoadingPdf(false);
          }
        } catch (fetchErr: unknown) {
          if (!active) return;
          const msg = fetchErr instanceof Error ? fetchErr.message : 'Error loading official PDF';
          setPdfError(msg);
          setIsLoadingPdf(false);
        }
      };

      void loadBlob();
    } else {
      setIsLoadingPdf(false);
      setPdfError(null);
    }

    return () => {
      active = false;
      if (createdUrl !== null && typeof window !== 'undefined') {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [app.id, activeTab, viewFormat, reloadKey, effectiveSelectedOr]);

  const handlePrint = () => {
    void handlePrintDocument(app, activeTab, effectiveSelectedOr);
  };

  const handleDownloadDoc = (targetDoc: ClientReportTab, targetOrNumber?: string) => {
    handleDownloadSpecificDocument(app, targetDoc, targetOrNumber, effectiveSelectedOr);
  };

  const handleReload = () => setReloadKey((k) => k + 1);

  return {
    ...meta,
    activeTab,
    setActiveTab,
    viewFormat,
    setViewFormat,
    pdfBlobUrl,
    isLoadingPdf,
    pdfError,
    showActionMenu,
    setShowActionMenu,
    effectiveSelectedOr,
    selectedOrNumber,
    setSelectedOrNumber,
    handlePrint,
    handleDownloadDoc,
    handleReload,
  };
}

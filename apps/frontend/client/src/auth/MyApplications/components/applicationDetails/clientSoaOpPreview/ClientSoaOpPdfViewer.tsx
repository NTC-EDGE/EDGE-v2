import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@edge/ui';
import { ClientSoaOpPdfViewerProps } from './clientSoaOpPreviewTypes';
import { pdfStyles } from './styles/clientSoaOpPdfStyles';

export function ClientSoaOpPdfViewer({
  activeTab,
  isLoadingPdf,
  pdfError,
  pdfBlobUrl,
  onRetry,
  onSwitchToGrid,
}: ClientSoaOpPdfViewerProps) {
  const loadingDocTitle = activeTab === 'soa'
    ? 'Statement of Account'
    : activeTab === 'op'
    ? 'Order of Payment'
    : 'Official Receipt';

  const iframeTitle = activeTab === 'soa'
    ? 'Official Statement of Account PDF'
    : activeTab === 'op'
    ? 'Official Order of Payment PDF'
    : 'Official Receipt PDF';

  if (isLoadingPdf) {
    return (
      <View style={pdfStyles.pdfContainer}>
        <View style={pdfStyles.pdfLoadingBox}>
          <Icon
            name={activeTab === 'or' ? 'check-circle' : 'file-text'}
            size={32}
            color={activeTab === 'or' ? '#059669' : '#0284C7'}
          />
          <Text style={pdfStyles.pdfLoadingText}>
            Loading official {loadingDocTitle} PDF template...
          </Text>
        </View>
      </View>
    );
  }

  if (pdfError !== null) {
    return (
      <View style={pdfStyles.pdfContainer}>
        <View style={pdfStyles.pdfErrorBox}>
          <Icon name="alert-circle" size={32} color="#DC2626" />
          <Text style={pdfStyles.pdfErrorText}>{pdfError}</Text>
          <View style={pdfStyles.pdfErrorActions}>
            <TouchableOpacity style={pdfStyles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
              <Icon name="refresh-cw" size={14} color="#FFFFFF" />
              <Text style={pdfStyles.retryBtnText}>Retry Loading</Text>
            </TouchableOpacity>
            <TouchableOpacity style={pdfStyles.switchGridBtn} onPress={onSwitchToGrid} activeOpacity={0.8}>
              <Text style={pdfStyles.switchGridBtnText}>Switch to Data View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (pdfBlobUrl !== null) {
    return (
      <View style={pdfStyles.pdfContainer}>
        {React.createElement('iframe', {
          src: pdfBlobUrl,
          style: { width: '100%', height: '100%', minHeight: '680px', border: 'none', borderRadius: '8px' },
          title: iframeTitle,
        })}
      </View>
    );
  }

  return null;
}

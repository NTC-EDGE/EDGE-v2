import React from 'react';
import { View, Text } from 'react-native';
import { ClientReportTab } from './clientSoaOpPreviewTypes';
import { modalStyles } from './styles/clientSoaOpModalStyles';

interface Props {
  officeName: string;
  activeTab: ClientReportTab;
}

export function ClientSoaOpPaperHeader({ officeName, activeTab }: Props) {
  const officeColor = activeTab === 'or'
    ? { color: '#059669' }
    : activeTab === 'op'
    ? { color: '#047857' }
    : { color: '#0284C7' };

  return (
    <View style={modalStyles.republicHeader}>
      <Text style={modalStyles.republicTitle}>Republic of the Philippines</Text>
      <Text style={modalStyles.agencyTitle}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
      <Text style={[modalStyles.officeTitle, officeColor]}>{officeName}</Text>
    </View>
  );
}

import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Icon } from '@edge/ui';
import { formatCurrency } from '../../../utils/clientSoaReportGenerator';
import { ClientOrDataViewProps } from './clientSoaOpPreviewTypes';
import { dataViewStyles } from './styles/clientSoaOpDataViewStyles';
import { tableStyles } from './styles/clientSoaOpTableStyles';
import { signatoryStyles } from './styles/clientSoaOpSignatoryStyles';

export function ClientOrDataView({
  app,
  refNum,
  opNum,
  orNum,
  effectiveSelectedOr,
  applicantName,
  formattedAddr,
  officeName,
  paidAmount,
  paidDateFormatted,
  wordsPaid,
  lineItems,
  isDesktop,
}: ClientOrDataViewProps) {
  const displayOrDocNum = effectiveSelectedOr !== null
    ? (effectiveSelectedOr.startsWith('#') ? effectiveSelectedOr : `#${effectiveSelectedOr}`)
    : (orNum !== null ? orNum : `OR-${refNum}`);

  const acknowledgedOrNum = effectiveSelectedOr !== null
    ? (effectiveSelectedOr.startsWith('#') ? effectiveSelectedOr : `#${effectiveSelectedOr}`)
    : `#${orNum !== null ? orNum : refNum}`;

  return (
    <View>
      <View style={dataViewStyles.orBanner}>
        <View>
          <Text style={dataViewStyles.bannerTitle}>OFFICIAL RECEIPT (OR)</Text>
          <Text style={dataViewStyles.bannerSubtitle}>Accountable Form No. 51 (Revised 2006)</Text>
        </View>
        <View style={dataViewStyles.bannerRight}>
          <Text style={[dataViewStyles.bannerDocNum, { color: '#34D399' }]}>{displayOrDocNum}</Text>
          <Text style={dataViewStyles.bannerDate}>Date Issued: {paidDateFormatted}</Text>
        </View>
      </View>

      <View style={[dataViewStyles.infoGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        <View style={[dataViewStyles.infoCard, { flex: 1 }]}>
          <Text style={[dataViewStyles.infoCardTitle, { color: '#059669' }]}>Payor Information</Text>
          <Text style={dataViewStyles.infoCardName}>{applicantName}</Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Address:</Text> {formattedAddr}
          </Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Order of Payment:</Text> {opNum} •{' '}
            <Text style={dataViewStyles.boldText}>App Ref:</Text> #{refNum}
          </Text>
        </View>

        <View style={[dataViewStyles.infoCard, { flex: 1 }]}>
          <Text style={[dataViewStyles.infoCardTitle, { color: '#059669' }]}>Payment Details</Text>
          <Text style={dataViewStyles.infoCardName}>Total Paid: {formatCurrency(paidAmount)}</Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Mode of Payment:</Text>{' '}
            {app.op?.paymentMethod || 'Cash / Electronic Payment'}
          </Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Issuing Office:</Text> {officeName}
          </Text>
        </View>
      </View>

      <View style={tableStyles.dataTable}>
        <View style={[tableStyles.tableHeader, { backgroundColor: '#ECFDF5', borderBottomColor: '#A7F3D0' }]}>
          <Text style={[tableStyles.thCell, { flex: 3, color: '#065F46' }]}>NATURE OF COLLECTION</Text>
          <Text style={[tableStyles.thCell, { width: 140, textAlign: 'center', color: '#065F46' }]}>FUND / CODE</Text>
          <Text style={[tableStyles.thCell, { width: 140, textAlign: 'right', color: '#065F46' }]}>AMOUNT (PHP)</Text>
        </View>

        {lineItems.map((item, idx) => {
          const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
          const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
          const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;

          return (
            <View key={item.id || idx} style={[tableStyles.tableRow, idx % 2 === 1 && tableStyles.tableRowEven]}>
              <View style={{ flex: 3 }}>
                <Text style={tableStyles.tdParticularName}>{item.particular}</Text>
              </View>
              <Text style={[tableStyles.tdCell, { width: 140, textAlign: 'center', fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }) }]}>
                {item.itemCode || 'NTC-FEE'}
              </Text>
              <Text style={[tableStyles.tdCell, { width: 140, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                {formatCurrency(amount).replace('PHP ', '')}
              </Text>
            </View>
          );
        })}

        <View style={[tableStyles.opTotalRow, { backgroundColor: '#F0FDF4', borderTopColor: '#BBF7D0' }]}>
          <Text style={[tableStyles.opTotalLabel, { color: '#065F46' }]}>TOTAL AMOUNT (in Figures):</Text>
          <Text style={[tableStyles.opTotalAmount, { color: '#059669' }]}>{formatCurrency(paidAmount)}</Text>
        </View>
      </View>

      <View style={[dataViewStyles.opStatusCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Text style={[dataViewStyles.opStatusLabel, { color: '#065F46' }]}>AMOUNT IN WORDS:</Text>
        <Text style={[dataViewStyles.opStatusWords, { color: '#047857' }]}>{wordsPaid}</Text>
        <View style={dataViewStyles.opPaymentStatusBadgeRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="check-circle" size={14} color="#059669" />
            <Text style={[dataViewStyles.opPaymentStatusText, { color: '#065F46', fontWeight: '700' }]}>
              OFFICIALLY PAID &amp; ACKNOWLEDGED • OR {acknowledgedOrNum}
            </Text>
          </View>
        </View>
      </View>

      <View style={[signatoryStyles.signatoriesRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 20 }]}>
        <View style={signatoryStyles.sigBlock}>
          <View style={{ width: 180, borderBottomWidth: 1, borderBottomColor: '#0F172A', marginBottom: 6 }} />
          <Text style={signatoryStyles.sigName}>SPECIAL COLLECTING OFFICER</Text>
          <Text style={signatoryStyles.sigRole}>Authorized Cashier / Collecting Officer</Text>
        </View>
      </View>
    </View>
  );
}

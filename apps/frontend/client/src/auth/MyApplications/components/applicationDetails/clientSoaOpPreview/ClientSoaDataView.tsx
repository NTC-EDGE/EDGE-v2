import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '../../../utils/clientSoaReportGenerator';
import { ClientSoaDataViewProps } from './clientSoaOpPreviewTypes';
import { dataViewStyles } from './styles/clientSoaOpDataViewStyles';
import { tableStyles } from './styles/clientSoaOpTableStyles';
import { signatoryStyles } from './styles/clientSoaOpSignatoryStyles';

export function ClientSoaDataView({
  app,
  soaNum,
  applicantName,
  applicantType,
  contactNum,
  emailAddr,
  formattedAddr,
  serviceName,
  categoryName,
  refNum,
  filingMode,
  dueDateFormatted,
  lineItems,
  totalAmount,
  wordsTotal,
  isDesktop,
}: ClientSoaDataViewProps) {
  const soaStatus = app.soa?.status;

  const statusBgColor =
    soaStatus === 'ForOrderOfPayment'
      ? '#e0e7ff'
      : soaStatus === 'Approved'
      ? '#dcfce7'
      : soaStatus === 'Returned'
      ? '#fef3c7'
      : '#f3f4f6';

  const statusTextColor =
    soaStatus === 'ForOrderOfPayment'
      ? '#4338ca'
      : soaStatus === 'Approved'
      ? '#15803d'
      : soaStatus === 'Returned'
      ? '#b45309'
      : '#4b5563';

  const statusLabel =
    soaStatus === 'ForOrderOfPayment'
      ? 'FOR Order of Payment'
      : soaStatus === 'Approved'
      ? 'FOR Payment'
      : (soaStatus || '');

  const displayService =
    categoryName && categoryName !== serviceName && categoryName !== 'General'
      ? `${serviceName} (${categoryName})`
      : serviceName;

  return (
    <View>
      <View style={dataViewStyles.soaBanner}>
        <View>
          <Text style={dataViewStyles.bannerTitle}>STATEMENT OF ACCOUNT (SOA)</Text>
          <Text style={dataViewStyles.bannerSubtitle}>Official Regulatory Fee Assessment &amp; Schedule</Text>
        </View>
        <View style={dataViewStyles.bannerRight}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Text style={dataViewStyles.bannerDocNum}>{soaNum}</Text>
            {soaStatus && (
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: statusBgColor }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: statusTextColor }}>{statusLabel}</Text>
              </View>
            )}
          </View>
          <Text style={dataViewStyles.bannerDate}>
            Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={[dataViewStyles.infoGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        <View style={[dataViewStyles.infoCard, { flex: 1 }]}>
          <Text style={dataViewStyles.infoCardTitle}>Billed To (Payor / Applicant)</Text>
          <Text style={dataViewStyles.infoCardName}>{applicantName}</Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Type:</Text> {applicantType} •{' '}
            <Text style={dataViewStyles.boldText}>Contact:</Text> {contactNum}
          </Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Email:</Text> {emailAddr}
          </Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Address:</Text> {formattedAddr}
          </Text>
        </View>

        <View style={[dataViewStyles.infoCard, { flex: 1 }]}>
          <Text style={dataViewStyles.infoCardTitle}>Assessment &amp; Filing Details</Text>
          <Text style={dataViewStyles.infoCardName}>{displayService}</Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Reference No.:</Text> #{refNum}
          </Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Filing Mode:</Text> {filingMode}
          </Text>
          <Text style={dataViewStyles.infoCardDetail}>
            <Text style={dataViewStyles.boldText}>Due Date:</Text>{' '}
            <Text style={dataViewStyles.dueDateHighlight}>{dueDateFormatted}</Text>
          </Text>
        </View>
      </View>

      <View style={tableStyles.dataTable}>
        <View style={tableStyles.tableHeader}>
          <Text style={[tableStyles.thCell, { flex: 3 }]}>PARTICULARS / NATURE OF COLLECTION</Text>
          <Text style={[tableStyles.thCell, { width: 50, textAlign: 'center' }]}>QTY</Text>
          <Text style={[tableStyles.thCell, { width: 60, textAlign: 'center' }]}>YRS</Text>
          <Text style={[tableStyles.thCell, { width: 100, textAlign: 'right' }]}>RATE (PHP)</Text>
          <Text style={[tableStyles.thCell, { width: 110, textAlign: 'right' }]}>AMOUNT (PHP)</Text>
        </View>

        {lineItems.map((item, idx) => {
          const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
          const validity = typeof item.validityYears === 'number' && item.validityYears > 0 ? item.validityYears : 1;
          const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
          const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;

          return (
            <View key={item.id || idx} style={[tableStyles.tableRow, idx % 2 === 1 && tableStyles.tableRowEven]}>
              <View style={{ flex: 3 }}>
                <Text style={tableStyles.tdParticularName}>{item.particular}</Text>
                <Text style={tableStyles.tdParticularSub}>Code: {item.itemCode || 'NTC-FEE'}</Text>
              </View>
              <Text style={[tableStyles.tdCell, { width: 50, textAlign: 'center' }]}>{units}</Text>
              <Text style={[tableStyles.tdCell, { width: 60, textAlign: 'center' }]}>{validity}</Text>
              <Text style={[tableStyles.tdCell, { width: 100, textAlign: 'right' }]}>
                {formatCurrency(rate).replace('PHP ', '')}
              </Text>
              <Text style={[tableStyles.tdCell, { width: 110, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                {formatCurrency(amount).replace('PHP ', '')}
              </Text>
            </View>
          );
        })}

        <View style={tableStyles.tableTotalRow}>
          <Text style={tableStyles.tableTotalLabel}>TOTAL AMOUNT DUE:</Text>
          <Text style={tableStyles.tableTotalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      <View style={dataViewStyles.wordsCard}>
        <Text style={dataViewStyles.wordsLabel}>AMOUNT IN WORDS:</Text>
        <Text style={dataViewStyles.wordsText}>{wordsTotal}</Text>
      </View>

      <View style={[signatoryStyles.signatoriesRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 20 }]}>
        <View style={signatoryStyles.sigBlock}>
          <Text style={signatoryStyles.sigName}>{app.soa?.preparedByName || app.evaluatingOfficer || 'EVALUATOR'}</Text>
          <Text style={signatoryStyles.sigRole}>{app.soa?.preparedByTitle || 'Assessed & Prepared By'}</Text>
        </View>
        <View style={signatoryStyles.sigBlock}>
          <Text style={signatoryStyles.sigName}>{app.soa?.approvedByName || app.issuingOfficer || 'CHIEF, EOD'}</Text>
          <Text style={signatoryStyles.sigRole}>{app.soa?.approvedByTitle || 'Chief, Enforcement & Operations Div.'}</Text>
        </View>
      </View>
    </View>
  );
}

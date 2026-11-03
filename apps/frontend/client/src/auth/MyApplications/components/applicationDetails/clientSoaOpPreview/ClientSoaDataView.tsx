import React from 'react';
import { View, Text, Platform } from 'react-native';
import { formatCurrency, formatOrDisplayNumber } from '../../../utils/clientSoaReportGenerator';
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
  orNum,
  orList = [],
  isPaid,
}: ClientSoaDataViewProps) {
  const hasOr = (typeof orNum === 'string' && orNum.trim().length > 0) || Boolean(isPaid);
  const safeOrList = Array.isArray(orList) ? orList : [];
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

      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'stretch', marginTop: 20, gap: 16 }}>
        {/* Official O.R. Stamp Box matching official physical Statement of Account */}
        {hasOr ? (
          <View style={{ width: isDesktop ? 240 : '100%', borderWidth: 1.5, borderColor: '#059669', borderRadius: 4, padding: 8, backgroundColor: '#F0FDF4' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, borderBottomWidth: 1, borderBottomColor: '#BBF7D0', paddingBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#065F46', width: 45 }}>O.R.</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#047857', fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }) }}>
                {safeOrList.length > 1 ? safeOrList.map(formatOrDisplayNumber).join(', ') : formatOrDisplayNumber(orNum || 'RECORDED')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#065F46' }}>AMOUNT:</Text>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#047857' }}>{formatCurrency(totalAmount)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 9, color: '#047857' }}>Date:</Text>
              <Text style={{ fontSize: 9, color: '#065F46' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 9, color: '#047857' }}>By:</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: '#065F46' }}>Special Collecting Officer</Text>
            </View>
          </View>
        ) : (
          <View style={{ width: isDesktop ? 240 : '100%', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, padding: 8, backgroundColor: '#F8FAFC' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 2 }}>O.R. STAMP BOX</Text>
            <Text style={{ fontSize: 9, color: '#94A3B8' }}>Official Receipt will be stamped upon cashier collection &amp; verification.</Text>
          </View>
        )}

        <View style={[signatoryStyles.signatoriesRow, { flexDirection: 'row', gap: 16, marginTop: 0 }]}>
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
    </View>
  );
}

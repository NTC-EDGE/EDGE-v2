import React from 'react';
import { View, Text, Platform } from 'react-native';
import { formatCurrency, formatOrDisplayNumber } from '../../../utils/clientSoaReportGenerator';
import { ClientOpDataViewProps } from './clientSoaOpPreviewTypes';
import { dataViewStyles } from './styles/clientSoaOpDataViewStyles';
import { tableStyles } from './styles/clientSoaOpTableStyles';
import { signatoryStyles } from './styles/clientSoaOpSignatoryStyles';

export function ClientOpDataView({
  opNum,
  applicantName,
  formattedAddr,
  serviceName,
  refNum,
  lineItems,
  totalAmount,
  wordsTotal,
  orNum,
  orList,
  isDesktop,
}: ClientOpDataViewProps) {
  const hasOr = typeof orNum === 'string' && orNum.trim().length > 0;
  const paymentStatusText = hasOr
    ? (orList.length > 1
        ? `Paid via ${orList.length} Official Receipts (${orList.map(formatOrDisplayNumber).join(', ')})`
        : `Paid via ${formatOrDisplayNumber(orList.length > 0 ? orList[0] : orNum)}`)
    : 'Pending Cashier Verification / Collection';

  return (
    <View>
      <View style={dataViewStyles.opBanner}>
        <View>
          <Text style={dataViewStyles.bannerTitle}>ORDER OF PAYMENT (OP)</Text>
          <Text style={dataViewStyles.bannerSubtitle}>
            Authorized National Telecommunications Commission Payment Voucher
          </Text>
        </View>
        <View style={dataViewStyles.bannerRight}>
          <Text style={dataViewStyles.bannerDocNum}>{opNum}</Text>
          <Text style={dataViewStyles.bannerDate}>
            Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={dataViewStyles.opPayorCard}>
        <View style={dataViewStyles.opPayorRow}>
          <Text style={dataViewStyles.opPayorLabel}>Payor / Applicant:</Text>
          <Text style={dataViewStyles.opPayorVal}>{applicantName}</Text>
        </View>
        <View style={dataViewStyles.opPayorRow}>
          <Text style={dataViewStyles.opPayorLabel}>Application Reference:</Text>
          <Text style={[dataViewStyles.opPayorVal, { fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }) }]}>
            #{refNum}
          </Text>
        </View>
        <View style={dataViewStyles.opPayorRow}>
          <Text style={dataViewStyles.opPayorLabel}>Address:</Text>
          <Text style={dataViewStyles.opPayorVal}>{formattedAddr}</Text>
        </View>
        <View style={dataViewStyles.opPayorRow}>
          <Text style={dataViewStyles.opPayorLabel}>Service Variant:</Text>
          <Text style={dataViewStyles.opPayorVal}>{serviceName}</Text>
        </View>
      </View>

      <View style={tableStyles.dataTable}>
        <View style={[tableStyles.tableHeader, { backgroundColor: '#F0FDF4', borderBottomColor: '#BBF7D0' }]}>
          <Text style={[tableStyles.thCell, { flex: 3, color: '#065F46' }]}>NATURE OF COLLECTION / PARTICULARS</Text>
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
                <Text style={tableStyles.tdParticularSub}>Code: {item.itemCode || 'NTC-FEE'}</Text>
              </View>
              <Text style={[tableStyles.tdCell, { width: 140, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                {formatCurrency(amount)}
              </Text>
            </View>
          );
        })}

        <View style={tableStyles.opTotalRow}>
          <Text style={tableStyles.opTotalLabel}>TOTAL AMOUNT PAYABLE:</Text>
          <Text style={tableStyles.opTotalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      <View style={dataViewStyles.opStatusCard}>
        <Text style={dataViewStyles.opStatusLabel}>AMOUNT IN WORDS:</Text>
        <Text style={dataViewStyles.opStatusWords}>{wordsTotal}</Text>
        <View style={dataViewStyles.opPaymentStatusBadgeRow}>
          <Text style={dataViewStyles.opPaymentStatusText}>
            <Text style={dataViewStyles.boldText}>Payment Status:</Text> {paymentStatusText}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'stretch', marginTop: 20, gap: 16 }}>
        {/* Official O.R. Stamp Box matching official physical Order of Payment */}
        {hasOr ? (
          <View style={{ width: isDesktop ? 220 : '100%', borderWidth: 1.5, borderColor: '#059669', borderRadius: 4, padding: 8, backgroundColor: '#F0FDF4' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, borderBottomWidth: 1, borderBottomColor: '#BBF7D0', paddingBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#065F46', width: 45 }}>O.R.</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#047857', fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }) }}>
                {orList.length > 1 ? orList.map(formatOrDisplayNumber).join(', ') : formatOrDisplayNumber(orNum || 'RECORDED')}
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
          <View style={{ width: isDesktop ? 220 : '100%', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, padding: 8, backgroundColor: '#F8FAFC' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 2 }}>O.R. STAMP BOX</Text>
            <Text style={{ fontSize: 9, color: '#94A3B8' }}>Official Receipt will be stamped upon cashier collection &amp; verification.</Text>
          </View>
        )}

        <View style={[signatoryStyles.signatoriesRow, { flexDirection: 'row', gap: 16, marginTop: 0 }]}>
          <View style={signatoryStyles.sigBlock}>
            <Text style={signatoryStyles.sigName}>REGIONAL ASSESSMENT OFFICER</Text>
            <Text style={signatoryStyles.sigRole}>Authorized Assessment Officer</Text>
          </View>
          <View style={signatoryStyles.sigBlock}>
            <Text style={signatoryStyles.sigName}>SPECIAL COLLECTING OFFICER</Text>
            <Text style={signatoryStyles.sigRole}>Collecting Cashier</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

import React from "react";
import { View, Text } from "react-native";
import { useTheme, RADIUS, TYPOGRAPHY, Icon as Lucide } from "@edge/ui";

interface SoaStatusBannersProps {
  isForAccountant: boolean;
  isPendingPayment: boolean;
  isPaymentSubmitted: boolean;
  isSoaReturned: boolean;
  note?: string;
}

export function SoaStatusBanners({
  isForAccountant,
  isPendingPayment,
  isPaymentSubmitted,
  isSoaReturned,
  note,
}: SoaStatusBannersProps) {
  const { colors, isDark } = useTheme();

  return (
    <>
      {/* Accountant Verification Banner */}
      {isForAccountant && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#1e1b4b' : '#eef2ff',
            borderColor: isDark ? '#4338ca' : '#c7d2fe',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="file-text" size={18} color={isDark ? '#a5b4fc' : '#4f46e5'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#e0e7ff' : '#3730a3', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>SOA Verification:</Text> Verify fee calculations. Click <Text style={{ fontWeight: '700' }}>Approve &amp; Issue OP</Text> to issue Order of Payment, or <Text style={{ fontWeight: '700' }}>Return</Text> if corrections are needed.
          </Text>
        </View>
      )}

      {/* Cashier Payment Status Banner */}
      {isPendingPayment && isPaymentSubmitted && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
            borderColor: isDark ? '#059669' : '#10b981',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="check-circle" size={18} color={isDark ? '#34d399' : '#059669'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#d1fae5' : '#065f46', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>Payment Submitted:</Text> Client submitted payment reference. Ready for Cashier OR issuance.
          </Text>
        </View>
      )}

      {isPendingPayment && !isPaymentSubmitted && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#451a03' : '#fffbeb',
            borderColor: isDark ? '#b45309' : '#f59e0b',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="lock" size={18} color={isDark ? '#fbbf24' : '#d97706'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#fde68a' : '#92400e', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>Awaiting Payment:</Text> Client has not paid. Cashier cannot issue OR until payment is made.
          </Text>
        </View>
      )}

      {/* Returned from Accountant Alert */}
      {isSoaReturned && (
        <View
          style={{
            padding: 12,
            borderRadius: RADIUS.sm,
            backgroundColor: isDark ? '#451a03' : '#fef3c7',
            borderColor: isDark ? '#b45309' : '#f59e0b',
            borderWidth: 1,
            marginBottom: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Lucide name="alert-triangle" size={18} color={isDark ? '#fbbf24' : '#d97706'} />
          <Text style={{ flex: 1, fontSize: 12, color: isDark ? '#fde68a' : '#92400e', fontFamily: TYPOGRAPHY.fonts.primary, lineHeight: 18 }}>
            <Text style={{ fontWeight: '700' }}>SOA Returned:</Text> {note || 'Review findings and adjust calculations.'} Click <Text style={{ fontWeight: '700' }}>Edit SOA</Text> to revise and resubmit.
          </Text>
        </View>
      )}
    </>
  );
}

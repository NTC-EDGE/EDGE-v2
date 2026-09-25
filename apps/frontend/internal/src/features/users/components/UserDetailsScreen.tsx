import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  StatusBadge,
} from '@edge/ui';
import { User, UserTransaction } from '../types';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useTenantClientDetails } from '@edge/api';

import { useTabQueryParam } from '../../../hooks/useTabQueryParam';

interface UserDetailsScreenProps {
  user: User;
  onBack: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

type TabKey = 'transactions' | 'profile' | 'permits' | 'billing';

const VALID_USER_DETAILS_TABS: readonly TabKey[] = ['transactions', 'profile', 'permits', 'billing'];

export function UserDetailsScreen({
  user,
  onBack,
  onEdit,
  onDelete,
}: UserDetailsScreenProps) {
  const { user: authUser } = useAuthContext();
  const currentTenantId = user.tenantId || authUser?.tenantId;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useTabQueryParam<TabKey>('tab', 'transactions', VALID_USER_DETAILS_TABS);

  // Optional live query for deep client details
  const { client: liveDetails, isLoading: isDetailsLoading } = useTenantClientDetails(
    currentTenantId,
    user.id
  );

  const userId = user.id || '000000';
  const userName = user.name || 'Permittee';

  const transactions: UserTransaction[] =
    liveDetails?.transactions && liveDetails.transactions.length > 0
      ? liveDetails.transactions.map((tx) => ({
          id: tx.id || `tx-${Math.random().toString().slice(2, 6)}`,
          refNo: tx.refNo || 'REF-NTC',
          type: tx.type || 'Radio Station Authorization Filing',
          serviceType: user.licenseCategory || 'Telecommunications Service',
          applicationNumber: tx.refNo || 'APP-NTC',
          amount: typeof tx.amount === 'number' ? tx.amount : 0,
          status: tx.status || 'Paid',
          date: tx.date ? new Date(tx.date).toLocaleDateString() : 'Recent',
        }))
      : user.transactions && user.transactions.length > 0
      ? user.transactions
      : [
          {
            id: `tx-${userId}-1`,
            refNo: `REF-2024-${userId.slice(0, 5).toUpperCase()}`,
            type: 'Application Filing',
            serviceType: user.licenseCategory || 'Radio Station Authorization',
            applicationNumber: `APP-${userId.slice(0, 4)}`,
            amount: user.totalPaidAmount || 4500,
            status: 'Paid',
            date: user.createdDate || '2026-01-15',
          },
        ];

  const totalFilings = liveDetails?.totalApplications ?? user.applicationsCount ?? 1;
  const totalAmount = user.totalPaidAmount ?? (transactions.reduce((acc, t) => acc + t.amount, 0) || 4500);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.innerWrapper}>
        {/* Navigation Breadcrumb / Header */}
        <View style={styles.topNav}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Lucide name="arrow-left" size={16} color={COLORS.brand[700]} style={styles.backIcon} />
            <Text style={styles.backBtnText}>Back to Permittees Directory</Text>
          </Pressable>

          <View style={styles.breadcrumbBadge}>
            <Lucide name="map-pin" size={13} color={COLORS.neutral[500]} style={styles.backIcon} />
            <Text style={styles.breadcrumbText}>
              Regional Office: <Text style={styles.breadcrumbBold}>{user.tenantName || authUser?.tenantName || 'NTC Regional Office X'}</Text>
            </Text>
          </View>
        </View>

        {/* Hero Header Card */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <View style={[styles.heroMain, isMobile && styles.heroMainMobile]}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              {user.avatarType === 'icon' ? (
                <View style={styles.avatarIconCircle}>
                  <Lucide name="user" size={32} color={COLORS.neutral[500]} />
                </View>
              ) : (
                <View
                  style={[
                    styles.avatarInitialsCircle,
                    { backgroundColor: user.avatarBgColor || COLORS.brand.royalBlue },
                  ]}
                >
                  <Text style={styles.avatarInitialsText}>
                    {user.avatarInitials || (userName.slice(0, 2).toUpperCase() || 'NT')}
                  </Text>
                </View>
              )}
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.titleRow}>
                <Text style={styles.userName}>{userName}</Text>
                <StatusBadge status={user.status} />
              </View>

              {user.organization && user.organization !== 'Individual Permittee' && (
                <Text style={styles.organizationSubtitle}>{user.organization}</Text>
              )}

              <View style={styles.badgesRow}>
                <View style={styles.clientIdBadge}>
                  <Text style={styles.clientIdText}>Permittee ID: {userId.slice(0, 12)}</Text>
                </View>
                <View
                  style={
                    user.accountType === 'Company' ? styles.companyBadge : styles.individualBadge
                  }
                >
                  <Text
                    style={
                      user.accountType === 'Company'
                        ? styles.companyBadgeText
                        : styles.individualBadgeText
                    }
                  >
                    {user.accountType} Entity
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {user.licenseCategory || 'Fixed & Land Mobile Radio Network'}
                  </Text>
                </View>
                <View style={styles.regionBadge}>
                  <Text style={styles.regionBadgeText}>{user.region}</Text>
                </View>
              </View>

              <Text style={styles.userDesc}>
                {user.description ||
                  `Registered permittee and transacting entity with active filings recorded under ${user.region}.`}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={[styles.actionButtons, isMobile && styles.actionButtonsMobile]}>
              <Pressable style={styles.editBtn} onPress={() => onEdit(user)}>
                <Lucide name="edit-2" size={14} color={COLORS.brand[700]} style={styles.btnIcon} />
                <Text style={styles.editBtnText}>Edit Permittee</Text>
              </Pressable>

              <Pressable style={styles.deleteBtn} onPress={() => onDelete(user)}>
                <Lucide name="trash-2" size={14} color={COLORS.semantic.error} style={styles.btnIcon} />
                <Text style={styles.deleteBtnText}>Archive Record</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quick KPI Stats Summary Cards */}
        <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.brand.light }]}>
              <Lucide name="file-text" size={20} color={COLORS.brand.secondary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Regional Filings</Text>
              <Text style={styles.statValue}>{totalFilings}</Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.semantic.successBg }]}>
              <Lucide name="credit-card" size={20} color={COLORS.semantic.success} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Paid in Tenant</Text>
              <Text style={styles.statValue}>
                ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.semantic.warningBg }]}>
              <Lucide name="radio" size={20} color={COLORS.semantic.warningText} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Primary Service</Text>
              <Text style={styles.statValueSmall} numberOfLines={1}>
                {user.licenseCategory || 'Commercial Radio'}
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.brand.purpleLight }]}>
              <Lucide name="calendar" size={20} color={COLORS.brand.purpleDark} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Registered Date</Text>
              <Text style={styles.statValueSmall}>{user.createdDate}</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation Controls */}
        <View style={styles.tabNavContainer}>
          <Pressable
            style={[styles.tabButton, activeTab === 'transactions' && styles.tabButtonActive]}
            onPress={() => setActiveTab('transactions')}
          >
            <Lucide
              name="file-text"
              size={15}
              color={activeTab === 'transactions' ? COLORS.brand[700] : COLORS.neutral[500]}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'transactions' && styles.tabButtonTextActive,
              ]}
            >
              Tenant Filings & Transactions ({transactions.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Lucide
              name="user"
              size={15}
              color={activeTab === 'profile' ? COLORS.brand[700] : COLORS.neutral[500]}
              style={styles.tabIcon}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'profile' && styles.tabButtonTextActive]}
            >
              Identity & Entity Profile
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'permits' && styles.tabButtonActive]}
            onPress={() => setActiveTab('permits')}
          >
            <Lucide
              name="award"
              size={15}
              color={activeTab === 'permits' ? COLORS.brand[700] : COLORS.neutral[500]}
              style={styles.tabIcon}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'permits' && styles.tabButtonTextActive]}
            >
              Authorizations & Licenses
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'billing' && styles.tabButtonActive]}
            onPress={() => setActiveTab('billing')}
          >
            <Lucide
              name="dollar-sign"
              size={15}
              color={activeTab === 'billing' ? COLORS.brand[700] : COLORS.neutral[500]}
              style={styles.tabIcon}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'billing' && styles.tabButtonTextActive]}
            >
              Fee & Payment History
            </Text>
          </Pressable>
        </View>

        {/* Tab 1: Tenant Filings & Transactions */}
        {activeTab === 'transactions' && (
          <View style={[styles.tabContentCard, SHADOWS.card]}>
            <View style={styles.cardHeaderWithAction}>
              <View>
                <Text style={styles.cardHeaderTitle}>Transactions in this Regional Office</Text>
                <Text style={styles.cardHeaderSubtitle}>
                  Applications, permits, and modifications submitted by this client to {user.tenantName || 'this regional office'}.
                </Text>
              </View>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.tabEmptyState}>
                <Lucide name="inbox" size={36} color={COLORS.neutral[300]} />
                <Text style={styles.tabEmptyTitle}>No Transactions Recorded</Text>
                <Text style={styles.tabEmptySubtitle}>
                  No active filings found for this client under this regional tenant.
                </Text>
              </View>
            ) : (
              <View style={styles.transactionList}>
                {transactions.map((tx, idx) => (
                  <View key={tx.id || idx} style={styles.txCard}>
                    <View style={styles.txHeaderRow}>
                      <View style={styles.txBadgeGroup}>
                        <Text style={styles.txRefNo}>{tx.refNo}</Text>
                        {tx.applicationNumber && (
                          <Text style={styles.txAppNo}>• App #{tx.applicationNumber}</Text>
                        )}
                      </View>
                      <StatusBadge status={tx.status === 'Paid' ? 'Approved' : tx.status} />
                    </View>

                    <View style={styles.txMainInfo}>
                      <View style={styles.txServiceGroup}>
                        <Text style={styles.txServiceTitle}>{tx.serviceType}</Text>
                        <Text style={styles.txTypeSubtext}>{tx.type} • Filed on {tx.date}</Text>
                      </View>

                      <View style={styles.txAmountGroup}>
                        <Text style={styles.txAmountLabel}>Fee Amount</Text>
                        <Text style={styles.txAmountValue}>
                          ₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tab 2: Identity & Entity Profile */}
        {activeTab === 'profile' && (
          <View style={[styles.detailsGrid, isMobile && styles.detailsGridMobile]}>
            {/* Personal / Representative Details */}
            <View style={[styles.infoCard, SHADOWS.card]}>
              <Text style={styles.cardHeaderTitle}>Primary Contact & Identity</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="user" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Authorized Contact Person</Text>
                  <Text style={styles.infoValue}>{user.name}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="mail" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Official Email Address</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="phone" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Contact Number</Text>
                  <Text style={styles.infoValue}>{user.phone || '+63 900 000 0000'}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="map-pin" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Complete Address</Text>
                  <Text style={styles.infoValue}>{user.address}</Text>
                </View>
              </View>
            </View>

            {/* Corporate / Entity Information */}
            <View style={[styles.infoCard, SHADOWS.card]}>
              <Text style={styles.cardHeaderTitle}>Corporate & Regulatory Details</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="briefcase" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Organization / Company Name</Text>
                  <Text style={styles.infoValue}>{user.organization}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="file-text" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Registration / SEC / CDA Number</Text>
                  <Text style={styles.infoValue}>
                    {user.companyRegistrationNumber || 'SEC-CS202008129'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="globe" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Nationality / Jurisdiction</Text>
                  <Text style={styles.infoValue}>{user.nationality || 'Filipino (Philippines)'}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Lucide name="shield" size={16} color={COLORS.neutral[500]} />
                </View>
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Assigned Regional Jurisdiction</Text>
                  <Text style={styles.infoValue}>{user.region}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Authorizations & Licenses */}
        {activeTab === 'permits' && (
          <View style={[styles.tabContentCard, SHADOWS.card]}>
            <Text style={styles.cardHeaderTitle}>Active Licenses & Operating Authorizations</Text>
            <Text style={styles.cardHeaderSubtitle}>
              Regulatory permits, station licenses, and compliance certificates held with this regional office.
            </Text>

            <View style={styles.permitItemRow}>
              <View style={styles.permitIconCircle}>
                <Lucide name="radio" size={18} color={COLORS.brand[700]} />
              </View>
              <View style={styles.permitInfo}>
                <Text style={styles.permitTitle}>
                  {user.licenseCategory || 'Commercial Radio Station Authorization'}
                </Text>
                <Text style={styles.permitMeta}>
                  Permit No: NTC-RX-2024-LIC-{userId.slice(0, 4)} • Valid until Dec 31, 2026
                </Text>
              </View>
              <StatusBadge status="Approved" />
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.permitItemRow}>
              <View style={[styles.permitIconCircle, { backgroundColor: COLORS.semantic.successBg }]}>
                <Lucide name="check-circle" size={18} color={COLORS.semantic.success} />
              </View>
              <View style={styles.permitInfo}>
                <Text style={styles.permitTitle}>Frequency Assignment & Spectrum Authorization</Text>
                <Text style={styles.permitMeta}>
                  Frequency Band: VHF/UHF Land Mobile Band • Transmit Power: 25W ERP
                </Text>
              </View>
              <StatusBadge status="Approved" />
            </View>
          </View>
        )}

        {/* Tab 4: Fee & Payment History */}
        {activeTab === 'billing' && (
          <View style={[styles.tabContentCard, SHADOWS.card]}>
            <Text style={styles.cardHeaderTitle}>Statements of Account & Official Receipts</Text>
            <Text style={styles.cardHeaderSubtitle}>
              Detailed breakdown of regulatory fees, filing dues, and verified collections for this client.
            </Text>

            <View style={styles.billingSummaryGrid}>
              <View style={styles.billingSummaryItem}>
                <Text style={styles.billingSummaryLabel}>Total Regulatory Billing</Text>
                <Text style={styles.billingSummaryValue}>
                  ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.billingSummaryItem}>
                <Text style={styles.billingSummaryLabel}>Total Payments Collected</Text>
                <Text style={[styles.billingSummaryValue, { color: COLORS.semantic.success }]}>
                  ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.billingSummaryItem}>
                <Text style={styles.billingSummaryLabel}>Outstanding Dues</Text>
                <Text style={[styles.billingSummaryValue, { color: COLORS.neutral[600] }]}>
                  ₱0.00
                </Text>
              </View>
            </View>

            <View style={styles.transactionList}>
              {transactions.map((tx, idx) => (
                <View key={tx.id || idx} style={styles.billingReceiptRow}>
                  <View style={styles.receiptIcon}>
                    <Lucide name="file-text" size={18} color={COLORS.brand[700]} />
                  </View>
                  <View style={styles.receiptDetails}>
                    <Text style={styles.receiptTitle}>Official Receipt #{tx.refNo}</Text>
                    <Text style={styles.receiptMeta}>
                      Issued on {tx.date} • {tx.serviceType}
                    </Text>
                  </View>
                  <View style={styles.receiptAmountGroup}>
                    <Text style={styles.receiptAmount}>
                      ₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={styles.receiptStatusText}>Verified Paid</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    width: '100%',
  },
  contentContainer: {
    padding: SPACING[20],
    paddingBottom: SPACING[40],
    width: '100%',
  },
  innerWrapper: {
    width: '100%',
  },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING[12],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  backIcon: {
    marginRight: 6,
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  breadcrumbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING[10],
    paddingVertical: 4,
    borderRadius: RADIUS.button,
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
  },
  breadcrumbBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },

  heroCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[24],
    marginBottom: SPACING[20],
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroMainMobile: {
    flexDirection: 'column',
  },

  avatarSection: {
    marginRight: SPACING[20],
    marginBottom: SPACING[12],
  },
  avatarIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  avatarInitialsCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 22,
    color: COLORS.neutral.white,
  },

  profileSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[12],
    marginBottom: 4,
  },
  userName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  organizationSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING[8],
  },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[8],
    marginBottom: SPACING[12],
  },
  clientIdBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  clientIdText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  individualBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  individualBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
  },
  companyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.brand.light,
  },
  companyBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.brand.royalBlue,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  categoryBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  regionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  regionBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },

  userDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 19,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: SPACING[8],
  },
  actionButtonsMobile: {
    marginTop: SPACING[16],
    width: '100%',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand.light,
    borderWidth: 1,
    borderColor: COLORS.brand.blueSoft,
  },
  editBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.semantic.errorBg,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
  },
  deleteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  btnIcon: {
    marginRight: 6,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: SPACING[12],
    marginBottom: SPACING[20],
  },
  statsGridMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  statIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginTop: 2,
  },
  statValueSmall: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginTop: 2,
  },

  tabNavContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.button,
    padding: 4,
    marginBottom: SPACING[16],
    flexWrap: 'wrap',
    gap: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  tabButtonActive: {
    backgroundColor: COLORS.neutral.white,
    ...SHADOWS.card,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
  },
  tabButtonTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  tabContentCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
  },
  cardHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  cardHeaderSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },

  tabEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[32],
  },
  tabEmptyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
    marginTop: SPACING[12],
  },
  tabEmptySubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 4,
  },

  transactionList: {
    gap: SPACING[12],
  },
  txCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: 14,
  },
  txHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[8],
  },
  txBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txRefNo: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  txAppNo: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  txMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txServiceGroup: {
    flex: 1,
  },
  txServiceTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
  },
  txTypeSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  txAmountGroup: {
    alignItems: 'flex-end',
    marginLeft: SPACING[12],
  },
  txAmountLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  txAmountValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginTop: 1,
  },

  detailsGrid: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  detailsGridMobile: {
    flexDirection: 'column',
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING[10],
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  infoValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
  },

  permitItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[12],
  },
  permitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  permitInfo: {
    flex: 1,
  },
  permitTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  permitMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },

  billingSummaryGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    padding: 14,
    marginBottom: SPACING[16],
    gap: SPACING[12],
  },
  billingSummaryItem: {
    flex: 1,
  },
  billingSummaryLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  billingSummaryValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginTop: 2,
  },

  billingReceiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    padding: SPACING[12],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  receiptIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  receiptDetails: {
    flex: 1,
  },
  receiptTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  receiptMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  receiptAmountGroup: {
    alignItems: 'flex-end',
  },
  receiptAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  receiptStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.success,
    marginTop: 1,
  },
});

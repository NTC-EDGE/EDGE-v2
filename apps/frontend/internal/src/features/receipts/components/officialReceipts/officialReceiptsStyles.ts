import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1.5,
    minWidth: 240,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  statBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statSubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statDot: {
    fontSize: 10,
  },
  bookletStatusCard: {
    flex: 1.5,
    minWidth: 240,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  bookletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookletCardTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  sharedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  sharedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  bookletNextOr: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bookletMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  issueOrBtn: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  issueIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  issueBtnSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  subViewSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  subViewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  subViewBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subViewBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  subViewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchContainer: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 34,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    marginLeft: 6,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 380,
  },
  grid: {
    gap: 10,
  },
  paymentCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTextPending: {
    fontSize: 10,
    fontWeight: '700',
  },
  opNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
  },
  cardBody: {
    padding: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  applicantName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  applicantType: {
    fontSize: 11,
    marginTop: 1,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: 8,
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  lineItemsBox: {
    marginTop: 4,
  },
  lineItemsTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  lineItemCode: {
    fontSize: 10,
    fontWeight: '700',
    width: 60,
  },
  lineItemDesc: {
    flex: 1,
    fontSize: 11,
  },
  lineItemAmt: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  issueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  issueActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  tableScroll: {
    flex: 1,
  },
  tableCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableRowCancelled: {
    backgroundColor: '#FEF2F2',
    opacity: 0.75,
  },
  textCancelled: {
    textDecorationLine: 'line-through',
  },
  orNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  orDate: {
    fontSize: 10,
    marginTop: 2,
  },
  payorName: {
    fontSize: 12,
    fontWeight: '600',
  },
  opRef: {
    fontSize: 10,
    marginTop: 1,
  },
  payMethod: {
    fontSize: 11,
    fontWeight: '600',
  },
  checkRef: {
    fontSize: 10,
    color: '#6B7280',
  },
  depositRef: {
    fontSize: 10,
    color: '#059669',
  },
  amountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  statusIssued: {
    backgroundColor: '#FEF3C7',
  },
  statusDeposited: {
    backgroundColor: '#D1FAE5',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
  },
  statusTextIssued: {
    color: '#92400E',
  },
  statusTextDeposited: {
    color: '#065F46',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 4,
  },
  clientPrefBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  clientPrefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientPrefTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  clientPrefPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  clientPrefPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  clientPrefPillText: {
    fontSize: 10,
  },
});

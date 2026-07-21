import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';

export const styles = StyleSheet.create({
  // ── Root ──────────────────────────────────────────────────────────────
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    flexDirection: 'column',
  },

  // ── Top Header ────────────────────────────────────────────────────────
  topHeader: {
    height: 60,
    backgroundColor: COLORS.brand[900],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    zIndex: 100,
    ...Platform.select({
      web: {
        backgroundImage: `linear-gradient(135deg, ${COLORS.brand[900]} 0%, ${COLORS.brand[800]} 100%)`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      },
    }),
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    paddingLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerUserName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  topLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  topLogoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // ── Main Layout (Left Sidebar + Content) ─────────────────────────────
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },

  // ── Left Sidebar Panel ────────────────────────────────────────────────
  sidebar: {
    width: 200,
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingTop: SPACING[20],
    position: 'relative',
    zIndex: 10,
  },
  sidebarCollapsed: {
    width: 64,
  },
  collapseToggle: {
    position: 'absolute',
    right: -12,
    top: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
    }),
  },
  sidebarItems: {
    flexDirection: 'column',
    paddingHorizontal: 8,
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  sidebarItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#64748B',
    marginLeft: 12,
  },
  sidebarItemTextActive: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    marginLeft: 12,
  },

  // ── Content Column ────────────────────────────────────────────────────
  contentColumn: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[24],
    paddingBottom: 40,
  },

  // Hero Section
  heroHeader: {
    marginBottom: SPACING[20],
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: SPACING[20],
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[16],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    }),
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  statSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#94A3B8',
  },

  // Dropdown Toolbar Panel
  toolbarPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[16],
    marginBottom: SPACING[20],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    zIndex: 50,
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    }),
  },

  searchInputContainer: {
    flex: 2,
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },

  dropdownsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    zIndex: 50,
  },

  dropdownWrap: {
    position: 'relative',
    zIndex: 50,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  dropdownTriggerActive: {
    borderColor: COLORS.brand[700],
    backgroundColor: '#EFF6FF',
  },
  dropdownLabelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
  },

  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 0,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 4,
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dropdownOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  dropdownOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#334155',
  },
  dropdownOptionTextSelected: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Cards List / Grid
  cardsContainer: {
    gap: 16,
  },

  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginTop: 12,
  },
  emptyStateSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  // Pagination
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[20],
    paddingTop: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationSummary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },
  paginationBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNavBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  pageNumberBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberBtnActive: {
    backgroundColor: COLORS.brand[700],
    borderColor: COLORS.brand[700],
  },
  pageNumberBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
  },
  pageNumberBtnTextActive: {
    color: '#FFFFFF',
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 2000,
    ...Platform.select({
      web: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' },
    }),
  },
  toastText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

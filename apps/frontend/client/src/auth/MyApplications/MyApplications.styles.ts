import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';

export const styles = StyleSheet.create({
  // ── Root ──────────────────────────────────────────────────────────────
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    flexDirection: 'column',
  },

  // ── Top header ────────────────────────────────────────────────────────
  topHeader: {
    height: 60,
    backgroundColor: COLORS.brand[900],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
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

  // ── Main layout ───────────────────────────────────────────────────────
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },

  // ── Sidebar ───────────────────────────────────────────────────────────
  sidebar: {
    width: 200,
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
    paddingTop: SPACING[20],
    position: 'relative',
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
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
    color: COLORS.neutral[400],
    marginLeft: 12,
  },
  sidebarItemTextActive: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    marginLeft: 12,
  },

  // ── Content column (left pane) ────────────────────────────────────────
  contentColumn: {
    width: 340,
    backgroundColor: COLORS.neutral[50],
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  scrollContent: {
    padding: SPACING[16],
  },

  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: SPACING[12],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    ...Platform.select({
      web: { outlineWidth: 0 },
    }),
  },
  clearSearch: {
    padding: 4,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[12],
    flexWrap: 'wrap',
    gap: 8,
  },
  metaSummary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  metaBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  metaShowing: {
    color: COLORS.neutral[400],
  },
  metaActions: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  actionChipActive: {
    backgroundColor: COLORS.neutral[800],
    borderColor: COLORS.neutral[800],
  },
  actionChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actionChipTextActive: {
    color: COLORS.neutral.white,
  },

  // Mode filter pills row
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING[8],
    flexWrap: 'wrap',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  filterPillActive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.brand[700],
  },
  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  filterPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  filterPillTextActive: {
    color: COLORS.brand[700],
  },

  // Status filter chips row
  statusFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING[16],
    flexWrap: 'wrap',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: COLORS.neutral[100],
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  statusChipActive: {
    backgroundColor: '#EEF2FF',
  },
  statusChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statusChipTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Empty list state
  emptyList: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#9ca3af',
    fontSize: 14,
  },

  // List pagination
  listPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: SPACING[16],
    paddingBottom: 8,
  },
  listPageBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  listPageBtnDisabled: {
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[100],
  },
  listPageBtnCurrent: {
    backgroundColor: COLORS.brand[800],
    borderColor: COLORS.brand[800],
  },
  listPageBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  listPageBtnTextCurrent: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // ── Details column (right pane) ───────────────────────────────────────
  detailsColumn: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  mobileDetailsColumn: {
    flex: 1,
  },

  // ── Empty placeholder (right pane) ────────────────────────────────────
  emptyPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[40],
    paddingHorizontal: SPACING[24],
  },
  placeholderIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[16],
    position: 'relative',
  },
  pointerOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  placeholderTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
    marginBottom: 6,
  },
  placeholderSubtitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },

  // ── Footer banner ─────────────────────────────────────────────────────
  footerBanner: {
    height: 48,
    backgroundColor: COLORS.brand[900],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footerButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});

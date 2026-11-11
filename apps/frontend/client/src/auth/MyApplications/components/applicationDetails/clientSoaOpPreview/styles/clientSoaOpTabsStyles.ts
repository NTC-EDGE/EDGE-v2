import { StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY } from '@edge/ui';

export const tabsStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBarScroll: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[16],
    paddingTop: 8,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  tabItemActiveSoa: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BAE6FD',
    borderBottomColor: '#FFFFFF',
  },
  tabItemActiveOp: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
    borderBottomColor: '#FFFFFF',
  },
  tabItemActiveOr: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#64748B',
  },
  tabTextActiveSoa: {
    color: '#0369A1',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabTextActiveOp: {
    color: '#047857',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabTextActiveOr: {
    color: '#059669',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabBadgeActiveSoa: {
    backgroundColor: '#E0F2FE',
  },
  tabBadgeActiveOp: {
    backgroundColor: '#D1FAE5',
  },
  tabBadgeActiveOr: {
    backgroundColor: '#D1FAE5',
  },
  tabBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  tabBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabBadgeTextActiveSoa: {
    color: '#0369A1',
  },
  tabBadgeTextActiveOp: {
    color: '#047857',
  },
  tabBadgeTextActiveOr: {
    color: '#065F46',
  },
  tabBadgeTextInactive: {
    color: '#94A3B8',
  },
  multiOrSelectorBar: {
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    gap: 8,
  },
  multiOrSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  multiOrSelectorLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#065F46',
    letterSpacing: 0.5,
  },
  multiOrChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  multiOrChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  multiOrChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#059669',
  },
  multiOrChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#475569',
  },
  multiOrChipTextActive: {
    color: '#065F46',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  orTemplateSelectorBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  orTemplateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orTemplateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    letterSpacing: 0.5,
  },
  orTemplateChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orTemplateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  orTemplateChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#059669',
  },
  orTemplateChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#64748B',
  },
  orTemplateChipTextActive: {
    color: '#065F46',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

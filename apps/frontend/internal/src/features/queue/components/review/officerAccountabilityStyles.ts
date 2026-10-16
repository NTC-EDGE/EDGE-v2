import { StyleSheet } from 'react-native';
import { SPACING, RADIUS } from '@edge/ui';

export const officerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING[16],
    marginTop: SPACING[12],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[8],
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  endorsementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: SPACING[10],
  },
  endorsementText: {
    fontSize: 12,
  },
  bold: {
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  stageCard: {
    flex: 1,
    minWidth: 140,
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[6],
  },
  iconAndRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  officerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  stageSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
});

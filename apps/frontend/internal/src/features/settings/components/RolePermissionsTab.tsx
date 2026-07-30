import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

interface PermissionItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  { id: 'perm-1', name: 'Create Applications', category: 'Applications', description: 'Submit new permit applications' },
  { id: 'perm-2', name: 'Review Applications', category: 'Applications', description: 'Evaluate and endorse submitted permits' },
  { id: 'perm-3', name: 'Approve Applications', category: 'Applications', description: 'Final approval and sign-off on permits' },
  { id: 'perm-4', name: 'Manage Regional Settings', category: 'Admin Settings', description: 'Update regional configurations and branch offices' },
  { id: 'perm-5', name: 'Configure Fees & Notes', category: 'Admin Settings', description: 'Modify service fee tables and instruction notes' },
  { id: 'perm-6', name: 'Form Builder Access', category: 'Admin Settings', description: 'Design and publish dynamic application forms' },
  { id: 'perm-7', name: 'View Audit Logs', category: 'Security', description: 'Access system operation logs and staff trails' },
];

export function RolePermissionsTab() {
  const { width } = useWindowDimensions();
  const [selectedRole, setSelectedRole] = useState<'Regional Administrator' | 'Evaluator' | 'Cashier' | 'Inspector'>('Regional Administrator');
  const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({
    'perm-1': true,
    'perm-2': true,
    'perm-3': true,
    'perm-4': true,
    'perm-5': true,
    'perm-6': true,
    'perm-7': true,
  });

  const togglePermission = (id: string) => {
    setPermissionsState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const roles: ('Regional Administrator' | 'Evaluator' | 'Cashier' | 'Inspector')[] = [
    'Regional Administrator',
    'Evaluator',
    'Cashier',
    'Inspector',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Roles & Permissions Matrix</Text>
          <Text style={styles.subtitle}>
            Control access scopes and action permissions for staff roles across the region.
          </Text>
        </View>
      </View>

      {/* Role Selection Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleTabsRow}>
        {roles.map((role) => {
          const isActive = selectedRole === role;
          return (
            <Pressable
              key={role}
              style={[styles.roleTab, isActive ? styles.roleTabActive : styles.roleTabInactive]}
              onPress={() => setSelectedRole(role)}
            >
              <Lucide name="shield" size={14} color={isActive ? COLORS.brand[700] : COLORS.neutral[500]} />
              <Text style={[styles.roleTabText, isActive ? styles.roleTabTextActive : styles.roleTabTextInactive]}>
                {role}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Permissions Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Assigned Permissions for {selectedRole}</Text>
          <Text style={styles.cardSubtitle}>Enable or disable capabilities for this role scope.</Text>
        </View>

        <View style={styles.permList}>
          {DEFAULT_PERMISSIONS.map((perm) => {
            const isEnabled = Boolean(permissionsState[perm.id]);
            return (
              <View key={perm.id} style={styles.permRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.permName}>{perm.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{perm.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>{perm.description}</Text>
                </View>

                <Switch
                  value={isEnabled}
                  onValueChange={() => togglePermission(perm.id)}
                  trackColor={{ false: COLORS.neutral[200], true: COLORS.brand[600] }}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral[500],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  roleTabsRow: {
    flexDirection: 'row',
    gap: SPACING[8],
    paddingVertical: 4,
  },
  roleTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  roleTabActive: {
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand.blueSoft,
  },
  roleTabInactive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleTabTextActive: {
    color: COLORS.brand[700],
  },
  roleTabTextInactive: {
    color: COLORS.neutral[600],
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    gap: SPACING[12],
    ...SHADOWS.card,
  },
  cardHeader: {
    gap: 2,
    paddingBottom: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  permList: {
    gap: 10,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  permName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.neutral[600],
    textTransform: 'uppercase',
  },
  permDesc: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
});

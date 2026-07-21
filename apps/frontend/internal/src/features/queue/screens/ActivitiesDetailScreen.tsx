import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { ActivitiesDetailPane } from '../components/ActivitiesDetailPane';
import { mockApplications } from '../data/mockApplications';

export function ActivitiesDetailScreen() {
  const navigation = useNavigation<NavigationProp<ReactNavigation.RootParamList>>();
  const route = useRoute<RouteProp<ReactNavigation.RootParamList, 'ActivitiesDetail'>>();

  const applicationId = route.params?.applicationId;
  const activeTab = route.params?.activeTab ?? 'bulk';

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleTabChange = (tab: 'bulk' | 'details' | 'payment') => {
    navigation.setParams({ activeTab: tab });
  };

  const activeApplication = mockApplications.find((app) => app.id === applicationId);

  return (
    <View style={styles.container}>
      {/* Mobile Back Button Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backBtn}>
          <Lucide name="arrow-left" size={18} color={COLORS.neutral[800]} />
        </Pressable>
        <Text style={styles.title}>Application Details</Text>
      </View>

      {/* Pane Content */}
      <View style={styles.content}>
        <ActivitiesDetailPane
          application={activeApplication}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[16],
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.button,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    marginRight: SPACING[12],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  content: {
    flex: 1,
  },
});

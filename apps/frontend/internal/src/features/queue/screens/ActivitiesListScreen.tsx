import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { COLORS } from '@edge/ui';
import { ActivitiesFeed } from '../components/ActivitiesFeed';
import { ActivitiesDetailPane } from '../components/ActivitiesDetailPane';
import { mockApplications } from '../data/mockApplications';

// Custom type guard to safely check object properties without type assertions
function hasProperty<K extends string>(obj: object, key: K): obj is Record<K, unknown> {
  return key in obj;
}

export function ActivitiesListScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const navigation = useNavigation<NavigationProp<ReactNavigation.RootParamList>>();
  const route = useRoute<RouteProp<ReactNavigation.RootParamList, 'ActivitiesList'>>();

  const activeFilter = route.params?.filter ?? 'All';
  const selectedId = route.params?.applicationId;
  const activeTab = route.params?.activeTab ?? 'bulk';

  // Handle select application
  const handleSelect = (id: string) => {
    if (isMobile) {
      // On mobile, navigate to details screen in stack
      navigation.navigate('ActivitiesDetail', {
        applicationId: id,
        activeTab: 'bulk',
        filter: activeFilter,
      });
    } else {
      // On desktop, set route params locally
      navigation.setParams({ applicationId: id, activeTab: 'bulk' });
    }
  };

  // Handle filter changes
  const handleFilterChange = (filter: 'All' | 'Pending' | 'History') => {
    // Clear selected ID when switching filters on desktop
    navigation.setParams({ filter, applicationId: undefined });
  };

  // Handle tab changes in detail pane
  const handleTabChange = (tab: 'bulk' | 'details' | 'payment') => {
    navigation.setParams({ activeTab: tab });
  };

  // Find active application
  const activeApplication = mockApplications.find((app) => app.id === selectedId);

  return (
    <View style={styles.container}>
      <View style={styles.feedWrapper}>
        <ActivitiesFeed
          applications={mockApplications}
          selectedId={selectedId}
          activeFilter={activeFilter}
          onSelect={handleSelect}
          onFilterChange={handleFilterChange}
        />
      </View>
      {!isMobile && (
        <View style={styles.detailWrapper}>
          <ActivitiesDetailPane
            application={activeApplication}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    minHeight: 600,
  },
  feedWrapper: {
    width: 360,
    height: '100%',
  },
  detailWrapper: {
    flex: 1,
    height: '100%',
  },
});

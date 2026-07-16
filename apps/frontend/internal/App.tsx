import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

function DashboardScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NTC-EDGE Internal Portal</Text>
      <Text style={styles.subtitle}>Official Staff Dashboard • SDK 57 & React Nav 8</Text>
      <Button
        title="Review Application Queue"
        onPress={() => navigation.navigate('Queue')}
        color="#2e7d32" // Green theme for internal
      />
      <StatusBar style="auto" />
    </View>
  );
}

function QueueScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Review Queue</Text>
      <Text style={styles.subtitle}>Applications requiring immediate evaluation.</Text>
      <Button
        title="Back to Dashboard"
        onPress={() => navigation.goBack()}
        color="#2e7d32"
      />
      <StatusBar style="auto" />
    </View>
  );
}

// React Navigation 8 Static configuration
const RootStack = createNativeStackNavigator({
  initialRouteName: 'Dashboard',
  screens: {
    Dashboard: {
      screen: DashboardScreen,
      options: { title: 'NTC Staff Home' },
    },
    Queue: {
      screen: QueueScreen,
      options: { title: 'Pending Queue' },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b2a1c', // Forest dark theme for internal portal
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a5bda6',
    marginBottom: 20,
    textAlign: 'center',
  },
});

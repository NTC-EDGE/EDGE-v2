import React, { useState } from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from './tokenCache';
import { apiClient } from '@edge/api';
import { ServicesPortal } from './src/features/services/components/ServicesPortal';
import { GuestAuthProvider, useGuestAuth } from './src/features/auth/context/GuestAuthContext';
import { LandingScreen } from './src/features/landing/screens/LandingScreen';
import { LoginScreen } from './src/features/auth/screens/LoginScreen';
import { SignUpScreen } from './src/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from './src/features/auth/screens/ForgotPasswordScreen';

const getClerkKey = (): string => {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (typeof key === 'string' && key.length > 0) {
    return key;
  }
  return '';
};

const publishableKey = getClerkKey();

if (publishableKey.length === 0) {
  console.warn('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. Clerk will not initialize properly.');
}

interface ApplicationResponse {
  id: string;
  title: string;
  applicantName: string;
  status: string;
  createdAt: string;
}

interface NavigationProp {
  navigate: (screen: string) => void;
  goBack: () => void;
}

function HomeScreen({ navigation }: { navigation: NavigationProp }) {
  const { signOut, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { isGuest, logoutGuest } = useGuestAuth();
  const [submitting, setSubmitting] = useState(false);

  const userProfile = clerkUser !== null && clerkUser !== undefined ? {
    name: clerkUser.fullName ?? clerkUser.firstName ?? 'Client User',
    email: clerkUser.primaryEmailAddress?.emailAddress ?? 'client@edge.gov',
    avatarUrl: clerkUser.imageUrl,
  } : null;

  const handleApplySubmit = async (
    serviceTitle: string,
    formData: { applicantName: string; email: string; notes: string }
  ) => {
    setSubmitting(true);
    try {
      const token = isGuest ? null : await getToken();
      const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};

      await apiClient.post<ApplicationResponse>(
        '/api/applications',
        {
          title: serviceTitle,
          applicantName: formData.applicantName,
        },
        { headers }
      );

      if (Platform.OS === 'web') {
        window.alert(`Successfully submitted application for: ${serviceTitle}`);
      } else {
        Alert.alert('Success', `Successfully submitted application for: ${serviceTitle}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown server error occurred.';
      if (Platform.OS === 'web') {
        window.alert(`Submission failed: ${errMsg}`);
      } else {
        Alert.alert('Error', `Submission failed: ${errMsg}`);
      }
      throw err; // Re-throw to allow modal to display the error message
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (isGuest) {
      logoutGuest();
    } else {
      await signOut();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ServicesPortal
        user={userProfile}
        onLogout={signOut}
        onApplySubmit={handleApplySubmit}
        isSubmitting={submitting}
      />
      <StatusBar style="light" />
    </View>
  );
}

function DetailsScreen({ navigation }: { navigation: NavigationProp }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Application Details</Text>
      <Text style={styles.subtitle}>Tracking Status: Draft</Text>
      <Button
        title="Go Back Home"
        onPress={() => navigation.goBack()}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const UnauthenticatedStack = createNativeStackNavigator({
  initialRouteName: 'Landing',
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: 'transparent' },
  },
  screens: {
    Landing: {
      screen: LandingScreen,
      path: 'landingPage',
    },
    Login: {
      screen: LoginScreen,
      path: 'login',
    },
    SignUp: {
      screen: SignUpScreen,
      path: 'signup',
    },
    ForgotPassword: {
      screen: ForgotPasswordScreen,
      path: 'forgot-password',
    },
  },
});

const AuthenticatedStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screens: {
    Home: {
      screen: HomeScreen,
      options: { headerShown: false },
    },
    Details: {
      screen: DetailsScreen,
      options: { title: 'App Details' },
    },
  },
});

const UnauthNavigation = createStaticNavigation(UnauthenticatedStack);
const AuthNavigation = createStaticNavigation(AuthenticatedStack);

const unauthLinking = {
  prefixes: ['http://localhost:8082', 'http://localhost:8081', 'edge://'],
};

const authLinking = {
  prefixes: ['http://localhost:8082', 'http://localhost:8081', 'edge://'],
};

function AppContent() {
  const { isSignedIn } = useAuth();
  const { isGuest } = useGuestAuth();

  if (isSignedIn || isGuest) {
    return <AuthNavigation linking={authLinking} />;
  }

  return <UnauthNavigation linking={unauthLinking} />;
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <GuestAuthProvider>
        <AppContent />
      </GuestAuthProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031A6E', // Blue theme matching app config
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
    color: '#8b9bb4',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#0529A5',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  authButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff8a80',
    marginBottom: 10,
    textAlign: 'center',
  },
  toggleText: {
    color: '#8b9bb4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  statusText: {
    color: '#a5d6a7',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

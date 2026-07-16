import React, { useState } from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity } from 'react-native';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { tokenCache } from './tokenCache';
import { apiClient } from '@edge/api';

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

function DashboardScreen({ navigation }: any) {
  const { signOut, getToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const submitApplication = async () => {
    setSubmitting(true);
    setStatusMessage('');
    try {
      const token = await getToken();
      const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.post<ApplicationResponse>(
        '/api/applications',
        {
          title: 'Internal Review Request',
          applicantName: 'Staff Portal User'
        },
        { headers }
      );
      setStatusMessage(`Created Application: ${response.data.title}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatusMessage(`Error: ${err.message}`);
      } else {
        setStatusMessage('Error: Unknown server error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NTC-EDGE Internal Portal</Text>
      <Text style={styles.subtitle}>Official Staff Dashboard • SDK 57 & React Nav 8</Text>
      
      <Button
        title="Review Application Queue"
        onPress={() => navigation.navigate('Queue')}
        color="#2e7d32" // Green theme for internal
      />

      <View style={{ marginTop: 15, width: '100%' }}>
        <Button
          title={submitting ? "Creating Job..." : "Submit Internal App to BE"}
          onPress={submitApplication}
          disabled={submitting}
          color="#388e3c"
        />
      </View>

      {statusMessage.length > 0 ? (
        <Text style={styles.statusText}>{statusMessage}</Text>
      ) : null}

      <View style={{ marginTop: 25, width: '100%' }}>
        <Button
          title="Sign Out"
          onPress={() => signOut()}
          color="#d32f2f"
        />
      </View>
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

function AuthScreen() {
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!signInLoaded) return;
    setError('');
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });
      if (setActive !== undefined) {
        await setActive({ session: completeSignIn.createdSessionId });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const onSignUpPress = async () => {
    if (!signUpLoaded) return;
    setError('');
    setLoading(true);
    try {
      const completeSignUp = await signUp.create({
        emailAddress: email,
        password,
      });
      if (completeSignUp.status === 'complete') {
        if (setActive !== undefined) {
          await setActive({ session: completeSignUp.createdSessionId });
        }
      } else {
        setError('Verification is required. Please check your Clerk setup.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NTC-EDGE Staff Portal</Text>
      <Text style={styles.subtitle}>Authentication Required</Text>

      <TextInput
        autoCapitalize="none"
        placeholder="Email Address"
        placeholderTextColor="#a5bda6"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#a5bda6"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {error.length > 0 ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity 
        style={styles.authButton} 
        onPress={isSignUpMode ? onSignUpPress : onSignInPress}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Processing...' : (isSignUpMode ? 'Register' : 'Sign In')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUpMode(!isSignUpMode)} style={{ marginTop: 15 }}>
        <Text style={styles.toggleText}>
          {isSignUpMode ? 'Already have an account? Sign In' : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
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
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <SignedIn>
        <Navigation />
      </SignedIn>
      <SignedOut>
        <AuthScreen />
      </SignedOut>
    </ClerkProvider>
  );
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
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#273e29',
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
    color: '#a5bda6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  statusText: {
    color: '#a5bda6',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

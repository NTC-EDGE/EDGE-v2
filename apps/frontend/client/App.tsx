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

function HomeScreen({ navigation }: any) {
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
          title: 'External Client Request',
          applicantName: 'External Client Portal'
        },
        { headers }
      );
      setStatusMessage(`Successfully submitted: ${response.data.title}`);
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
      <Text style={styles.title}>NTC-EDGE External Client</Text>
      <Text style={styles.subtitle}>Powered by Expo SDK 57 & React Navigation 8</Text>
      
      <Button
        title="View Application Details"
        onPress={() => navigation.navigate('Details')}
      />

      <View style={{ marginTop: 15, width: '100%' }}>
        <Button
          title={submitting ? "Submitting Application..." : "Submit Test Application to BE"}
          onPress={submitApplication}
          disabled={submitting}
          color="#2e7d32"
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

function DetailsScreen({ navigation }: any) {
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
      <Text style={styles.title}>NTC-EDGE Portal</Text>
      <Text style={styles.subtitle}>Authentication Required</Text>

      <TextInput
        autoCapitalize="none"
        placeholder="Email Address"
        placeholderTextColor="#8b9bb4"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#8b9bb4"
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
  initialRouteName: 'Home',
  screens: {
    Home: {
      screen: HomeScreen,
      options: { title: 'Welcome Portal' },
    },
    Details: {
      screen: DetailsScreen,
      options: { title: 'App Details' },
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

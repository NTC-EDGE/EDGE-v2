import { styles } from './SignUpScreen.styles';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '../../shared/theme/tokens';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { Logo } from '../../shared/components/Logo';
import { useSignUp } from '@clerk/clerk-expo';

interface SignUpScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const { signUp, setActive, isLoaded: signUpLoaded } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Animations
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    // Breathing background glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [cardFade, cardSlide, glowAnim]);

  const validate = (): boolean => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (name.trim().length === 0) {
      setNameError('Full name is required');
      isValid = false;
    }

    if (email.trim().length === 0) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError('Please enter a valid email containing "@"');
      isValid = false;
    }

    if (password.length === 0) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    }

    if (confirmPassword.length === 0) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    if (!signUpLoaded) {
      setGeneralError('Sign up service is not loaded yet. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const completeSignUp = await signUp.create({
        emailAddress: email,
        password,
      });

      if (completeSignUp.status === 'complete') {
        if (setActive !== undefined) {
          await setActive({ session: completeSignUp.createdSessionId });
        }
        setSuccess(true);
      } else {
        setGeneralError('Verification required. Please check your Clerk verification setup.');
      }
    } catch (err: any) {
      const errMsg = err.errors?.[0]?.message || 'Sign up failed. Please check your inputs.';
      setGeneralError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Animated background glows */}
        <Animated.View
          style={[
            styles.bgGlow,
            { transform: [{ scale: glowScale }] },
            Platform.OS === 'web' ? { filter: 'blur(100px)' } as any : { opacity: 0.12 }
          ]}
        />

        <View style={styles.outerContainer}>
          {/* Back to landing */}
          <Button
            title="Back to Landing Page"
            variant="text"
            size="sm"
            onPress={() => navigation.navigate('Landing')}
            style={styles.backButton}
            textStyle={styles.backButtonText}
            icon={<Lucide name="arrow-left" size={14} color={COLORS.neutral[600]} />}
          />

          <Animated.View
            style={[
              styles.card,
              SHADOWS.modal,
              { opacity: cardFade, transform: [{ translateY: cardSlide }] }
            ]}
          >
            {/* Header Logo */}
            <View style={styles.logoWrapper}>
              <Logo />
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register to start filing your applications</Text>

            {generalError.length > 0 ? (
              <Text style={styles.generalError}>{generalError}</Text>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Lucide name="check-circle" size={24} color={COLORS.semantic.success} style={styles.successIcon} />
                <Text style={styles.successText}>
                  Account created successfully! Redirecting to login...
                </Text>
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Full Name / Representative"
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  error={nameError}
                  autoCapitalize="words"
                  iconName="user"
                />

                <Input
                  label="Email Address"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="mail"
                />

                <Input
                  label="Password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={confirmPasswordError}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Button
                  title={loading ? 'Creating Account...' : 'Register'}
                  onPress={handleSignUp}
                  loading={loading}
                  style={styles.submitButton}
                  icon={!loading ? <Lucide name="user-plus" size={16} color={COLORS.neutral.white} /> : undefined}
                />

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Button
                    title="Sign In"
                    variant="text"
                    size="sm"
                    onPress={() => navigation.navigate('Login')}
                    textStyle={styles.footerLink}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

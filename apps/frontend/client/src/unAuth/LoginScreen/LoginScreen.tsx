import { styles } from './LoginScreen.styles';
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
import { useSignIn } from '@clerk/clerk-expo';
import { Select } from '../../shared/components/Select';
import { PHILIPPINE_REGIONS } from '../../shared/constants/regions';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const [region, setRegion] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation errors
  const [regionError, setRegionError] = useState('');
  const [phoneOrEmailError, setPhoneOrEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

    // Subtle background glow breathing effect
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
    setRegionError('');
    setPhoneOrEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (region.length === 0) {
      setRegionError('Philippine region is required');
      isValid = false;
    }

    const trimmedIdentifier = phoneOrEmail.trim();
    if (trimmedIdentifier.length === 0) {
      setPhoneOrEmailError('Phone number or email address is required');
      isValid = false;
    } else if (trimmedIdentifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedIdentifier)) {
        setPhoneOrEmailError('Please enter a valid email address');
        isValid = false;
      }
    } else {
      const sanitizedPhone = trimmedIdentifier.replace(/\s+/g, '');
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(sanitizedPhone)) {
        setPhoneOrEmailError('Please enter a valid phone number or email address');
        isValid = false;
      }
    }

    if (password.length === 0) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    if (!signInLoaded) {
      setGeneralError('Authentication service is not loaded yet. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: phoneOrEmail,
        password,
      });

      if (completeSignIn.status === 'complete') {
        if (setActive !== undefined) {
          await setActive({ session: completeSignIn.createdSessionId });
        }
        setSuccess(true);
      } else {
        setGeneralError(`Unable to complete sign-in. Status is: ${completeSignIn.status}. Please complete verification.`);
      }
    } catch (err: any) {
      const errMsg = err.errors?.[0]?.message || 'Invalid email/phone or password.';
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
            {/* Header and Brand */}
            <View style={styles.logoWrapper}>
              <Logo />
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your dashboard</Text>

            {generalError.length > 0 ? (
              <Text style={styles.generalError}>{generalError}</Text>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Lucide name="check-circle" size={24} color={COLORS.semantic.success} style={styles.successIcon} />
                <Text style={styles.successText}>Successfully authenticated! Redirecting...</Text>
              </View>
            ) : (
              <View style={styles.form}>
                <Select
                  label="Philippine Region"
                  placeholder="Select administrative region..."
                  value={region}
                  onValueChange={setRegion}
                  options={PHILIPPINE_REGIONS.map((reg) => ({ label: reg, value: reg }))}
                  error={regionError}
                  iconName="map-pin"
                />

                <Input
                  label="Phone No. / Email Address"
                  placeholder="e.g. 09171234567 or email@domain.com"
                  value={phoneOrEmail}
                  onChangeText={setPhoneOrEmail}
                  error={phoneOrEmailError}
                  keyboardType="default"
                  autoCapitalize="none"
                  iconName="user"
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Button
                  title="Forgot Password?"
                  variant="text"
                  size="sm"
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotButton}
                  textStyle={styles.forgotText}
                />

                <Button
                  title={loading ? 'Verifying Credentials...' : 'Sign In'}
                  onPress={handleSignIn}
                  loading={loading}
                  style={styles.submitButton}
                  icon={!loading ? <Lucide name="log-in" size={16} color={COLORS.neutral.white} /> : undefined}
                />



                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>New to EDGE? </Text>
                  <Button
                    title="Create an account"
                    variant="text"
                    size="sm"
                    onPress={() => navigation.navigate('SignUp')}
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

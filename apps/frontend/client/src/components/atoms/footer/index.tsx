import { Animated, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import  styles from '@styles/login/styles';
import EdgeBlue from '@assets/svg/edgeBlue';
import Text from '@atoms/text';
import React, { useEffect, useState } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import {useNavigation} from "@react-navigation/core";

function Footer() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 1000;
  const translateY = useSharedValue(height);
  const [menuVisible, setMenuVisible] = useState(false); // State for hamburger menu visibility
  const slideAnim = useState(new Animated.Value(250))[0];
  const navigation = useNavigation();
  const footerItems = [
    { label: 'User Agreement', screen: 'UserAgreement' },
    { label: 'Privacy Policy', screen: 'PrivacyPolicy' },
    { label: 'Community Guidelines', screen: 'CommunityGuidelines' },
    { label: 'Cookie Policy', screen: 'CookiePolicy' },
    { label: 'Send Feedback', screen: 'SendFeedback' },
    { label: 'Help Center', screen: 'HelpCenter' },
  ];
  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 100,
      stiffness: 100,
      mass: 1,
    });
  }, []);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });
  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  return <Animated.View style={[styles.footerContainer, { gap: 40 }, animatedStyle]}>
    {isSmallScreen ? (
      <View style={{ position: 'absolute', bottom: 10, right: 20 }}>
        <TouchableOpacity onPress={toggleMenu}>
          <View style={{ width: 30, height: 3, backgroundColor: '#000', marginVertical: 5 }} />
          <View style={{ width: 30, height: 3, backgroundColor: '#000', marginVertical: 5 }} />
          <View style={{ width: 30, height: 3, backgroundColor: '#000', marginVertical: 5 }} />
        </TouchableOpacity>
      </View>
    ) : (
      <View style={[styles.footerLinks, { flexDirection: 'row', gap: 20 }]}>
        <View style={styles.edgeFooter}>
          <EdgeBlue width={93} height={21} />
          <View>
            <Text style={[styles.footer]}> © {new Date().getFullYear()} </Text>
          </View>
        </View>
        {
          footerItems.map(({ label, screen }) => (
              <TouchableOpacity key={label} onPress={() => navigation.navigate(screen)}>
                <Text style={styles.footer}>{label}</Text>
              </TouchableOpacity>
          ))
        }
      </View>
    )}
    {menuVisible && isSmallScreen && (
      <TouchableWithoutFeedback onPress={toggleMenu}>
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#333',
            padding: 20,
            transform: [{ translateY: slideAnim }]
          }}
        >
          { footerItems.map(({ label, screen }) => (
              <TouchableOpacity key={label} onPress={() => navigation.navigate(screen)}>
                <Text style={styles.footer}>{label}</Text>
              </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableWithoutFeedback>
    )}
  </Animated.View>;
}


export default React.memo(Footer)

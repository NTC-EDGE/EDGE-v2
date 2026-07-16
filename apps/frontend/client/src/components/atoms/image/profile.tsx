import React, { useCallback } from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { MotiView } from "moti";
import Text from "../text";
import { isMobile, isTablet, getInitial, getColorFromName } from "@utils/fileHelper";
import { palette, text } from '@styles/color';
import { RFValue } from 'react-native-responsive-fontsize';
import { Bold, Regular } from '@styles/font';

const styles = StyleSheet.create({
  image: {
    height: 35,
    width: 35,
    borderRadius: 35,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: (isMobile && !(Platform?.isPad || isTablet())) ? RFValue(2) : 2,
    borderColor: palette.surface,
    overflow: 'hidden',
    shadowColor: palette.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  onlineBorder: {
    backgroundColor: palette.surface,
    borderColor: text.success,
    borderWidth: (isMobile && !(Platform?.isPad || isTablet())) ? RFValue(2.5) : 2.5,
    overflow: 'hidden',
    shadowColor: text.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  }
});

const ProfileImage = ({
  image = '',
  name = '',
  others = '',
  size = 35,
  textSize = 14,
  backgroundColor = '',
  isOnline = false,
  style = {},
  onlineStyle = {},
}) => {
  const imageSize = isOnline ? (isMobile && !(Platform?.isPad || isTablet())) ? RFValue(size - 5) : size - 5 : (isMobile && !Platform?.isPad) ? RFValue(size) : size

  const getBackgroundColor = useCallback(() => {
      if (!(backgroundColor)) {
      return getColorFromName(name);
    }
    return backgroundColor;
  }, [name, backgroundColor]);

  if (image) {
    return (
      <MotiView 
        from={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={isOnline && [styles.onlineBorder, { borderRadius: size * 1.5 }, onlineStyle]}
      >
        <View style={[
            styles.image,
            {
              backgroundColor: getBackgroundColor(),
              height: imageSize,
              width: imageSize,
              borderRadius: imageSize,
            },
            style
          ]}>
            {<View style={{ position: 'absolute' }}>
              <Text
                size={imageSize / 2.3}
                color={palette.secondary}
                style={{ fontFamily: Regular, marginRight: -1, marginTop: 1 }}
              >
                {others == "" ? getInitial(name) : others }
              </Text>
            </View>}
            <Image
              width={imageSize}
              height={imageSize}
              resizeMode={"cover"}
              source={{ uri: image }}
              style={[{
                height: imageSize,
                width: imageSize,
                borderRadius: imageSize
              },  style]}
            />
        </View>

      </MotiView>
    );
  }
  return (
    <MotiView 
      from={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={isOnline && [styles.onlineBorder, { borderRadius: size * 2 }, onlineStyle]}
    >
      <View
        style={[
          styles.image,
          {
            backgroundColor: getBackgroundColor(),
            height: imageSize,
            width: imageSize,
            borderRadius: size,
          },
          style
        ]}>
        <Text
          size={textSize}
          color={palette.secondary}
          style={{ fontFamily: Bold, marginRight: -1, marginTop: 1 }}
        >
            {others == "" ? getInitial(name) : others }
        </Text>
      </View>
    </MotiView>
  )
}

export default ProfileImage

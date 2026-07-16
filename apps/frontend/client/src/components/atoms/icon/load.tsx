// Load.tsx
import React, { FC } from 'react';
import { View } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { AntDesign } from '@expo/vector-icons';
import {RFValue} from "react-native-responsive-fontsize";
import {Loader2} from "lucide-react-native";

interface Props {
  size?: number;
  color?: string;
  label?: string;
}

const Load: FC<Props> = ({ size = 12, color = '#60A5FA', label }) => {
  const spinnerSize = RFValue(size);

  return (
      <View style={{ paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' }}>
        <MotiView
            from={{ rotate: '0deg', scale: 1 }}
            animate={{ rotate: '360deg', scale: [1, 1.1, 1] }}
            transition={{
              type: 'timing',
              loop: true,
              duration: 1200,
              repeatReverse: false,
            }}
        >
            <Loader2
                size={spinnerSize / 1.5}
                color={color}
                strokeWidth={2}
            />
        </MotiView>

        {label && (
            <MotiText
                from={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ loop: true, duration: 1600 }}
                style={{
                  marginTop: 6,
                  color,
                  fontSize: RFValue(11),
                  fontWeight: '600',
                  letterSpacing: 0.5,
                }}
            >
              {label}
            </MotiText>
        )}
      </View>
  );
};

export default React.memo(Load);

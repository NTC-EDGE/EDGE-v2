import React, {FC} from "react";
import { MotiView } from "moti";
import { RFValue } from "react-native-responsive-fontsize";

interface Props {
  size?: number;
  color?: string;
  style?: any;
}

const Dot: FC<Props> = ({
                          size = 16,
                          color = "#000",
                          style = {},
                        }) => {
  const finalSize = RFValue(size);

  return (
      <MotiView
          from={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            loop: true,
            type: "timing",
            duration: 1100,
          }}
          style={[
            {
              height: finalSize,
              width: finalSize,
              borderRadius: finalSize / 2,
              backgroundColor: color,
            },
            style,
          ]}
      />
  );
};

export default React.memo(Dot);

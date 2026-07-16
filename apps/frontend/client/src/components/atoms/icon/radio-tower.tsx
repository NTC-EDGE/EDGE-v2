import React, { FC } from "react";
import { RadioTower } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const Plus: FC<Props> = ({
                                     size = 24,
                                     color = "#000",
                                     ...otherProps
                                   }) => {
  return (
      <RadioTower
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(Plus);

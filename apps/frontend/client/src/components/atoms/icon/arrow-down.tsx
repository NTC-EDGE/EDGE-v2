import React, { FC } from "react";
import { ChevronDown } from "lucide-react-native";    // or "lucide-react"
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  type?: string;
  size?: number;
  color?: string;
  [x: string]: any;
}

const ArrowDown: FC<Props> = ({
                                type = "",
                                size = 24,
                                color = "#000",
                                ...otherProps
                              }) => {
  return (
      <ChevronDown
          size={RFValue(size)}
          color={color}
          strokeWidth={2}       // same line weight as Lucide icons
          {...otherProps}
      />
  );
};

export default React.memo(ArrowDown);

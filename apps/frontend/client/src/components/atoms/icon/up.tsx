import React, { FC } from "react";
import { ChevronUp } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  type?: string;
  size?: number;
  color?: string;
  [x: string]: any;
}

const Up: FC<Props> = ({
                         type = "",
                         size = 24,
                         color = "#000",
                         ...otherProps
                       }) => {
  return (
      <ChevronUp
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(Up);

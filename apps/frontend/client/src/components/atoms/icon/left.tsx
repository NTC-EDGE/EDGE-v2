import React, { FC } from "react";
import { ChevronLeft } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const Left: FC<Props> = ({
                           size = 24,
                           color = "#000",
                           ...otherProps
                         }) => {
  return (
      <ChevronLeft
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(Left);

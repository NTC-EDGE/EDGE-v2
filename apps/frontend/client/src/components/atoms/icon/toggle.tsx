import React, { FC } from "react";
import { ToggleRight } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const ToggleIcon: FC<Props> = ({
                                 size = 24,
                                 color = "black",
                                 ...otherProps
                               }) => {
  return (
      <ToggleRight
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(ToggleIcon);

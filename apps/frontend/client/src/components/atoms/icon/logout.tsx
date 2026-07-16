import React, { FC } from "react";
import { LogOut } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const Help: FC<Props> = ({
                           size = 24,
                           color = "#000",
                           ...otherProps
                         }) => {
  return (
      <LogOut
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(Help);

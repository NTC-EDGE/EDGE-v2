import React, { FC } from "react";
import { AlertCircle } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface Props {
  type?: "circle" | "";
  size?: number;
  color?: string;
  [x: string]: any;
}

const Exclamation: FC<Props> = ({
                                  type = "",
                                  size = 24,
                                  color = "#000",
                                  ...otherProps
                                }) => {
  return (
      <AlertCircle
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(Exclamation);

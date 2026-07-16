import React, { FC } from "react";
import { Camera as LucideCamera } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface Props {
  type?: string;
  size?: number;
  color?: string;
  [x: string]: any;
}

const Camera: FC<Props> = ({
                             type = "",
                             size = 24,
                             color = "#000",
                             ...otherProps
                           }) => {
  return (
      <LucideCamera
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(Camera);

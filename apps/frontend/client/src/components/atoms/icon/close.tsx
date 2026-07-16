import React, { FC } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import { X, CircleX } from "lucide-react-native";

interface Props {
  type?: string;
  size?: number;
  color?: string;
  [x: string]: any;
}

const Close: FC<Props> = ({
  type = "",
  size = 24,
  color = "#000",
  ...otherProps
}) => {
  const finalSize = (size);

  switch (type) {
    case "circle": // outline circle X
      return (
        <CircleX
          size={finalSize}
          color={color}
          strokeWidth={1.8}
          {...otherProps}
        />
      );

    case "block-circle": // Lucide has no filled version, use same icon
      return (
        <CircleX
          size={finalSize}
          color={color}
          strokeWidth={2.4}
          {...otherProps}
        />
      );

    default:
      return <X size={finalSize} color={color} {...otherProps} />;
  }
};

export default React.memo(Close);

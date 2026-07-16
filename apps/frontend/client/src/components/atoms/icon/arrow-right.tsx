import React, { FC } from "react";
import { ArrowRight as LucideArrowRight } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface Props {
  type?: string;
  size?: number;
  color?: string;
  [x: string]: any;
}

const ArrowRight: FC<Props> = ({
                                 type = "",
                                 size = 24,
                                 color = "#000",
                                 ...otherProps
                               }) => {
  return (
      <LucideArrowRight
          size={RFValue(size)}
          color={color}
          strokeWidth={2}     // gives sharp clean Lucide outline
          {...otherProps}
      />
  );
};

export default React.memo(ArrowRight);

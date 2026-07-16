import React, { FC } from "react";
import { ChevronRight } from "lucide-react-native"; // closest visual match
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const ArrowRight: FC<Props> = ({
                                 size = 24,
                                 color = "#000",
                                 ...otherProps
                               }) => {
  return (
      <ChevronRight
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(ArrowRight);

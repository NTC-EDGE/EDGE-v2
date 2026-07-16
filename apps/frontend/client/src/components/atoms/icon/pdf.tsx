import React, { FC } from "react";
import { FileText } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const PDF: FC<Props> = ({
                          size = 24,
                          color = "#000",
                          ...otherProps
                        }) => {
  return (
      <FileText
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(PDF);

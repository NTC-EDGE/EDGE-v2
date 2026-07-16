import React, { FC } from "react";
import { Upload as UploadIcon } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  type?: string;
  size?: number;
  color?: string;
  [x: string]: any;
}

const Upload: FC<Props> = ({
                             type = "",
                             size = 24,
                             color = "#000",
                             ...otherProps
                           }) => {
  return (
      <UploadIcon
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(Upload);

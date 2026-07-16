import React, { FC } from "react";
import { FilePlus } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const FileAdd: FC<Props> = ({
                              size = 24,
                              color = "#000",
                              ...otherProps
                            }) => {
  return (
      <FilePlus
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(FileAdd);

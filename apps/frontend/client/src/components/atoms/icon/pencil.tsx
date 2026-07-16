import React, { FC } from "react";
import { Pencil as PencilIcon, SquarePen } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  type?: "square" | "";   // keep same API
  size?: number;
  color?: string;
  [x: string]: any;
}

const Pencil: FC<Props> = ({
                             type = "",
                             size = 24,
                             color = "#000",
                             ...otherProps
                           }) => {
  const iconProps = {
    size: RFValue(size),
    color,
    strokeWidth: 2,
    ...otherProps,
  };

  return type === "square" ? (
      <SquarePen {...iconProps} />
  ) : (
      <PencilIcon {...iconProps} />
  );
};

export default React.memo(Pencil);

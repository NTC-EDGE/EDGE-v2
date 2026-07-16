import React, { FC } from "react";
import { MapPin } from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  size?: number;
  color?: string;
  [x: string]: any;
}

const MapMarker: FC<Props> = ({
                                size = 24,
                                color = "#000",
                                ...otherProps
                              }) => {
  return (
      <MapPin
          size={RFValue(size)}
          color={color}
          strokeWidth={2}
          {...otherProps}
      />
  );
};

export default React.memo(MapMarker);

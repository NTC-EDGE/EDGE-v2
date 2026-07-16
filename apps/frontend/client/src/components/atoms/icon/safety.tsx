import React, { FC } from 'react'
import { AntDesign } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import {Search} from "lucide-react-native";

interface Props {
  type?: string;
  size?: number;
  color?: string;
  [x: string]: any;
};

const Magnifier: FC<Props> = ({
  type = '',
  size = 24,
  color = '#000',
  ...otherProps
}) => {
  return (
      <Search
          size={RFValue(size)}
          color={color}
          strokeWidth={2}  // crisper modern look
          {...otherProps}
      />
  );
};

export default React.memo(Magnifier);

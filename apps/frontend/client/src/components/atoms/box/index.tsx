import React, { FC, ReactNode } from 'react';
import { View } from 'react-native';
import styles from './styles';

interface Props {
  borderStyle?: any;
  children?: ReactNode;
};

const Box: FC<Props> = ({
  borderStyle = 'solid',
  children,
}) => {
	return (
    <View style={[styles.view, { borderStyle }]}>
      {children}
    </View>	
	)
};

export default Box;
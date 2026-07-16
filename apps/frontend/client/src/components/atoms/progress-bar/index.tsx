import React, { FC } from 'react';
import Bar from "@atoms/expo-progress/Bar"
import propsStyles from '@atoms/progress-steps/props-styles';
import styles from './styles';

interface Props {
  [x: string]: any;
};

const ProgressBar: FC<Props> = ({
  ...otherProps
}) => {
  return (
    <Bar
      style={styles.progress}
      {...propsStyles.progress}
      {...otherProps}
      duration={700}
      isIndeterminate
    />
  )
};

export default React.memo(ProgressBar);

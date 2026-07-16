import React, {FC, useMemo} from 'react';
import { StatusBar, View } from 'react-native';
import styles from './styles';

interface Props {
  barStyle?: any;
  backgroundColor?: string,
};

const Statusbar: FC<Props> = ({
  barStyle = 'default',
  backgroundColor = ''
}) => {
  const stylesMemo = useMemo(() => {
    return styles;
  }, [])
  return (
    <View style={[stylesMemo.view, { backgroundColor }]}>
      <StatusBar barStyle={barStyle} />
    </View>
  )
};

export default React.memo(Statusbar);

import React, {useMemo} from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@atoms/text';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10
  }
});

const DateTimeField = ({
  title = '',
  value = '',
  placeholder = '',
  style
}: any) => {
  const stylesMemo = useMemo(() => {
    return styles;
  }, [])
  return (
    <View style={[stylesMemo.container, style]}>
      <Text style={{ marginBottom: 5 }} fontSize={16}>
        {title}
      </Text>
   
    </View>
  );
};

export default React.memo(DateTimeField);

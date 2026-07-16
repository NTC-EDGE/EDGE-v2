import React, { FC } from 'react';
import { View, FlatList } from 'react-native';
import styles from './styles';

interface Requirement {
  title?: string;
  description?: string;
}

interface Props {
  flastlistStyle?: any;
  requirements?: Requirement[];
  renderItem?: any;
};

const renderItemSeparator = () => <View style={styles.separator} />

const List: FC<Props> = ({
  flastlistStyle = {},
  requirements = [],
  renderItem = () => {},
}) => {
  return (
    <FlatList
      // Optimization: Restored virtualization by using a sensible initialNumToRender.
      // Removed extreme maxToRenderPerBatch which was disabling virtualization.
      initialNumToRender={10}
      style={flastlistStyle}
      scrollEnabled={true}
      data={requirements}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${index}`}
      ItemSeparatorComponent={renderItemSeparator}
    />
  )
}

export default React.memo(List);

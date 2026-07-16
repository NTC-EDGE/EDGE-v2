import React, { FC, useCallback } from 'react';
import { View, FlatList, Platform } from 'react-native';
import Text from '@atoms/text';
import styles from './styles';

interface Props {
  content?: any;
};

// Optimization: Extracted static components outside to ensure stable references.
const ItemSeparator = () => <View style={styles.separator} />;
const ItemSeparator2 = () => <View style={styles.separator2} />;
const ListFooter = () => <View style={styles.footer} />;
const keyExtractor = (_item: any, index: number) => `${index}`;

// Optimization: Memoized SubAvailItem to prevent re-renders when parent list updates.
const SubAvailItem = React.memo(({ item }: { item: any }) => (
  <View style={styles.row}>
    <Text style={[styles.subText, styles.indentedText]}>•</Text>
    <View style={styles.rightView}>
      <Text style={styles.subText}>{item}</Text>
    </View>
  </View>
));

// Optimization: Memoized AvailItem and stabilized its nested FlatList callbacks.
const AvailItem = React.memo(({ item, index }: { item: any, index: number }) => {
  let { title, list } = item;
  let hasList = list?.length > 0;
  let textStyle = hasList ? styles.headerText : styles.subText;

  const renderSubItem = useCallback(({ item }: any) => <SubAvailItem item={item} />, []);

  return (
    <>
      <View style={styles.row}>
        <Text style={textStyle}>{index + 1}.</Text>
        <View style={styles.rightView}>
          <Text style={textStyle}>{title}</Text>
        </View>
      </View>
      {
        hasList &&
        <FlatList
          // Optimization: Restored virtualization by adding performance props.
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          style={styles.flatlist2}
          data={list}
          renderItem={renderSubItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator2}
        />
      }
    </>
  );
});

// Optimization: Extracted AboutHeader for the main FlatList.
const AboutHeader = React.memo(({ heading, description }: { heading: string, description: string }) => (
  <View style={styles.mainHeaderContainer}>
    <Text style={[styles.headerText, styles.mainHeaderText]}>{heading}</Text>
    {
      !!description &&
      <Text style={styles.subText}>{description}</Text>
    }
  </View>
));

const About: FC<Props> = ({
  content = {},
}) => {
  const {
    heading = '',
    description = '',
    whoMayAvail = [],
  } = content;

  // Optimization: Stabilized main list renderItem.
  const renderAvailItem = useCallback(({ item, index }: any) => (
    <AvailItem item={item} index={index} />
  ), []);

  const renderMainItem = useCallback(({ item }: { item: number }) => {
    if (item === 0) {
      return <AboutHeader heading={heading} description={description} />;
    } else {
      return (
        <View style={{ ...Platform.select({ web: { top: -20 } }) }}>
          <FlatList
            // Optimization: Restored virtualization.
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            showsVerticalScrollIndicator={true}
            style={styles.flatlistContainer}
            data={whoMayAvail}
            ListHeaderComponent={<Text style={styles.whoMayAvailText}>WHO MAY AVAIL:</Text>}
            ListFooterComponent={ListFooter}
            renderItem={renderAvailItem}
            ItemSeparatorComponent={ItemSeparator}
            keyExtractor={keyExtractor}
          />
        </View>
      );
    }
  }, [heading, description, whoMayAvail, renderAvailItem]);

  return (
    <FlatList
      // Optimization: Restored virtualization.
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      style={styles.flatlist}
      showsVerticalScrollIndicator={true}
      data={[0, 1]}
      renderItem={renderMainItem}
      keyExtractor={keyExtractor}
    />
  );
};

export default React.memo(About);

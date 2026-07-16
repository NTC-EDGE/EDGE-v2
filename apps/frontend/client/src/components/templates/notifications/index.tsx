import React, { FC, useState, useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { Close } from '@atoms/icon';
import Ellipsis from '@atoms/ellipsis';
import Text from '@atoms/text';
import NavBar from '@organisms/navbar';
import styles from './styles';
import { infoColor, text } from '@styles/color';
import moment from 'moment';

interface Props {
  notification?: any;
  onBack?: any;
  onRefresh?: any;
  onLoadMore?: any;
  loading?: boolean;
};

// Extracted NotificationItem to prevent re-creation of component type on every parent render.
const NotificationItem = React.memo(({item}: any) => {
  return (
    <View style={styles?.notifView}>
      <Text style={[styles?.notifTitle, /*!item?.isRead && {color: text?.primary}*/]}>{item?.title}</Text>
      <Text style={styles?.notifDate}>{moment(item?.createdAt).format('LLL')}</Text>
      <Text>{item?.message}</Text>
    </View>
  )
});

const Notifications: FC<Props> = ({
  notification = [],
  onBack = () => {},
  onRefresh = () => {},
  onLoadMore = () => {},
  loading,
}) => {
  const { list = [] } = notification;
  const [scroll, setScroll] = useState(false);

  const renderItem = useCallback(({item}: any) => (
    <NotificationItem item={item} />
  ), []);

  const renderItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  const renderEmpty = useCallback(() => (
		<View style={styles.emptyView}>
			<Text>
				No notifications yet.
			</Text>
		</View>
	), []);

  const renderFooter = useCallback(() => (
    <View style={styles?.bottomView}>
      {
        loading &&
        <Ellipsis color={infoColor} size={10} />
      }
    </View>
  ), [loading]);

  const onEndReached = useCallback(() => {
    if (!scroll) {
      onLoadMore();
      setScroll(true);
    }
  }, [scroll, onLoadMore]);

  const onMomentumScrollBegin = useCallback(() => setScroll(false), []);

  const keyExtractor = useCallback((_: any, index: number) => `${index}`, []);
  
  return (
    <>
      <NavBar
        title='Notifications'
        leftIcon={<Close color='#fff' />}
        onLeft={onBack}
      />
      <FlatList
        style={styles?.flatlist}
        showsVerticalScrollIndicator={true}
        keyExtractor={keyExtractor}
        data={list}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshing={!!loading}
        onRefresh={onRefresh}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onEndReachedThreshold={.2}
        onEndReached={onEndReached}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </>
  )
};

export default React.memo(Notifications);

import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Note: RootStateOrAny was removed in react-redux v8+.
// Using 'any' for the state for now to maintain compatibility with the environment's typechecker.
import { useNavigation } from '@react-navigation/core';
import Notifications from '@templates/notifications';
import { fetchNotifications } from '@reducers/notification/actions';

const NotificationsNavigator = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const stateNotification = useSelector((state: any) => state?.notifications);
  const { notification = {}, fetchingNotifications } = stateNotification;

  useEffect(() => {
    if (!(notification?.list > 0)) {
      dispatch(fetchNotifications());
    }
  }, []);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onRefresh = useCallback(() => dispatch(fetchNotifications()), [dispatch]);
  const onLoadMore = useCallback(() => {
    if (notification?.list?.length < notification?.total) {
      dispatch(fetchNotifications({ page: (notification?.page || 0) + 1 }));
    }
  }, [dispatch, notification?.list?.length, notification?.total, notification?.page]);

  return (
    <Notifications
      notification={notification}
      onBack={onBack}
      onRefresh={onRefresh}
      onLoadMore={onLoadMore}
      loading={fetchingNotifications}
    />
  )
};


export default React.memo(NotificationsNavigator);

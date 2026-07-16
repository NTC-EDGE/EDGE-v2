import { logoutUser } from '@reducers/user/actions';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import {RootStateOrAny, useDispatch, useSelector} from 'react-redux';
import { resetCredentials } from './useBiometrics';
import useOneSignal from './useOneSignal';
import { useIsFocused } from '@react-navigation/native';
import { TIMER_LOGOUT } from '@utils/ntc';
import UserInactiveCheck from "@molecules/user-inactivity-check";

interface Props {
  children?: ReactNode;
};

const AppInactivity: FC<Props> = ({
  children,
}) => {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const dispatch = useDispatch();
  const [active, setActive] = useState(true);
  const [timer, setTimer] = useState(TIMER_LOGOUT);

  const biometricsLogin = useSelector(state => state?.user?.biometrics);
  const [enableBiometrics, setEnableBiometrics] = useState(false);
  useEffect(() => {
    if (biometricsLogin) setEnableBiometrics(true);
    else setEnableBiometrics(false);
  }, [biometricsLogin]);
  const { destroy } = useOneSignal();
  const onLogout = () => {
    if (!enableBiometrics) resetCredentials();
    setTimeout(() => {
      navigation.dispatch((state: RootStateOrAny) => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login', params: {loggedOut: true} }],
        });
      });
    }, 500);
    setTimeout(() => {
      dispatch(logoutUser());
      destroy();
    }, 1000);
  };

  useEffect(() => {
    if (!active && focused) onLogout();
  }, [active]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActive(true);
      setTimer(TIMER_LOGOUT);
    });
    return unsubscribe;
  }, [navigation]);

	return (
    <UserInactiveCheck
      isActive={active}
      timeForInactivity={timer}
      onAction={isActive => { setActive(isActive); }}
    >
      {children}
    </UserInactiveCheck>
	)
};

export default React.memo(AppInactivity);

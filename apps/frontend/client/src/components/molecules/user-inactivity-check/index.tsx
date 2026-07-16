import React, { FC, ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/core';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { TIMER_LOGOUT } from '@utils/ntc';
import useOneSignal from "@hooks/useOneSignal";
import { resetCredentials } from "@hooks/useBiometrics";
import { logoutUser } from '@reducers/user/actions';
import { Platform, TouchableWithoutFeedback, View } from 'react-native';
import Alert from '@atoms/alert'; // your custom alert

interface Props {
    children?: ReactNode;
}

const AppInactivity: FC<Props> = ({ children }) => {
    const navigation = useNavigation();
    const focused = useIsFocused();
    const dispatch = useDispatch();
    const [active, setActive] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    const biometricsLogin = useSelector(state => state?.user?.biometrics);
    const enableBiometrics = biometricsLogin || false;
    const { destroy } = useOneSignal();

    const clearInactivityTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const resetInactivityTimeout = useCallback(() => {
        clearInactivityTimeout();
        timeoutRef.current = setTimeout(() => {
            setShowAlert(true); // show warning before logout
        }, TIMER_LOGOUT);
    }, []);

    const handleUserActivity = useCallback(() => {
        setActive(true);
        resetInactivityTimeout();
    }, [resetInactivityTimeout]);

    const onLogout = useCallback(() => {
        if (!enableBiometrics) resetCredentials();

        setTimeout(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'EdgePortal', params: { loggedOut: true } }],
            });
        }, 500);

        setTimeout(() => {
            dispatch(logoutUser());
            destroy();
        }, 1000);
    }, [dispatch, destroy, enableBiometrics, navigation]);

    const onStayLoggedIn = () => {
        setShowAlert(false);
        setActive(true);
        resetInactivityTimeout();
    };

    const onConfirmLogout = () => {
        setShowAlert(false);
        setActive(false); // triggers logout via useEffect
    };

    useEffect(() => {
        if (!active && focused && !showAlert) {
            onLogout();
        }
    }, [active, focused, showAlert]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setActive(true);
            resetInactivityTimeout();
        });
        return unsubscribe;
    }, [navigation, resetInactivityTimeout]);

    useEffect(() => {
        const activityEvents = Platform.OS === 'web' ? ['touchstart', 'mousemove', 'keydown'] : [];

        const debouncedActivityHandler = debounce(handleUserActivity, 300);

        activityEvents.forEach(event =>
            document.addEventListener(event, debouncedActivityHandler)
        );

        return () => {
            clearInactivityTimeout();
            activityEvents.forEach(event =>
                document.removeEventListener(event, debouncedActivityHandler)
            );
        };
    }, [handleUserActivity]);

    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timer: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const handleInteraction = () => {
        handleUserActivity();
    };

    return (
        <>
            <TouchableWithoutFeedback onPress={handleInteraction} onLongPress={handleInteraction}>
                <View style={{ flex: 1 }}>
                    {children}
                </View>
            </TouchableWithoutFeedback>

            <Alert
                visible={showAlert}
                title="Are you still there?"
                message="You will be logged out due to inactivity."
                confirmText="Logout"
                cancelText="Stay Logged In"
                onConfirm={onConfirmLogout}
                onCancel={onStayLoggedIn}
            />
        </>
    );
};

export default React.memo(AppInactivity);

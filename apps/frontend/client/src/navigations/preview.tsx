import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";

import PaymentSOA from "@pages/payment/soa";
import ApplicationSteps from "@pages/application-steps";
import Preview from "@templates/application-steps/preview";
import {useSelector} from "react-redux";
import {Platform} from "react-native";

type RootStackParamList = {
    Preview: undefined;
    ApplicationSteps: undefined;
    PaymentSOA: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const PreviewNavigator = () => {
    const lastRouteRef = React.useRef<string | null>(null);
    const buttonText = useSelector(state => state?.application?.buttonText);
    return (
        <Stack.Navigator
            initialRouteName="Preview"
            screenOptions={{ gestureEnabled: false, headerShown: false }}
            screenListeners={({ navigation }) => ({
                state: (e) => {
                    if(Platform.OS === "web"){
                        const s = e.data.state;
                        const active = s.routes[s.index]?.name as string | undefined;
                        if (!active) return;

                        if (lastRouteRef.current === active) return;
                        lastRouteRef.current = active;
                        if (active === "PaymentSOA" && buttonText == "Preview") {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: "Preview" }],
                                })
                            );
                        }
                    }
                },
            })}
        >
            <Stack.Screen name="Preview" component={Preview} />
            <Stack.Screen name="ApplicationSteps" component={ApplicationSteps} />
            <Stack.Screen name="PaymentSOA" component={PaymentSOA} />
        </Stack.Navigator>
    );
};

export default React.memo(PreviewNavigator);

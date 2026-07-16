    import * as React from 'react';
    import {createNativeStackNavigator} from '@react-navigation/native-stack';
    import PaymentMethods from "@pages/payment/methods";
    import PaymentMethodInstructions from "@pages/payment/methods/instructions";
    import PaymentForVerification from "@pages/payment/for-verification";
    import PaymentSOA from '@pages/payment/soa';

    type RootStackParamList={
        PaymentSOA:undefined;
        PaymentMethods:undefined;
        PaymentMethodInstructions:undefined;
        PaymentForVerification:undefined;
    };
    const Stack=createNativeStackNavigator<RootStackParamList>();

    const PaymentNavigator=({navigation})=>{
        return (
            <Stack.Navigator
                screenOptions={({route})=>(
                    {
                        gestureEnabled:false,
                        headerShown:false,

                    })}
                initialRouteName="PaymentSOA"
            >
                <Stack.Screen name="PaymentSOA"  component={PaymentSOA}/>
                <Stack.Screen name="PaymentMethods" component={PaymentMethods}/>
                <Stack.Screen name='PaymentMethodInstructions' component={PaymentMethodInstructions}/>
                <Stack.Screen name='PaymentForVerification' component={PaymentForVerification}/>
            </Stack.Navigator>
        );
    };

    export default React.memo(PaymentNavigator);

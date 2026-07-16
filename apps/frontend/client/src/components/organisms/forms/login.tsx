import React, {FC, useMemo, useRef, useCallback} from 'react';
import {Dimensions,Platform,StyleSheet,TouchableOpacity,View} from 'react-native';
import { isMobile, isTablet, RNValue as RFValue } from '@utils/formatting';
import Text from '@atoms/text';
import {InputField,PasswordField} from '@molecules/form-fields';
import {text} from '@styles/color';
import DropdownField from '@molecules/form-fields/dropdown-field';
import DeviceInfo from "react-native-device-info";

const {width,height}=Dimensions.get('screen');
const styles=StyleSheet.create({
    container:{
        flex:1,
        ...Platform.select({
            native:{},
            web:{
                minWidth:330,
                minHeight:(
                    width*0.27)/height
            }
        })
    },
    forgotPasswordText:{
        ...Platform.select({
            native:{
                color:text.info,
                fontSize:RFValue(12),
            },
            web:{
                color: "#003366",
                fontSize:RFValue(14),
            }
        }),


        marginTop:-10,
    },
    horizontal:{
        flexDirection:'row',
        alignItems:'center',
    },
    unchecked:{
        height:18,
        width:18,
        backgroundColor:'#DBDFE5',
        borderRadius:3,
    }
});

interface Props{
    isBiometricSupported?: boolean;
    onBiometrics?:any;
    form?:any;
    onChangeValue?:any;
    showForgotPassword?:boolean
}

const LoginForm:FC<Props>=({isBiometricSupported=false,onBiometrics=()=>{},form={},onChangeValue=()=>{}, showForgotPassword=true })=>{
    const inputRef:any=useRef(null);
    const passwordRef:any=useRef(null);

    const handleRegionChange = useCallback((value: string) => onChangeValue('CreatedAt', value), [onChangeValue]);

    const handleEmailKeyPress = useCallback((event: any) => {
        if (Platform?.OS === "web" && event?.nativeEvent?.key == "Tab") {
            event?.preventDefault();
            passwordRef?.current?.focus();
        }
    }, []);

    const handleEmailChange = useCallback((value: string) => onChangeValue('email', value), [onChangeValue]);

    const handleEmailSubmit = useCallback((event: any) => {
        passwordRef.current.focus();
        onChangeValue('email', event.nativeEvent.text);
    }, [onChangeValue]);

    const handleShowPassword = useCallback(() => onChangeValue('showPassword'), [onChangeValue]);

    const handlePasswordChange = useCallback((value: string) => onChangeValue('password', value), [onChangeValue]);

    const handlePasswordSubmit = useCallback((event: any) => {
        if (form?.password?.value && !form?.password?.error) {
            let cred: any = {
                email: form?.email?.value,
                password: form?.password?.value,
                createdAt: form?.CreatedAt?.value?.value
            };
            if (form?.email?.isPhone) {
                cred = {
                    phone: form?.email?.value,
                    password: form?.password?.value,
                    createdAt: form?.createdAt?.value
                }
            }
            onChangeValue('login', cred);
        }
    }, [onChangeValue, form?.password?.value, form?.password?.error, form?.email?.value, form?.CreatedAt?.value?.value, form?.email?.isPhone, form?.createdAt?.value]);

    const handleForgotPassword = useCallback(() => onChangeValue('forgotPassword'), [onChangeValue]);

    const regionSelection = useMemo(() => {
        return   [
            {label: "Region I - Ilocos Region",value: "ntc-region1",key:"1"},
            {label: "Region III - Central Luzon",value: "ntc-region3",key:"3"},
            {label: "Region IV-A - CALABARZON",value: "ntc-region4a",key:"4a"},
            {label: "Region VII - Central Visayas",value: "ntc-region7",key:"7"},
            {label: "Region IX - Zamboanga Peninsula",value: "ntc-region9",key:"9"},
            {label: "Region X - Northern Mindanao",value: "ntc-region10",key:"10"},
            {label: "Region XI - Davao Region",value: "ntc-region11",key:"11"},
            {label: "Region XII - SOCCSKSARGEN",value: "ntc-region12",key:"12"},
            {label: "Region XIII - Caraga",value: "ntc-region13",key:"13"},
            {label: "Region XIV",value: "ntc-region14",key:"14"},
        ]
    }, [])
    return (
        <View style={styles.container}>
            <View>
                <DropdownField

                  items={regionSelection}
                  value={form?.CreatedAt?.value?.label ?? ""}
                  onChangeValue={handleRegionChange}
                  placeholder='Region'
                />
            </View>
            {
                !(isTablet)  ? <InputField
                    onKeyPress={handleEmailKeyPress}
                    ref={inputRef}
                    label='Phone no./Email Address'
                    placeholder='Phone no./Email Address'
                    required={true}
                    hasValidation={true}
                    value={form?.email?.value}
                    error={form?.email?.error}
                    // keyboardType={'email-address'}

                    onChangeText={handleEmailChange}
                    onSubmitEditing={handleEmailSubmit}
                /> : <></>
            }
            {
                !(isTablet) ?
            <PasswordField
                ref={passwordRef}
                label='Password'
                placeholder='Password'
                textContentType='oneTimeCode'
                required={true}
                hasValidation={true}
                secureTextEntry={!form?.showPassword?.value}
                error={form?.password?.error}
                value={form?.password?.value}
                showPassword={handleShowPassword}
                onChangeText={handlePasswordChange}
                onSubmitEditing={handlePasswordSubmit}
            /> : <></> }
            {!DeviceInfo?.isTablet() ? isBiometricSupported&&<View style={[styles.horizontal,{ justifyContent:'flex-start', marginTop: -5, marginBottom: 20 }]}>
                <TouchableOpacity onPress={onBiometrics}>
                    <Text
                        style={[{color:text.info, fontSize:RFValue(12),}]}
                        size={12}
                    >
                        Login with biometrics
                    </Text>
                </TouchableOpacity>
            </View> : <></>}
            {!DeviceInfo?.isTablet()  ? Platform.select({
                web: showForgotPassword ? <View style={{ paddingVertical: 24, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                        Forgot your password?
                    </Text>
                </TouchableOpacity></View> : <></>,
                native:<TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                        Forgot your password?
                    </Text>
                </TouchableOpacity>,

            }) : <></>}
        </View>
    );
};

export default React.memo(LoginForm);

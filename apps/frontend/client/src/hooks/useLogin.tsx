import {useDispatch,useSelector} from "react-redux";
import {useFocusEffect} from "@react-navigation/native";
import React, {useEffect, useState} from "react";
import {Alert, BackHandler, Platform} from "react-native";
import { loginUser, setCreatedAt } from '@reducers/user/actions';
import {validateEmail,validatePassword, validatePhone} from "@utils/form-validations";
import { changeCreatedAt } from '@config/api';
import AsyncStorage from "@react-native-async-storage/async-storage";
const errorResponse = {
    email: 'Enter a valid email address',
    password: 'Password must be at least 8 characters',
};
export function useLogin(navigation: any, route: any){
    const stateUser = useSelector(state => state?.user);
    const {loggingIn, session, loginUserError } = stateUser;
    const [loggedOut, setLoggedOut] = useState(route?.params?.loggedOut);
    const dispatch=useDispatch();

    useFocusEffect(
        React.useCallback(()=>{
            const onBackPress=()=>{
                Alert.alert(
                    'Quit Application',
                    'Are you sure you want to quit the application?',
                    [
                        {
                            text:'Cancel',
                        },
                        {
                            text:'OK',
                            onPress:()=>BackHandler.exitApp()
                        },
                    ]
                );
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress',onBackPress);
            return ()=>BackHandler.removeEventListener('hardwareBackPress',onBackPress);
        },[]),
    );

    const onLogin=async (data:any)=>{
        try {
            if(Platform.OS == "web") {
                try {
                    const keys = await AsyncStorage.getAllKeys();
                    const keysToDelete = keys.filter(key => key !== 'regions:v2');
                    await AsyncStorage.multiRemove(keysToDelete);
                    const region = await AsyncStorage.getItem('regions:v2');
                    if (!region) {
                        await AsyncStorage.setItem('regions:v2', '{"savedAt":1761283199332,"ttlMs":3600000,"data":[{"_id":"9d15d4e6-ec3a-48eb-828a-8748174a9e16","address":null,"supportEmail":null,"label":"Region II - Cagayan Valley","value":"II","code":"II","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Nelson","lastName":"Daquioag","middleName":null,"suffix":null,"email":null,"role":null,"signature":"https://testedgeaccountstorage.blob.core.windows.net/files/8ecb4664-8d0b-460a-86d7-95e007824d91.png"}}},{"_id":"d0fb9a9c-01af-45c1-a637-bb08c5807f68","address":null,"supportEmail":null,"label":"Region I - Ilocos Region","value":"I","code":"I","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Glenn Anthony","lastName":"Mercado","middleName":null,"suffix":null,"email":null,"role":null,"signature":"https://testedgeaccountstorage.blob.core.windows.net/files/2f02870d-f172-4096-9d7a-9b9694b312b7.png"}}},{"_id":"42013b7f-de24-4e63-84a0-a07219bbea63","address":null,"supportEmail":null,"label":"Region III - Central Luzon","value":"III","code":"III","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Azor Dalmacio","lastName":"Sitchon","middleName":"Lozano","suffix":null,"email":"azor.sitchon@ntc.gov.ph","role":"Director - Regional Director","signature":null}}},{"_id":"5841d4a5-e366-4d4d-9f14-b6fdce05ec99","address":null,"supportEmail":null,"label":"Region IV-A - CALABARZON","value":"IV-A","code":"IV-A","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Rolando","lastName":"San Luis","middleName":null,"suffix":null,"email":null,"role":null,"signature":null}}},{"_id":"1d9045b4-e335-4c21-836a-d27441c5f021","address":null,"supportEmail":null,"label":"MIMAROPA Region","value":"IV-B","code":"IV-B","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Ronald Francis","lastName":"Cabute","middleName":null,"suffix":null,"email":null,"role":null,"signature":null}}},{"_id":"abfe1e30-f2f7-44b2-949a-6ab6d67c8bc7","address":null,"supportEmail":null,"label":"Region V - Bicol Region","value":"V","code":"V","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Samuel","lastName":"Sabile","middleName":null,"suffix":null,"email":null,"role":null,"signature":null}}},{"_id":"08ca7f03-4e94-4f8c-9025-879da749ffc6","address":null,"supportEmail":null,"label":"Region VI - Western Visayas","value":"VI","code":"VI","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Leah dela Cruz","lastName":"Doromal","middleName":null,"suffix":null,"email":null,"role":null,"signature":null}}},{"_id":"1031830d-0a90-422a-918e-d497cb32381d","address":null,"supportEmail":null,"label":"Region VII - Central Visayas","value":"VII","code":"VII","configuration":{"commissioner":{"firstName":"ATTY. ELLA","lastName":"BLANCA","middleName":"B","suffix":"II","email":"ellablanca@gmail.com","role":null,"signature":""},"director":{"firstName":"Alan Felix","lastName":"Macaraya","middleName":"JESENA","suffix":"JR","email":"alanfelix.macaraya@ntc.gov.ph","role":"Director","signature":"https://prodedgeaccountstorage.blob.core.windows.net/files/8d9f05ab-4b22-4633-98cd-b99758da9beb.jpeg"}}},{"_id":"c661d393-fb39-4bd2-8fa0-7947760567c7","address":null,"supportEmail":null,"label":"Region VIII'); // replace with your default value
                    } else {
                    }
                } catch (e) {
                    console.error('Error clearing AsyncStorage:', e);
                }
            }

        }catch (e) {
            console.log(e)
        }
        dispatch(loginUser(data));
    };

    const [formValue,setFormValue]=useState({
        email:{
            value:'',
            isValid:false,
            error:'',
            isPhone: false,
        },
        password:{
            value:'',
            isValid:false,
            error:'',
        },
        showPassword:{
            value:false
        },
        CreatedAt : {
            isValid: true,
            error: false,
            value:  {label: "Region X - Northern Mindanao",value: "ntc-region10",key:"10"},
        },
        keepLoggedIn:{
            value:false,
        }
    });

    useEffect(() => {
        if (session?.sessionToken && !loggedOut) navigation.replace('HomeScreen');
    }, [session?.sessionToken]);

    useEffect(() => setLoggedOut(false), []);

    const onChangeValue=(key:string,value:any)=>{

        switch(key){
            case 'email':{
                const checkedEmail = validateEmail(value);
                const checkedPhone = validatePhone(value);
                const checked = checkedEmail || checkedPhone;
                return setFormValue({
                    ...formValue,
                    [key]:{
                        value:value,
                        isValid:checked,
                        isPhone: checkedPhone,
                        error:!checked ? errorResponse['email'] : ''
                    }
                });
            }
            case 'password':{
                const passwordTest=validatePassword(value,'length');
                return setFormValue({
                    ...formValue,
                    [key]:{
                        value:value,
                        isValid:passwordTest?.isValid,
                        error:!passwordTest?.isValid ? errorResponse['password'] : '',
                    }
                });
            }
            case 'showPassword':{
                return setFormValue({
                    ...formValue,
                    [key]:{
                        value:!formValue.showPassword.value,
                    }
                });
            }
            case 'forgotPassword':{
                return navigation.navigate('ForgotPassword');
            }
            case 'login': {
                dispatch(setCreatedAt(value.createdAt));
                return onLogin(value)
            }
            case 'CreatedAt': {
                AsyncStorage.setItem('selectedRegion', JSON.stringify(value));
                return setFormValue({
                    ...formValue ,
                    [key] : {
                        value : value ,
                        isValid : !!value ,
                        error : '' ,
                    }
                });
            }
            default:
                return setFormValue({
                    ...formValue,
                    [key]:{
                        value:value,
                        isValid:!!value,
                        error:'',
                    }
                });
        }
    };
    const onCheckValidation=()=>{
        if(!formValue.email.isValid){
            return onChangeValue('email',formValue.email.value);
        }
        if(!formValue.password.isValid){
            return onChangeValue('password',formValue.password.value);
        } else{
            let cred:any = {
                email: formValue?.email?.value,
                password: formValue?.password?.value,
                createdAt: formValue?.CreatedAt?.value.value
            }
            if (formValue?.email?.isPhone) {
                cred = {
                    phone: formValue?.email?.value,
                    password: formValue?.password?.value ,
                    createdAt: formValue?.CreatedAt?.value
                }
            }
            if(formValue?.CreatedAt?.value?.value) {
                dispatch(setCreatedAt(formValue?.CreatedAt?.value?.value))
            }

            return onLogin(cred);
        }
    }
    const isValid=
        formValue.email.isValid&&
        formValue.password.isValid;
    return {loggingIn,formValue,onChangeValue,onCheckValidation,isValid,loginUserError};
}

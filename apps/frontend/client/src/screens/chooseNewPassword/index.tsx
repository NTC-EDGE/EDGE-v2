import React,{useState} from 'react';
import {
    ImageBackground, Platform, ScrollView,
    StatusBar,
    useWindowDimensions,
    View
} from "react-native";
import EdgeBlue from "@assets/svg/edgeBlue";
import {styles} from "@styles/chooseNewPassword";
import Text from "@atoms/text";
import Button from "@atoms/button";
import {button, defaultColor, errorColor, successColor, text} from "@styles/color";
import Ellipsis from "@atoms/ellipsis";
import PasswordForm from "@organisms/forms/reset-password";
import {validatePassword} from "@utils/form-validations";
import axios from "axios";
import {BASE_URL} from "@services/config";
import {RootStateOrAny, useSelector} from "react-redux";
import Alert from "@atoms/alert";
import AsyncStorage from "@react-native-async-storage/async-storage";
const errorResponse = {
    password: 'Password must be atleast 6 characters',
    confirm: 'Passwords do not match',
};
const background = require('@assets/webbackground.png');
const ChooseNewPassword = (props) => {
    const sessionToken = useSelector((state: RootStateOrAny) => state.user.sessionToken);
    const config = {
        headers: {
            Authorization: "Bearer ".concat(sessionToken)
        }
    }
    const [formValue , setFormValue] = useState({
        CreatedAt : {
            isValid: true,
            error: false,
            value:  {label: "Region X - Northern Mindanao",value: "ntc-region10",key:"10"},
        },

        password: {
            value: '',
            isValid: false,
            error: '',
            characterLength: false,
            upperAndLowerCase: false,
            atLeastOneNumber: false,
            strength: 'Weak',
        },
        confirmPassword: {
            value: '',
            isValid: false,
            error: '',
        },
    });
    const validatePasswordMatch = (value: string, password: string) => {
        return value === password;
    }
    const onChangeText = (key: string, value: any) => {
        switch (key) {
            case 'password': {
                const passwordTest = validatePassword(value);
                const checked = validatePasswordMatch(value, formValue.confirmPassword.value);
                return setFormValue({
                    ...formValue,
                    [key]: {
                        value: value,
                        isValid: passwordTest?.isValid,
                        error: !passwordTest?.isValid ? errorResponse['password'] : '',
                        characterLength: passwordTest.characterLength,
                        upperAndLowerCase: passwordTest.upperAndLowerCase,
                        atLeastOneNumber: passwordTest.atLeastOneNumber,
                        strength: passwordTest.strength,
                    },    //013021
                    'confirmPassword': {
                        ...formValue.confirmPassword,
                        isValid: checked,
                        error: !checked ? errorResponse['confirm'] : ''
                    }
                });
            }
            case 'confirmPassword': {
                const checked = validatePasswordMatch(value, formValue.password.value);
                return setFormValue({
                    ...formValue,
                    [key]: {
                        value: value,
                        isValid: checked,
                        error: !checked ? errorResponse['confirm'] : ''
                    }
                });
            }
            case 'oldPassword' : {
                return setFormValue({
                    ...formValue,
                    [key]: {
                        value: value,
                        isValid: value.length
                    }
                });
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
            case 'showPassword': {
                return setFormValue({
                    ...formValue,
                    [key]: {
                        value: value,
                    }
                });
            }
            default:
                return setFormValue({
                    ...formValue,
                    [key]: {
                        value: value,
                        isValid: !!value,
                        error: '',
                    }
                });
        }
    };
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alert, setAlert] = useState({
        title: '',
        message: '',
        color: defaultColor,
    });

    const onCheckValidation = () => {
        if (!formValue.password.isValid) {
            return onChangeText('password', formValue.password.value);
        } else if (!formValue.confirmPassword.isValid) {
            return onChangeText('confirmPassword', formValue.confirmPassword.value);
        } else {
            setLoading(true);

            const params = {
                newPassword: formValue.password.value,
                confirmNewPassword: formValue.confirmPassword.value
            }

            axios.post(BASE_URL + `/internal/users/${props.route.params.token}/choose-new-password`, params, config).then((response) => {

                setFormValue({
                    ...formValue,
                    ['oldPassword']: {
                        ...formValue.oldPassword,
                        value: "",
                    },
                    ['password']: {
                        ...formValue.password,
                        value: '',
                        isValid: false,
                        error: '',
                        characterLength: false,
                        upperAndLowerCase: false,
                        atLeastOneNumber: false,
                    },
                    ['confirmPassword']: {
                        ...formValue.confirmPassword,
                        value: "",
                    }

                })


                setAlert({
                    title: response?.status === 200 ? 'Success' : 'Failure',
                    message: response?.data?.message || '',
                    color: response?.status === 200 ? successColor : errorColor,
                });

                setShowAlert(true);
                setLoading(false);
            }).catch((err)=>{
                setAlert({
                    title: err?.title || 'Failure',
                    message: err?.message || 'Your password was not updated.',
                    color: errorColor,
                });
                setShowAlert(true);
                setLoading(false);
            })
        }
    };
    const isValid = formValue.password.isValid && formValue.confirmPassword.isValid;
    const {width, height} = useWindowDimensions();

    return (<ImageBackground
        height={height}
        resizeMode="cover"
        source={ background }
        style={ {
            flex : 1 ,
            justifyContent : "center"
        } }
        imageStyle={ { flex : 1 } }
    >
        <StatusBar barStyle="dark-content"/>
        <View style={ { flex : 1 , justifyContent : "center" , alignItems : "center" } }>
            <View style={ { paddingBottom : 40 } }>
                <EdgeBlue width={ 342 } height={ 78 }></EdgeBlue>
            </View>
            <View style={ styles.formContainer }>

                <Text style={ [styles.formTitleText] }>New Password</Text>
                <View style={{flex: 1, ...Platform.select({
                        native:{},
                        default:{
                            minWidth:330,
                        }
                    })}}>
                    <PasswordForm onChangeValue={onChangeText} form={formValue}/>

                </View>

                <View style={ styles.bottomContainer }>
                    <Button
                        style={ [
                            styles.loginButton ,
                            {
                                backgroundColor : loading
                                    ? button.info
                                    : isValid
                                        ? button.primary
                                        : button.default
                            }
                        ] }
                        disabled={ loading }
                        onPress={ onCheckValidation }
                    >
                        {
                            loading ? (
                                <View style={ { paddingVertical : 10 } }>
                                    <Ellipsis color="#fff" size={ 10 }/>
                                </View>

                            ) : (
                                <View>
                                    <Text style={ styles.boldText } color={ isValid ? "#fff" : text.disabled }
                                          size={ 18 }>Change Password</Text>
                                </View>

                            )
                        }
                    </Button>
                </View>

            </View>
        </View>
        <Alert
            visible={showAlert}
            title={alert?.title}
            message={alert?.message}
            confirmText='OK'
            onConfirm={() => {
                setShowAlert(false)
                props.navigation?.navigate('Login')
            }}
        />
    </ImageBackground>)
};

export default React.memo(ChooseNewPassword);

import React from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View,} from 'react-native';
import {ArrowLeft, ArrowRight} from '@atoms/icon';
import RegistrationDetailsForm from '@organisms/forms/registration-details';
import Text from '@atoms/text';
import Button from '@components/atoms/button';
import {button, text} from '@styles/color';
import styles from './styles';
import Ellipsis from '@components/atoms/ellipsis';
import useSignUp from "@hooks/useSignUp";


const RegistrationSignUp = ({route, navigation}: any) => {
    const {
        isKeyboardVisible,
        saveFormData,
        formValue,
        fetchingProvinces,
        provinces,
        fetchingCities,
        cities,
        loading,
        onChangeText,
        onCheckValidation,
        isValid
    } = useSignUp(route, navigation);

    return (
        <View style={styles.container}>

            <KeyboardAvoidingView
                behavior={Platform.select({ios: 'padding', android: undefined})}
                keyboardVerticalOffset={Platform.select({ios: 75, android: undefined})}
                style={styles.container}
            >
                <ScrollView
                    style={styles.scrollview}
                    showsVerticalScrollIndicator={true}
                >
                    <RegistrationDetailsForm onChangeValue={onChangeText}
                                             form={formValue}
                                             provinces={provinces}
                                             fetchingProvinces={fetchingProvinces}
                                             cities={cities}
                                             fetchingCities={fetchingCities}
                        /** *//>
                    <View style={styles.bottomView}/>
                </ScrollView>
            </KeyboardAvoidingView>

            <KeyboardAvoidingView
                behavior={Platform.select({ios: 'position', android: undefined})}
                style={styles.keyboardAvoiding}
            >
                <View style={[
                    styles.buttonContainer,
                    styles.row,
                    isKeyboardVisible && styles.shadow
                ]}>
                    <TouchableOpacity onPress={() => {
                        saveFormData(formValue);
                        navigation.pop();
                    }}>
                        <Text
                            size={16}
                            color={text.info}
                            style={styles.boldText}
                        >
                            <View
                                style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",}}>
                                <ArrowLeft color={"#2863D6"} size={18} style={styles.arrowRight}/>
                                <Text color={"#2863D6"} style={{marginLeft: 10,}}>Back</Text>
                            </View>

                        </Text>
                    </TouchableOpacity>
                    <Button

                        style={[
                            styles.row,
                            styles.button,
                            {
                                backgroundColor: isValid ?
                                    button.primary :
                                    button.default,

                            },
                        ]}
                        onPress={onCheckValidation}
                        disabled={loading}
                    >
                        {
                            loading
                                ? <Ellipsis color='#fff' size={10}/>
                                : <>
                                    <Text color={isValid ? '#fff' : text.disabled} size={14}
                                          style={styles.boldText}>Next</Text>
                                    <ArrowRight color={isValid ? '#fff' : text.disabled} size={18}
                                                style={styles.arrowRight}/>
                                </>
                        }
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default React.memo(RegistrationSignUp);

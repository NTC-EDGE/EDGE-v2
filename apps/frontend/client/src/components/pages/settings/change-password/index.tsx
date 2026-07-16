import React, {useEffect, useState} from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import {
	KeyboardAvoidingView,
	Platform,
	View,
	ScrollView
} from 'react-native';
import Text from '@atoms/text';
import Button from '@atoms/button';
import Left from '@atoms/icon/left';
import Ellipsis from '@atoms/ellipsis';
import Alert from '@atoms/alert';
import { PasswordField } from '@molecules/form-fields';
import NavBar from '@organisms/navbar';
import PasswordForm from '@organisms/forms/reset-password';
import { button } from '@styles/color';
import styles from './styles';
import { validatePassword } from '@utils/form-validations';
import { changePassword, setChangePasswordError, setChangePasswordSuccess } from '@reducers/user/actions';

const errorResponse = {
	password: 'Password must be atleast 8 characters',
	confirm: 'Passwords do not match',
};

const ResetPassword = ({navigation}: any) => {
  const dispatch = useDispatch();
	const user = useSelector((state: RootStateOrAny) => state.user);
	const { changingPassword, changePasswordSuccess, changePasswordError } = user;

	const baseFormValue = {
		oldPassword: {
			value: '',
			isValid: false,
			error: '',
			characterLength: false,
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
		showPassword: {
			value: false,
		},
	};
	const [formValue, setFormValue] = useState({...baseFormValue});
	const [showAlert, setShowAlert] = useState(false);
	const isValid = formValue.password.isValid && formValue.confirmPassword.isValid;

	const validatePasswordMatch = (value: string, password: string) => {
		return value === password;
	};
	const onChangeText = (key: string, value: any) => {
		const passwordTest = validatePassword(value);
		switch (key) {
			case 'password': {
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
					},
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
						isValid: passwordTest?.characterLength,
						error: !passwordTest?.characterLength ? errorResponse['password'] : ''
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
	const onCheckValidation = () => {
		if (!formValue.password.isValid) return onChangeText('password', formValue.password.value);
		else if (!formValue.confirmPassword.isValid) return onChangeText('confirmPassword', formValue.confirmPassword.value);
		else {
			dispatch(changePassword({
				oldPassword: formValue.oldPassword.value,
				newPassword: formValue.password.value
			}));
		}
	};

	useEffect(() => {
		if (changePasswordSuccess) setShowAlert(true);
	}, [changePasswordSuccess]);
	useEffect(() => {
		if (changePasswordError) setShowAlert(true);
	}, [changePasswordError]);

	return (
		<View style={styles.container}>
			<NavBar
				title='Change Password'
				leftIcon={<Left color='#fff' />}
				onLeft={() => navigation.goBack()}
			/>
			<ScrollView style={styles.content}>
				<PasswordField
					label={'Old password'}
					placeholder='Old password'
					textContentType='oneTimeCode'
					required={true}
					hasValidation={true}
					secureTextEntry={!formValue?.showPassword?.value}
					value={formValue?.oldPassword?.value}
					error={formValue?.oldPassword?.error}
					onChangeText={(value: string) => onChangeText('oldPassword', value)}
					onSubmitEditing={(event: any) => onChangeText('oldPassword', event.nativeEvent.text)}
					showPassword={() => onChangeText('showPassword', !formValue?.showPassword?.value)}
				/>
				<PasswordForm onChangeValue={onChangeText} form={formValue}/>
			</ScrollView>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'position' : 'height'}
				style={styles.keyboardAvoiding}
			>
				<Button
					style={[styles.button, {backgroundColor: isValid ? button.primary : button.default}]}
					onPress={onCheckValidation}
				>
					{
						changingPassword
							?	<Ellipsis color='#fff' size={10} />
							:	<Text
									color='#fff'
									size={16}
									style={styles.boldText}
								>
									Save
								</Text>
					}
				</Button>
			</KeyboardAvoidingView>
			<Alert
				visible={showAlert}
				title={changePasswordSuccess ? 'Success' : 'Failure'}
				message={changePasswordSuccess ? 'Your password has been changed!' : 'Your password was not changed.'}
				confirmText='OK'
				onConfirm={() => {
					setShowAlert(false);
					navigation.goBack();
					setTimeout(() => {
						if (changePasswordSuccess) dispatch(setChangePasswordSuccess(false));
						if (changePasswordError) dispatch(setChangePasswordError(false));
					}, 500);
				}}
			/>
		</View>
	)
}

export default React.memo(ResetPassword);

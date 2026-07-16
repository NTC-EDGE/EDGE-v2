import React, {FC, useCallback, useMemo} from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Text from '@atoms/text';
import { Check } from '@atoms/icon';
import Sign from '@atoms/signature';
import { InputField, DropdownField } from '@molecules/form-fields';
import { DateField } from '@molecules/form-fields';
import { text, outline } from '@styles/color';
import { userType } from '@utils/registration-lists';
import { changeCreatedAt } from '@config/api';
import { useDispatch } from 'react-redux';
import { setCreatedAt } from '@reducers/user/actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    marginLeft: 10
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
  },
  horizontal: {
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  unchecked: {
    height: 18,
    width: 18,
    backgroundColor: '#DBDFE5',
    borderRadius: 3,
  },
  circle: {
    height: 15,
    width: 15,
    borderColor: outline.default,
    borderWidth: 1.2,
    borderRadius: 15,
    marginRight: 5,
  },
  circleActive: {
    borderColor: outline.primary,
    borderWidth: 5,
  }
});

interface Props {
  form?: any;
  onChangeValue?: any;
  [x: string]: any;
};

const RegistrationForm: FC<Props> = ({ form = {}, onChangeValue = () => {}, ...otherProps }) => {
  const handlePress = useCallback(() => {
    Linking.openURL('https://ntc.gov.ph/');
  }, []);
    const stylesMemo = useMemo(() => {
        return styles;
    }, [])
  const dispatch = useDispatch();
  const {
    provinces = [],
    fetchingProvinces,
    cities = [],
    fetchingCities,
    onBegin = () => {},
    onEnd = () => {},
  } = otherProps;

  const handleUserTypeChange = useCallback((value: object) => {
    onChangeValue('userType', value)
  }, [onChangeValue]);

  const handleCompanyNameChange = useCallback((value: string) => onChangeValue('companyName', value), [onChangeValue]);
  const handleRepresentativeNameChange = useCallback((value: string) => onChangeValue('applicantName', value), [onChangeValue]);

  const handleFirstNameChange = useCallback((value: string) => onChangeValue('firstName', value), [onChangeValue]);
  const handleMiddleNameChange = useCallback((value: string) => onChangeValue('middleName', value), [onChangeValue]);
  const handleLastNameChange = useCallback((value: string) => onChangeValue('lastName', value), [onChangeValue]);
  const handleSuffixChange = useCallback((value: string) => onChangeValue('suffix', value), [onChangeValue]);

  const handleDOBChange = useCallback((subId: string, value: string) => {
    onChangeValue('dateOfBirth', value, subId);
  }, [onChangeValue]);

  const handleSexChange = useCallback((value: any) => onChangeValue('sex', value?.value), [onChangeValue]);

  const handleNationalityChange = useCallback((value: string) => onChangeValue('nationality', value), [onChangeValue]);

  const handlePhoneNumberChange = useCallback((value: string) => onChangeValue('contactNumber', value), [onChangeValue]);
  const handlePhoneNumberSubmit = useCallback((event: any) => onChangeValue('contactNumber', event.nativeEvent.text), [onChangeValue]);

  const handleRegionChange = useCallback((value: any) => {
    if (value?.value) {
      dispatch(setCreatedAt(changeCreatedAt(value?.value)))
    }
    onChangeValue('region', value)
  }, [onChangeValue, dispatch]);

  const handleProvinceChange = useCallback((value: object) => onChangeValue('province', value), [onChangeValue]);
  const handleCityChange = useCallback((value: object) => onChangeValue('city', value), [onChangeValue]);

  const handleBarangayChange = useCallback((value: string) => onChangeValue('barangay', value), [onChangeValue]);
  const handleStreetChange = useCallback((value: string) => onChangeValue('street', value), [onChangeValue]);
  const handleUnitChange = useCallback((value: string) => onChangeValue('unit', value), [onChangeValue]);
  const handleZipCodeChange = useCallback((value: string) => onChangeValue('zipCode', value), [onChangeValue]);

  const handleSignatureOK = useCallback((value: any) => onChangeValue('signature', value), [onChangeValue]);
  const handleSignatureClear = useCallback(() => onChangeValue('signature', ''), [onChangeValue]);

  const handleAgreedChange = useCallback(() => onChangeValue('agreed', !form?.agreed?.value), [onChangeValue, form?.agreed?.value]);

  const renderAgreedChecker = (checked:boolean) => {
    if (checked) {
      return (
        <View
          style={[
              stylesMemo.unchecked,
            {
              backgroundColor: text.primary,
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}
        >
          <Check
            color='#fff'
            size={14}
          />
        </View>
      );
    }
    return (
      <View style={stylesMemo.unchecked} />
    );
  };

  return (
    <View style={stylesMemo.container}>
      {/* <View style={styles.typeContainer}>
        <Text color={text.default} size={14}>User</Text>
        {
          userType.map(item => (
            <TouchableOpacity
              key={item.value}
              onPress={() => onChangeValue('userType', item.value)}
            >
              <View style={styles.buttonContainer}>
                <View style={[styles.circle, item.value === form.userType.value && styles.circleActive]} />
                <Text color={text.default} size={14}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </View> */}
      <DropdownField
        items={userType}
        required={true}
        hasValidation={true}
        placeholder='User'
        error={form?.userType?.error}
        value={form?.userType?.value}
        onChangeValue={handleUserTypeChange}
      />
      {/* <DropdownField
        items={
          form.userType.value ?
            form.userType.value === 'Company' ?
              companyType
              : individualType
            : []
        }
        required={true}
        hasValidation={true}
        placeholder='User type'
        error={form?.permitType?.error}
        value={form?.permitType?.value}
        onChangeValue={(value: object) => {
          onChangeValue('permitType', value)
        }}
      /> */}
      {
        form?.userType?.value === 'Company'
          ? <>
              <InputField
                label='Company Name'
                placeholder='Company Name'
                required={true}
                hasValidation={true}
                error={form?.companyName?.error}
                value={form?.companyName?.value}
                onChangeText={handleCompanyNameChange}
              />
              <InputField
                label='Name of Representative'
                placeholder='Name of Representative'
                required={true}
                value={form?.applicantName?.value}
                onChangeText={handleRepresentativeNameChange}
              />
            </>
          : <>
              <InputField
                label='First name'
                placeholder='First name'
                required={true}
                hasValidation={true}
                error={form?.firstName?.error}
                value={form?.firstName?.value}
                onChangeText={handleFirstNameChange}
              />
              <InputField
                label='Middle name'
                placeholder='Middle name'
                value={form?.middleName?.value}
                onChangeText={handleMiddleNameChange}
              />
              <InputField
                label='Last name'
                placeholder='Last name'
                required={true}
                hasValidation={true}
                error={form?.lastName?.error}
                value={form?.lastName?.value}
                onChangeText={handleLastNameChange}
              />
              <InputField
                label='Suffix'
                placeholder='Suffix'
                error={form?.suffix?.error}
                value={form?.suffix?.value}
                onChangeText={handleSuffixChange}
              />
              <DateField
                label='Date of Birth'
                value={form?.dateOfBirth?.value}
                onChangeValue={handleDOBChange}
                required={true}
                isDateOfBirth
              />
              <DropdownField
                items={[
                  {label: 'Male', value: 'Male'},
                  {label: 'Female', value: 'Female'},
                ]}
                required={true}
                hasValidation={true}
                placeholder='Sex'
                error={form?.sex?.error}
                value={form?.sex?.value}
                onChangeValue={handleSexChange}
              />
              <InputField
                label='Nationality'
                placeholder='Nationality'
                required={true}
                hasValidation={true}
                error={form?.nationality?.error}
                value={form?.nationality?.value}
                onChangeText={handleNationalityChange}
              />
            </>
      }
      <InputField
        label='Phone number'
        placeholder='Phone number'
        required={true}
        hasValidation={true}
        error={form?.contactNumber?.error}
        value={form?.contactNumber?.value}
        keyboardType='phone-pad'
        onChangeText={handlePhoneNumberChange}
        onSubmitEditing={handlePhoneNumberSubmit}
      />
      <DropdownField
        items={form?.region?.items}
        required={true}
        hasValidation={true}
        placeholder='Region'
        error={form?.region?.error}
        value={form?.region?.value?.label ?? form?.region?.value}
        onChangeValue={handleRegionChange}
      />
      <DropdownField
        required={true}
        hasValidation={true}
        placeholder='Province'
        error={form?.province?.error}
        value={form?.province?.value}
        onChangeValue={handleProvinceChange}
        loading={fetchingProvinces}
        items={provinces}
      />
      <DropdownField
        required={true}
        hasValidation={true}
        placeholder='City'
        error={form?.city?.error}
        value={form?.city?.value}
        onChangeValue={handleCityChange}
        loading={fetchingCities}
        items={cities}
      />
      <InputField
        label='Barangay'
        placeholder='Barangay'
        required={true}
        hasValidation={true}
        error={form?.barangay?.error}
        value={form?.barangay?.value}
        onChangeText={handleBarangayChange}
      />
      <InputField
        label='Street/Zone'
        placeholder='Street/Zone'
        hasValidation={true}
        error={form?.street?.error}
        value={form?.street?.value}
        onChangeText={handleStreetChange}
      />
      <InputField
        label='Unit'
        placeholder='Unit'
        hasValidation={true}
        error={form?.unit?.error}
        value={form?.unit?.value}
        onChangeText={handleUnitChange}
      />
      <InputField
        label='Zip Code'
        placeholder='Zip Code'
        required={true}
        hasValidation={true}
        error={form?.zipCode?.error}
        value={form?.zipCode?.value}
        onChangeText={handleZipCodeChange}
      />
      <Sign
        onOK={handleSignatureOK}
        onClear={handleSignatureClear}
        onBegin={onBegin}
        onEnd={onEnd}
      />
      <View style={styles.horizontal}>
        <TouchableOpacity onPress={handleAgreedChange}>
          {renderAgreedChecker(form?.agreed?.value)}
        </TouchableOpacity>
        <Text
          style={styles.label}
          size={12}
        >
          {'By clicking Sign up, you agree to our'}
          <Text
            color={text.primary}
            size={12}
            onPress={handlePress}
          >
            {' Terms, Data Policy '}
          </Text>
          {'and'}
          <Text
            color={text.primary}
            size={12}
            onPress={handlePress}
          >
            {' Cookies Policy.'}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default React.memo(RegistrationForm);

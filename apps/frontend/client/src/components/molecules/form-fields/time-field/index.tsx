import React, { FC, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import Text from '@atoms/text';
import styles from '@styles/input-style';
import { input, outline, text } from '@styles/color';

interface Props {
  label?: string;
  value?: Date;
  placeholder?: string;
  onChange?: any;
  secureTextEntry?: boolean;
  required?: boolean;
  hasValidation?: boolean;
  description?: string;
  error?: string;
};

const TimeField: FC<Props> = ({
  label = '',
  value = '',
  placeholder = '',
  onChange = () => {},
  required = false,
  hasValidation = false,
  description,
  error,
}) => {
  const { text, background } = input;
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    hideDatePicker();
    onChange(date);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[
        styles.container,
        styles.rowContainer,
        isDatePickerVisible && {
          borderColor: outline.primary,
          backgroundColor: '#fff',
        },
        !!error && {
          backgroundColor: background?.error,
          borderColor: text?.errorColor,
        },
      ]}>
        <View style={{ flex: 0.95 }}>
          {!!value && !!label && (
            <View style={styles.labelContainer}>
              <Text
                style={[
                  styles.labelText,
                  !!error && {color: text?.errorColor,}
                ]}
              >
                {label}
              </Text>
              {required && (
                <Text style={styles.requiredText}>
                  {'*'}
                </Text>
              )}
            </View>
          )}
          <TouchableOpacity onPress={showDatePicker}>
            <Text
              style={!value && styles.placeholderText}
              numberOfLines={1}
            >
              {!!value ? moment(value).format('LT') : placeholder}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode='time'
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        </View>
      </View>
      {
        hasValidation && (!!error || !!description) && (
          <View>
            <Text
              style={[
                styles?.validationText,
                !!error && { color: text?.errorColor },
              ]}
            >
              {error || description}
            </Text>
          </View>
        )
      }
    </View>
  )
};
export default React.memo(TimeField)

import React, {FC, useMemo} from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import Text from '@atoms/text';
import DynamicField from '@organisms/forms/fields/dynamic';
import inputStyle from '@styles/input-style';
import styles from './styles';

interface Props {
  label?: string;
  value?: any;
  onChangeValue?: any;
  parentType?: string;
  // isDateOfBirth?: boolean;
  // required?: boolean;
  [x: string]: any;
};

const UnitField: FC<Props> = ({
  label = '',
  value,
  onChangeValue = () => {},
  parentType = '',
  // isDateOfBirth,
  // required,
  ...otherProps
}) => {
  const { width } = useWindowDimensions();
  let isParentList = parentType === 'list';
  let left = value?.[0];
  let right = value?.[1];
  const stylesMemo = useMemo(() => {
    return styles;
  }, [])
  const inputstylesMemo = useMemo(() => {
    return inputStyle;
  }, [])
  return (
    <View>
      <Text style={inputstylesMemo.headerLabelText}>
        {label}
      </Text>
      <View style={stylesMemo.view}>
        <View style={[
          stylesMemo.dropdownContainer,
          {...Platform.select( { native: { flex: 0.49}, web: {flex: 0.49}})},
          !!isParentList && stylesMemo?.dropdownContainer3
        ]}>
          <DynamicField
            parentId={otherProps?.parentId}
            index={otherProps?.index}
            {...left}
            onChangeValue={(value: string) => onChangeValue(left?.id, value, left?.validate, left?.errorResponse)}
            parentType={otherProps?.type}
          />
        </View>
        <View style={[stylesMemo.dropdownContainer,  {...Platform.select( { native: { flex: 0.49}, web: {flex: 0.49}})},]}>
          <DynamicField
            parentId={otherProps?.parentId}
            index={otherProps?.index}
            {...right}
            onChangeValue={(value: string) => onChangeValue(right?.id, value, right?.validate, right?.errorResponse)}
            parentType={otherProps?.type}
          />
        </View>
      </View>
    </View>
  )
};

export default React.memo(UnitField)

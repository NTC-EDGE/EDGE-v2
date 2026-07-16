import React, {FC, useCallback, useMemo, useState} from 'react';
import { View } from 'react-native';
import Text from '@atoms/text';
import { DropdownField, InputField, OptionField, TimeField } from '@molecules/form-fields';
import { DateField, UnitField } from '@molecules/form-fields';
import styles from './styles';

interface Props {
  type?: string;
  id?: string;
  parentId?: string;
  index?: number;
  onChangeValue?: any;
  title?: string;
  description?: string;
  [x: string]: any;
};

const DynamicField: FC<Props> = ({
  ...otherProps
}) => {
  let {
    type = '',
    id = '',
    parentId = '',
    subParentId = '',
    subIndex = -1,
    index = -1,
    onChangeValue = () => {},
    validate,
    title = '',
    description = '',
    hasDependent,
    option = false,
    setParentId = '',
    setIndex = -1,
    required,
    keyboardType,
  } = otherProps;
  if (otherProps?.hidden) return <View />;
  const handleInputChange = useCallback((value: string) => {
    onChangeValue({
      parentId,
      subParentId,
      subIndex,
      id,
      value,
      type,
      validate,
      errorResponse: otherProps?.errorResponse,
      index,
      hasDependent,
      option,
      setParentId,
      setIndex,
      required,
      keyboardType,
    });
  }, [
    onChangeValue,
    parentId,
    subParentId,
    subIndex,
    id,
    type,
    validate,
    otherProps?.errorResponse,
    index,
    hasDependent,
    option,
    setParentId,
    setIndex,
    required,
    keyboardType
  ]);

  // Bolt: Stabilized event handlers to prevent unnecessary re-renders of memoized child molecules
  const handleGenericChange = useCallback((value: string) => {
    onChangeValue({
      parentId,
      subParentId,
      subIndex,
      id,
      value,
      type,
      index,
      hasDependent,
      option,
      setParentId,
      setIndex,
      required,
      keyboardType
    });
  }, [onChangeValue, parentId, subParentId, subIndex, id, type, index, hasDependent, option, setParentId, setIndex, required, keyboardType]);

  const handleUnitChange = useCallback((subId: string, value: string, _validate: any, _errorResponse: string) => {
    onChangeValue({
      parentId,
      subParentId,
      id,
      subId,
      subIndex,
      value,
      type,
      validate: _validate,
      errorResponse: _errorResponse,
      index,
      hasDependent,
      option,
      setParentId,
      setIndex,
      required,
      keyboardType,
    });
  }, [onChangeValue, parentId, subParentId, id, subIndex, type, index, hasDependent, option, setParentId, setIndex, required, keyboardType]);

  const handleDateChange = useCallback((subId: string, value: string) => {
    onChangeValue({
      parentId,
      subParentId,
      id,
      subId,
      subIndex,
      value,
      type,
      index,
      hasDependent,
      option,
      setParentId,
      setIndex,
      required,
      keyboardType,
    });
  }, [onChangeValue, parentId, subParentId, id, subIndex, type, index, hasDependent, option, setParentId, setIndex, required, keyboardType]);

  const handleTimeChange = useCallback((value: Date) => {
    onChangeValue({
      parentId,
      subParentId,
      id,
      subIndex,
      value,
      type,
      index,
      hasDependent,
      option,
      setParentId,
      setIndex,
      required,
      keyboardType,
    });
  }, [onChangeValue, parentId, subParentId, id, subIndex, type, index, hasDependent, option, setParentId, setIndex, required, keyboardType]);

  const renderTitleAndDescription = useMemo(() => (
      <>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </>
  ), [title, description]);

  switch (type) {
    case 'option': {
      return (
        <>
          {renderTitleAndDescription}
          <OptionField
            {...otherProps}
            onSelect={handleGenericChange}
          />
        </>
      )
    }
    case 'unit': {
      return (
        <>
          {renderTitleAndDescription}
          <UnitField
            {...otherProps}
            onChangeValue={handleUnitChange}
          />
        </>
      )
    }
    case 'date': {
      return (
        <>
          {renderTitleAndDescription}
          <DateField
            {...otherProps}
            onChangeValue={handleDateChange}
          />
        </>
      )
    }
    case 'time': {
      return (
        <>
          {renderTitleAndDescription}
          <TimeField
            {...otherProps}
            onChange={handleTimeChange}
          />
        </>
      )
    }
    case 'dropdown': {
      return (
        <>
          {renderTitleAndDescription}
          <DropdownField
            {...otherProps}
            onChangeValue={handleGenericChange}
          />
        </>
      )
    }

    default: {
      return (
        <>
          {renderTitleAndDescription}
          <InputField
            {...otherProps}
            onChangeText={handleInputChange}
          />
        </>
      )
    }
  }
};

export default React.memo(DynamicField);

import React, {FC, useCallback, useMemo} from 'react';
import { FlatList, View } from 'react-native';
import CheckBox from '@molecules/checkbox';
import DynamicField from '@organisms/forms/fields/dynamic';
import styles from './styles';

interface Props {
  items?: any[];
  onSelect?: any;
  [x: string]: any;
  /**can also select only one, just empty value first before pushing the item instead of immediately pushing it*/
};

// Extracted OptionItem to prevent re-creation of component types during renders.
// This prevents unnecessary unmount/remount cycles in React Native's JS thread.
const OptionItem = React.memo(({ item, index, onSelect, parentId, otherId, otherIndex, onChangeValue, type, stylesMemo }: any) => {
  const isChecked = item?.selected;
  return (
    <View>
      <CheckBox
        type='circle'
        style={stylesMemo.checkbox}
        isChecked={isChecked}
        onClick={() => onSelect(item)}
        label={item?.value}
      />
      {
        item?.hasSpecification && isChecked &&
        <View style={stylesMemo?.dynamicView}>
          <DynamicField
            parentId={parentId}
            subParentId={otherId}
            subIndex={index}
            index={`${parentId}-${otherIndex}`}
            {...item?.specification}
            onChangeValue={onChangeValue}
            parentType={type}
            option
          />
        </View>
      }
    </View>
  );
});

const OptionField: FC<Props> = ({
  items = [],
  onSelect = () => {},
  ...otherProps
}) => {
  const {
    type = '',
    parentId = '',
    index = -1,
    onChangeValue = () => {},
    id: otherId,
    index: otherIndex,
  } = otherProps;

  const stylesMemo = useMemo(() => styles, []);

  const renderSeparator = useCallback(() => <View style={stylesMemo.separator} />, [stylesMemo.separator]);

  const renderItem = useCallback(({ item, index }: any) => (
    <OptionItem
      item={item}
      index={index}
      onSelect={onSelect}
      parentId={parentId}
      otherId={otherId}
      otherIndex={otherIndex}
      onChangeValue={onChangeValue}
      type={type}
      stylesMemo={stylesMemo}
    />
  ), [onSelect, parentId, otherId, otherIndex, onChangeValue, type, stylesMemo]);

  const keyExtractor = useCallback((_: any, index: number) => `${index}`, []);

  return (
    <FlatList
      style={stylesMemo.container}
      showsVerticalScrollIndicator={true}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={renderSeparator}
      // Standard FlatList performance props
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  )
};
export default React.memo(OptionField)

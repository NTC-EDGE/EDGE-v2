import React, { FC, useCallback, useMemo } from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import Text from '@atoms/text';
import UploadFile from '@molecules/upload-file';
import styles from './styles';
import { isMobile } from "@utils/formatting";

const { height } = Dimensions.get('window');

interface UploadItemProps {
  item: any;
  index: number;
  region?: string;
  onUpload: (file: any) => void;
  onRemove: (index: number, fileIndex: number) => void;
  disabled: boolean;
}

// Optimization: Extracted UploadItem to a standalone memoized component to prevent
// unnecessary re-renders when the parent component updates.
const UploadItem = React.memo(({ item, index, region, onUpload, onRemove, disabled }: UploadItemProps) => {
  let isRequired = item?.required;
  if (region != null) {
    isRequired =
      item?.required ||
      (item?.additional &&
        item?.additional?.[region]?.required === true);
  }

  return (
    <View style={styles.uploadContainer}>
      <View>
        <Text style={styles.uploadLabelText}>
          {index + 1}. {item?.title}
          <Text style={styles?.requiredText}>{isRequired ? '*' : ''}</Text>
        </Text>
      </View>
      {
        !!item?.description &&
        <Text style={styles.uploadContentText}>{item?.description}</Text>
      }
      <View style={styles.separator} />

      <UploadFile
        onUpload={(file: any) => {
          onUpload({ ...file, index })
        }}
        onRemove={(_index: number) => onRemove(index, _index)}
        defaultFiles={item?.files}
        disabled={disabled}
        isCrop={true}
      />
    </View>
  )
});

interface Props {
  requirements?: any;
  onUpload?: any;
  onRemove?: any;
  disabled?: boolean;
  region?: string;
};

const Requirements: FC<Props> = ({
  requirements = [],
  onUpload = () => { },
  onRemove = () => { },
  disabled = false,
  region,
}) => {
  // Optimization: Stabilize renderItem reference to prevent FlatList from re-rendering all items.
  const renderItem = useCallback(({ item, index }: any) => (
    <UploadItem
      index={index}
      item={item}
      region={region}
      onUpload={onUpload}
      onRemove={onRemove}
      disabled={disabled}
    />
  ), [onUpload, onRemove, disabled, region]);

  const ItemSeparatorComponent = useCallback(() => <View style={styles.separator} />, []);
  const ListFooterComponent = useCallback(() => <View style={{ height: height * .15 }} />, []);

  return (
    <FlatList
      // Optimization: Restored virtualization by using a sensible initialNumToRender.
      // Removed extreme maxToRenderPerBatch which was disabling virtualization.
      initialNumToRender={10}
      showsVerticalScrollIndicator={!isMobile}
      keyExtractor={(item, index) => `${index}`}
      data={requirements}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListFooterComponent={ListFooterComponent}
    />
  )
}

export default React.memo(Requirements);

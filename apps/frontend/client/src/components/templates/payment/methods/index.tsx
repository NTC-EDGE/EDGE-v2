import React, { FC, useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import {View, FlatList, Image, TouchableOpacity, Platform} from 'react-native';
import Text from '@atoms/text';
import RadioButton from '@atoms/radio-button';
import { ArrowLeft } from '@atoms/icon';
import Alert from '@atoms/alert';
import { Bottom } from '@molecules/buttons';
import NavBar from '@organisms/navbar';
import { infoColor } from '@styles/color';
import styles from './styles';

interface PaymentOption {
  key?: string;
  label?: string;
  description?: string;
  logo?: any;
  cc?: any;
  uploading?: any;
  uploaded?: any;
};

interface Props {
  paymentOptions?: PaymentOption[];
  paymentOption?: PaymentOption;
  onLeft?: any;
  onRight?: any;
  onSelect?: any;
  onConfirm?: any;
  buttonDisabled?: boolean;
  loading?: boolean;
};

const Methods: FC<Props> = ({
  paymentOptions = [],
  paymentOption = {},
  onLeft = () => {},
  onRight = () => {},
  onSelect = () => {},
  onConfirm = () => {},
  buttonDisabled,
  loading,
}) => {

  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const renderItemSeparator = () => {
    return (
      <View style={styles.separator} />
    )
  };

  const renderItem = ({item, onSelect, paymentOption}: any) => {
    const selected = paymentOption?.key === item?.key;
    return (
      <TouchableOpacity
        onPress={() => {
          if (item?.disabled) setVisible(true)
          else {
            onSelect(item);
            if (item.onPress) item.onPress(item);
          }
        }}
      >
        <View
          style={[styles.paymentContainerContainer, {...Platform.select({ web: {opacity :item?.disabled ? 0.5 : 1}})}]}
          opacity={item?.disabled ? 0.5 : 1}
        >
          <View style={styles.paymentContainer}>
            <Image
              resizeMode='contain'
              style={styles.paymentLogo}
              source={item.logo}
            />
            <View>
              <Text style={[styles.paymentTxt, selected && styles.selectedText]}>
                {item.label}
              </Text>
              {
                !!item.description &&
                <Text style={[styles.paymentDescription, selected && styles.selectedText]}>
                  {item.description}
                </Text>
              }
            </View>
          </View>
          <RadioButton
            color={infoColor}
            isChecked={selected}
            size={30}
          />
        </View>
      </TouchableOpacity>
    )
  };

  return (
      <>

        <View style={styles.container}>


          <NavBar
              light
              shadow
              title='Payment Options'
              leftIcon={<ArrowLeft />}
              onLeft={onLeft}
          />

          <View style={[styles.flatlist, {...Platform.select({web: {
            flex: 1
              }})}]}>
            <FlatList
                scrollEnabled={true}
                data={paymentOptions}
                renderItem={({item}) => renderItem({item, onSelect, paymentOption})}
                keyExtractor={(item, index) => `key-${index}`}
                ItemSeparatorComponent={renderItemSeparator}
            />
          </View>
          <Bottom
              noShadow
              label='Confirm'
              onPress={onConfirm}
              disabled={buttonDisabled || loading}
              loading={loading}
          />


        </View>
        <Alert
            visible={visible}
            title='Coming soon'
            message='It seems like you are interested on this payment method. This will be available soon!'
            confirmText='OK'
            onConfirm={() => setVisible(false)}
        />
      </>

  )
};

export default React.memo(Methods);

import React, { FC, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { ScrollView } from 'react-native-gesture-handler';
import Text from '@atoms/text';
import TextInput from '@atoms/input'
import { ArrowLeft,Check, CC, Safety } from '@atoms/icon';
import { Bottom } from '@molecules/buttons';
import Checkbox from '@molecules/checkbox';
import UploadFile from '@molecules/upload-file';
import NavBar from '@organisms/navbar';
import { defaultColor, successColor } from '@styles/color';
import styles from './styles';

interface Props {
  paymentOption?: any;
  onConfirm?: any;
  onUpload?: any;
  onPayment?: any;
  onRemove?: any;

};

const Instructions: FC<Props> = ({

  paymentOption = {},
  onConfirm = () => {},
  onUpload = () => {},
  onRemove = () => {},
}) => {
  const {
    key = '',
    label = '',
    bankAccount = '', /**for bank-transfer */
    instructions = {
      header: '',
      steps: ['']
    },
    file,
    uploading,
    uploaded,
  } = paymentOption;

  const navigation = useNavigation();

  const [cc, setCC] = useState(paymentOption?.cc);
  const [agree_tc, setAgree_tc] = useState(false);

  const renderItem = ({item, index}: any) => {
    return (
      <View style={styles.plainRow}>
        <Text>{index + 1}.</Text>
        <View style={styles.rightView}>
          <Text>{item}</Text>
        </View>
      </View>
    )
  };

  const renderBankAccount = () => {
    return (
      <View style={styles.bankAccountView}>
        <View style={styles.hr} />
        <Text style={styles.bankAccountTextLabel}>Bank Account Number:</Text>
        <Text style={styles.bankAccountTextValue}>{bankAccount}</Text>
        <View style={styles.hr} />
      </View>
    )
  };

  const renderCCInput = ({
    label = '',
    value = '',
    onChangeText = {},
    displayIcon = false,
    halfRow = false,
    width = '100%',
  }) => {
    return (
      <View style={[styles.ccView, halfRow && styles.ccHalfView]}>
        <Text style={styles.ccLabel}>{label}</Text>
        <View style={styles.row}>
          {displayIcon && <CC color={defaultColor} size={20} style={styles.ccIcon} />}
          <TextInput style={[styles.input, {width}]} value={value} onChangeText={onChangeText} />
          <Check type='block-circle' size={20} color={value ? successColor : defaultColor} />
        </View>
      </View>
    )
  };

  const renderCC = () => {
    return (
      <View style={styles.subContainer}>
        {renderCCInput({
          label: "Cardholder's Name",
          value: cc?.name,
          onChangeText: (txt: string) => setCC({...cc, name: txt}),
          width: '90%',
        })}
        {renderCCInput({
          label: 'Card Number',
          value: cc?.number,
          onChangeText: (txt: string) => setCC({...cc, number: txt}),
          displayIcon: true,
          width: '84%',
        })}
        <View style={styles.row}>
          {renderCCInput({
            label: 'Expiry',
            value: cc?.expiry,
            onChangeText: (txt: string) => setCC({...cc, expiry: txt}),
            halfRow: true,
            width: '80%',
          })}
          {renderCCInput({
            label: 'CVC',
            value: cc?.cvc,
            onChangeText: (txt: string) => setCC({...cc, cvc: txt}),
            halfRow: true,
            width: '80%',
          })}
        </View>
        <Checkbox
          type='circle'
          style={styles.chkbx_futureUseView}
          textStyle={styles.chkbx_futureUseText}
          isChecked={cc?.futureUse}
          onClick={() => setCC({...cc, futureUse: !cc?.futureUse})}
          label='Use this card for future purchases'
        />
        <Checkbox
          type='circle'
          textStyle={styles.chkbx_futureUseText}
          isChecked={agree_tc}
          onClick={() => setAgree_tc(!agree_tc)}
          label='Accept the'
          highlightedText='Terms and Conditions'
        />
        <View style={[styles.row, styles.ccBottomView]}>
          <Safety size={15} color={defaultColor} style={styles.safeIcon} />
          <Text style={styles.ccBottomText}>We'll keep your payment details safe</Text>
        </View>
      </View>
    )
  };
  const buttonDisabled = () => {
    switch(key) {
      case 'bank-transfer': return !uploaded;
      case 'cash': return false; //!cashFile;
      case 'cc': return !(cc?.name && cc?.number && cc?.expiry && cc?.cvc && agree_tc);
        case 'check': return !uploaded;
    }
  };
  return (
    <View style={styles.container}>

      <NavBar
        light
        shadow
        title={label}
        leftIcon={<ArrowLeft />}
        onLeft={() => navigation.pop()}
      />

      <ScrollView
        showsVerticalScrollIndicator={true}
        style={styles.iView}
      >
        {
          key !== 'cc' &&
          <View style={styles.subContainer}>
            <View>
              <Text style={styles.iHeaderText}>
                {instructions?.header}
              </Text>
            </View>
            <FlatList
              scrollEnabled={true}
              style={styles.flatlist}
              data={instructions?.steps}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${index}`}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        }
        {key === 'bank-transfer' && renderBankAccount()}
        {
          (key === 'bank-transfer' || key === 'check') &&
          <>
            <View style={styles.fakeSeparatorView} />
            <View style={styles.uploadContainer}>

              <UploadFile
                defaultFiles={file || []}
                onUpload={(file: any) => onUpload({ file, key })}
                onRemove={onRemove}
                uploading={uploading}
                uploaded={uploaded}
                disabled={uploading}
                isCrop={false}
              />
            </View>
          </>
        }
        {key === 'cc' && renderCC()}
      </ScrollView>

      <Bottom
        noShadow
        label='Confirm'
        onPress={() => {
          let data = {};
          if (key === 'cc') data = { cc };
          onConfirm(data);
          navigation.pop();
        }}
        disabled={buttonDisabled()}
      />

    </View>
  )
};

export default Instructions;

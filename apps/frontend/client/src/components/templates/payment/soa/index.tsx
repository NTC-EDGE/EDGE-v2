import React, { FC } from 'react';
import { View, FlatList, Dimensions, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import Text from '@atoms/text';
import { Close, Download, Right } from '@atoms/icon';
import { Bottom } from '@molecules/buttons';
import NavBar from '@organisms/navbar';
import styles from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { setApplicationItem } from '@reducers/service/actions';
import payment from '../../../../navigations/payment';
const { width } = Dimensions.get('window');
import { setPaymentRoute } from '@reducers/payment/actions';
import { currency, onDownloadDocument } from '@utils/formatting';
import { button, text } from "@styles/color";
import Button from "@atoms/button";
import DocumentDownloadButton from "@molecules/buttons/DocumentDownloadButton";
interface Props {
  application?: any;
  navigation?: any;
  route?: any;
};

const renderHeader = () => {
  return (
    <View style={[styles.headerView, styles.mainHeaderView]}>
      <Text style={[styles.text, styles.textHeader]}>ORDER OF PAYMENT</Text>
    </View>
  )
};

const renderButton = (onPress: () => void, buttonText: string) => {
  return (
    <Button
      onPress={onPress}
    >
      {buttonText}
    </Button>
  )
};


const renderRow = (
  left: string,
  right: string,
  header: boolean,
  bottom: boolean,
  description: string = '',
) => {
  return (
    <View>
      <View style={[
        styles.row,
        header && styles.headerView,
        bottom && styles.rowBottom,
      ]}>
        <Text style={[
          styles.text,
          styles?.leftText,
          header && styles.textHeader,
          bottom && styles.bottomLeftText,
        ]}>{left}</Text>
        <Text style={[styles.text, header && styles.textHeader]}>{right}</Text>
      </View>
      {
        !!description &&
        <Text style={[styles.text, styles?.descriptionText]}>{description}</Text>
      }
    </View>
  )
};



const renderItem = ({ item }: any) => {
  if (item?.item?.toLowerCase() === 'validity') {
    return renderRow(item?.item, `${(item?.amount || 0).toFixed(0)} ${item?.amount > 1 ? 'yrs' : 'yr'}`, false, false);
  } else if (item?.item?.toLowerCase() === 'discount') {
    return renderRow(item?.item, `${(item?.amount || 0).toFixed(0)}%`, false, false);
  } else if (item?.item?.toLowerCase() === 'penalty' || item?.item?.toLowerCase() === 'units' || !!item?.item?.toLowerCase()?.includes('channels')) {
    return renderRow(item?.item, `${(item?.amount || 0).toFixed(0)}`, false, false);
  }
  return renderRow(item?.item, `${currency(item?.amount || 0)}`, false, false);
};

const renderZigZagView = () => {
  let nodes = []
  for (var i = 0; i < 100; i++) {
    const point = `${20 * i},0 ${20 * i + 10},10 ${20 * (i + 1)},0`
    nodes.push(
      <Polygon
        key={i}
        points={point}
        fill='#fff'
        stroke='#fff'
        strokeWidth='1'
      />
    )
  }
  return nodes;
};

const SOA: FC<Props> = ({
  application,
  navigation,
  route = {}
}) => {
  const { applicationItem } = useSelector(state => state?.service);
  application = application || route?.params?.application || applicationItem;
  const { soa = [], totalFee = 0, paymentHistory = {}, orderOfPayment = {}, approvalHistory = {} } = application;
  const dispatch = useDispatch();
  let OP = orderOfPayment?.pdf;
  let SOA = application?.soaReportPdf;
  const PM = application?.paymentMethod?.toUpperCase();
  const pmStatus = paymentHistory?.status?.toUpperCase();

  return (
    <View style={styles.container}>

      <NavBar
        light
        shadow
        title='Order of Payment'
        leftIcon={<Close />}
        onLeft={() => {
          Platform.select({
            web: () => {
              dispatch(setApplicationItem(null))
              //navigation.replace('Login');
            },
            native: navigation.pop(),
          })
        }}
        onRight={() => { }}
      />

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <FlatList
          scrollEnabled={true}
          style={styles.flatlist}
          data={[...soa]}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`}
          ListHeaderComponent={() => {
            return (
              <>
                {/* {renderHeader()} */}
                {renderRow('Particulars', 'Amount', true, false)}

              </>
            )
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={() => {
            return (
              <>
                <View style={styles.bar} />
                {renderRow('TOTAL:', `${currency(totalFee || 0)}`, true, true)}
                <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", paddingRight: 16, paddingTop: 8, width: "100%" }}>
                  <View style={{ paddingRight: 10 }}>
                    <DocumentDownloadButton onPress={() => onDownloadDocument(OP)} />

                  </View>
                  <View>
                    <DocumentDownloadButton
                      buttonLabel="Download SOA"
                      onPress={() => onDownloadDocument(SOA)}
                    />
                  </View>

                </View>

              </>
            )
          }}
        />

        {
          !!PM &&
          <View style={styles?.pmView}>
            <Text style={styles?.pmTxt}>
              Payment Method: <Text style={styles?.pmText}>{PM}</Text>
            </Text>
            <Text style={styles?.pmTxt}>
              Status: <Text style={styles?.pmText}>{pmStatus}</Text>
            </Text>
          </View>
        }
        <Svg height={width * .05} width={width}>
          {renderZigZagView()}
        </Svg>
      </View>

      {
        (
          !application?.paymentMethod ||
          paymentHistory?.status === 'Declined'
        ) &&
        <Bottom
          label='Proceed to Payment'
          onPress={() => navigation.navigate('PaymentMethods', { application })}
          disabled={false}
        />
      }


    </View>
  )
};

export default React.memo(SOA);

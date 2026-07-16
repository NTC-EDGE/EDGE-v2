import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { View, Image, Dimensions } from 'react-native';
import Moment from 'moment';
import { ScrollView } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import Text from '@atoms/text';
import { Close } from '@atoms/icon';
import NavBar from '@organisms/navbar';
import styles from './styles';

const { width } = Dimensions.get('window');

interface Props {
  route?: any;
  application?: any;
  onRight?: any;
};

const AdmissionSlip: FC<Props> = ({
  route,
  application,
}) => {
  const navigation = useNavigation();
  const user = useSelector(state => state?.user?.session);
  const profilePicture = user?.profilePicture?.small;
  const photo = profilePicture ? {uri: profilePicture} : require('@assets/avatar.png');

  application = application || route?.params?.application;
  const { _id = 'qrcodevalue', applicant = {}, schedule = {}, paymentHistory = {}, remarks = 'None', evaluator = {}, director = {}, totalFee = 0, ORNumber, service = {} } = application;
  const { unit = '', street = '', barangay = '', city = '', province = '', zipCode = '' } = applicant.address;
  const address = `${unit ? `${unit}, ` : ""}${street ? `${street}, ` : ""}${barangay ? `${barangay}, ` : ""}${city ? `${city}, ` : ""}${province ? `${province}, ` : ""}${zipCode ?? ""}`;
  const name = `${applicant?.firstName ?? ""} ${applicant?.middleName ?? ""} ${applicant?.lastName ?? ""} ${applicant?.suffix ?? ""}`;

  const renderHeader = (header: string) => {
    return (
      <View style={styles.tableHeadView}>
        <Text style={styles.headerText}>
          {header}
        </Text>
      </View>
    )
  };

  const renderRow = (label: string, value: string) => {
    let remarks = label === 'remarks';
    return (
      <View style={styles.contentRow}>
        {
          !remarks &&
          <Text style={styles.leftText}>{label}</Text>
        }
        <View style={styles.rightTextView}>
          <Text>{value}</Text>
        </View>
      </View>
    )
  };

  const renderSignatory = (personnel: string, position: string) => {
    return (
      <View>
        <Image
          style={styles.eSignatureImg}
          source={{ uri: personnel.eSignature }}
          resizeMode='stretch'
        />
        <Text style={styles.signNameText}>{personnel?.firstName} {personnel?.lastName}</Text>
        <Text style={styles.signPositionText}>{position}</Text>
      </View>
    )
  };

  return (
    <View>
      <NavBar
        light
        shadow
        title='Notice of Admission'
        leftIcon={<Close />}
        onLeft={() => navigation.pop()}
      />
      <ScrollView
        showsVerticalScrollIndicator={true}
        style={styles.mainContainer}
      >

        <View style={styles.row}>
          <Image
            style={styles.applicantImg}
            source={photo}
          />
          <QRCode
            value={_id}
            size={width / 3}
          />
        </View>

        <View style={styles.container}>
          <View style={styles.sectionView}>
            {renderHeader('BASIC INFO')}
            {renderRow('Name:', name)}
            {renderRow('Address:', address)}
          </View>

          <View style={styles.sectionView}>
            {renderHeader('APPLICATION DETAILS')}
            {renderRow('Title:', service?.name || '-')}
            {renderRow('Type:', service?.applicationType?.label || '-')}
            {renderRow('Element/Class:', service?.applicationType?.element || '-')}
          </View>

          <View style={styles.sectionView}>
            {renderHeader('EXAM DETAILS')}
            {renderRow('Date:', schedule?.dateStart ? Moment(schedule?.dateStart).format('MMMM DD YYYY') : '-')}
            {renderRow('Time Start:', schedule?.dateStart ? Moment(schedule?.dateStart).format('h:mm A') : '-')}
            {renderRow('Time End:', schedule?.dateEnd ? Moment(schedule?.dateEnd).format('h:mm A') : '-')}
            {renderRow('Venue:', schedule?.venue || '-')}
            {!!schedule?.seatNumber && renderRow('Seat No.:', schedule?.seatNumber)}
          </View>

          <View style={styles.sectionView}>
            {renderHeader('PAYMENT DETAILS')}
            {renderRow('O.R. No.:', ORNumber || '-')}
            {renderRow('Amount Paid:', `₱ ${totalFee.toFixed(2)}`)}
            {renderRow('Date Paid:', Moment(paymentHistory?.time).format('MMMM DD YYYY, h:mm A'))}
          </View>

          <View style={styles.sectionView}>
            {renderHeader('REMARKS')}
            {renderRow('remarks', remarks)}
          </View>
        </View>

        <View style={[styles.sectionView, styles.row, styles.rowSignatories]}>
          {renderSignatory(evaluator, 'Evaluator')}
          {renderSignatory(director, 'Director')}
        </View>

        <View style={styles.bottomView} />

      </ScrollView>
    </View>
  )
};

export default React.memo(AdmissionSlip);

import React, { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PaymentMethods from '@templates/payment/methods';

import {
  pay,
  setPaymentSuccess,
  setPaymentError,
  setPaymentOption,
  setPaymentOptions,
} from '@reducers/payment/actions';
import { fetchApplications } from '@reducers/application/actions';

interface Props {
  navigation?: any;
  route?: any;
};

const Method: FC<Props> = ({
  navigation,
  route,
}) => {

  const dispatch = useDispatch();
  const application = route?.params?.application;
  const user = useSelector(state => state?.user);
  const { cc } = user;

  const payment = useSelector(state => state?.payment);
  const { paying, paymentOptions, paymentOption } = payment || {};

  const makePrivate = (number: string) => number?.replace(/.(?=.{3})/g, '*');
  const buttonDisabled = () => {
    let { uploaded, cc } = paymentOption || {};
    switch(paymentOption?.key) {
      case 'bank-transfer': return !uploaded;
      case 'cash': return false; //!file;
      case 'cc': return !(cc?.name && cc?.number && cc?.expiry && cc?.cvc);
      case 'check': return !uploaded;
      case 'gcash': return false;
      default: return true;
    }
  };
  const onPress = (item: any) => {

    dispatch(setPaymentOption(item));
    navigation.navigate('PaymentMethodInstructions', {applicationId: application?._id});
  };
  const onConfirm = () => {

    dispatch(pay({
      applicationId: application?._id,
      payment: paymentOption?.key,
      file: paymentOption.links,
    }));
  };

  useEffect(() => {
    dispatch(setPaymentOptions([
      {
        key: 'bank-transfer',
        label: 'Bank Transfer',
        description: '*** **** ***000',
        logo: require('@assets/payment/bank-transfer.png'),
        bankAccount: '123-4567-890000',
        instructions: {
          header: 'Have your payment directly transfered to our bank account.',
          steps: [
            'Transfer money to the indicated bank account below.',
            'Attach receipt/proof of payment once payment has been done.'
          ]
        },
        onPress,
        disabled: true,
      },
      {
        key: 'cash',
        label: 'Cash',
        logo: require('@assets/payment/cash.png'),
        instructions: {
          header: 'Pay to the nearest regional office.',
          steps: [
            `Please pay the total amount of ₱${(application?.totalFee || 0).toFixed(2)} at the cashier's counter.`,
          ]
        },
        onPress,
      },
      {
        key: 'check',
        label: 'Check',
        logo: require('@assets/payment/check.png'),
        instructions: {
          header: 'Payment should be in checks in the form of managers/cashiers check',
          steps: [
            `State the total amount: ₱${(application?.totalFee || 0).toFixed(2)}`,
            `Demand draft check or postal money order payable to NTC ${application.region ?? "10"}, FAO Bureau of Treasury`,
          ]
        },
        onPress,
      },
      {
        key: 'cc',
        label: 'Credit/Debit Card',
        description: makePrivate(paymentOption?.cc?.number),
        logo: require('@assets/payment/cc.png'),
        cc: paymentOption?.cc,
        onPress,
        disabled: true,
      },
      {
        key: 'gcash',
        label: 'GCash',
        logo: require('@assets/payment/gcash.png'),
        disabled: true,
      },
    ]));
    dispatch(setPaymentOption({cc}));
  }, []);

  const paymentSuccess = useSelector(state => state?.payment?.paymentSuccess);
  useEffect(() => {
    if (paymentSuccess) {
      navigation.navigate('PaymentForVerification', {
        onClose: () => {
          dispatch(setPaymentSuccess(false));
          dispatch(setPaymentError(false));
          dispatch(fetchApplications());
          if (user?.session?.sessionToken) navigation.navigate('Home');
          else navigation.replace('Login', {loggedOut: true});
        }
      });
    }
  }, [paymentSuccess]);

  return (
    <PaymentMethods
      paymentOptions={paymentOptions}
      paymentOption={paymentOption}
      onLeft={() => navigation.pop()}
      onRight={() => navigation.navigate('Home')}
      onSelect={(payment: any) => dispatch(setPaymentOption({...paymentOption, ...payment}))}
      onConfirm={onConfirm}
      buttonDisabled={buttonDisabled()}
      loading={paying}
    />
  )
};

export default React.memo(Method);

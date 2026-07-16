import React from 'react';
import PaymentSOA from '@templates/payment/soa';

const PaymentNavigator =  (props: any) => {
  return (
    <PaymentSOA {...props} />
  )
};

export default React.memo(PaymentNavigator);

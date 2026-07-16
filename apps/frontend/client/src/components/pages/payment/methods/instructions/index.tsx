import React, {FC, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PaymentMethodInstructions from '@templates/payment/methods/instructions';

import { saveCC } from '@reducers/user/actions';
import { setPaymentOption, setPaymentOptions, uploadPayment } from '@reducers/payment/actions';
import {isMobile} from "@utils/formatting";
import {Platform} from "react-native";

interface Props {
  route?: any;
};

const Instructions: FC<Props> = ({
  route,
}) => {
  const dispatch = useDispatch();
  const applicationId = route?.params?.applicationId;
  const payment = useSelector(state => state?.payment);
  const { paymentOptions, paymentOption } = payment;
  let onConfirm = (data: any) => {
    if (data?.cc) {
      if (data?.cc?.futureUse) dispatch(saveCC(data?.cc));
      paymentOption.cc = data?.cc;
      dispatch(setPaymentOption(paymentOption));
    }


    let _paymentOptions = [...paymentOptions];
    const idx = _paymentOptions.findIndex(p => p?.key === paymentOption?.key);

    if (idx !== -1) {
      _paymentOptions[idx] = { ...paymentOption };
    }

    dispatch(setPaymentOptions(_paymentOptions));
  };
  let onUpload = async (data: any) => {

    let createFormData = async(payload:any)=>{
      const {key,file}=payload;
      const data=new FormData();
      let f:any={
        name:file?.name ?? file.assets?.[0]?.name,
        type:file?.mimeType ?? file.assets?.[0]?.mimeType,
        uri:file?.uri?? file.assets?.[0]?.uri,
      }
      if(isMobile){
        data.append('file',f);
        data.append('key',key);
        data.append('applicationId',applicationId);
        return data;
      }
      Platform.select({
        web:await fetch(f?.uri).then(res=>{
          return res?.blob()
        }).then(blob=>{
          var mime=f?.uri?.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
          var attachmentMime=mime[1]?.split("/")?.[1]
          if(mime&&mime.length){
            f=new File([blob],f?.name+(
                attachmentMime.length<5 ? "."+attachmentMime : ''));
          }
        })
      })
      data.append('file',f);
      data.append('key',key);
      data.append('applicationId',applicationId);

      return data;
    };
    let formData = await createFormData(data);
    dispatch(uploadPayment({
      paymentOption,
      file: data?.file,
      formData,
    }));
  };
  let onRemove = (index) => {
    if (paymentOption) {
      let _files = [...paymentOption.file];
      let _links = [...paymentOption.links];
      _files.splice(index, 1);
      _links.splice(index, 1);
      if(_files.length == 0){
        paymentOption.uploaded = false
        paymentOptions.links = [];
      }

      dispatch(setPaymentOption({...paymentOption, file: _files, links: _links }));
    }
  };


  return (
    <PaymentMethodInstructions

      paymentOption={paymentOption}
      onUpload={onUpload}
      onRemove={onRemove}
      onConfirm={onConfirm}
    />)
}

export default React.memo(Instructions);

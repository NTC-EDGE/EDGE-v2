import React, {useMemo} from 'react';
import {SafeAreaView, Image, View, Platform} from 'react-native';
import Text from '@atoms/text';
import { Bottom } from '@molecules/buttons';
import styles from './styles';
import {setApplicationItem} from "@reducers/service/actions";
import {useDispatch} from "react-redux";

const ForVerification =  ({
  onClose = () => {}
}) => {
    var dispatch = useDispatch();
    const stylesMemo = useMemo(() => {
        return styles;
    }, [])
  return (
      <>
          <SafeAreaView style={stylesMemo.safeAreaView}>

              <Image
                  style={stylesMemo.image}
                  source={require('@assets/plane.png')}
              />
              <Text style={stylesMemo.txt}>
                  {`Please wait\nwhile your payment\nis being verified.`}
              </Text>

              {Platform.select({
                 native: <Bottom
                     noShadow
                     label='Close'
                     onPress={onClose}
                     disabled={false}
                 />
              }) }

          </SafeAreaView>

          {Platform.OS == "web"  ? <View style={{alignItems: "center", justifyContent: "center"}}>

              <Bottom

                  noShadow
                  label='Close'
                  onPress={() => {
                      dispatch(setApplicationItem(null))
                      onClose()
                  }}
                  disabled={false}
              />
          </View>: <></>}
      </>

  )
};


export default React.memo(ForVerification);

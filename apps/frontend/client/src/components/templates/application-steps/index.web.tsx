
import React, { FC, ReactNode, useEffect, useRef } from 'react';
import {View, Platform, useWindowDimensions} from 'react-native';
import Statusbar from '@atoms/status-bar';
import Text from '@atoms/text';
import ProgressSteps from '@atoms/progress-steps';
import { Bottom } from '@molecules/buttons';
import buttonStyle from '@molecules/buttons/bottom/styles';
import styles from './styles';
import {Bold} from "@styles/font";
import Button from "@atoms/button";
import NTCAlert from '@atoms/alert';
import {button,text} from "@styles/color";
import CheveronLeftIcon from "@assets/svg/cheveron-left";
import CheveronRightIcon from "@assets/svg/cheveron-right";
import {setSelectedService} from "@reducers/service/actions";
import {useDispatch} from "react-redux";
import { SplitSquareHorizontal} from "lucide-react-native";

interface Steps {
  title?: string;
  content?: ReactNode;
  onPrevious?: any;
  onNext?: any;
  buttonLabel?: string;
  buttonDisabled?: boolean;
};

interface Props {
  applicationProcess: string,
  split: boolean;
  onSplit?: any;
  steps?: Steps[];
  currentStep?: number;
  completed?: boolean;
    bulkApplicationReview?: boolean;
  onExit?: any;
  loading?: any;
  UDAAlert?: any;
  logoutAlert?: any;
};

const ApplicationSteps: FC<Props> = ({
                                       split= true,
                                       onSplit = () => {},
                                       applicationProcess = "single-application",
                                       steps = [],
                                       currentStep = 0,
                                       completed,
                                       onExit = () => {},
                                       loading,
                                         bulkApplicationReview = false,
                                       UDAAlert = {},
                                       logoutAlert = {},
                                     }) => {
  const totalSteps = steps?.length;
  const current = steps?.[currentStep] || {};
  const {
    title = '',
    content = <View />,
    onPrevious = () => {},
    onNext = () => {},
    buttonLabel = 'OK',
    buttonDisabled,
  } = current;
  const dimensions=useWindowDimensions();
  const values = new Array(totalSteps - 1).fill(0).map((n, index) => { return index <= currentStep || completed ? 1 : 0; });
  const dispatch = useDispatch();
  if (!(totalSteps > 0)) return <View />;
  return (
      <>

        <View style={styles.mainContainer}>

          <NTCAlert
              alertContainerStyle={{zIndex: 1,}}
              visible={UDAAlert?.active}
              title={UDAAlert?.title || 'Alert'}
              message={UDAAlert?.message}
              confirmText='OK'
              onConfirm={UDAAlert?.onConfirm}
          />

          <NTCAlert
              alertContainerStyle={{zIndex: 1,}}
              visible={logoutAlert?.active}
              title={logoutAlert?.title || 'Alert'}
              message={logoutAlert?.message}
              confirmText='OK'
              onConfirm={logoutAlert?.onConfirm}
          />

          {
             completed && applicationProcess == "single-application"
                ? <Statusbar barStyle='dark-content' backgroundColor='#fff' />
                : <View style={styles.title}>

                  <View style={{flex: 1, alignItems: "center", flexDirection: 'row' }}>
                    <SplitSquareHorizontal style={{paddingRight: 10, }}  color={ "#113196"} onPress={onSplit}/>
                    <Text style={{fontSize: 20, color: "#113196", fontFamily: Bold}}>{title}</Text>

                  </View>

                  {
                    ((currentStep + 1) >= totalSteps) //currentStep is by index
                        ? <View />
                        : <View style={styles.progressContainer}>
                          <ProgressSteps values={values} />
                        </View>
                  }
                </View>
          }

          <View style={{flex: 1, ...Platform.select({web: {
                overflow: "auto"
              }}) }}>
            {content}
          </View>

          <View>
            <Bottom

                containerStyles={{
                  flexDirection: "row",
                  justifyContent: (loading || buttonLabel == "Close")  ? "center" :"space-between"
                }}
                buttonStyles={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}
                label={buttonLabel}
                icon={(loading || buttonLabel == "Close")  ? <Text/> : <View style={{paddingLeft: 14}}>
                  <CheveronLeftIcon color={ (buttonDisabled || loading) && text.disabled}  />
                </View>}
                onPress={onNext}
                disabled={buttonDisabled || loading}
                loading={loading}
            >
              {!bulkApplicationReview &&((!(completed && applicationProcess == "single-application") || dimensions?.width<=dimensions?.height) && !loading) ?
                  <Button
                      style={[
                        buttonStyle.button,
                        loading && {backgroundColor: button.info},
                        {flexDirection: "row", justifyContent: "center", alignItems: "center"}
                      ]}
                      onPress={() =>{
                        if(currentStep == 0){
                          dispatch(setSelectedService(null));
                        }
                        onPrevious()
                      }}
                  >
                    <View  style={{}}>
                      <CheveronRightIcon color={ loading ? "#fff" : "#2863D6"} />
                    </View>
                    {
                      <Text style={[
                        {

                          color: '#2863D6',

                          fontSize:16,
                          fontFamily: Bold
                        },
                        loading && {color: "#fff"},
                      ]}>
                        {"Back"}
                      </Text>
                    }
                  </Button> : ((loading || buttonLabel == "Close")  ? <></> : <View/>)
              }
            </Bottom>

          </View>

        </View>
      </>

  )
};

export default React.memo(ApplicationSteps);

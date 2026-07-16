
import React, { FC, ReactNode } from 'react';
import { View } from 'react-native';
import Statusbar from '@atoms/status-bar';
import Text from '@atoms/text';
import ProgressSteps from '@atoms/progress-steps';
import { ArrowLeft, Close } from '@atoms/icon';
import NTCAlert from '@atoms/alert';
import { Bottom } from '@molecules/buttons';
import NavBar from '@organisms/navbar';
import styles from './styles';
interface Steps {
  title?: string;
  content?: ReactNode;
  onPrevious?: any;
  onNext?: any;
  buttonLabel?: string;
  buttonDisabled?: boolean;
};

interface Props {
  bulkApplicationReview: boolean;
  applicationProcess: string;
  split: boolean;
  steps?: Steps[];
  currentStep?: number;
  completed?: boolean;
  onExit?: any;
  onSplit?: any;
  loading?: any;
  UDAAlert?: any;
  logoutAlert?: any;
  bulkApplicationsCount?: number;
};

const ApplicationSteps: FC<Props> = ({
  split = true,
  applicationProcess = "single-application",
  steps = [],
  currentStep = 0,
  completed,
  onExit = () => {},
  onSplit = () => {},
  loading,
  UDAAlert = {},
  bulkApplicationReview = false,
  logoutAlert = {},
  bulkApplicationsCount = 0,
}) => {
  const totalSteps = steps?.length;
  if (!(totalSteps > 0)) return <View />;

  const current = steps?.[currentStep] || {};
  const {
    title = '',
    content = <View />,
    onPrevious = () => {},
    onNext = () => {},

    buttonLabel = 'OK',
    buttonDisabled,
  } = current;
  const values = new Array(totalSteps - 1).fill(0).map((n, index) => { return index <= currentStep || completed ? 1 : 0; });


  return (
      <View style={styles.mainContainer}>

        <NTCAlert
            visible={UDAAlert?.active}
            title={UDAAlert?.title || 'Alert'}
            message={UDAAlert?.message}
            confirmText='OK'
            onConfirm={UDAAlert?.onConfirm}
        />

        <NTCAlert
            visible={logoutAlert?.active}
            title={logoutAlert?.title || 'Alert'}
            message={logoutAlert?.message}
            confirmText='OK'
            onConfirm={logoutAlert?.onConfirm}
        />

        {
          completed
              ? <Statusbar barStyle='dark-content' backgroundColor='#fff' />
              : <NavBar
                  title={title}
                  leftIcon={((currentStep + 1) >= totalSteps) ? <Close {...styles.iconStyle} /> : !completed && <ArrowLeft {...styles.iconStyle} />}
                  rightIcon={((currentStep + 1) < totalSteps) && (
                    applicationProcess === 'bulk-application' && bulkApplicationsCount > 0
                    ? <Text style={styles.iconStyle}>Items ({bulkApplicationsCount})</Text>
                    : <Text style={styles.iconStyle}>Close</Text>
                  )}
                  onLeft={onPrevious}
                  onRight={(applicationProcess === 'bulk-application' && bulkApplicationsCount > 0) ? onSplit : onExit}
              />
        }

        {
          (currentStep + 1) >= totalSteps //currentStep is by index
              ? <View />
              : <View style={styles.progressContainer}>
                <ProgressSteps values={values} />
              </View>
        }

        {content}

        <Bottom
            label={buttonLabel}
            onPress={() => setTimeout(() => onNext(), 100)}
            disabled={buttonDisabled || loading}
            loading={loading}
        />

      </View>
  )
};

export default React.memo(ApplicationSteps);

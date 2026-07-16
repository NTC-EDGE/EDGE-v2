import React, {FC, useMemo} from 'react';
import AwesomeAlert from 'react-native-awesome-alerts';
import styles from './styles';

interface Props {
  visible?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: any;
  onCancel?: any;
  alertContainerStyle?:any;
  contentStyle?: any;
  overlayStyle?: any;
  contentContainerStyle?: any;
  titleStyle?: any;
};

const   Alert: FC<Props> = ({
  visible = false,
  title = '',
  message = '',
  confirmText = '',
  cancelText = '',
  onConfirm = () => {},
  onCancel = () => {},
  alertContainerStyle = {},
                            contentStyle = {},
                            overlayStyle = {},
                            contentContainerStyle = {},
    titleStyle = {}
}) => {
  const stylesMemo = useMemo(() => {
    return styles;
  }, [])
  return (
    <AwesomeAlert
      show={visible}
      title={title}
      message={message}
      closeOnTouchOutside={false}
      closeOnHardwareBackPress={false}
      confirmText={confirmText}
      cancelText={cancelText}
      showConfirmButton={!!confirmText}
      showCancelButton={!!cancelText}
      onConfirmPressed={onConfirm}
      onCancelPressed={onCancel}
      overlayStyle={[{...overlayStyle}]}
      alertContainerStyle={[stylesMemo.alertContainerStyle, {...alertContainerStyle}]}
      contentContainerStyle={[stylesMemo.contentContainerStyle, {...contentContainerStyle}]}
      contentStyle={[stylesMemo.contentStyle, {...contentStyle}]}
      titleStyle={[stylesMemo.titleStyle, {...titleStyle}]}
      messageStyle={stylesMemo.messageStyle}
      actionContainerStyle={stylesMemo.actionContainerStyle}
      confirmButtonStyle={stylesMemo.confirmButtonStyle}
      cancelButtonStyle={stylesMemo.cancelButtonStyle}
      confirmButtonTextStyle={stylesMemo.confirmButtonTextStyle}
      cancelButtonTextStyle={stylesMemo.cancelButtonTextStyle}
      useNativeDriver={true}
    />
  )
};

export default React.memo(Alert);

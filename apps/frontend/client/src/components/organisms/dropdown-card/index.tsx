import React, {FC, ReactNode, useMemo, useState} from 'react';
import { View, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Down, Up } from '@atoms/icon';
import { defaultColor } from '@styles/color';
import styles from './styles';

interface Props {
  style?: any;
  headerContainer?: any;
  label?: ReactNode;
  children?: ReactNode;
  onToggle?: (collapsed: boolean) => void;
}

const DropdownCard: FC<Props> = ({
                                   style = {},
                                   headerContainer = {},
                                   label = <View />,
                                   children,
                                   onToggle = () => {},
                                 }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // default to collapsed

  const toggleDropdown = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle(newState);
  };
    const stylesMemo = useMemo(() => {
        return styles;
    }, [])
  return (
      <View style={[stylesMemo.container, style]}>
        <View style={[stylesMemo.headerContainer, headerContainer]}>
          <View style={stylesMemo.headerLabelContainer}>{label}</View>
          <TouchableOpacity onPress={toggleDropdown}>
            {isCollapsed ? (
                <Down size={20} color={defaultColor} />
            ) : (
                <Up size={20} color={defaultColor} />
            )}
          </TouchableOpacity>
        </View>

        {!!children && (
            <Collapsible collapsed={isCollapsed}>
              <View style={stylesMemo.contentContainer}>{children}</View>
            </Collapsible>
        )}
      </View>
  );
};

export default React.memo(DropdownCard);

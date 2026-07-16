import React, {FC, useMemo, useState} from 'react';
import { View } from 'react-native';
import { InputField } from '@molecules/form-fields';
import { Magnifier, Close } from '@atoms/icon';
import { infoColor, defaultColor } from '@styles/color';
import styles from './styles';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {

};

const SearchBar: FC<Props> = ({

}) => {
    const stylesMemo = useMemo(() => {
        return styles;
    }, [])
  const [text, setText] = useState('');
  return (
    <View style={stylesMemo.view}>
      <View style={stylesMemo.viewLeft}>
        <Magnifier color={infoColor} size={18} />
        <InputField
          placeholder='Search'
          outlineStyle={stylesMemo.input_outlineStyle}
          containerStyle={stylesMemo.input_containerStyle}
          inputStyle={stylesMemo.input_inputStyle}
          value={text}
          onChangeText={(txt: string) => setText(txt)}
        />
      </View>
      <TouchableOpacity
        onPress={() => setText('')}
        accessibilityLabel="Clear search"
        accessibilityRole="button"
      >
        <Close color={defaultColor} type='block-circle' size={13} />
      </TouchableOpacity>
    </View>
  )
};

export default React.memo(SearchBar);

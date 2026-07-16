import React, { FC, useCallback, memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { View, FlatList, Platform, useWindowDimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from '@atoms/text';
import { ArrowLeft } from '@atoms/icon';
import NavBar from '@organisms/navbar';
import styles from './styles';
import { isMobile } from '@utils/formatting';
import { Bold } from '@styles/font';
import { setSelectedService, setSelectedServiceKey } from '@reducers/service/actions';

interface Props {
  navigation: any;
  services: any;
}

const ServiceItem = memo(({ item, onPress }: { item: any; onPress: (item: any) => void }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
    >
      <View style={styles.dropdown}>
        <Text style={styles.dropdownTitleTxt}>{item?.name} </Text>
      </View>
    </TouchableOpacity>
  );
});

const ListSeparator = memo(() => <View style={styles?.separator} />);
const ListFooter = memo(() => <View style={styles?.bottomContainer} />);

function Nav(props: { width: number, onPress: () => void }) {
  return (
    <View style={[styles.title, { paddingRight: props.width * 0.02, paddingLeft: props.width * 0.048 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ paddingRight: 3 }}>
          <TouchableOpacity onPress={props.onPress}>
            <ArrowLeft color="#113196" />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={{ fontSize: 20, color: '#113196', fontFamily: Bold }}>Services</Text>
        </View>
      </View>
    </View>
  );
}

const Services: FC<Props> = ({
  navigation,
  services,
}) => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  const handlePress = useCallback((item: any) => {
    dispatch(setSelectedService(item));
    if (isMobile) setTimeout(() => navigation.navigate('ApplicationSteps'));
  }, [dispatch, navigation]);



  const renderItem = useCallback(({ item }: any) => (
    <ServiceItem item={item} onPress={handlePress} />
  ), [handlePress]);

  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);

  const renderSeparator = useCallback(() => <ListSeparator />, []);
  const renderFooter = useCallback(() => <ListFooter />, []);

  const handleNavPress = useCallback(() => {
    dispatch(setSelectedService(null));
    dispatch(setSelectedServiceKey(null));
  }, [dispatch]);

  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <View style={styles.container}>
      {Platform.select({
        native: (
          <NavBar
            title="Services"
            leftIcon={<ArrowLeft color="#fff" />}
            onLeft={handleGoBack}
          />
        ),
        web: <Nav width={width} onPress={handleNavPress} />,
      })}

      <FlatList
        showsVerticalScrollIndicator={true}
        style={styles.flatlist}
        data={services}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        keyExtractor={keyExtractor}
        ListFooterComponent={renderFooter}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

export default memo(Services);

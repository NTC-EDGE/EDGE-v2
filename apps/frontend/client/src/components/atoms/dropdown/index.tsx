import React, { memo, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    FlatList,
    Platform,
    StatusBar,
    Pressable,
    Dimensions,
    TextInput
} from 'react-native';
import Text from '@atoms/text';
import Ellipsis from '@atoms/ellipsis';
import { Down } from '@atoms/icon';
import { infoColor, text } from '@styles/color';
import styles2 from '@styles/input-style';
import styles from './styles';
import {LucideSearch, XCircle} from "lucide-react-native";
import ItemRow from './components/ItemRow';

const screenHeight = Dimensions.get('window').height;
const statusBarHeight = Platform.OS === 'android' ? StatusBar?.currentHeight || 0 : 0;

const DropDown = ({
                      items = [],
                      value = '',
                      alternativeValue = '',
                      onPreSelect = () => {},
                      onChangeValue = () => {},
                      placeholder = 'Choose an item..',
                      iconSize = 24,
                      iconColor = '#000',
                      containerStyle = {},
                      dropdownStyle = {},
                      dropdownElementStyle = {},
                      selectedElementColor = {},
                      placeholderStyle = {},
                      onToggle = (visible: boolean) => {},
                      loading = false,
                      required = false,
                      error = '',
                  }) => {
    const DropdownButton = useRef();
    const DropdownList = useRef();
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const [dropdownWidth, setDropdownWidth] = useState(0);
    const [dropdownHeight, setDropdownHeight] = useState(0);
    const [searchQuery, setSearchQuery] = useState(''); // Actual query used for filtering
    const [searchValue, setSearchValue] = useState(''); // Local state for the input

    // Debounce the search query update to prevent lag during typing
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(searchValue);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchValue]);

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, items]);

    const stylesMemo = useMemo(() => {
        return {
            ...styles, // existing styles
            searchInput: {
                width: '100%',
                padding: 10,
                paddingLeft: 40,
                fontSize: 16,
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 5,
                marginBottom: 10, // spacing between search input and dropdown list
            }
        };
    }, []);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const toggleDropdown = (): void => {
        if (visible && !isInputFocused) {
            setVisible(false);
            onToggle(false);
        } else {
            openDropdown();
        }
    };

    const openDropdown = (): void => {
        DropdownButton?.current?.measure((_fx, _fy, _w, h, _px, py) => {
            const availableHeight = screenHeight - py - h - statusBarHeight;
            setDropdownWidth(_w);
            setDropdownLeft(_px);
            setDropdownTop(py + h - statusBarHeight);
            setDropdownHeight(Math.min(availableHeight, 300));
        });
        setVisible(true);
        onToggle(true);
    };

    const onItemPress = useCallback((item: any): void => {
        onChangeValue(item);
        setVisible(false);
        onToggle(false);
    }, [onChangeValue, onToggle]);

    const stylesMemo2 = useMemo(() => {
        return styles2;
    }, []);

    const renderItem = React.useCallback(
        ({ item }: { item: any }) => {
            const isSelected = value === item?.value || item?.label === value;
            return (
                <ItemRow
                    item={item}
                    isSelected={isSelected}
                    onPress={onItemPress}
                />
            );
        },
        [value, onItemPress]
    );

    const renderDropdown = (): ReactElement<any, any> => (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onDismiss={() => {
                setIsInputFocused(false)
                setVisible(false)
            }} // Close modal when dismissed
        >
            {/* Pressable for the background (to close the modal when clicked outside) */}
            <Pressable
                style={stylesMemo.overlay}
                onPress={() => {
                    if(!isInputFocused) {
                            setVisible(false);
                            onToggle(false);
                    }
                } // Close modal when clicking on the background
                }
            >
                {/* Dropdown container */}
                <View
                    style={[
                        stylesMemo.dropdown,
                        { top: dropdownTop + 5, height: dropdownHeight },
                        dropdownStyle,
                        {
                            ...Platform.select({
                                web: {
                                    width: dropdownWidth,
                                    left: dropdownLeft,
                                    overflow: 'auto'
                                }
                            }),
                        }
                    ]}
                    onStartShouldSetResponder={(e) => true}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <TouchableOpacity
                        style={stylesMemo.searchButton}
                    >
                        <LucideSearch/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setVisible(false)}
                        style={stylesMemo.closeButton}
                    >
                        <XCircle/>
                    </TouchableOpacity>
                    {loading ? (
                        <View style={stylesMemo?.ellipsisContainer}>
                            <Ellipsis color={infoColor} size={10} />
                        </View>
                    ) : (
                        <>
                            {/* Search Input */}
                            <TextInput
                                value={searchValue}
                                placeholderTextColor={text.disabled}
                                onChangeText={setSearchValue}
                                placeholder="Search..."
                                style={stylesMemo.searchInput}
                                onFocus={() => {
                                    setIsInputFocused(true);  // Set input focused state\
                                }}
                                onBlur={() => {
                                    setIsInputFocused(false); // Set input unfocused state
                                }}
                            />
                            {/* Dropdown items */}
                            <FlatList
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                data={filteredItems}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => item?.id || item?.value || item?.label || index.toString()}
                                ref={DropdownList}
                                showsVerticalScrollIndicator
                                showsHorizontalScrollIndicator
                                getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
                                ListEmptyComponent={() => (
                                    <View style={stylesMemo?.emptyListContainer}>
                                        <Text style={stylesMemo?.emptyListText}>No data available yet.</Text>
                                    </View>
                                )}
                                onScrollToIndexFailed={(info) => {
                                    setTimeout(() => {
                                        DropdownList.current?.scrollToIndex({ index: info.index, animated: true });
                                    }, 100);
                                }}
                            />
                        </>
                    )}
                </View>
            </Pressable>
        </Modal>
    );

    return (
        <>
            {
                <TouchableOpacity
                    ref={DropdownButton}
                    style={[containerStyle, stylesMemo.container]}
                    onPress={toggleDropdown}
                >
                    {renderDropdown()}
                    <View style={{ flex: 0.95 }}>
                        {!!value && !!placeholder && (
                            <View style={stylesMemo2.labelContainer}>
                                <Text
                                    style={[
                                        stylesMemo2.labelText,
                                        !!error && { color: text?.error },
                                    ]}
                                >
                                    {placeholder}
                                </Text>
                                {required && (
                                    <Text style={stylesMemo2.requiredText}>
                                        {'*'}
                                    </Text>
                                )}
                            </View>
                        )}
                        <Text
                            style={[
                                stylesMemo.placeholder,
                                value && styles.valueText,
                                placeholderStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {(alternativeValue || value) || placeholder}
                        </Text>
                    </View>
                    <Down size={iconSize} iconColor={iconColor} />
                </TouchableOpacity>
            }
        </>
    );
};

export default React.memo(DropDown);

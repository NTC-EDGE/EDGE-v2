import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '@atoms/text';
import { StatusBadge } from "@pages/homepage/tab-navigation/services/StatusBadge";
import styles from '../styles';

interface ItemRowProps {
    item: any;
    isSelected: boolean;
    onPress: (item: any) => void;
}

const ItemRow = memo(function ItemRow({
    item,
    isSelected,
    onPress,
}: ItemRowProps) {
    const handlePress = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={[styles.row, isSelected && styles.rowSelected]}>
                <View style={styles.labelCol}>
                    <Text style={styles.labelText}>{item?.label}</Text>
                </View>

                <View style={styles.badgesRow}>
                    {item?.serviceCode ? (
                        <StatusBadge
                            label={item.serviceCode}
                            colors={["#6a11cb", "#2575fc"]}
                        />
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default ItemRow;

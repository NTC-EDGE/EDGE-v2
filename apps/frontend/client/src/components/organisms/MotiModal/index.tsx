import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    Pressable,
    Platform,
    Dimensions,
    ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';

interface ModalMotiProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: number | string;
    contentStyle?: ViewStyle;
}

const ModalMoti: React.FC<ModalMotiProps> = ({
    visible,
    onClose,
    children,
    width,
    contentStyle,
}) => {
    const screenWidth = Dimensions.get('window').width;

    const defaultWidth =
        Platform.OS === 'web'
            ? Math.min(screenWidth * 0.92, 1200)
            : '92%';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <MotiView
                    from={{
                        opacity: 0,
                        scale: 0.95,
                        translateY: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        translateY: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.95,
                        translateY: 20,
                    }}
                    transition={{
                        type: 'timing',
                        duration: 200,
                    }}
                    style={[
                        styles.content,
                        {
                            width: width || defaultWidth,
                            maxWidth: Platform.OS === 'web' ? 1200 : '92%',
                        },
                        contentStyle,
                    ]}
                >
                    {children}
                </MotiView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },

    content: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: Platform.OS === 'web' ? 16 : 12,
        alignSelf: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,

        elevation: 10,
    },
});

export default ModalMoti;
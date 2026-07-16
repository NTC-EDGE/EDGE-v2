import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import Modal from 'react-native-modal';
import Sign from '@atoms/signature';
import { uploadSignature } from '@reducers/user/actions';
import { useDispatch } from 'react-redux';
import signatureStyles from './styles.ts';

type Props = {
    userId: string;
    formSignature?: string | null; // base64 dataURL or uri
};

export default function SignatureModal({ userId, formSignature = null }: Props) {
    const [visible, setVisible] = useState(false);
    const [signature, setSignature] = useState<string | null>(formSignature);
    const signatureRef = useRef<any>();
    const dispatch = useDispatch();

    const createFormData = async (uriOrDataUrl: string) => {
        const data = new FormData();

        if (Platform.OS === 'web') {
            // If it's a data URL, fetch will handle it; if it's an http(s) url, also fine
            const res = await fetch(uriOrDataUrl);
            const blob = await res.blob();
            const file = new File([blob], 'sign.png', { type: blob.type || 'image/png' });
            data.append('file', file);
        } else {
            // iOS/Android expect { uri, name, type }
            // If uriOrDataUrl is a dataURL, convert to temporary file first (or ensure Sign returns a file URI)
            data.append('file', {
                uri: uriOrDataUrl,
                name: 'sign.png',
                type: 'image/png',
            } as any);
        }

        data.append('userId', userId);
        return data;
    };

    const handleOK = async () => {
        if (!signature) return;
        const formData = await createFormData(signature);
        await dispatch(uploadSignature(formData)); // await if your action returns a promise
        setVisible(false);
    };

    const handleClear = () => {
        signatureRef.current?.clearSignature?.();
        setSignature(null);
    };

    return (
        <View style={signatureStyles.container}>
            <TouchableOpacity style={signatureStyles.button} onPress={() => setVisible(true)}>
                <Text style={signatureStyles.buttonText}>Signature</Text>
            </TouchableOpacity>

            <Modal isVisible={visible} onBackdropPress={() => setVisible(false)} backdropOpacity={0.5}>
                <AnimatePresence>
                    {visible && (
                        <MotiView
                            from={{ opacity: 0, translateY: 50 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: 50 }}
                            transition={{ type: 'timing', duration: 250 }}
                            style={signatureStyles.modalContent}
                        >
                            <Text style={signatureStyles.modalTitle}>Sign Below</Text>

                            <View style={signatureStyles.signatureWrapper}>
                                <Sign
                                    ref={signatureRef}
                                    onOK={(val: string) => setSignature(val)}  // ensure Sign returns a URI or dataURL consistently
                                    onClear={() => setSignature(null)}
                                />
                            </View>

                            <View style={signatureStyles.actions}>
                                <TouchableOpacity onPress={handleClear} style={signatureStyles.actionBtn}>
                                    <Text>Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleOK} style={[signatureStyles.actionBtn, signatureStyles.saveBtn]}>
                                    <Text style={signatureStyles.saveBtnText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </MotiView>
                    )}
                </AnimatePresence>
            </Modal>
        </View>
    );
}

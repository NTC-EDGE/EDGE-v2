import React, { useMemo, useRef, useState } from 'react';
import {
  Platform,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import Signature, { SignatureViewRef } from 'react-native-signature-canvas';
import SignatureCanvas from 'react-signature-canvas';
import * as DocumentPicker from 'expo-document-picker';
import Text from '@atoms/text';
import { input } from '@styles/color';
import styles from './styles';

interface Props {
  onOK?: (signature: any) => void;
  onClear?: () => void;
  error?: string;
  onBegin?: () => void;
  onEnd?: () => void;
};

const Sign: React.FC<Props> = ({
                                 onOK = () => {},
                                 onClear = () => {},
                                 error,
                                 onBegin = () => {},
                                 onEnd = () => {},
                               }) => {
  const ref = Platform.OS === 'web'
      ? useRef<SignatureCanvas>(null)
      : useRef<SignatureViewRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [usedUpload, setUsedUpload] = useState<boolean>(false); // toggle to check upload vs canvas
  const [signatureKey, setSignatureKey] = useState<number>(0);
  const stylesMemo = useMemo(() => styles, []);

  const handleSignature = (signature: any) => {
    const finalSignature = Platform.OS === 'web'
        ? ref?.current?.getTrimmedCanvas()?.toDataURL('image/png')
        : signature;

    setUsedUpload(false); // it's drawn
    setUploadedSignature(null); // no preview needed
    onOK(finalSignature);
  };

  const handleClear = () => {
    if (Platform.OS === 'web') {
      ref?.current?.clear();
    } else {
      ref?.current?.clearSignature();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadedSignature(null);
    setUsedUpload(false);
    onClear();
  };

  const handleEnd = () => {
    ref.current?.readSignature();
    onEnd();
  };

  const handleUploadSignature = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
      });

      if (result?.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setUsedUpload(true);

        // 👇 Reset signature, then set after a short delay
        setUploadedSignature(null);
        setTimeout(() => {
          setSignatureKey(prev => prev + 1); // keep for extra safety
          setUploadedSignature(uri);
          onOK(uri);
        }, 50);
      }
    } catch (error) {
      console.error('Signature upload failed', error);
    }
  };

  const handleWebUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUsedUpload(true);

        // 👇 Reset signature, then set after a short delay
        setUploadedSignature(null);
        setTimeout(() => {
          setSignatureKey(prev => prev + 1);
          setUploadedSignature(result);
          onOK(result);
        }, 50);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
      <>
        <View style={[stylesMemo.view, !!error && stylesMemo.viewError]}>
          {usedUpload && uploadedSignature ? (
              <Image
                  key={signatureKey}
                  source={{ uri: uploadedSignature }}
                  style={{
                    width: '100%',
                    height: 150,
                    resizeMode: 'contain',
                    marginTop: 10,
                    borderRadius: 8,
                  }}
              />
          ) : Platform.OS === 'web' ? (
              <SignatureCanvas
                  ref={ref}
                  canvasProps={stylesMemo.webCanvas}
                  backgroundColor={input.background.default}
                  onEnd={handleSignature}
              />
          ) : (
              <Signature
                  ref={ref}
                  onBegin={onBegin}
                  onEnd={handleEnd}
                  onOK={handleSignature}
                  onClear={handleClear}
                  onEmpty={() => {}}
                  trimWhitespace={true}
              />
          )}
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
          <TouchableOpacity onPress={handleClear}>
            <View style={stylesMemo.webCanvasClearView}>
              <Text style={stylesMemo.webCanvasClearTxt}>Clear</Text>
            </View>
          </TouchableOpacity>

              <TouchableOpacity onPress={handleUploadSignature}>
                <View style={stylesMemo.webCanvasClearView}>
                  <Text style={stylesMemo.webCanvasClearTxt}>Upload Signature</Text>
                </View>
              </TouchableOpacity>
        </View>

        {!!error && (
            <Text style={stylesMemo.errorText}>Sign your signature above</Text>
        )}
      </>
  );
};

export default React.memo(Sign);

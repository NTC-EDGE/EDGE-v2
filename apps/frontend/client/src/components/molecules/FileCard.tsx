// FileCard.tsx
import React, { useState } from 'react';
import { View, Pressable, ImageBackground, StyleSheet, Platform } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { Close } from '@atoms/icon';

type FileCardProps = {
    file: any;
    index: number;
    previewUri?: string;
    stylesMemo: any;
    disabled?: boolean;
    multipleFiles?: boolean;
    isUploading?: boolean;
    isUploaded?: boolean;
    files: any[];
    setFiles: (f: any[]) => void;
    setFile: (f: any) => void;
    onRemove: (i: number) => void;
    onOpenPreview?: () => void;
};

export default function FileCard({
                                     file,
                                     index,
                                     previewUri,
                                     stylesMemo,
                                     disabled,
                                     multipleFiles = true,
                                     isUploading,
                                     isUploaded,
                                     files,
                                     setFiles,
                                     setFile,
                                     onRemove,
                                     onOpenPreview,
                                 }: FileCardProps) {
    const [loading, setLoading] = useState(true);
    const [thumbLayout, setThumbLayout] = useState<{x:number;y:number;width:number;height:number} | null>(null);

    return (
        <MotiView
            layout
            from={{ opacity: 0, scale: 0.95, translateY: 8 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.95, translateY: 8 }}
            transition={{ type: 'spring', damping: 18, stiffness: 180 }}
            style={stylesMemo.card}
        >
            {/* Left: thumbnail */}
            <MotiPressable
                onPress={onOpenPreview}
                disabled={disabled || !previewUri}
                animate={({ pressed }) => {
                    'worklet';
                    return {
                        scale: pressed ? 0.985 : 1,
                        shadowOpacity: pressed ? 0.25 : 0.15,
                    };
                }}
                transition={{ type: 'timing', duration: 120 }}
                style={stylesMemo.thumbWrap}
            >
                {previewUri ? (
                    <ImageBackground
                        onLayout={e => setThumbLayout(e.nativeEvent.layout)}
                        style={stylesMemo.filePreview}
                        imageStyle={stylesMemo.thumbImg}
                        source={{ uri: previewUri }}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                    >
                        {/* idle float layer */}
                        <MotiView
                            from={{ translateY: 0 }}
                            animate={{ translateY: -2 }}
                            transition={{ type: 'timing', duration: 1800, loop: true, repeatReverse: true }}
                            style={StyleSheet.absoluteFill}
                            pointerEvents="none"
                        />

                        {/* iOS “ink” press ripple substitute */}
                        <MotiPressable
                            animate={({ pressed }) => {
                                'worklet';
                                return { opacity: pressed ? 0.08 : 0 };
                            }}
                            style={StyleSheet.absoluteFill}
                        >
                            <View style={{ flex: 1, backgroundColor: '#000' }} />
                        </MotiPressable>

                        {/* Loading shimmer/pulse */}
                        <AnimatePresence>
                            {loading && (
                                <MotiView
                                    from={{ opacity: 0.25 }}
                                    animate={{ opacity: 0.6 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'timing', duration: 600, loop: true, repeatReverse: true }}
                                    style={styles.loadingOverlay}
                                />
                            )}
                        </AnimatePresence>

                        {/* Remove button (animated pill) */}
                        <Pressable
                            onPress={() => {
                                if (multipleFiles) {
                                    const newFiles = [...files];
                                    newFiles.splice(index, 1);
                                    setFiles(newFiles);
                                } else {
                                    setFile({});
                                }
                                onRemove(index);
                            }}
                            disabled={disabled}
                            hitSlop={10}
                            style={stylesMemo.closeBtn}
                        >
                            <MotiView
                                from={{ opacity: 0, scale: 0.8, rotate: '0deg' }}
                                animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95, rotate: '90deg' }}
                                transition={{ type: 'timing', duration: 140 }}
                                style={stylesMemo.closePill}
                            >
                                <Close size={16} color="#fff" />
                            </MotiView>
                        </Pressable>
                    </ImageBackground>
                ) : (
                    // Fallback when there’s no preview image
                    <View style={[styles.fallback, stylesMemo.filePreview]}>
                        {/* add an icon if you like */}
                    </View>
                )}
            </MotiPressable>

            {/* Right: meta + status */}
            <View style={stylesMemo.meta}>
                {/* name/status—keep your existing children here */}
                {/* Example “Uploaded” badge */}
                {!isUploading && isUploaded ? (
                    <View style={stylesMemo.badgeSuccess}>
                        <MotiView
                            from={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'timing', duration: 150 }}
                        >
                            <View>
                                {/* wrap your Text */}
                            </View>
                        </MotiView>
                    </View>
                ) : null}
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    fallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 10,
    },
});

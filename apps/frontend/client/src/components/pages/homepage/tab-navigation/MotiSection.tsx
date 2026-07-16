// components/MotiSection.tsx
import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MotiView, AnimatePresence } from "moti";

interface Props {
    title: string;
    children: React.ReactNode;
}

export default function MotiSection({ title, children }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <View style={{ marginBottom: 12 }}>
            {/* Header */}
            <TouchableOpacity
                onPress={() => setOpen(prev => !prev)}
                style={{ paddingVertical: 10 }}
            >
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{title}</Text>
            </TouchableOpacity>

            {/* Collapsible Content */}
            <AnimatePresence>
                {open && (
                    <MotiView
                        from={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "timing", duration: 300 }}
                        style={{ overflow: "hidden", paddingTop: 6 }}
                    >
                        {children}
                    </MotiView>
                )}
            </AnimatePresence>
        </View>
    );
}

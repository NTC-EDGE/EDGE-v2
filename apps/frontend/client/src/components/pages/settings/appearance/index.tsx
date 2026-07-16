import React, { FC, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
} from "react-native";
import { MotiView } from "moti";

type ThemeOption = "light" | "dark" | "system";

interface AppearanceProps {
    theme?: ThemeOption;
    onThemeChange?: (theme: ThemeOption) => void;
    reduceMotion?: boolean;
    onToggleReduceMotion?: (value: boolean) => void;
}

const Appearance: FC<AppearanceProps> = ({
                                             theme: controlledTheme,
                                             onThemeChange,
                                             reduceMotion: controlledReduceMotion,
                                             onToggleReduceMotion,
                                         }) => {
    // Fallback internal state if not controlled by parent
    const [internalTheme, setInternalTheme] = useState<ThemeOption>("light");
    const [internalReduceMotion, setInternalReduceMotion] =
        useState<boolean>(false);

    const currentTheme = controlledTheme ?? internalTheme;
    const currentReduceMotion =
        controlledReduceMotion ?? internalReduceMotion;

    const handleThemeChange = (next: ThemeOption) => {
        if (onThemeChange) onThemeChange(next);
        else setInternalTheme(next);
    };

    const handleReduceMotionToggle = (value: boolean) => {
        if (onToggleReduceMotion) onToggleReduceMotion(value);
        else setInternalReduceMotion(value);
    };

    const renderRadio = (value: ThemeOption, label: string, helper?: string) => {
        const selected = currentTheme === value;

        return (
            <TouchableOpacity
                key={value}
                style={styles.radioRow}
                activeOpacity={0.7}
                onPress={() => handleThemeChange(value)}
            >
                <View style={styles.radioOuter}>
                    {selected && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.radioLabel}>{label}</Text>
                    {helper ? (
                        <Text style={styles.radioHelper}>{helper}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Page heading */}
            <View style={styles.header}>
                <Text style={styles.title}>Appearance</Text>
                <Text style={styles.subtitle}>
                    Customize the look and feel of your account.
                </Text>
            </View>

            {/* Theme card */}
            <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 220 }}
                style={styles.card}
            >
                <Text style={styles.cardTitle}>Theme</Text>

                {renderRadio("light", "Light")}
                {renderRadio("dark", "Dark")}
                {renderRadio("system", "Use system setting", "Follow your device theme")}
            </MotiView>

            {/* Accessibility card */}
            <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 220, delay: 80 }}
                style={styles.card}
            >
                <Text style={styles.cardTitle}>Accessibility</Text>

                <View style={styles.accessRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.radioLabel}>Reduce Motion</Text>
                        <Text style={styles.radioHelper}>
                            Limit animations and transitions.
                        </Text>
                    </View>
                    <Switch
                        value={currentReduceMotion}
                        onValueChange={handleReduceMotionToggle}
                    />
                </View>
            </MotiView>
        </View>
    );
};

export default Appearance;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
    },
    radioRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 8,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        marginTop: 2,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#2563EB",
    },
    radioLabel: {
        fontSize: 14,
        color: "#111827",
        marginBottom: 2,
    },
    radioHelper: {
        fontSize: 12,
        color: "#6B7280",
    },
    accessRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
    },
});

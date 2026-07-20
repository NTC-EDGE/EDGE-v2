"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvatarColors = getAvatarColors;
exports.Avatar = Avatar;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const tokens_1 = require("../theme/tokens");
const fallbackColors = [
    { bg: tokens_1.COLORS.brand[900], text: tokens_1.COLORS.neutral.white },
    { bg: tokens_1.COLORS.brand[700], text: tokens_1.COLORS.neutral.white },
    { bg: tokens_1.COLORS.brand[500], text: tokens_1.COLORS.neutral.white },
    { bg: tokens_1.COLORS.semantic.successBg, text: tokens_1.COLORS.semantic.success },
    { bg: tokens_1.COLORS.semantic.warningBg, text: tokens_1.COLORS.semantic.warning },
    { bg: tokens_1.COLORS.semantic.infoBg, text: tokens_1.COLORS.semantic.info },
];
function getAvatarColors(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % fallbackColors.length;
    const match = fallbackColors[index];
    if (match !== undefined) {
        return match;
    }
    return { bg: tokens_1.COLORS.neutral[100], text: tokens_1.COLORS.neutral[900] };
}
function Avatar({ imageUri, name, size = 'md', variant = 'circle', useDeterministicColors = false, }) {
    const initial = name.length > 0 ? name.charAt(0).toUpperCase() : 'S';
    const colors = useDeterministicColors
        ? getAvatarColors(name)
        : { bg: tokens_1.COLORS.neutral.white, text: tokens_1.COLORS.brand[900] };
    const sizeValue = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
    const fontStyle = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;
    const borderRadius = variant === 'circle' ? sizeValue / 2 : tokens_1.RADIUS.button;
    const containerStyle = [
        styles.avatarContainer,
        {
            width: sizeValue,
            height: sizeValue,
            borderRadius,
            backgroundColor: colors.bg,
        },
    ];
    if (imageUri !== undefined && imageUri !== null && imageUri.length > 0) {
        return (<react_native_1.Image source={{ uri: imageUri }} style={{
                width: sizeValue,
                height: sizeValue,
                borderRadius,
            }}/>);
    }
    return (<react_native_1.View style={containerStyle}>
      <react_native_1.Text style={[styles.fallbackText, fontStyle, { color: colors.text }]}>
        {initial}
      </react_native_1.Text>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
    },
    textSm: {
        fontSize: 11,
    },
    textMd: {
        fontSize: 14,
    },
    textLg: {
        fontSize: 18,
    },
});

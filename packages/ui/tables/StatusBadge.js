"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusColors = void 0;
exports.StatusBadge = StatusBadge;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const tokens_1 = require("../theme/tokens");
const getStatusColors = (status) => {
    const normalized = status.toLowerCase();
    if (normalized === 'approved' || normalized === 'active' || normalized === 'complete') {
        return {
            bg: tokens_1.COLORS.semantic.successBg,
            border: tokens_1.COLORS.semantic.successBorder,
            text: tokens_1.COLORS.semantic.success,
        };
    }
    if (normalized === 'pending' || normalized === 'reviewing' || normalized === 'warning') {
        return {
            bg: tokens_1.COLORS.semantic.warningBg,
            border: tokens_1.COLORS.semantic.warningBorder,
            text: tokens_1.COLORS.semantic.warning,
        };
    }
    if (normalized === 'rejected' || normalized === 'failed' || normalized === 'error') {
        return {
            bg: tokens_1.COLORS.semantic.errorBg,
            border: tokens_1.COLORS.semantic.errorBorder,
            text: tokens_1.COLORS.semantic.error,
        };
    }
    return {
        bg: tokens_1.COLORS.neutral[100],
        border: tokens_1.COLORS.neutral[200],
        text: tokens_1.COLORS.neutral[600],
    };
};
exports.getStatusColors = getStatusColors;
function StatusBadge({ status }) {
    const colors = (0, exports.getStatusColors)(status);
    return (<react_native_1.View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <react_native_1.Text style={[styles.badgeText, { color: colors.text }]}>{status}</react_native_1.Text>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 9999,
        borderWidth: 1,
    },
    badgeText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 12,
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
    },
});

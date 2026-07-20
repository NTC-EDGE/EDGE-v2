"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPOGRAPHY = exports.SHADOWS = exports.RADIUS = exports.SPACING = exports.COLORS = void 0;
exports.COLORS = {
    brand: {
        900: '#0B1953', // Deep Executive Navy
        800: '#1E3A8A', // Branded Enterprise Blue
        700: '#2563EB', // Branded Accent Blue (Hover)
        600: '#3B82F6', // Active Highlight Blue
        505: '#60A5FA', // Light Focus Blue (renamed to avoid type issues if needed, but 500 is standard)
        500: '#60A5FA', // Light Focus Blue
    },
    neutral: {
        white: '#FFFFFF',
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
    },
    semantic: {
        success: '#10B981', // Emerald 500
        successBg: '#ECFDF5', // Emerald 50
        successBorder: '#A7F3D0', // Emerald 200
        warning: '#F59E0B', // Amber 500
        warningBg: '#FEF3C7', // Amber 50
        warningBorder: '#FDE68A', // Amber 200
        error: '#EF4444', // Red 500
        errorBg: '#FEF2F2', // Red 50
        errorBorder: '#FCA5A5', // Red 200
        info: '#06B6D4', // Cyan 500
        infoBg: '#ECFEFF', // Cyan 50
        infoBorder: '#A5F3FC', // Cyan 200
    },
    bg: '#F8FAFC', // Slate background for a premium neutral layout
};
exports.SPACING = {
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    20: 20,
    24: 24,
    32: 32,
    40: 40,
    48: 48,
    64: 64,
};
exports.RADIUS = {
    input: 8, // Refined slightly smaller borders for enterprise look
    button: 8,
    card: 12,
    dialog: 16,
    circle: 9999,
};
exports.SHADOWS = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    card: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, // Very soft shadow
        shadowRadius: 10,
        elevation: 1,
    },
    modal: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08, // Soft modal shadow
        shadowRadius: 20,
        elevation: 8,
    },
};
exports.TYPOGRAPHY = {
    fonts: {
        primary: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    sizes: {
        heading: 32, // Refined hierarchy sizes
        section: 22,
        cardTitle: 16,
        body: 14,
        smallLabel: 13,
        caption: 12,
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};

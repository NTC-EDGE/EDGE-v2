export declare const COLORS: {
    readonly brand: {
        readonly 900: "#0B1953";
        readonly 800: "#1E3A8A";
        readonly 700: "#2563EB";
        readonly 600: "#3B82F6";
        readonly 505: "#60A5FA";
        readonly 500: "#60A5FA";
    };
    readonly neutral: {
        readonly white: "#FFFFFF";
        readonly 50: "#F8FAFC";
        readonly 100: "#F1F5F9";
        readonly 200: "#E2E8F0";
        readonly 300: "#CBD5E1";
        readonly 400: "#94A3B8";
        readonly 500: "#64748B";
        readonly 600: "#475569";
        readonly 700: "#334155";
        readonly 800: "#1E293B";
        readonly 900: "#0F172A";
    };
    readonly semantic: {
        readonly success: "#10B981";
        readonly successBg: "#ECFDF5";
        readonly successBorder: "#A7F3D0";
        readonly warning: "#F59E0B";
        readonly warningBg: "#FEF3C7";
        readonly warningBorder: "#FDE68A";
        readonly error: "#EF4444";
        readonly errorBg: "#FEF2F2";
        readonly errorBorder: "#FCA5A5";
        readonly info: "#06B6D4";
        readonly infoBg: "#ECFEFF";
        readonly infoBorder: "#A5F3FC";
    };
    readonly bg: "#F8FAFC";
};
export declare const SPACING: {
    readonly 4: 4;
    readonly 8: 8;
    readonly 12: 12;
    readonly 16: 16;
    readonly 20: 20;
    readonly 24: 24;
    readonly 32: 32;
    readonly 40: 40;
    readonly 48: 48;
    readonly 64: 64;
};
export declare const RADIUS: {
    readonly input: 8;
    readonly button: 8;
    readonly card: 12;
    readonly dialog: 16;
    readonly circle: 9999;
};
export declare const SHADOWS: {
    readonly none: {
        readonly shadowColor: "transparent";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 0;
        };
        readonly shadowOpacity: 0;
        readonly shadowRadius: 0;
        readonly elevation: 0;
    };
    readonly card: {
        readonly shadowColor: "#0F172A";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 2;
        };
        readonly shadowOpacity: 0.04;
        readonly shadowRadius: 10;
        readonly elevation: 1;
    };
    readonly modal: {
        readonly shadowColor: "#0F172A";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.08;
        readonly shadowRadius: 20;
        readonly elevation: 8;
    };
};
export declare const TYPOGRAPHY: {
    readonly fonts: {
        readonly primary: "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif";
    };
    readonly sizes: {
        readonly heading: 32;
        readonly section: 22;
        readonly cardTitle: 16;
        readonly body: 14;
        readonly smallLabel: 13;
        readonly caption: 12;
    };
    readonly weights: {
        readonly regular: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
    };
};

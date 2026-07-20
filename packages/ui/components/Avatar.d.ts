import React from 'react';
type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarVariant = 'circle' | 'square';
interface AvatarProps {
    imageUri?: string | null;
    name: string;
    size?: AvatarSize;
    variant?: AvatarVariant;
    useDeterministicColors?: boolean;
}
export declare function getAvatarColors(name: string): {
    readonly bg: "#0B1953";
    readonly text: "#FFFFFF";
} | {
    readonly bg: "#2563EB";
    readonly text: "#FFFFFF";
} | {
    readonly bg: "#60A5FA";
    readonly text: "#FFFFFF";
} | {
    readonly bg: "#ECFDF5";
    readonly text: "#10B981";
} | {
    readonly bg: "#FEF3C7";
    readonly text: "#F59E0B";
} | {
    readonly bg: "#ECFEFF";
    readonly text: "#06B6D4";
} | {
    bg: "#F1F5F9";
    text: "#0F172A";
};
export declare function Avatar({ imageUri, name, size, variant, useDeterministicColors, }: AvatarProps): React.JSX.Element;
export {};

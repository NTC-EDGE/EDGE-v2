import React from 'react';
export declare const getStatusColors: (status: string) => {
    bg: "#ECFDF5";
    border: "#A7F3D0";
    text: "#10B981";
} | {
    bg: "#FEF3C7";
    border: "#FDE68A";
    text: "#F59E0B";
} | {
    bg: "#FEF2F2";
    border: "#FCA5A5";
    text: "#EF4444";
} | {
    bg: "#F1F5F9";
    border: "#E2E8F0";
    text: "#475569";
};
interface StatusBadgeProps {
    status: string;
}
export declare function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element;
export {};

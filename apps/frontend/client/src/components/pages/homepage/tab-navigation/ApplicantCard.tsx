// ApplicantCard.tsx
import React, { memo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { MotiPressable } from "moti/interactions";
import {
    MoreVertical,
    FilePenLine,
    Pencil,
    Trash2,
    CheckCircle2,
    AlertCircle
} from "lucide-react-native";
import styles from './services/styles';

type ApplicantCardProps = {
    item: any;
    isMenuOpen: boolean;
    onToggleMenu: () => void;
    onReview: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

const TooltipIcon = ({
    children,
    text,
}: {
    children: React.ReactNode;
    text: string;
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Pressable
            onHoverIn={() => setShowTooltip(true)}
            onHoverOut={() => setShowTooltip(false)}
            onLongPress={() => setShowTooltip(true)}
            onPressOut={() => setShowTooltip(false)}
            style={{
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {children}

            <AnimatePresence>
                {showTooltip && (
                    <MotiView
                        from={{ opacity: 0, translateX: 6, scale: 0.96 }}
                        animate={{ opacity: 1, translateX: 0, scale: 1 }}
                        exit={{ opacity: 0, translateX: 6, scale: 0.96 }}
                        transition={{ type: "timing", duration: 120 }}
                        style={{
                            position: "absolute",
                            right: 24,
                            top: -5,
                            backgroundColor: "#111827",
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                            borderRadius: 6,
                            zIndex: 99999,
                            elevation: 99999,
                            minWidth: 120,
                            maxWidth: 160,
                        }}
                        pointerEvents="none"
                    >
                        <Text
                            numberOfLines={2}
                            style={{
                                color: "#FFFFFF",
                                fontSize: 11,
                                fontWeight: "600",
                                textAlign: "center",
                            }}
                        >
                            {text}
                        </Text>
                    </MotiView>
                )}
            </AnimatePresence>
        </Pressable>
    );
};

const ApplicantCardComponent = ({
    item,
    isMenuOpen,
    onToggleMenu,
    onReview,
    onEdit,
    onDelete,
}: ApplicantCardProps) => {
    const basic = item?.service?.basic;

    const companyName = basic?.companyName || "";

    const fullName = `${basic?.firstName || ""} ${basic?.middleName || ""} ${basic?.lastName || ""}`
        .trim()
        .replace(/\s+/g, " ");

    const name = companyName || fullName;

    const reqs = item?.service?.applicationType?.requirements || [];
    const regionValue = item?.region;

    let incompleteRequirements = false;

    reqs?.forEach((r: any) => {
        if (
            r?.required ||
            (r?.additional && r?.additional?.[regionValue]?.required === true)
        ) {
            const validFiles = r?.files?.filter(
                (c: any) => c.links?.small || c.uri || c.assets?.[0]?.uri
            );

            if (!(validFiles?.length > 0)) {
                incompleteRequirements = true;
                return;
            }

            validFiles?.forEach((f: any) => {
                if (
                    !(
                        Object?.keys(f?.links || {})?.length > 0 ||
                        f?.uri ||
                        f?.assets?.[0]?.uri
                    )
                ) {
                    incompleteRequirements = true;
                    return;
                }
            });
        }
    });

    const requirementText = incompleteRequirements
        ? "Incomplete requirements"
        : "Complete requirements";

    return (
        <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.6, translateX: -30 }}
            transition={{ duration: 220 }}
            style={[
                styles.card,
                {
                    borderLeftWidth: 4,
                    borderLeftColor: "#2863D6",
                    paddingLeft: 12,
                    overflow: "visible",
                },
                isMenuOpen
                    ? { zIndex: 9999, elevation: 9999 }
                    : { zIndex: 1, elevation: 2 },
            ]}
        >
            {/* LEFT */}
            <View style={{ flex: 1, paddingVertical: 4, overflow: "visible" }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 5,
                        justifyContent: "space-between",
                        overflow: "visible",
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: "700",
                                color: "#111827",
                            }}
                            numberOfLines={1}
                        >
                            {name}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginRight: 8,
                            overflow: "visible",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: incompleteRequirements ? "#F59E0B" : "#6B7280",
                            }}
                        >
                            {incompleteRequirements ? "1/2" : "2/2"}
                        </Text>

                        <TooltipIcon text={requirementText}>
                            {incompleteRequirements ? (
                                <AlertCircle size={18} color="#F59E0B" />
                            ) : (
                                <CheckCircle2 size={18} color="#10B981" />
                            )}
                        </TooltipIcon>
                    </View>
                </View>

                <Text
                    style={{ fontSize: 12, color: "#6B7280" }}
                    numberOfLines={1}
                >
                    {item?.service?.examineeType?.examineeType
                        ? item?.service?.examineeType?.examineeType
                        : ""}{" "}
                    •{" "}
                    {item?.service?.applicationType?.label
                        ? `${item?.service?.applicationType?.label}-${item?.service?.applicationType?.element}`
                        : ""}
                </Text>
            </View>

            {/* STATUS & ACTIONS */}
            <View
                style={[
                    styles.cardActions,
                    {
                        flex: 0,
                        paddingLeft: 8,
                        overflow: "visible",
                        zIndex: 9999,
                        elevation: 9999,
                    },
                ]}
            >
                {/* KEBAB BUTTON */}
                <TooltipIcon text="More actions">
                    <MotiPressable
                        onPress={onToggleMenu}
                        animate={({ hovered, pressed }) => {
                            "worklet";
                            return {
                                scale: pressed ? 0.85 : hovered ? 1.05 : 1,
                                opacity: pressed ? 0.8 : 1,
                            };
                        }}
                        transition={{ type: "spring", damping: 14 }}
                    >
                        <MoreVertical size={18} strokeWidth={2} />
                    </MotiPressable>
                </TooltipIcon>

                {/* DROPDOWN MENU */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <MotiView
                            from={{ opacity: 0, scale: 0.9, translateY: -4 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, translateY: -4 }}
                            transition={{ type: "timing", duration: 180 }}
                            style={styles.actionMenu}
                        >
                            <Pressable style={styles.actionMenuItem} onPress={onReview}>
                                <FilePenLine size={16} strokeWidth={2} />
                                <Text style={styles.actionMenuText}>Review</Text>
                            </Pressable>

                            <Pressable style={styles.actionMenuItem} onPress={onEdit}>
                                <Pencil size={16} strokeWidth={2} />
                                <Text style={styles.actionMenuText}>Edit</Text>
                            </Pressable>

                            <Pressable style={styles.actionMenuItem} onPress={onDelete}>
                                <Trash2 size={16} strokeWidth={2} color="red" />
                                <Text style={[styles.actionMenuText, { color: "red" }]}>
                                    Delete
                                </Text>
                            </Pressable>
                        </MotiView>
                    )}
                </AnimatePresence>
            </View>
        </MotiView>
    );
};

export const ApplicantCard = memo(
    ApplicantCardComponent,
    (prev, next) =>
        prev.isMenuOpen === next.isMenuOpen &&
        prev.item === next.item
);
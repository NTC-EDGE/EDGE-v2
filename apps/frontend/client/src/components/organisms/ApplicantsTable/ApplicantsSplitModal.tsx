import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    Platform,
    useWindowDimensions,
} from "react-native";
import ApplicantsTable, { ApplicantRow } from "./ApplicantsTable";
import { LinearGradient } from "expo-linear-gradient";
import { RootStateOrAny, useSelector } from "react-redux";

type Props = {
    visible: boolean;
    onClose: () => void;

    applicants: ApplicantRow[];
    getApplicantDetails?: (row: ApplicantRow) => any;
    renderDetails?: (row: ApplicantRow) => React.ReactNode;
    focusedId?: string;
};

export default function ApplicantsSplitModal({
    visible,
    onClose,
    applicants,
    focusedId,
    renderDetails,
    getApplicantDetails,
}: Props) {
    const { width } = useWindowDimensions();
    const isWide = Platform.OS === "web" || width >= 900;
    const bulkFeedVisible = useSelector((state: RootStateOrAny) => state?.activity?.bulkFeedVisible ?? true);
    const initialSelected = useMemo(() => {
        if (focusedId) return focusedId;
        return applicants?.[0]?.id;
    }, [focusedId, applicants]);

    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelected);

    useEffect(() => {
        if (visible) setSelectedId(initialSelected);
    }, [visible, initialSelected]);

    const selectedRow = useMemo(
        () => applicants.find((a) => a.id === selectedId),
        [applicants, selectedId]
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={[styles.shell, styles.shellNarrow]}>
                    {/* Header */}
                    <LinearGradient
                        colors={["#1976D2", "#2B2C98", "#2A136B"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.header}
                    >
                        <Text style={styles.headerTitle}>Applicants</Text>
                        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                            <Text style={styles.closeTxt}>✕</Text>
                        </Pressable>
                    </LinearGradient>
                    {/* Body */}
                    <View style={[styles.body, isWide ? styles.bodyWide : styles.bodyNarrow]}>

                        <View style={[styles.rightPane, isWide ? styles.rightWide : styles.rightNarrow]}>
                            {!selectedRow ? (
                                <Text style={styles.empty}>Select an applicant</Text>
                            ) : (
                                <>
                                    {renderDetails ? (
                                        renderDetails(selectedRow)
                                    ) : (
                                        <DefaultDetails
                                            row={selectedRow}
                                            details={getApplicantDetails?.(selectedRow)}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/** simple fallback details */
function DefaultDetails({ row, details }: { row: ApplicantRow; details?: any }) {
    return (
        <View style={{ marginTop: 10 }}>
            <Text style={styles.kv}><Text style={styles.k}>ID: </Text>{row.Id}</Text>
            <Text style={styles.kv}><Text style={styles.k}>License: </Text>{row.Id.replace(/-/g, "").slice(-10)}</Text>

            {!!details && (
                <View style={{ marginTop: 12 }}>
                    <Text style={styles.section}>Details</Text>
                    <Text style={styles.mono}>{JSON.stringify(details, null, 2)}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        padding: 16,
    },
    shell: {
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        maxHeight: "92%",
    },
    shellWide: { width: "92%", alignSelf: "center" },
    shellNarrow: { width: "100%" },

    header: {
        height: 54,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
    closeBtn: { padding: 6, borderRadius: 10 },
    closeTxt: { fontSize: 18, color: "#FFFFFF" },

    body: { flex: 1 },
    bodyWide: { flexDirection: "row" },
    bodyNarrow: { flexDirection: "column" },

    leftPane: { borderRightWidth: 1, borderRightColor: "#E5E7EB" },
    leftWide: { width: 600 },
    leftNarrow: { width: "100%", borderRightWidth: 0 },

    rightPane: { flex: 1, backgroundColor: "#FBFBFD" },
    rightWide: { minWidth: 420, minHeight: "100%" },
    rightNarrow: { borderTopWidth: 1, borderTopColor: "#E5E7EB" },

    detailTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
    empty: { color: "#6B7280" },

    section: { marginTop: 10, fontWeight: "700", color: "#111827" },
    kv: { marginTop: 6, color: "#374151" },
    k: { fontWeight: "700", color: "#111827" },
    mono: { fontFamily: Platform.OS === "web" ? ("monospace" as any) : undefined, color: "#374151" },
});

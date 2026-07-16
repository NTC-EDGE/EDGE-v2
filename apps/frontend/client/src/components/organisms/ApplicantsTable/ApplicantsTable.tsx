import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Circle, ExternalLink } from "lucide-react-native";
import styles from "./ApplicantsTable.styles";

export type ApplicantRow = {
    id?: string;
    _id?: string;
    name?: string;
    status?: string;
    statusText?: string;
    link?: string;
    [key: string]: any;
};

type Props = {
    title?: string;
    data?: ApplicantRow[];

    getLicenseNumber?: (row: ApplicantRow) => string;
    onViewDetails?: (row: ApplicantRow) => void;
    onSelectionChange?: (selectedIds: string[]) => void;

    focusedId?: string;

    page?: number;
    pageCount?: number;
    totalCount?: number;
    onPageChange?: (nextPage: number) => void;
};

const PAGE_SIZE = 10;
const ROW_HEIGHT = 56;

const getStatusStyle = (status?: string) => {
    const s = (status ?? "Pending").toLowerCase();

    switch (s) {
        case "approved":
            return {
                bg: "#DCFCE7",
                text: "#166534",
                border: "#22C55E",
            };

        case "declined":
        case "rejected":
            return {
                bg: "#FEE2E2",
                text: "#991B1B",
                border: "#EF4444",
            };

        case "for approval":
            return {
                bg: "#FEF3C7",
                text: "#92400E",
                border: "#F59E0B",
            };

        case "for evaluation":
        case "endorsed":
            return {
                bg: "#E0E7FF",
                text: "#3730A3",
                border: "#6366F1",
            };

        case "pending":
        default:
            return {
                bg: "#F3F4F6",
                text: "#374151",
                border: "#D1D5DB",
            };
    }
};

const getRowId = (item: ApplicantRow, index?: number) => {
    return String(
        item?.id ??
        item?._id ??
        item?.applicationId ??
        item?.referenceNo ??
        item?.link ??
        index ??
        ""
    );
};

export function ApplicantsTable({
    data = [],
    title = "APPLICANTS",
    getLicenseNumber,
    onViewDetails,
    onSelectionChange,
    focusedId,
    page = 1,
    pageCount,
    totalCount,
    onPageChange,
}: Props) {
    const listRef = useRef<FlatList<ApplicantRow>>(null);
    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const safeData = Array.isArray(data) ? data : [];
    const safeTotal = totalCount ?? safeData.length;

    const computedPageCount =
        pageCount ?? Math.max(1, Math.ceil(safeTotal / PAGE_SIZE));

    const safePage = Math.min(Math.max(page ?? 1, 1), computedPageCount);

    const selectedIds = useMemo(() => {
        return Object.keys(selected).filter((id) => selected[id]);
    }, [selected]);

    const toggle = useCallback(
        (id: string) => {
            if (!id) return;

            setSelected((prev) => {
                const next = { ...prev };

                if (next[id]) {
                    delete next[id];
                } else {
                    next[id] = true;
                }

                const nextSelectedIds = Object.keys(next).filter((key) => next[key]);
                onSelectionChange?.(nextSelectedIds);

                return next;
            });
        },
        [onSelectionChange]
    );

    const focusedIndex = useMemo(() => {
        if (!focusedId) return -1;

        return safeData.findIndex((x, index) => {
            const id = getRowId(x, index);
            return id === focusedId || x?._id === focusedId;
        });
    }, [focusedId, safeData]);

    useEffect(() => {
        if (focusedIndex < 0) return;

        requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({
                index: focusedIndex,
                animated: true,
                viewPosition: 0.35,
            });
        });
    }, [focusedIndex]);

    const onScrollToIndexFailed = useCallback(() => {
        if (focusedIndex < 0) return;

        setTimeout(() => {
            listRef.current?.scrollToIndex({
                index: focusedIndex,
                animated: true,
                viewPosition: 0.35,
            });
        }, 80);
    }, [focusedIndex]);

    const handleView = useCallback(
        (row: ApplicantRow) => {
            onViewDetails?.(row);
        },
        [onViewDetails]
    );

    const Footer = useMemo(() => {
        if (safeTotal <= 0) return null;

        const canPrev = safePage > 1;
        const canNext = safePage < computedPageCount;

        const go = (p: number) => {
            if (!onPageChange) return;
            if (p < 1 || p > computedPageCount) return;

            onPageChange(p);
        };

        return (
            <View style={styles.footer}>
                <View style={styles.pager}>
                    <Pressable
                        onPress={() => go(safePage - 1)}
                        disabled={!canPrev}
                        style={[styles.pill, !canPrev && styles.pillDisabled]}
                    >
                        <Text style={styles.pillText}>Previous</Text>
                    </Pressable>

                    {Array.from({ length: computedPageCount })
                        .slice(0, 7)
                        .map((_, i) => {
                            const p = i + 1;
                            const active = p === safePage;

                            return (
                                <Pressable
                                    key={p}
                                    onPress={() => go(p)}
                                    disabled={!onPageChange}
                                    style={[styles.pageBtn, active && styles.pageBtnActive]}
                                >
                                    <Text
                                        style={[
                                            styles.pageText,
                                            active && styles.pageTextActive,
                                        ]}
                                    >
                                        {p}
                                    </Text>
                                </Pressable>
                            );
                        })}

                    <Pressable
                        onPress={() => go(safePage + 1)}
                        disabled={!canNext}
                        style={[styles.pill, !canNext && styles.pillDisabled]}
                    >
                        <Text style={styles.pillText}>Next</Text>
                    </Pressable>
                </View>

                <View style={styles.selectedBox}>
                    <Text style={styles.selectedBoxText}>
                        {selectedIds.length} over {safeTotal} applications selected
                    </Text>
                </View>
            </View>
        );
    }, [
        safePage,
        computedPageCount,
        onPageChange,
        selectedIds.length,
        safeTotal,
    ]);

    const renderItem = useCallback(
        ({ item, index }: { item: ApplicantRow; index: number }) => {
            const rowId = getRowId(item, index);
            const status = item?.statusText ?? item?.status ?? "Pending";
            const badge = getStatusStyle(status);
            const isChecked = !!selected[rowId];
            const isFocused = focusedId === rowId || focusedId === item?._id;

            const name =
                item?.name ||
                item?.fullName ||
                item?.applicantName ||
                item?.service?.name ||
                `Applicant ${index + 1}`;

            return (
                <View style={[styles.row, isFocused && styles.rowFocused]}>
                    <Pressable
                        hitSlop={10}
                        onPress={() => toggle(rowId)}
                        style={styles.checkCell}
                    >
                        {isChecked ? (
                            <CheckCircle size={22} color="#4C3FFF" />
                        ) : (
                            <Circle size={22} color="#9CA3AF" />
                        )}
                    </Pressable>

                    <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>
                        {name}
                    </Text>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: badge.bg,
                                borderColor: badge.border,
                            },
                        ]}
                    >
                        <Text style={[styles.statusText, { color: badge.text }]}>
                            {status}
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => handleView(item)}
                        style={styles.viewCell}
                        disabled={!onViewDetails}
                    >
                        <Text
                            style={[
                                styles.viewText,
                                !onViewDetails && { opacity: 0.35 },
                            ]}
                        >
                            View Details
                        </Text>

                        <ExternalLink
                            size={16}
                            color="#1F2A5A"
                            style={{
                                marginLeft: 6,
                                opacity: !onViewDetails ? 0.35 : 1,
                            }}
                        />
                    </Pressable>
                </View>
            );
        },
        [selected, focusedId, toggle, handleView, onViewDetails]
    );

    return (
        <View style={styles.container}>
            {!!title && <Text style={styles.sectionTitle}>{title}</Text>}

            <View style={styles.card}>
                <LinearGradient
                    colors={["#1976D2", "#2B2C98", "#2A136B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <Text style={[styles.headerText, styles.hName]}>Name</Text>
                    <Text style={[styles.headerText, styles.hLicense]}>Status</Text>
                    <Text style={[styles.headerText, styles.hPreview]}>
                        Preview Application
                    </Text>
                </LinearGradient>

                <FlatList
                    ref={listRef}
                    data={safeData}
                    keyExtractor={(item, index) => getRowId(item, index)}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.sep} />}
                    contentContainerStyle={{ paddingBottom: 6 }}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    ListFooterComponent={Footer}
                    ListEmptyComponent={() => (
                        <View style={{ padding: 16 }}>
                            <Text style={{ color: "#6B7280" }}>
                                No applicants found.
                            </Text>
                        </View>
                    )}
                    getItemLayout={(_, index) => ({
                        length: ROW_HEIGHT,
                        offset: ROW_HEIGHT * index,
                        index,
                    })}
                    scrollEnabled={false}
                />
            </View>
        </View>
    );
}

export default ApplicantsTable;
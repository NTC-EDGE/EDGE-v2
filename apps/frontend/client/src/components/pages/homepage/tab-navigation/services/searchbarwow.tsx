import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Pressable, Platform, StyleSheet } from 'react-native';
import { MotiView, useAnimationState, AnimatePresence } from 'moti';
import Text from '@atoms/text';
import { text } from '@styles/color';
import Input from "@atoms/input";

type Props = {
    value: string;
    onChangeText: (t: string) => void;
    onClear: () => void;
    onRefresh: () => void;
    fetching?: boolean;
    totalCount?: number;     // sortedList?.length
    filteredCount?: number;  // filteredList?.length
    placeholder?: string;
    showMeta?: boolean;      // show counts + "filtering by"
    tagFilter?: 'single' | 'bulk' | null;
    onTagChange?: (tag: 'single' | 'bulk' | null) => void;
    layoutMode?: 'std' | 'cozy' | 'compact';
    onLayoutModeChange?: (mode: 'std' | 'cozy' | 'compact') => void;
};

const TAG_CHIPS: { key: 'all' | 'single' | 'bulk'; label: string; dotColor?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'single', label: 'Single', dotColor: '#0EA5E9' },
    { key: 'bulk', label: 'Bulk', dotColor: '#F59E0B' },
];

const FilterChip = ({ chip, active, onPress }: any) => {
    return (
        <Pressable onPress={onPress}>
            <View
                style={[
                    styles.chip,
                    active && chip.key === 'all' ? styles.chipActiveAll : (active ? styles.chipActiveBorder : styles.chipInactive)
                ]}
            >
                {chip.dotColor && (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: chip.dotColor, marginRight: 6 }} />
                )}
                <Text
                    size={12}
                    color={active ? '#1E293B' : '#64748B'}
                    style={{ fontWeight: active ? '700' : '600' }}
                >
                    {chip.label}
                </Text>
            </View>
        </Pressable>
    );
};

const SearchBarWow: React.FC<Props> = ({
    value,
    onChangeText,
    onClear,
    onRefresh,
    fetching = false,
    totalCount = 0,
    filteredCount = 0,
    placeholder = 'Type to filter…',
    showMeta = true,
    tagFilter = 'all',
    onTagChange,
    layoutMode = 'cozy',
    onLayoutModeChange,
}) => {
    const [focused, setFocused] = useState(false);

    // animated “ring” state
    const ring = useAnimationState({
        idle: { borderColor: '#E5E7EB', shadowOpacity: 0, scale: 1 },
        focus: { borderColor: '#60A5FA', shadowOpacity: 0.25, scale: 1.01 },
    });

    useEffect(() => {
        ring.transitionTo(focused ? 'focus' : 'idle');
    }, [focused]);

    // shimmer pulse when fetching
    const shimmer = useAnimationState({
        stop: { opacity: 0 },
        go: { opacity: [0, 1, 0] },
    });

    useEffect(() => {
        if (fetching) shimmer.transitionTo('go');
        else shimmer.transitionTo('stop');
    }, [fetching]);

    const showBar = useMemo(() => (!fetching) || !!value, [fetching, value]);

    return (
        <View
            focusable={false}
            style={{ backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#E5E7EB" }}
        >

            <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 }}>
                {true ? (
                    <MotiView
                        state={ring}
                        transition={{ type: 'timing', duration: 180 }}
                        style={[
                            styles.shell,
                            Platform.select({
                                ios: { shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24 },
                                android: { elevation: focused ? 3 : 0 },
                            }) as any,
                        ]}
                    >
                        <View style={styles.row}>
                            <Text size={12} color={text.disabled}>🔎</Text>
                            <Input
                                value={value}
                                onChangeText={onChangeText}
                                placeholder={placeholder}
                                placeholderTextColor={text.disabled}
                                style={{ flex: 1, marginLeft: 8, paddingVertical: 0 }}
                                returnKeyType="search"
                                blurOnSubmit={false}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                            />
                            {!!value && (
                                <MotiView
                                    from={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: 'timing', duration: 120 }}
                                >
                                    <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                                        <Text size={12} color={text.primary}>Clear</Text>
                                    </TouchableOpacity>
                                </MotiView>
                            )}
                        </View>
                    </MotiView>
                ) : null}

                {/* Meta + refresh row */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: showBar ? 'space-between' : 'center',
                        alignItems: 'center',
                        marginTop: 12,
                        flexWrap: 'wrap',
                        gap: 8,
                    }}
                >
                    {showBar && showMeta ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text size={10} color="#1E293B" style={{ fontWeight: '700' }}>
                                {value ? `${filteredCount ?? 0} item(s) found` : `${totalCount ?? 0} item(s) found`}
                            </Text>
                            <Text size={9} color="#94A3B8" style={{ marginLeft: 6 }}>
                                • showing {filteredCount || totalCount}
                            </Text>
                        </View>
                    ) : <View />}

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={onRefresh} activeOpacity={0.8}>
                            <View style={styles.refreshPill}>
                                <Text size={9} color="#334155" style={{ fontWeight: '600' }}>
                                    Refresh
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.layoutToggleContainer}>
                            <TouchableOpacity
                                style={[styles.layoutToggleButton, layoutMode === 'std' && styles.layoutToggleButtonActive]}
                                onPress={() => onLayoutModeChange?.('std')}
                            >
                                <Text size={9} color={layoutMode === 'std' ? '#1E293B' : '#64748B'} style={layoutMode === 'std' ? { fontWeight: '700' } : undefined}>Std</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.layoutToggleButton, layoutMode === 'cozy' && styles.layoutToggleButtonActive]}
                                onPress={() => onLayoutModeChange?.('cozy')}
                            >
                                <Text size={9} color={layoutMode === 'cozy' ? '#1E293B' : '#64748B'} style={layoutMode === 'cozy' ? { fontWeight: '700' } : undefined}>Cozy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.layoutToggleButton, layoutMode === 'compact' && styles.layoutToggleButtonActive]}
                                onPress={() => onLayoutModeChange?.('compact')}
                            >
                                <Text size={9} color={layoutMode === 'compact' ? '#1E293B' : '#64748B'} style={layoutMode === 'compact' ? { fontWeight: '700' } : undefined}>Compact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ── Tag filter chips ── */}
                {showBar && onTagChange ? (
                    <View style={styles.chipRow}>
                        {TAG_CHIPS.map((chip) => (
                            <FilterChip
                                key={chip.key}
                                chip={chip}
                                active={(tagFilter === chip.key) || (tagFilter === null && chip.key === 'all')}
                                onPress={() => onTagChange(chip.key === 'all' ? null : chip.key as any)}
                            />
                        ))}
                    </View>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shell: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 48,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    floatingLabel: {
        position: 'absolute',
        left: 12,
        top: 6,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 4,
        right: 4,
        height: 2,
        borderRadius: 2,
        backgroundColor: '#60A5FA',
    },
    clearBtn: {
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderRadius: 8,
    },
    refreshPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
        marginRight: 10,
    },
    layoutToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        padding: 2,
    },
    layoutToggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    layoutToggleButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    chipActiveAll: {
        backgroundColor: '#E2E8F0',
    },
    chipActiveBorder: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    chipInactive: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
});

export default SearchBarWow;

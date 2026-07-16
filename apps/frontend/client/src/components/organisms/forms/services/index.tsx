import React, { FC, useCallback, useMemo } from "react";
import { FlatList, View, TouchableOpacity, Platform } from "react-native";
import SectionList from "react-native-tabs-section-list";
import DeviceInfo from "react-native-device-info";
import Text from "@atoms/text";
import DynamicField from "@organisms/forms/fields/dynamic";
import styles from "./styles";
import { text } from "@styles/color";
import { RFValue } from "react-native-responsive-fontsize";
import { Close, Dot, Plus } from "@components/atoms/icon";
import Button from "@components/atoms/button";
import { isMobile } from "@utils/formatting";
import { cloneDeep } from 'lodash';

// -------------------------
// PURE VALIDATION HELPERS
// -------------------------
const isOptionLike = (t: any) => t === "option" || t === "dropdown";

const normalizeRow = (row: any): any[] => {
    if (Array.isArray(row)) return row;
    if (row == null) return [];
    return [row];
};

const normalizeRows = (data: any): any[][] => {
    if (!Array.isArray(data)) return [];
    return data.map(normalizeRow);
};

const validateSpecificationIfAny = (selectedItems: any[]) => {
    for (const item of selectedItems) {
        if (item?.hasSpecification) {
            const spec = item?.specification;
            if (spec?.required && !(!spec?.error && spec?.value)) return false;
        }
    }
    return true;
};

const validateField = (field: any) => {
    if (!field?.required) return true;
    if (field?.type === "time") return true;

    if (isOptionLike(field?.type)) {
        const selectedItems = (field?.items ?? []).filter((i: any) => i?.selected);
        if (selectedItems.length < (field?.minimum ?? 0)) return false;
        if (!validateSpecificationIfAny(selectedItems)) return false;
        return true;
    }

    if (!field?.value) return false;

    // IMPORTANT: only loop arrays
    if (Array.isArray(field?.value)) {
        return field.value.every((d: any) => d?.value && d?.isValid);
    }

    return !!(field?.value && field?.isValid);
};

const validateNode = (node: any): boolean => {
    // node can be:
    // - field object
    // - array of field objects
    // - "set" object { isSet: true, data: [...] }
    // - list-like set where data contains rows
    if (node == null) return true;

    // If it's an array, validate each element
    if (Array.isArray(node)) {
        for (const f of node) {
            if (!validateNode(f)) return false;
        }
        return true;
    }

    // If it's a set, validate its internal data rows
    if (node?.isSet) {
        const setRows = normalizeRows(node?.data);
        const setIsParentList = node?.type === "list";

        if (setIsParentList) {
            // rows => fields
            for (const row of setRows) {
                for (const f of row) {
                    if (f?.isSet) {
                        if (!validateNode(f)) return false;
                    } else {
                        if (!validateField(f)) return false;
                    }
                }
            }
            return true;
        }

        // Non-list set: data might already be flat fields or arrays
        for (const row of setRows) {
            for (const f of row) {
                if (f?.isSet) {
                    if (!validateNode(f)) return false;
                } else {
                    if (!validateField(f)) return false;
                }
            }
        }
        return true;
    }

    // Otherwise: regular field object
    return validateField(node);
};

const ServiceField = React.memo(({
                                     parentId,
                                     item,
                                     index,
                                     type,
                                     setParentId,
                                     setParentIndex,
                                     setIndex,
                                     onChangeValue,
                                 }: any) => {
    return (
        <DynamicField
            parentId={parentId}
            index={index}
            {...item}
            onChangeValue={onChangeValue}
            parentType={type}
            setParentId={setParentId}
            setParentIndex={setParentIndex}
            setIndex={setIndex}
        />
    );
});

const ListSubView = React.memo(({
                                    item,
                                    index,
                                    setParentItem,
                                    parentId,
                                    setParentIndex,
                                    onAdd,
                                    onRemove,
                                    onChangeValue,
                                }: any) => {
    const _renderAddBtn = () => {
        if (
            index + 1 >= setParentItem?.data?.length &&
            (setParentItem?.showIndex == null ||
                setParentItem?.showIndex <= setParentIndex)
        ) {
            return (
                <Button
                    style={styles?.addBtnContainer}
                    onPress={() =>
                        onAdd({
                            parentId,
                            template: setParentItem?.template,
                            setParentId: setParentItem?.id,
                            setParentIndex,
                        })
                    }
                >
                    <Plus color="#fff" />
                </Button>
            );
        }
        return <View />;
    };

    const _renderRemoveBtn = () => {
        if (setParentItem?.data?.length > 1) {
            return (
                <Button
                    style={[
                        styles?.addBtnContainer,
                        styles?.removeBtnContainer,
                    ]}
                    onPress={() =>
                        onRemove({
                            parentId,
                            index,
                            setParentId: setParentItem?.id,
                            setParentIndex,
                        })
                    }
                >
                    <Close color="#fff" />
                </Button>
            );
        }
        return null;
    };

    const _renderFooter = () => {
        return (
            <View
                style={[
                    styles?.footerContainer,
                    styles?.footerContainer2,
                ]}
            >
                {_renderAddBtn()}
                {_renderRemoveBtn()}
            </View>
        );
    };

    const renderServiceField = useCallback(({ item: fieldItem, index: fieldIndex }: any) => {
        return (
            <ServiceField
                parentId={parentId}
                item={fieldItem}
                index={setParentIndex}
                type="list"
                setParentId={setParentItem?.id}
                setIndex={index}
                onChangeValue={onChangeValue}
            />
        );
    }, [parentId, setParentIndex, setParentItem?.id, index, onChangeValue]);

    const keyExtractor = useCallback((_: any, idx: number) => `${idx}`, []);

    const ListHeader = useCallback(() => (
        <View>
            <Text style={styles?.headerText}>
                {setParentItem?.title} (No. {index + 1})
            </Text>
        </View>
    ), [setParentItem?.title, index]);

    return (
        <FlatList
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            style={styles?.setSubView}
            data={item}
            renderItem={renderServiceField}
            keyExtractor={keyExtractor}
            ListFooterComponent={_renderFooter}
            ListHeaderComponent={ListHeader}
        />
    );
});

const SetMainView = React.memo(({
                                    item,
                                    index,
                                    parentId,
                                    setParentIndex,
                                    onAdd,
                                    onRemove,
                                    onChangeValue,
                                }: any) => {
    const setParentItem = item;

    const renderItem = useCallback(({ item: listItem, index: listIndex }: any) => {
        if (setParentItem?.type === "list") {
            return (
                <ListSubView
                    item={listItem}
                    index={listIndex}
                    setParentItem={setParentItem}
                    parentId={parentId}
                    setParentIndex={setParentIndex}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onChangeValue={onChangeValue}
                />
            );
        }

        return (
            <ServiceField
                parentId={parentId}
                item={listItem}
                index={setParentIndex}
                type="list"
                setParentId={setParentItem?.id}
                onChangeValue={onChangeValue}
            />
        );
    }, [setParentItem, parentId, setParentIndex, onAdd, onRemove, onChangeValue]);

    const keyExtractor = useCallback((_: any, idx: number) => `${idx}`, []);

    const ListHeader = useCallback(() => (
        <View>
            <Text style={styles?.headerText}>{setParentItem?.title}</Text>
        </View>
    ), [setParentItem?.title]);

    return (
        <FlatList
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            style={styles?.setMainView}
            data={setParentItem?.data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={setParentItem?.type !== "list" ? ListHeader : undefined}
        />
    );
});

const ServiceSection = React.memo(({
                                       item,
                                       section,
                                       index,
                                       onAdd,
                                       onRemove,
                                       onChangeValue,
                                   }: any) => {
    const parentId = section?.id;
    const setParentIndex = index;

    const renderAddBtn = () => {
        if (index + 1 >= section?.data?.length) {
            return (
                <Button
                    style={styles?.addBtnContainer}
                    onPress={() => {
                        const _section = cloneDeep(section);
                        if (
                            _section?.templateSplice != null &&
                            _section?.templateSpliceIndex != null
                        ) {
                            if (index === _section?.templateSplice) {
                                _section?.template?.splice(section?.templateSpliceIndex, 1);
                            }
                        }
                        onAdd({
                            parentId,
                            template: _section?.template,
                        });
                    }}
                >
                    <Plus color="#fff" />
                </Button>
            );
        }
        return <View />;
    };

    const renderRemoveBtn = () => {
        if (section?.data?.length > 1) {
            return (
                <Button
                    style={[styles?.addBtnContainer, styles?.removeBtnContainer]}
                    onPress={() => onRemove({ parentId, index })}
                >
                    <Close color="#fff" />
                </Button>
            );
        }
        return <View />;
    };

    const renderFooter = () => {
        return (
            <View style={styles?.footerContainer}>
                {renderAddBtn()}
                {renderRemoveBtn()}
            </View>
        );
    };

    const renderListItem = useCallback(({ item: listItem, index: listIndex }: any) => {
        if (listItem?.isSet) {
            return (
                <SetMainView
                    item={listItem}
                    index={listIndex}
                    parentId={parentId}
                    setParentIndex={setParentIndex}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onChangeValue={onChangeValue}
                />
            );
        }

        return (
            <ServiceField
                parentId={parentId}
                item={listItem}
                index={setParentIndex}
                type="list"
                onChangeValue={onChangeValue}
            />
        );
    }, [parentId, setParentIndex, onAdd, onRemove, onChangeValue]);

    const keyExtractor = useCallback((_: any, idx: number) => `${idx}`, []);

    if (section?.type === "info") {
        return (
            <>
                {!!item?.title && <Text style={styles?.infoTitle}>{item?.title}</Text>}
                {!!item?.message && (
                    <Text style={styles?.infoMessage}>{item?.message}</Text>
                )}
            </>
        );
    } else if (section?.type === "list") {
        return (
            <FlatList
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                style={styles?.listFieldContainer}
                data={item}
                renderItem={renderListItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={renderFooter}
            />
        );
    }

    return <ServiceField item={item} parentId={parentId} onChangeValue={onChangeValue} />;
});

interface Props {
    form?: any;
    onChangeValue?: any;
    onAdd?: any;
    onRemove?: any;
    onUseDifferentAddress?: any;
    useDifferentAddress?: any;
}

const ServicesForm: FC<Props> = ({
                                     form = [],
                                     onChangeValue = () => {},
                                     onAdd = () => {},
                                     onRemove = () => {},
                                     onUseDifferentAddress = () => {},
                                     useDifferentAddress,
                                 }) => {
    const onChangeValueCallback = useCallback(onChangeValue, [onChangeValue]);
    const onAddCallback = useCallback(onAdd, [onAdd]);
    const onRemoveCallback = useCallback(onRemove, [onRemove]);
    const onUseDifferentAddressCallback = useCallback(onUseDifferentAddress, [onUseDifferentAddress]);

    const renderSection = useCallback(({ item, section, index }: any) => {
        return (
            <ServiceSection
                item={item}
                section={section}
                index={index}
                onAdd={onAddCallback}
                onRemove={onRemoveCallback}
                onChangeValue={onChangeValueCallback}
            />
        );
    }, [onAddCallback, onRemoveCallback, onChangeValueCallback]);

    const sectionCompletionMap = useMemo(() => {
        const map = new Map();
        form.forEach((section: any) => {
            let isComplete = true;
            const isParentList = section?.type === "list";
            if (isParentList) {
                const rows = normalizeRows(section?.data);
                for (const row of rows) {
                    for (const node of row) {
                        if (!validateNode(node)) {
                            isComplete = false;
                            break;
                        }
                    }
                    if (!isComplete) break;
                }
            } else {
                const fields = Array.isArray(section?.data) ? section?.data : [];
                for (const node of fields) {
                    if (!validateNode(node)) {
                        isComplete = false;
                        break;
                    }
                }
            }
            map.set(section, isComplete);
        });
        return map;
    }, [form]);

    const renderSectionTitle = useCallback(({ section }: any) => {
        return (
            <>
                {!!section?.title && (
                    <View style={styles.sectionHeaderContainer}>
                        <View>
                            <Text style={styles?.headerText}>{section?.title}</Text>
                        </View>
                        {section?.id === "address" && !DeviceInfo?.isTablet() && (
                            <TouchableOpacity onPress={onUseDifferentAddressCallback}>
                                <Text style={styles?.headerTextTouch}>
                                    Use {!!useDifferentAddress ? "same" : "different"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </>
        );
    }, [useDifferentAddress, onUseDifferentAddressCallback]);


    // -------------------------
    // FIXED renderTabMenu
    // -------------------------
    const renderTabMenu = useCallback(
        (section: any) => {
            const { title, alternativeTitle, isActive } = section;
            const isComplete = sectionCompletionMap.get(section) ?? true;

            return (
                <View
                    style={
                        form?.length > 4
                            ? styles?.tabViewContainerMoreThan4
                            : styles?.tabViewContainer4
                    }
                >
                    <View
                        style={[
                            styles?.tabView,
                            isActive && { borderBottomWidth: RFValue(3) },
                        ]}
                    >
                        <Text
                            size={Platform.select({ web: 20 })}
                            color={Platform.select({
                                native: isActive ? text.primary : text.disabled,
                                web: isActive ? text.info : text.disabled,
                            })}
                        >
                            {alternativeTitle || title}
                        </Text>

                        {!isComplete && <Dot size={5} color="red" />}
                    </View>
                </View>
            );
        },
        [form?.length, sectionCompletionMap]
    );

    return (
        <SectionList
            showsVerticalScrollIndicator={!isMobile}
            style={styles.container}
            sections={form}
            keyExtractor={(_, index) => `${index}`}
            stickySectionHeadersEnabled={false}
            tabBarStyle={styles?.tabBar}
            renderTab={(item: any) => renderTabMenu(item)}
            renderSectionHeader={({ section }) => renderSectionTitle({ section })}
            renderItem={renderSection}
            ListFooterComponent={() => <View style={styles.bottomView} />}
        />
    );
};

export default React.memo(ServicesForm);

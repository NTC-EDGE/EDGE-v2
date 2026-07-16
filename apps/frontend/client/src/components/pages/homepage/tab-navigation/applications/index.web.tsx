import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
//import RNFS from 'react-native-fs';
//import FileViewer from 'react-native-file-viewer';
import Moment from 'moment';
import Text from '@atoms/text';
import { Check, Close, Dot, Download, Load, License, Right, Refresh, Down } from '@atoms/icon';
import Button from '@atoms/button';
import NTCAlert from '@atoms/alert';
import DropdownCard from '@organisms/dropdown-card';
import { button, infoColor, text } from '@styles/color';
import styles from './styles';

import {
    fetchApplications,
    setApplicationCart,
    setButtonText,
    setFetchSOAError,
    setFetchSOASuccess, setSaveApplicationError, setSaveApplicationSuccess
} from '@reducers/application/actions';
import { isMobile } from "@utils/formatting";
import {
    setApplicationItem,
    setSelectedService,
    setServiceLayout
} from "@reducers/service/actions";
import { Bold } from "@styles/font";
import NoServices from "@assets/svg/noService";
import _ from "lodash";
import PaymentNavigator from "../../../../../navigations/payment";
import NavBar from "@organisms/navbar";
import { useComponentLayout } from "@hooks/useComponentLayout";
import Ellipsis from "@atoms/ellipsis";
import RefreshIcon from "@assets/svg/refreshIcon";
import { GUEST_USER } from '@utils/ntc';
import PreviewNavigator from "../../../../../navigations/preview";
import ApplicationSteps from "@pages/application-steps";
import HelpModal from "@organisms/help-modal";
import { setPaymentError, setPaymentSuccess } from "@reducers/payment/actions";
import { AnimatePresence, MotiView } from 'moti';
import Input from "@atoms/input";
import SearchBarWow from "@pages/homepage/tab-navigation/services/searchbarwow";
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    navigation: any
    route: any,
    params: any
}

function onDownloadDocument(doc: any) {
    var link = document.createElement('a');
    link.href = doc;
    link.download = 'file.pdf';
    link.dispatchEvent(new MouseEvent('click'));
    link?.remove();
}

const WhimsicalLoader = React.memo(({ mini = false }: { mini?: boolean }) => {
    const textOptions = [
        "Sprinkling some digital magic...",
        "Hunting down your applications...",
        "Crunching numbers with extra enthusiasm...",
        "Waking up the server hamsters..."
    ];
    const [loadingText] = useState(() => textOptions[Math.floor(Math.random() * textOptions.length)]);

    return (
        <View style={{ padding: mini ? 20 : 60, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', marginBottom: mini ? 0 : 20 }}>
                {[0, 1, 2].map((i) => (
                    <MotiView
                        key={i}
                        from={{ translateY: 0, opacity: 0.3, scale: 0.8 }}
                        animate={{ translateY: -10, opacity: 1, scale: 1.2 }}
                        transition={{
                            type: 'timing',
                            duration: 500,
                            loop: true,
                            repeatReverse: true,
                            delay: i * 150,
                        }}
                        style={{
                            width: mini ? 8 : 12,
                            height: mini ? 8 : 12,
                            borderRadius: mini ? 4 : 6,
                            backgroundColor: ['#38BDF8', '#818CF8', '#4F46E5'][i],
                            marginHorizontal: 6,
                        }}
                    />
                ))}
            </View>
            {!mini && (
                <MotiView
                    from={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 800, loop: true, repeatReverse: true }}
                >
                    <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '600' }}>
                        ✨ {loadingText}
                    </Text>
                </MotiView>
            )}
        </View>
    );
});

const ListFooter = React.memo(({
    fetchingApplications,
    list,
    total,
    dispatch,
    rawQuery,
    page,
    stylesMemo,
}: any) => {
    if (fetchingApplications) {
        return (
            <View style={[stylesMemo?.bottomView, stylesMemo?.ellipsisViewWeb]}>
                <WhimsicalLoader mini />
            </View>
        );
    }

    if (list?.length >= total) return null;

    return (
        <View style={{ marginTop: 8, marginBottom: 40 }}>
            <TouchableOpacity
                onPress={() => {
                    if (list?.length < total) dispatch(fetchApplications({ keyword: rawQuery, page: page + 1 }));
                }}
                style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text size={15} color="#2563EB" style={{ fontWeight: '700' }}>
                        Click Here to display more applications
                    </Text>
                    <MotiView
                        from={{ translateY: -4 }}
                        animate={{ translateY: 4 }}
                        transition={{
                            type: 'timing',
                            duration: 600,
                            loop: true,
                            repeatReverse: true,
                        }}
                        style={{ marginLeft: 6 }}
                    >
                        <Down size={20} color="#2563EB" />
                    </MotiView>
                </View>
                <Text size={13} color="#94A3B8" style={{ marginTop: 8 }}>
                    Currently showing {list?.length || 0} of {total || 0}
                </Text>
            </TouchableOpacity>
        </View>
    );
});

const RenderUpdate = React.memo(({
    action = '',
    buttonText = 'Preview',
    status = '',
    onPress = () => { },
    onDownload = () => { },
    inactive = false,
    hasDownloadble = false,
    stylesMemo,
    type = 'default',
    layoutMode = 'cozy',
}: any) => {
    const statusColor = () => {
        if (type === 'approval') return '#F59E0B'; // Orange for FOR EVALUATION
        switch (status) {
            case 'Approved':
                return '#10B981';
            case 'Declined':
                return '#EF4444';
            default:
                return '#F59E0B';
        }
    };

    return (
        <View style={[
            stylesMemo.updateContainer,
            type !== 'approval' && { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
            { paddingVertical: layoutMode === 'cozy' ? 16 : layoutMode === 'compact' ? 8 : 12 }
        ]}>
            <View style={stylesMemo.updateStatusContainer}>
                {type === 'approval' && (
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: statusColor(), marginRight: 8 }} />
                )}
                <Text style={[stylesMemo.updateStatus, { color: type === 'approval' ? statusColor() : '#94A3B8' }]}>
                    {action}
                </Text>
            </View>

            <View style={stylesMemo.buttonMainContainer}>
                {type === 'document' && inactive ? (
                    <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Bold', marginRight: 10 }}>
                        Pending
                    </Text>
                ) : (
                    <Button
                        onPress={onPress}
                        disabled={inactive}
                        style={[
                            stylesMemo.updateButtonContainer,
                            inactive && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1, shadowOpacity: 0, elevation: 0 },
                            !inactive && type === 'approval' && { backgroundColor: '#2563EB', paddingVertical: layoutMode === 'compact' ? 8 : 10, paddingHorizontal: 20, borderRadius: 8 },
                            !inactive && type !== 'approval' && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1, paddingVertical: layoutMode === 'compact' ? 6 : 8, paddingHorizontal: 16 }
                        ]}
                    >
                        <View style={stylesMemo.updateButtonTextContainer}>
                            <Text style={[stylesMemo.updateButtonText, inactive && { color: '#94A3B8' }, !inactive && type !== 'approval' && { color: '#94A3B8' }]}>
                                {buttonText}
                            </Text>
                        </View>
                        <Right size={15} color={inactive || type !== 'approval' ? '#94A3B8' : '#FFFFFF'} />
                    </Button>
                )}

                {/* Download Button (conditionally rendered) */}
                {hasDownloadble && (
                    <TouchableOpacity
                        onPress={onDownload}
                        disabled={inactive}
                        style={[
                            stylesMemo.downloadButtonContainer,
                            {
                                borderWidth: 1,
                                borderColor: inactive ? '#E2E8F0' : '#E2E8F0',
                                padding: 6,
                                borderRadius: 6,
                                backgroundColor: inactive ? '#F8FAFC' : '#FFFFFF',
                                marginLeft: 8
                            },
                        ]}
                    >
                        <Download size={14} color={inactive ? '#94A3B8' : '#64748B'} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

const AnimatedRow = React.memo(({ delay = 0, children }: { delay?: number; children: React.ReactNode }) => (
    <MotiView
        from={{ opacity: 0, translateY: 15, scale: 0.97 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        exit={{ opacity: 0, translateY: -10, scale: 0.97 }}
        transition={{ type: 'spring', damping: 16, stiffness: 140, mass: 0.8, delay }}
        style={{ marginTop: 6 }}
    >
        {children}
    </MotiView>
));

const Item = React.memo(({
    item,
    applicationItem,
    navigation,
    dispatch,
    stylesMemo,
    setDoc,
    onDownloadDocument,
    setShowAlert,
    setAlertData,
    layoutMode = 'cozy',
}: any) => {
    let [isCollapsed, setIsCollapsed] = useState(false);
    let {
        _id, updatedAt, createdAt, service = {}, approvalHistory = {}, paymentHistory = {},
        document, officialReceipt = {}, orderOfPayment = {}, renew, formDocument
    } = item;
    renew = !!renew ? renew : {};
    let { forRenewal } = renew;

    let { label, isDirectProcess } = service?.applicationType || {};
    let numLines = isCollapsed ? { numberOfLines: 1 } : {};
    let OR = officialReceipt?.pdf;
    let SOA = item?.soaReportPdf;
    let OP = orderOfPayment?.pdf;

    let onViewOutput = (filepath: string) => { setDoc(filepath); };
    let onPreview = () => {
        dispatch(setApplicationItem(item));
    };

    let outputLabel = (applicationType: string, serviceCode: string) => {
        applicationType = (`${applicationType} ${service?.name}`)?.toLowerCase();
        if (serviceCode === 'service-22') return 'Receipt';
        else if (applicationType?.match('accreditation')) return 'Accreditation';
        else if (applicationType?.match('admission slip') || serviceCode === 'service-1') return 'Admission Slip';
        else if (applicationType?.match('certificate')) return 'Certificate';
        else if (applicationType?.match('license')) return 'License';
        else if (applicationType?.match('permit')) return 'Permit';
        return '';
    };

    let _document = outputLabel(label, service?.serviceCode);

    let alert = () => {
        setAlertData({ title: `Claim ${_document}`, message: "Please proceed to the selected region's physical branch." });
        setTimeout(() => setShowAlert(true), 100);
    };

    let labelVar = (
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            <View style={{ flexShrink: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text style={stylesMemo.dropdownTitleTxt} {...numLines}>{label}</Text>

                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4, gap: 6 }}>
                    {(() => {
                        const isBulk = Array.isArray(item?.service?.applicants) && item.service.applicants.length > 1;
                        return (
                            <View style={[stylesMemo.tagBadge, isBulk ? stylesMemo.tagBadgeBulk : stylesMemo.tagBadgeSingle, {}]}>
                                <Text style={[stylesMemo.tagText, isBulk ? stylesMemo.tagTextBulk : stylesMemo.tagTextSingle]}>
                                    {isBulk ? 'Bulk' : 'Single'}
                                </Text>

                            </View>
                        );
                    })()}
                    {item.service?.basic?.companyName ? (
                        <Text style={stylesMemo.dropdownCompanyTxt}>{item.service?.basic?.companyName}</Text>
                    ) : (item.service?.basic?.firstName || item.service?.basic?.lastName) ? (
                        <Text style={stylesMemo.dropdownCompanyTxt}>
                            {item.service?.basic?.firstName} {item.service?.basic?.lastName}
                        </Text>
                    ) : null}
                </View>


                <Text style={stylesMemo.dropdownDescriptionTxt}>Submitted {Moment(createdAt).fromNow()}</Text>
            </View>
        </View>
    );

    const d = (i: number) => i * 20;

    return (
        <View style={stylesMemo.cardWrapper}>
            <LinearGradient
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                colors={['#38BDF8', '#818CF8', '#4F46E5']}
                style={stylesMemo.cardTopGradient}
            />
            <AnimatePresence>
                {applicationItem?._id === _id ? (
                    <MotiView
                        from={{ opacity: 0.3, scale: 0.98 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                        style={{ position: 'absolute', inset: 0, backgroundColor: '#3B82F6', borderRadius: 16 }}
                        pointerEvents="none"
                    />
                ) : null}
            </AnimatePresence>

            <DropdownCard
                headerContainer={{ flexWrap: 'wrap' }}
                style={{ backgroundColor: 'transparent', padding: layoutMode === 'cozy' ? 24 : layoutMode === 'compact' ? 12 : 16 }}
                label={labelVar}
                onToggle={(val: boolean) => setIsCollapsed(val)}
            >
                <AnimatePresence>
                    {!isCollapsed ? (
                        <MotiView
                            key="content"
                            from={{ opacity: 0, translateY: -12, scale: 0.98 }}
                            animate={{ opacity: 1, translateY: 0, scale: 1 }}
                            exit={{ opacity: 0, translateY: -12, scale: 0.98 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                        >
                            <AnimatedRow delay={d(0)}>
                                <RenderUpdate
                                    action={approvalHistory?.action || 'for approval'}
                                    buttonText="Preview"
                                    status={approvalHistory?.status}
                                    stylesMemo={stylesMemo}
                                    type="approval"
                                    layoutMode={layoutMode}
                                    onPress={() => {
                                        if (navigation.canGoBack()) {
                                            navigation.popToTop();
                                        }
                                        setTimeout(() => {
                                            dispatch(setPaymentSuccess(false));
                                            dispatch(setPaymentError(false));
                                            dispatch(setButtonText('Preview'));
                                            onPreview();
                                        });
                                    }}
                                />
                            </AnimatedRow>

                            {!isDirectProcess && paymentHistory?.status !== 'Approved' && (
                                <AnimatedRow delay={d(1)}>
                                    <RenderUpdate
                                        action="PAYMENT"
                                        buttonText="Order of Payment"
                                        status={paymentHistory?.status}
                                        stylesMemo={stylesMemo}
                                        type="payment"
                                        layoutMode={layoutMode}
                                        inactive={approvalHistory.status !== 'Approved'}
                                        onPress={() => {
                                            navigation.popToTop();
                                            setTimeout(() => {
                                                dispatch(setPaymentSuccess(false));
                                                dispatch(setPaymentError(false));
                                                dispatch(setButtonText('PaymentSOA'));
                                                onPreview();
                                            });
                                        }}
                                    />
                                </AnimatedRow>
                            )}

                            {!isDirectProcess && paymentHistory?.status === 'Approved' && (
                                <>
                                    <AnimatedRow delay={d(2)}>
                                        <RenderUpdate
                                            action="PAYMENT"
                                            buttonText="Official Receipt"
                                            status="Approved"
                                            stylesMemo={stylesMemo}
                                            type="payment"
                                            layoutMode={layoutMode}
                                            onPress={() => {
                                                if (item?.service?.serviceCode === 'service-21') alert();
                                                else {
                                                    navigation.popToTop();
                                                    setTimeout(() => {
                                                        dispatch(setButtonText('onViewOutput'));
                                                        onViewOutput(OR || '');
                                                    });
                                                }
                                            }}
                                            onDownload={() => {
                                                if (item?.service?.serviceCode === 'service-21') alert();
                                                else { onDownloadDocument(OR); }
                                            }}
                                            inactive={isDirectProcess
                                                ? approvalHistory.status !== 'Approved'
                                                : item?.service?.serviceCode === 'service-21'
                                                    ? paymentHistory?.status !== 'Approved'
                                                    : (paymentHistory?.status !== 'Approved' || !OR)}
                                            hasDownloadble={true}
                                        />

                                        <RenderUpdate
                                            action="PAYMENT"
                                            buttonText="SOA"
                                            status="Approved"
                                            stylesMemo={stylesMemo}
                                            type="payment"
                                            layoutMode={layoutMode}
                                            onPress={() => {
                                                if (item?.service?.serviceCode === 'service-21') alert();
                                                else {
                                                    navigation.popToTop();
                                                    setTimeout(() => {
                                                        dispatch(setButtonText('onViewOutput'));
                                                        onViewOutput(SOA || '');
                                                    });
                                                }
                                            }}
                                            onDownload={() => {
                                                if (item?.service?.serviceCode === 'service-21') alert();
                                                else { onDownloadDocument(SOA); }
                                            }}
                                            inactive={isDirectProcess
                                                ? approvalHistory.status !== 'Approved'
                                                : item?.service?.serviceCode === 'service-21'
                                                    ? paymentHistory?.status !== 'Approved'
                                                    : (paymentHistory?.status !== 'Approved' || !OR)}
                                            hasDownloadble={true}
                                        />
                                    </AnimatedRow>

                                    <AnimatedRow delay={d(3)}>
                                        <RenderUpdate
                                            action="PAYMENT"
                                            buttonText="Order of Payment"
                                            status="Approved"
                                            stylesMemo={stylesMemo}
                                            type="payment"
                                            layoutMode={layoutMode}
                                            onPress={() => {
                                                if (item?.service?.serviceCode === 'service-21') alert();
                                                else {
                                                    navigation.popToTop();
                                                    setTimeout(() => {
                                                        dispatch(setButtonText('onViewOutput'));
                                                        onViewOutput(OP || '');
                                                    });
                                                }
                                            }}
                                            onDownload={() => {
                                                if (item?.service?.serviceCode === 'service-21') alert();
                                                else { onDownloadDocument(OP); }
                                            }}
                                            inactive={isDirectProcess
                                                ? approvalHistory.status !== 'Approved'
                                                : item?.service?.serviceCode === 'service-21'
                                                    ? paymentHistory?.status !== 'Approved'
                                                    : (paymentHistory?.status !== 'Approved' || !OR)}
                                            hasDownloadble={true}
                                        />
                                    </AnimatedRow>

                                    {formDocument && (
                                        <AnimatedRow delay={d(4)}>
                                            <RenderUpdate
                                                action="FORM DOCUMENT"
                                                buttonText="Preview"
                                                status="Approved"
                                                stylesMemo={stylesMemo}
                                                type="document"
                                                layoutMode={layoutMode}
                                                onPress={() => {
                                                    if (item?.service?.serviceCode === 'service-21') alert();
                                                    else {
                                                        navigation.popToTop();
                                                        setTimeout(() => {
                                                            dispatch(setButtonText('onViewOutput'));
                                                            onViewOutput(formDocument || '');
                                                        });
                                                    }
                                                }}
                                                onDownload={() => {
                                                    if (item?.service?.serviceCode === 'service-21') alert();
                                                    else { onDownloadDocument(formDocument); }
                                                }}
                                                inactive={isDirectProcess
                                                    ? approvalHistory.status !== 'Approved'
                                                    : item?.service?.serviceCode === 'service-21'
                                                        ? paymentHistory?.status !== 'Approved'
                                                        : (paymentHistory?.status !== 'Approved' || !formDocument)}
                                                hasDownloadble={true}
                                            />
                                        </AnimatedRow>
                                    )}
                                </>
                            )}

                            <AnimatedRow delay={d(5)}>
                                <RenderUpdate
                                    action={_document}
                                    buttonText="Preview"
                                    status="Approved"
                                    stylesMemo={stylesMemo}
                                    type="document"
                                    layoutMode={layoutMode}
                                    inactive={isDirectProcess
                                        ? approvalHistory.status !== 'Approved'
                                        : item?.service?.serviceCode === 'service-21'
                                            ? paymentHistory?.status !== 'Approved'
                                            : (paymentHistory?.status !== 'Approved' || !document)}
                                    hasDownloadble={true}
                                    onPress={() => {
                                        if (item?.service?.serviceCode === 'service-21') alert();
                                        else {
                                            navigation.popToTop();
                                            setTimeout(() => {
                                                dispatch(setButtonText('onViewOutput'));
                                                onViewOutput(document || '');
                                            });
                                        }
                                    }}
                                    onDownload={() => {
                                        if (item?.service?.serviceCode === 'service-21') alert();
                                        else { onDownloadDocument(document); }
                                    }}
                                />
                            </AnimatedRow>

                            {forRenewal && (
                                <AnimatedRow delay={d(6)}>
                                    <RenderUpdate
                                        action="EXPIRING SOON"
                                        buttonText="Renew"
                                        status="Expiring"
                                        stylesMemo={stylesMemo}
                                        type="approval"
                                        layoutMode={layoutMode}
                                        onPress={() =>
                                            setTimeout(() => {
                                                dispatch(setSelectedService({}));
                                                dispatch(setApplicationCart({}));
                                                dispatch(setFetchSOASuccess(false));
                                                dispatch(setFetchSOAError(false));
                                                dispatch(setSaveApplicationError(false));
                                                dispatch(setSaveApplicationSuccess(false));
                                                onPreview();
                                                dispatch(setButtonText('Renew'));
                                            }, 100)}
                                    />
                                </AnimatedRow>
                            )}
                        </MotiView>
                    ) : null}
                </AnimatePresence>
            </DropdownCard>
        </View>
    );
});

const Applications: FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch();
    const email = useSelector(state => state?.user?.session?.email);
    const buttonText = useSelector(state => state?.application?.buttonText);
    const [showAlert, setShowAlert] = useState(false);
    const [alertData, setAlertData] = useState({});
    const [showHelp, setShowHelp] = useState(false);
    const [layoutMode, setLayoutMode] = useState<'std' | 'cozy' | 'compact'>('cozy');
    const stylesMemo = useMemo(() => {
        return styles;
    }, [])


    const [doc, setDoc] = useState<String>();

    React.useEffect(() => {
        if (email !== GUEST_USER?.email) {
            navigation.setOptions({
                tabBarLabel: ({ color }: any) => (
                    <View style={stylesMemo.drawerItem}>
                        <License style={stylesMemo.tabIcon} color={color} size={20} />
                        <Text style={[stylesMemo.tabText, { color }]}>My Applications</Text>
                        {false && <Dot style={stylesMemo.dot} size={5} color='red' />}
                    </View>
                )
            });
        }
    }, []);
    const applicationItem = useSelector(state => state?.service?.applicationItem);
    const { paymentRoute } = useSelector(state => state?.payment);
    const stateApplication = useSelector(state => state?.application);
    const { list, page = 1, total = 0, fetchingApplications, paymentSuccess } = stateApplication;

    const onRefresh = () => {
        dispatch(fetchApplications());
    };
    useEffect(() => {
        dispatch(fetchApplications());
    }, []);
    useEffect(() => {
        if (paymentSuccess) onRefresh();
    }, [paymentSuccess]);

    const [onChangeLayout, setOnChangeLayout] = useState(false);
    const onLayout = useCallback(event => {
        const layout = event.nativeEvent.layout;
        if (layout?.width) {
            if (layout?.width <= layout?.height) setOnChangeLayout(false);
            else setOnChangeLayout(true);
        }
    }, []);

    const renderItem = React.useCallback(({ item }: any) => (
        <Item
            item={item}
            applicationItem={applicationItem}
            navigation={navigation}
            dispatch={dispatch}
            stylesMemo={stylesMemo}
            setDoc={setDoc}
            onDownloadDocument={onDownloadDocument}
            setShowAlert={setShowAlert}
            setAlertData={setAlertData}
            layoutMode={layoutMode}
        />
    ), [applicationItem, navigation, dispatch, stylesMemo, setDoc, setShowAlert, setAlertData, layoutMode]);

    const renderItemSeparator = React.useCallback(() => <View style={stylesMemo.separator} />, [stylesMemo.separator]);
    const dimensions = useWindowDimensions();
    const [sizeComponent, onLayoutComponent] = useComponentLayout();
    useEffect(() => {
        if (!(sizeComponent?.width && sizeComponent?.height)) return
        dispatch(setServiceLayout(sizeComponent));
    }, [sizeComponent]);
    const sortedList = useMemo(() => {
        return list ? [...list].sort((a, b) => {
            // if createdAt is ISO string, this works; or wrap in moment()
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }) : [];
    }, [list]);


    const [rawQuery, setRawQuery] = useState('');
    const [query, setQuery] = useState('');
    const [tagFilter, setTagFilter] = useState<'single' | 'bulk' | null>(null);
    const typingRef = useRef<NodeJS.Timeout | null>(null);

    const onChangeSearch = useCallback((t: string) => {
        setRawQuery(t);
        if (typingRef.current) clearTimeout(typingRef.current);
        typingRef.current = setTimeout(() => {
            dispatch(fetchApplications({ keyword: t?.trim()?.toLowerCase() }));
        }, 250);
    }, []);


    const filteredList = useMemo(() => {
        let result = sortedList;
        if (query) {
            // Note: If you want text searching, it currently falls back to sortedList since query isn't fully implemented here,
            // but we maintain the tag filtering below.
        }
        if (tagFilter === 'single') {
            result = result.filter(item => !(Array.isArray(item?.service?.applicants) && item.service.applicants.length > 1));
        } else if (tagFilter === 'bulk') {
            result = result.filter(item => Array.isArray(item?.service?.applicants) && item.service.applicants.length > 1);
        }
        return result;
    }, [sortedList, query, tagFilter]);

    const renderEmptyWithSearch = useCallback(() => {
        if (fetchingApplications) return <WhimsicalLoader />;
        if (!query) {
            return (
                <View style={stylesMemo.emptyView}>
                    <Text>
                        No applications yet.
                    </Text>
                </View>
            );
        }
        return (
            <View style={{ padding: 16 }}>
                <Text size={12} color={text.disabled}>No results for “{rawQuery}”</Text>
            </View>
        );
    }, [fetchingApplications, query, rawQuery, stylesMemo.emptyView]);

    // --- SEARCH BAR (OUTSIDE THE LIST) ---
    const SearchBar = (
        <View
            // Avoid focus stealing on Android
            focusable={false}
            style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 }}
        >
            {
                ((!fetchingApplications) || rawQuery) ? <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        height: 40,
                    }}
                >
                    <Text size={12} color={text.disabled}>Search</Text>
                    <Input
                        // Critical: keep this outside FlatList so it never remounts
                        value={rawQuery}
                        onChangeText={onChangeSearch}
                        placeholder="Type to filter…"
                        placeholderTextColor={text.disabled}
                        style={{ flex: 1, marginLeft: 8, paddingVertical: 0 }}
                        returnKeyType="search"
                        blurOnSubmit={false}                 // don’t blur on submit
                        keyboardShouldPersistTaps="handled"  // web compat; no-op native
                    />
                    {rawQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setRawQuery('');
                                setQuery('');
                                dispatch(fetchApplications())
                            }}
                            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
                        >
                            <Text size={12} color={text.primary}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View> : <></>
            }


            <View style={{ flexDirection: 'row', justifyContent: ((!fetchingApplications) || rawQuery) ? 'space-between' : "center", marginTop: 6 }}>
                {
                    ((!fetchingApplications) || rawQuery) ? <>
                        <Text size={11} color={text.disabled}>
                            {rawQuery ? `${filteredList?.length ?? 0} result(s)` : `${sortedList?.length ?? 0} item(s)`}
                        </Text>

                        {!!rawQuery && (
                            <Text size={11} color={text.disabled}>Filtering by: “{rawQuery}”</Text>
                        )}
                    </> : <></>
                }

                <TouchableOpacity onPress={onRefresh}>
                    <View style={styles?.refreshView}>
                        {fetchingApplications ? (
                            <MotiView
                                from={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                transition={{ type: 'timing', duration: 600, loop: true, repeatReverse: true }}
                            >
                                <Text style={styles?.refreshText}>✨ Sprinkling magic...</Text>
                            </MotiView>
                        ) : (
                            <>
                                <Refresh color={text?.disabled} size={Platform.OS === 'web' ? 6 : 10} />
                                <Text style={styles?.refreshText}>Refresh</Text>
                            </>

                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
    return (

        <View onLayout={onLayout} style={{ backgroundColor: "#F8F8F8", flexDirection: "row", flex: 1, overflow: 'hidden' }}>
            {((!applicationItem || onChangeLayout) && !(buttonText == "onViewOutput" && !onChangeLayout)) && <View style={[stylesMemo.applicationRowContainer,
            {
                flexBasis: (isMobile || dimensions?.width < 768) ? "100%" : 466,
                flexShrink: 1,
                height: '100%', // <-- This constraints the height so FlatList can scroll
            }]}>

                {/* <View style={{alignItems: "flex-end"}}>
                    <TouchableOpacity onPress={onRefresh}>
                        <View style={[{paddingHorizontal: 40, paddingVertical: 10}]}>
                            <RefreshIcon/>
                        </View>
                    </TouchableOpacity>
                </View> */}
                <SearchBarWow
                    value={rawQuery}
                    onChangeText={onChangeSearch}
                    onClear={() => {
                        setRawQuery('');
                        setQuery('');
                        dispatch(fetchApplications());
                    }}
                    onRefresh={onRefresh}
                    fetching={!!fetchingApplications}
                    totalCount={total ?? sortedList?.length ?? 0}
                    filteredCount={filteredList?.length ?? 0}
                    tagFilter={tagFilter}
                    onTagChange={setTagFilter}
                    layoutMode={layoutMode}
                    onLayoutModeChange={setLayoutMode as any}
                />
                <FlatList
                    showsVerticalScrollIndicator={true}
                    style={stylesMemo.flatlist}
                    data={filteredList}
                    renderItem={renderItem}
                    initialNumToRender={filteredList?.length ?? 0}
                    maxToRenderPerBatch={filteredList?.length ?? 0}
                    keyExtractor={(item: any) => item?._id?.toString()}
                    ItemSeparatorComponent={renderItemSeparator}
                    ListEmptyComponent={renderEmptyWithSearch}
                    ListFooterComponent={<ListFooter
                        fetchingApplications={fetchingApplications}
                        list={list}
                        total={total}
                        dispatch={dispatch}
                        rawQuery={rawQuery}
                        page={page}
                        stylesMemo={stylesMemo}
                    />}
                    onRefresh={onRefresh}
                    refreshing={!!fetchingApplications}
                    onEndReached={() => {
                        if (list?.length < total && !fetchingApplications) {
                            dispatch(fetchApplications({ keyword: rawQuery, page: page + 1 }));
                        }
                    }}
                    onEndReachedThreshold={0.5}
                />
            </View>}
            <View
                onLayout={onLayoutComponent}
                style={{
                    ...Platform.select({
                        web: {
                            overflow: "auto"
                        }
                    }),
                    flex: 1
                }}
            >
                {(_.isEmpty(applicationItem) && !(buttonText && buttonText != "PaymentSOA")) && <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <NoServices />
                    <Text size={24} color={"#A0A3BD"}>No service selected</Text>
                </View>}
                {(applicationItem && buttonText == "Preview") && <View style={{ flex: 1 }}>
                    {(!(applicationItem && onChangeLayout)) && <NavBar
                        light
                        shadow
                        title='Preview'
                        leftIcon={<Close />}
                        onLeft={() => {
                            Platform.select({
                                native: navigation.navigate('Home')
                            })
                            if (Platform.OS == "web") {
                                dispatch(setButtonText(null))
                                dispatch(setApplicationItem(null))
                            }
                        }}
                        onRight={() => { }}
                    />}<PreviewNavigator drawer={false} navigation={navigation} /></View>}
                {applicationItem && buttonText == "PaymentSOA" && <PaymentNavigator navigation={navigation} />}
                {applicationItem && buttonText == "Renew" && <ApplicationSteps route={{ params: { application: applicationItem, renew: true, } }} navigation={navigation} />}
                {buttonText == "onViewOutput" && doc && <View style={{ flex: 1, }}>
                    <View style={{ padding: 10, zIndex: 1, position: "absolute", }}>
                        <TouchableOpacity onPress={() => {
                            dispatch(setButtonText(""))
                        }
                        }>
                            <View style={{
                                padding: 15,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                justifyContent: 'center',
                                alignSelf: "flex-start",
                                flex: 1,
                                flexDirection: "row"
                            }}>
                                <Text style={{ fontWeight: 'bold', fontFamily: Bold, fontSize: 16, color: "white" }}>Close</Text>
                            </View>
                        </TouchableOpacity>

                    </View>

                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", }}>
                        <object
                            style={{ zIndex: 2, height: "100%", width: "100%" }}
                            data={'https://docs.google.com/gview?url=' + doc + '&embedded=true'}
                        >
                            <Text>Could not load Doc. Make sure the source is correct and the browser is not on device
                                mode.</Text>
                        </object>
                        <Text style={{
                            zIndex: -1,
                            position: "absolute",
                            textAlign: "center",
                            color: "#fff",
                            fontFamily: Bold,
                            fontSize: 18
                        }}>
                            <ActivityIndicator />
                        </Text>
                    </View>
                </View>
                }
            </View>
            {
                <NTCAlert
                    alertContainerStyle={{ zIndex: 1 }}
                    visible={showAlert}
                    title={alertData?.title || 'Alert'}
                    message={alertData?.message}
                    confirmText={alertData.button || 'OK'}
                    onConfirm={() => setShowAlert(false)}
                />
            }
        </View>
    );

};
export default React.memo(Applications);

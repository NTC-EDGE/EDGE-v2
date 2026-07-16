import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import {
    FlatList,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import Text from '@atoms/text';
import { RadioTower } from '@atoms/icon';
import { button, disabledColor, text } from '@styles/color';
import styles from './styles';
import { NTCServices as NTCServicesList, region_list } from '@utils/ntc';
import { isMobile } from "@utils/formatting";
import SearchIcon from "@assets/svg/search";
import NoServices from "@assets/svg/noService";
import ExaminationIcon from "@assets/svg/exam";
import PermitIcon from "@assets/svg/permit";
import LicenseIcon from "@assets/svg/license";
import CertificateIcon from "@assets/svg/certificate";
import ComplaintRequest from "@assets/svg/complaint-request";
import NTCServices from '@pages/services';
import _ from "lodash";
import ApplicationSteps from '@pages/application-steps';
import {
    setSelectedService,
    setSelectedServiceKey,
    setServiceLayout
} from "@reducers/service/actions";
import { useComponentLayout } from "@hooks/useComponentLayout";
import {
    saveBulkApplication,
    setApplicationCart,
    setFetchSOAError,
    setFetchSOASuccess,
    setSaveApplicationError,
    setSaveApplicationSuccess,
    setSaveBulkApplicationSuccess,
    setSaveBulkApplicationError,
    setApplicationProcess
} from '@reducers/application/actions';
import useGuest from "@hooks/useGuest";
import HelpModal from "@organisms/help-modal";
import FloatingNote from "@organisms/floating-note";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTabSwitch } from "@reducers/user/actions";
import { MotiView, useAnimationState } from "moti";
import { clearBulkApplication, deleteBulkApplication, setBulkApplication, setSplit } from "@reducers/theme/actions";
import SubmitConfirmModal from "@pages/homepage/tab-navigation/services/SubmitConfirmModal";
import TermsAndConditions from "@organisms/terms-and-conditions";
import FeedbackSuccessModal from "@pages/homepage/tab-navigation/services/FeedbackSuccessModal";
import DeleteConfirmModal from "@organisms/DeleteConfirmModal/DeleteConfirmModal";
import { ApplicantCard } from "@pages/homepage/tab-navigation/ApplicantCard";
import AccreditationIcon from "@assets/svg/accreditations";
import { BASE_URL } from '@services/config';
import { submitFeedback } from "@services/feedbackApi";
import { FileText, Lock } from "lucide-react-native";

type Applicant = any;

interface Props {
    navigation: any;
    route: any;
    params: any;
}
const normalize = (value: any) =>
    String(value || '')
        .normalize('NFKC')
        .trim()
        .toLowerCase();

const looseKey = (value: any) =>
    normalize(value)
        .replace(/region/g, '')
        .replace(/[^a-z0-9]/g, '');

const findMatchingRegion = (regionValue: any) => {
    if (!regionValue) return null;

    if (typeof regionValue === 'object') {
        return regionValue;
    }

    return region_list.find((region: any) => {
        return (
            normalize(region?.label) === normalize(regionValue) ||
            normalize(region?.value) === normalize(regionValue) ||
            normalize(region?.code) === normalize(regionValue) ||
            looseKey(region?.label) === looseKey(regionValue) ||
            looseKey(region?.value) === looseKey(regionValue) ||
            looseKey(region?.code) === looseKey(regionValue)
        );
    }) || null;
};
const getRegionValue = (regionValue: any, fallback = 'VII') => {
    const matchingRegion = findMatchingRegion(regionValue);

    return (
        matchingRegion?.value ||
        matchingRegion?.code ||
        regionValue ||
        fallback
    );
};

const getOfficeValue = (officeValue: any) => {
    if (!officeValue) return null;

    return typeof officeValue === 'object'
        ? officeValue?.value
        : officeValue;
};


const Services: FC<Props> = ({ navigation, params }) => {
    const dispatch = useDispatch();

    const split = useSelector((state: RootStateOrAny) => state?.theme?.split);

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');
    const isIPhone = /iphone|ipod/i.test(navigator.userAgent);

    function isIOS() {
        return /iphone|ipad|ipod/i.test(navigator.userAgent);
    }

    const isIPad =
        /ipad/i.test(navigator.userAgent) ||
        (isIOS() && navigator.maxTouchPoints > 1);

    const dimensions = useWindowDimensions();
    const isTablet = dimensions.width >= 500;

    const tabSwitch = useSelector((state: any) => state.user.tabSwitch);

    const name = useSelector((state: RootStateOrAny) => {
        return state?.user?.session?.firstName || state?.user?.session?.applicant?.companyName;
    });

    const session = useSelector((state: RootStateOrAny) => state?.user?.session);
    const authToken = session.sessionToken ||
        session?.token ||
        session?.accessToken ||
        session?.jwt ||
        session?.authToken;

    const currentApplicant = session?.applicant || {};

    const stylesMemo = useMemo(() => {
        return styles;
    }, []);

    React.useEffect(() => {
        const f = async () => {
            const existing = await AsyncStorage.getItem("IS_SAVE");

            if (existing) {
                AsyncStorage.setItem("IS_SAVE", "0");
            }
        };

        f();

        navigation.setOptions({
            tabBarLabel: ({ color }: any) =>
                <View style={stylesMemo.tabContainer}>
                    <RadioTower style={stylesMemo.tabIcon} color={color} size={20} />
                    <Text style={[stylesMemo.tabText, { color }]}>Services</Text>
                </View>
        });
    }, []);

    const [showHelp, setShowHelp] = useState(false);
    const [deviceSize, setDeviceSize] = useState((isAndroid || isIPhone) && !isTablet ? 2 : 3);
    const [isDeviceSize, setIsDeviceSize] = useState((isAndroid || isIPhone) && !isTablet);
    const { width } = useWindowDimensions();
    const [serviceData, setServiceData] = useState({});

    const applicationProcess =
        useSelector((state: RootStateOrAny) => state?.application?.applicationProcess) || {};

    const applications = useSelector((state: any) =>
        state.theme.get('bulkApplications')
    ) as any[];

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Complete' | 'Drafts'>('All');

    const isAppComplete = useCallback((item: any) => {
        const reqs = item?.service?.applicationType?.requirements || [];
        const regionValue = item?.region;
        for (const r of reqs) {
            if (r?.required || (r?.additional && r?.additional?.[regionValue]?.required === true)) {
                if (!(r?.files?.filter((c: any) => c.links?.small || c.uri || c.assets?.[0]?.uri)?.length > 0)) {
                    return false;
                }
                let isMissing = false;
                r?.files?.filter((c: any) => c.links?.small || c.uri || c.assets?.[0]?.uri)?.forEach((f: any) => {
                    if (!(Object?.keys(f?.links || {})?.length > 0 || f?.uri || f?.assets?.[0]?.uri)) {
                        isMissing = true;
                    }
                });
                if (isMissing) return false;
            }
        }
        return true;
    }, []);

    const filtered = useMemo(() => {
        return applications?.filter(a => {
            const basic = a?.service?.basic;

            const companyName = basic?.companyName || '';

            const fullName = `${basic?.firstName || ''} ${basic?.middleName || ''} ${basic?.lastName || ''}`
                .trim()
                .replace(/\s+/g, ' ');

            const displayName = companyName || fullName;

            const matchesSearch = displayName
                .toLowerCase()
                .includes(search.toLowerCase());

            const isComplete = isAppComplete(a);

            if (statusFilter === 'Complete' && !isComplete) return false;
            if (statusFilter === 'Drafts' && isComplete) return false;

            return matchesSearch;
        });
    }, [applications, search, statusFilter, isAppComplete]);

    const hasIncompleteRequirements = useMemo(() => {
        if (!applications || applications.length === 0) return false;

        for (const item of applications) {
            const reqs = item?.service?.applicationType?.requirements || [];
            const regionValue = item?.region;

            for (const r of reqs) {
                if (r?.required || (r?.additional && r?.additional?.[regionValue]?.required === true)) {
                    if (!(r?.files?.filter((c: any) => c.links?.small || c.uri || c.assets?.[0]?.uri)?.length > 0)) {
                        return true;
                    }

                    let isMissing = false;
                    r?.files?.filter((c: any) => c.links?.small || c.uri || c.assets?.[0]?.uri)?.forEach((f: any) => {
                        if (!(Object?.keys(f?.links || {})?.length > 0 || f?.uri || f?.assets?.[0]?.uri)) {
                            isMissing = true;
                        }
                    });
                    if (isMissing) return true;
                }
            }
        }
        return false;
    }, [applications]);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [menuForId, setMenuForId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const handleSubmit = () => {
        setShowSubmit(true);
    };

    const toggleMenu = useCallback(
        (id: string) => {
            setMenuForId((current) => (current === id ? null : id));
        },
        []
    );

    const handleReview = useCallback(
        (item: Applicant) => {
            dispatch(setBulkApplication({ ...item, action: "review", currentStep: 6 }));
            dispatch(setApplicationCart(item));
            setMenuForId(null);
        },
        [dispatch]
    );

    const handleEdit = useCallback(
        (item: Applicant) => {
            dispatch(setBulkApplication({ ...item, action: "edit", currentStep: 3 }));
            dispatch(setApplicationProcess({ value: 'bulk-application', label: 'Bulk Application' }));
            dispatch(setApplicationCart(item));
            setMenuForId(null);
        },
        [dispatch]
    );

    const handleDeletePress = useCallback(
        (id: string) => {
            handleDelete(id);
        },
        []
    );

    const renderApplicant = useCallback(
        ({ item }: { item: Applicant; index: number }) => (
            <ApplicantCard
                item={item}
                isMenuOpen={menuForId === item.id}
                onToggleMenu={() => toggleMenu(item.id)}
                onReview={() => handleReview(item)}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDeletePress(item.id)}
            />
        ),
        [menuForId, toggleMenu, handleReview, handleEdit, handleDeletePress]
    );

    const greetings = () => {
        let curHr = new Date().getHours();

        if (curHr < 12) return 'Good morning';
        else if (curHr < 18) return 'Good afternoon';
        else return 'Good evening';
    };

    const renderService = ({ item, index }: any) => {
        let { key, title, logo, data } = item;
        let enabled = data?.length > 0;

        return (
            <View
                style={
                    isDeviceSize
                        ? {
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                        }
                        : { paddingLeft: 24 }
                }
            >
                <TouchableOpacity
                    onPress={async () => {
                        const existing = await AsyncStorage.getItem("IS_SAVE");

                        if (existing == null) {
                            dispatch(setSelectedService({}));
                            dispatch(setSelectedServiceKey(key));
                            dispatch(setApplicationCart({}));
                            dispatch(setFetchSOASuccess(false));
                            dispatch(setFetchSOAError(false));
                            dispatch(setSaveApplicationError(false));
                            dispatch(setSaveApplicationSuccess(false));
                            setServiceData({ key, services: data });
                        } else if (existing == "1") {
                            var ok = confirm("You have unsaved changes. Are you sure you want to continue?");

                            if (ok) {
                                await AsyncStorage.setItem("IS_SAVE", "0");
                                dispatch(setSelectedService({}));
                                dispatch(setSelectedServiceKey(key));
                                dispatch(setApplicationCart({}));
                                dispatch(setFetchSOASuccess(false));
                                dispatch(setFetchSOAError(false));
                                dispatch(setSaveApplicationError(false));
                                dispatch(setSaveApplicationSuccess(false));
                                setServiceData({ key, services: data });
                            }
                        } else if (existing == "0") {
                            dispatch(setSelectedService({}));
                            dispatch(setSelectedServiceKey(key));
                            dispatch(setApplicationCart({}));
                            dispatch(setFetchSOASuccess(false));
                            dispatch(setFetchSOAError(false));
                            dispatch(setSaveApplicationError(false));
                            dispatch(setSaveApplicationSuccess(false));
                            setServiceData({ key, services: data });
                        }
                    }}
                    disabled={!enabled}
                >
                    <View
                        style={[
                            stylesMemo.serviceShadow,
                            !enabled && { backgroundColor: disabledColor }
                        ]}
                    >
                        {selectedServiceKey == key && (
                            <View
                                style={{
                                    position: "absolute",
                                    width: 120,
                                    paddingVertical: 15,
                                    height: 137.5,
                                    borderRadius: 10,
                                    backgroundColor: "#EAEDFF",
                                    borderWidth: 4,
                                    borderColor: "#407BFF"
                                }}
                            />
                        )}

                        <View key={index} style={stylesMemo.serviceContainer}>
                            <View style={stylesMemo.serviceView}>
                                {key == "exams" ? (
                                    isMobile ? <ExaminationIcon width={60} height={60} /> : <ExaminationIcon />
                                ) : key == "permits" ? (
                                    isMobile ? <PermitIcon width={60} height={60} /> : <PermitIcon />
                                ) : key == "licenses" ? (
                                    isMobile ? <LicenseIcon width={60} height={60} /> : <LicenseIcon />
                                ) : key == "accreditations" ? (
                                    isMobile ? <AccreditationIcon width={60} height={60} /> : <AccreditationIcon />
                                ) : key == "certificates" ? (
                                    isMobile ? <CertificateIcon width={60} height={60} /> : <CertificateIcon />
                                ) : key == "complaints-requests" ? (
                                    isMobile ? <ComplaintRequest width={60} height={60} /> : <ComplaintRequest />
                                ) : <></>}
                            </View>
                        </View>

                        <View
                            style={{
                                alignSelf: "center",
                                justifyContent: "center",
                                paddingVertical: title.split('/').length < 2 ? 15 : 5
                            }}
                        >
                            <Text style={stylesMemo.serviceText}>
                                {title.replace("/", '/\n')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const { selectedService, selectedServiceKey } =
        useSelector((state: RootStateOrAny) => state?.service);

    const [value, setValue] = useState('');
    const [filter, setFilter] = useState(NTCServicesList);
    const [sizeComponent, onLayoutComponent] = useComponentLayout();

    useEffect(() => {
        if (!(sizeComponent?.width && sizeComponent?.height)) return;

        dispatch(setServiceLayout(sizeComponent));
    }, [sizeComponent]);

    const isGuest = useGuest();
    const [onChangeLayout, setOnChangeLayout] = useState(false);

    const onLayout = useCallback(event => {
        const layout = event.nativeEvent.layout;

        if (layout?.width) {
            if (layout?.width <= layout?.height) {
                setOnChangeLayout(false);
            } else {
                setOnChangeLayout(true);
            }
        }
    }, []);

    const bar1 = useAnimationState({
        closed: { rotate: '0deg', translateY: 0, translateX: 0 },
        open: { rotate: '35deg', translateY: 5, translateX: 6 },
    });

    const bar2 = useAnimationState({
        closed: { width: 24, opacity: 1 },
        open: { width: 16, opacity: 1 },
    });

    const bar3 = useAnimationState({
        closed: { rotate: '0deg', translateY: 0, translateX: 0 },
        open: { rotate: '-35deg', translateY: -5, translateX: 6 },
    });

    const [showSubmit, setShowSubmit] = useState(false);
    const [agree, setAgree] = useState(false);
    const [termAndCondition, setTermAndCondition] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentRegion, setCurrentRegion] = useState();
    const submitApplications = () => {
        // Keep your existing submit logic here if needed.
    };

    const getFeedbackRegionCode = () => {
        const firstApplication = applications?.[0];

        return (
            firstApplication?.region ||
            firstApplication?.application?.regionCode ||
            firstApplication?.application?.region?.value ||
            firstApplication?.application?.region?.label ||
            firstApplication?.service?.basic?.regionCode ||
            currentApplicant?.regionCode ||
            "VII"
        )
            ?.toString()
            ?.trim()
            ?.toUpperCase();
    };

    const submitFeedbackApi = async (rating: number, comment: string) => {
        const regionCode = currentRegion || getFeedbackRegionCode();

        const firstApplication = applications?.[0];
        const basic =
            firstApplication?.service?.basic ||
            firstApplication?.application?.service?.basic ||
            firstApplication?.application?.basic ||
            {};

        const firstName = basic?.firstName || currentApplicant?.firstName || "";
        const middleName = basic?.middleName || currentApplicant?.middleName || "";
        const lastName = basic?.lastName || currentApplicant?.lastName || "";

        const applicantFullName = `${firstName} ${middleName} ${lastName}`
            .trim()
            .replace(/\s+/g, " ");

        const fullName =
            currentApplicant?.companyName ||
            basic?.companyName ||
            applicantFullName ||
            name ||
            "";

        const payload = {
            fullName,
            email: currentApplicant?.email || basic?.email || session?.email || "",
            contactNumber:
                currentApplicant?.contactNumber ||
                basic?.contactNumber ||
                basic?.mobileNumber ||
                basic?.phoneNumber ||
                "",
            officeOrAgency:
                currentApplicant?.companyName ||
                basic?.companyName ||
                basic?.officeOrAgency ||
                "",
            regionCode,
            rating,
            comments: comment,
            submittedBy:
                session?.email ||
                currentApplicant?.email ||
                fullName ||
                "Applicant",
        };
        console.log(1, "submitFeedback")
        return submitFeedback(getRegionValue(regionCode), payload, authToken);
    };

    const renderEmptyWithSearch = useCallback(() => {
        return (
            <View
                style={{
                    padding: 16,
                    paddingTop: 80,
                    flex: 1,
                    alignItems: "center",
                }}
            >
                <View style={{ marginBottom: 16 }}>
                    <FileText size={36} color="#CBD5E1" />
                </View>
                <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, fontWeight: '600' }}>
                    No applications yet — add one to{"\n"}get started
                </Text>
            </View>
        );
    }, []);
    return (
        <>
            <View
                onLayout={onLayout}
                style={{
                    backgroundColor: "#F8F8F8",
                    flexDirection: "row",
                    flex: 1
                }}
            >

                {(!(selectedServiceKey && serviceData) || onChangeLayout) && (
                    <View
                        style={[
                            stylesMemo.serviceRowContainer,
                            {
                                flexBasis:
                                    (isMobile || dimensions?.width < 768)
                                        ? "100%"
                                        : (split ? 466 : 0),
                            }
                        ]}
                    >
                        {applicationProcess?.value != "bulk-application" ? (
                            <View style={stylesMemo.serviceViewContainer}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 5,
                                        alignItems: "center",
                                        flex: 1
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => dispatch(setTabSwitch(!tabSwitch))}
                                        activeOpacity={0.8}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#F3F4F6',
                                            shadowColor: '#000',
                                            shadowOpacity: 0.1,
                                            shadowRadius: 3,
                                            shadowOffset: { width: 0, height: 1 },
                                            elevation: 2,
                                        }}
                                    >
                                        <MotiView
                                            state={bar1}
                                            transition={{ type: 'timing', duration: 300 }}
                                            style={{
                                                position: 'absolute',
                                                width: 24,
                                                height: 2,
                                                borderRadius: 1,
                                                backgroundColor: '#111',
                                                top: 14,
                                            }}
                                        />

                                        <MotiView
                                            state={bar2}
                                            transition={{ type: 'timing', duration: 250 }}
                                            style={{
                                                position: 'absolute',
                                                width: 24,
                                                height: 2,
                                                borderRadius: 1,
                                                backgroundColor: '#111',
                                                top: 19,
                                            }}
                                        />

                                        <MotiView
                                            state={bar3}
                                            transition={{ type: 'timing', duration: 300 }}
                                            style={{
                                                position: 'absolute',
                                                width: 24,
                                                height: 2,
                                                borderRadius: 1,
                                                backgroundColor: '#111',
                                                top: 24,
                                            }}
                                        />
                                    </TouchableOpacity>

                                    <View style={{ paddingTop: 4, justifyContent: 'center' }}>
                                        <MotiView
                                            animate={{
                                                opacity: tabSwitch ? 0.6 : 1,
                                                translateX: tabSwitch ? 2 : 0
                                            }}
                                            transition={{ type: 'timing', duration: 220 }}
                                        >
                                            <Text style={stylesMemo.serviceTitle}>
                                                Services
                                            </Text>
                                        </MotiView>
                                    </View>
                                </View>

                                <View style={{ paddingTop: 11, paddingBottom: 22 }}>
                                    <View>
                                        <TextInput
                                            value={value}
                                            onChangeText={textValue => {
                                                setValue(textValue);
                                                setSearch(textValue);

                                                textValue.length === 0
                                                    ? setFilter(NTCServicesList)
                                                    : setFilter(
                                                        NTCServicesList.filter((item) => {
                                                            return item.title
                                                                .toLowerCase()
                                                                .indexOf(textValue.toLowerCase()) > -1;
                                                        })
                                                    );
                                            }}
                                            placeholderTextColor={"#6E7191"}
                                            placeholder={"Search"}
                                            style={stylesMemo.search}
                                        />

                                        <View style={stylesMemo.searchIcon}>
                                            <SearchIcon />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        {applicationProcess?.value == "bulk-application" ? (
                            <View
                                style={{
                                    ...styles.container,
                                    paddingHorizontal: 16,
                                    paddingTop: 8,
                                }}
                            >
                                <Text style={styles.title}>
                                    {applications?.[0]?.application?.applicationType?.label}
                                </Text>

                                <View style={{ paddingTop: 11, paddingBottom: 16 }}>
                                    <View>
                                        <TextInput
                                            value={value}
                                            onChangeText={textValue => {
                                                setValue(textValue);
                                                setSearch(textValue);
                                            }}
                                            placeholderTextColor={"#6E7191"}
                                            placeholder={"Search applicant..."}
                                            style={[
                                                stylesMemo.search,
                                                { marginBottom: 16 }
                                            ]}
                                        />

                                        <View
                                            style={[
                                                stylesMemo.searchIcon,
                                                { top: 0, height: 40 }
                                            ]}
                                        >
                                            <SearchIcon />
                                        </View>
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: '#F9FAFB',
                                            borderRadius: 8,
                                            padding: 4,
                                            borderWidth: 1,
                                            borderColor: '#E5E7EB'
                                        }}
                                    >
                                        {(['All', 'Complete', 'Drafts'] as const).map((tab) => {
                                            const isActive = statusFilter === tab;

                                            let count = 0;

                                            if (tab === 'All') count = applications?.length || 0;
                                            else if (tab === 'Complete') count = applications?.filter((a: any) => isAppComplete(a))?.length || 0;
                                            else if (tab === 'Drafts') count = applications?.filter((a: any) => !isAppComplete(a))?.length || 0;

                                            return (
                                                <TouchableOpacity
                                                    key={tab}
                                                    onPress={() => setStatusFilter(tab)}
                                                    style={{
                                                        flex: 1,
                                                        paddingVertical: 6,
                                                        alignItems: 'center',
                                                        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                                                        borderRadius: 6,
                                                        shadowColor: isActive ? '#000' : 'transparent',
                                                        shadowOpacity: isActive ? 0.05 : 0,
                                                        shadowOffset: { width: 0, height: 1 },
                                                        shadowRadius: 2,
                                                        elevation: isActive ? 1 : 0,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontWeight: isActive ? '700' : '600',
                                                            color: isActive ? '#2863D6' : '#6B7280',
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        {tab} ({count})
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                <FlatList
                                    data={filtered}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderApplicant}
                                    contentContainerStyle={[
                                        styles.listContent,
                                        { overflow: 'visible' }
                                    ]}
                                    removeClippedSubviews={false}
                                    ListEmptyComponent={renderEmptyWithSearch}
                                    CellRendererComponent={({ index, children, style, ...props }) => (
                                        <View pointerEvents="box-none" style={[style, { zIndex: 1000 - index }]} {...props}>
                                            {children}
                                        </View>
                                    )}
                                />

                                <View
                                    style={[
                                        styles.bottomBar,
                                        { left: 16, right: 16, bottom: 16 }
                                    ]}
                                >
                                    <TouchableOpacity
                                        aria-disabled={(applications?.length || 0) === 0 || hasIncompleteRequirements}
                                        disabled={(applications?.length || 0) === 0 || hasIncompleteRequirements}
                                        style={[
                                            styles.submitButton,
                                            {
                                                backgroundColor:
                                                    ((applications?.length || 0) === 0 || hasIncompleteRequirements)
                                                        ? '#E2E8F0' // Light grey for disabled
                                                        : '#112255',
                                                paddingVertical: 14,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 24,
                                                flexDirection: 'row',
                                                gap: 8,
                                            }
                                        ]}
                                        onPress={handleSubmit}
                                    >
                                        {((applications?.length || 0) === 0 || hasIncompleteRequirements) && (
                                            <Lock size={16} color="#94A3B8" />
                                        )}
                                        <Text
                                            style={[
                                                styles.submitText,
                                                {
                                                    color:
                                                        ((applications?.length || 0) === 0 || hasIncompleteRequirements)
                                                            ? '#94A3B8'
                                                            : "#fff",
                                                    fontWeight: '700',
                                                    letterSpacing: 0.5
                                                }
                                            ]}
                                        >
                                            SUBMIT ({applications?.length || 0})
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <FlatList
                                scrollEnabled={true}
                                numColumns={deviceSize}
                                data={filter}
                                renderItem={renderService}
                                keyExtractor={(item, index) => `${index}`}
                                ListFooterComponent={() => (
                                    <View style={isGuest ? stylesMemo?.footer : {}} />
                                )}
                                ListHeaderComponent={() => (
                                    <View style={stylesMemo?.headerView}>
                                        <Text style={stylesMemo?.headerText}>
                                            {greetings()}, {name}!
                                        </Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                )}

                {showSubmit ? (
                    <SubmitConfirmModal
                        visible={showSubmit}
                        onCancel={() => setShowSubmit(false)}
                        onConfirm={() => {
                            submitApplications();
                            setShowSubmit(false);
                            setTermAndCondition(true);
                        }}
                    />
                ) : <></>}

                {showDeleteConfirm ? (
                    <DeleteConfirmModal
                        visible={showDeleteConfirm}
                        onCancel={() => {
                            setShowDeleteConfirm(false);
                            setDeleteTargetId(null);
                        }}
                        onConfirm={() => {
                            if (deleteTargetId) {
                                dispatch(deleteBulkApplication(deleteTargetId));
                            }

                            setShowDeleteConfirm(false);
                            setDeleteTargetId(null);
                        }}
                    />
                ) : <></>}

                {termAndCondition ? (
                    <TermsAndConditions
                        agree={agree}
                        onClick={() => setAgree(!agree)}
                        visible={termAndCondition}
                        buttonLabel='Confirm'
                        onPress={() => {
                            setTermAndCondition(false);
                            setShowSuccess(true);
                            setAgree(false);
                            setCurrentRegion(applications?.[0]?.region || "VII");
                            const app = applications.map((a: any) => {
                                const { application, ...rest } = a;

                                const regionValue = getRegionValue(a?.region, 'VII');
                                const officeValue = getOfficeValue(a?.office);

                                const schedule = a?.schedule
                                    ? {
                                        ...a.schedule,
                                        region: getRegionValue(a?.schedule?.region || a?.region, regionValue),
                                        office: getOfficeValue(a?.schedule?.office || a?.office),
                                    }
                                    : null;

                                return {
                                    ...rest,
                                    region: regionValue,
                                    office: officeValue,
                                    schedule,
                                };
                            });

                            dispatch(saveBulkApplication(app));
                        }}
                        disabled={!agree}
                        onDismiss={() => {
                            setShowSuccess(false);
                            setTermAndCondition(false);
                            setAgree(!agree);
                        }}
                    />
                ) : <></>}

                {showSuccess ? (
                    <FeedbackSuccessModal
                        visible={showSuccess}
                        isBulk={applicationProcess?.value === 'bulk-application'}
                        onClose={() => {
                            setShowSuccess(false);
                            // Reset all state after submission flow
                            dispatch(clearBulkApplication());
                            dispatch(setApplicationProcess({}));
                            dispatch(setApplicationCart({}));
                            dispatch(setSelectedService({}));
                            dispatch(setSelectedServiceKey(''));
                            dispatch(setSplit(true));
                            dispatch(setSaveBulkApplicationSuccess(false));
                            dispatch(setSaveBulkApplicationError(false));
                            dispatch(setSaveApplicationSuccess(false));
                            dispatch(setSaveApplicationError(false));
                            setValue('');
                            setSearch('');
                            setStatusFilter('All');
                            setMenuForId(null);
                        }}
                        onSubmitFeedback={async (rating, comment) => {
                            try {
                                await submitFeedbackApi(rating, comment);
                                setShowSuccess(false);
                                // Reset all state after submission flow
                                dispatch(clearBulkApplication());
                                dispatch(setApplicationProcess({}));
                                dispatch(setApplicationCart({}));
                                dispatch(setSelectedService({}));
                                dispatch(setSelectedServiceKey(''));
                                dispatch(setSplit(true));
                                dispatch(setSaveBulkApplicationSuccess(false));
                                dispatch(setSaveBulkApplicationError(false));
                                dispatch(setSaveApplicationSuccess(false));
                                dispatch(setSaveApplicationError(false));
                                setValue('');
                                setSearch('');
                                setStatusFilter('All');
                                setMenuForId(null);
                            } catch (error: any) {
                                console.log("Feedback submit error:", error);
                                alert(error?.message || "Failed to submit feedback.");
                            }
                        }}
                    />
                ) : <></>}

                <View
                    onLayout={onLayoutComponent}
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1
                    }}
                >
                    {!_.isEmpty(selectedService) && !_.isEmpty(filter) && (
                        <ApplicationSteps />
                    )}

                    {!_.isEmpty(selectedServiceKey) &&
                        _.isEmpty(selectedService) &&
                        !_.isEmpty(filter) && (
                            <NTCServices
                                navigation={navigation}
                                route={{ params: serviceData }}
                            />
                        )}

                    {_.isEmpty(selectedServiceKey) && (
                        <View style={{ alignItems: "center" }}>
                            <NoServices />
                            <Text size={24} color={"#A0A3BD"}>
                                No service selected
                            </Text>
                        </View>
                    )}

                    {_.isEmpty(selectedServiceKey) && (
                        <>
                            <TouchableOpacity
                                onPress={() => setShowHelp(true)}
                                style={styles.helpCenterBtn}
                            >
                                <Text style={styles.helpCenterText}>
                                    Help Center
                                </Text>
                            </TouchableOpacity>

                            <HelpModal
                                visible={showHelp}
                                onClose={() => setShowHelp(false)}
                            />
                        </>
                    )}

                    {_.isEmpty(selectedServiceKey) && (
                        <>
                            <FloatingNote />
                        </>
                    )}
                </View>
            </View>
        </>
    );
};

export default React.memo(Services);
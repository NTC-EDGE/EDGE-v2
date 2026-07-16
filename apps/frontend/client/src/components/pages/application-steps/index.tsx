
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector, RootStateOrAny } from 'react-redux';
import { useNavigation } from '@react-navigation/core';
import { Alert, BackHandler, LogBox, Platform, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import TermsAndConditions from '@organisms/terms-and-conditions';
import ConfirmationModal from '@organisms/ConfirmationModal';
import FeedbackModal from '@organisms/FeedbackModal';
import Toast from '@molecules/Toast';
import ApplicationSteps from '@templates/application-steps';
import Submitted from '@pages/application-steps/submitted';

import GeneratingApplication from '@templates/application-steps/generating-application'; // step 0
import About from '@templates/application-steps/about'; // step 1
import Region from '@templates/application-steps/region'; // step 2
import FilingDataConfiguration from '@templates/application-steps/filing-data-configuration'; // step 2.5 (bulk only)
import Types from '@templates/application-steps/types'; // step 3
import ServicesForm from '@organisms/forms/services'; // step 4
import Requirements from '@templates/application-steps/requirements'; // step 5
import Preview from '@templates/application-steps/preview'; // step 6
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce, cloneDeep } from 'lodash';
import NTCServicesConfig from 'src/ntc-services-config';
import { transformToFeePayload, NTCServices as NTCServicesList, regionList, GUEST_USER, region_list } from '@utils/ntc';
import {
    validateDate,
    validateEmail,
    validateIMEI,
    validateNumber, validatePassword,
    validatePhone,
    validateText, validateYear,
    validateZipCode
} from '@utils/form-validations';

import {
    setApplicationCart,
    saveApplication,
    saveBulkApplication,
    setSaveApplicationSuccess,
    setSaveApplicationError,
    setSaveBulkApplicationSuccess,
    setSaveBulkApplicationError,
    uploadRequirement,
    fetchRegions,
    fetchSchedules,
    fetchCities,
    fetchProvinces,
    fetchSOA,
    setFetchSOASuccess,
    setFetchSOAError, setButtonText, setApplicationProcess
} from '@reducers/application/actions';
import { logoutUser, setCreatedAt } from '@reducers/user/actions';
import { setApplicationItem, setSelectedService, setSelectedServiceKey } from '@reducers/service/actions';
import { compareApplication, extractDate, generateForm, isMobile } from '@utils/formatting';
import useOneSignal from '@hooks/useOneSignal';
import { resetCredentials } from '@hooks/useBiometrics';
import useGuest from '@hooks/useGuest';
import { changeCreatedAt } from "@config/api";
import { createIssue } from "@sagas/requests/application";
import { addBulkApplication, setBulkApplication, setSplit, setBulkApplications, deleteBulkApplication, clearBulkApplication } from "@reducers/theme/actions";
import { BASE_URL } from "@services/config";
import { submitFeedback } from "@services/feedbackApi";
import FeedbackSuccessModal from '../homepage/tab-navigation/services/FeedbackSuccessModal';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parseCSV, generateCSVTemplate } from '@utils/csvHelper';
import { validateCSVRow } from '@utils/csvValidator';
import CSVPreviewModal from '@organisms/CSVPreviewModal';

const currentYear = moment()?.get('year')?.toString();

const iterate = (maybeArray: any, cb: (x: any) => void) => {
    if (Array.isArray(maybeArray)) maybeArray.forEach(cb);
};

const getStructuredData = (form: any) => {
    var structuredParent = {};
    form?.forEach((parent: any) => {
        var isParentList = parent?.type === 'list';
        var structuredChild = isParentList ? [] : {};
        if (parent?.type !== 'info') {
            parent?.data?.forEach((child: any, index: number) => {
                if (isParentList) { // any changes here should also reflect on ELSE below
                    var structuredSubChild = {};
                    child.forEach((subChild: any) => {
                        if (subChild?.isSet) {
                            var structuredSetChild = subChild?.type === 'list' ? [] : {};
                            subChild?.data?.forEach((setChild: any) => {
                                if (subChild?.type === 'list') { // multiple set
                                    var structuredSubSetChild = {};
                                    setChild?.forEach((subSetChild: any) => {
                                        var value = subSetChild?.value;
                                        var isDateIncomplete = () => { return value?.some((v: any) => !v?.isValid) };
                                        if (subSetChild?.type === 'option') {
                                            let _selected = subSetChild?.items?.filter((i: any) => i?.selected);
                                            let _items = [];
                                            _selected?.forEach((item: any) => {
                                                let __obj = { value: item?.value };
                                                if (item?.hasSpecification) {
                                                    __obj = {
                                                        ...__obj,
                                                        [`${item?.specification?.id}`]: item?.specification?.value,
                                                    };
                                                }
                                                _items?.push(__obj);
                                            });
                                            structuredSubSetChild = {
                                                ...structuredSubSetChild,
                                                [subSetChild?.id]: _items,
                                            };
                                        }
                                        else {
                                            if (typeof (value) === 'object' && !!value) {
                                                var structuredGrandchild = {};
                                                value.forEach((grandchild: any) => {
                                                    structuredGrandchild = {
                                                        ...structuredGrandchild,
                                                        [grandchild?.id]: grandchild?.value,
                                                    };
                                                });
                                                value = subSetChild?.type === 'date'
                                                    ? isDateIncomplete()
                                                        ? null
                                                        : structuredGrandchild
                                                    : structuredGrandchild;
                                            }
                                            if (subSetChild?.hasSpecification) value = `${value} • ${form?.find((f: any) => f?.id === parent?.id)?.data?.[index]?.find((f: any) => f?.id === `for-${subChild?.id}`)?.value}`;
                                            if (!subSetChild?.specification) {
                                                structuredSubSetChild = {
                                                    ...structuredSubSetChild,
                                                    [subSetChild?.id]: value,
                                                };
                                            }
                                        }
                                    });
                                    structuredSetChild?.push(structuredSubSetChild);
                                }
                                else {
                                    var value = setChild?.value;
                                    var isDateIncomplete = () => { return value?.some((v: any) => !v?.isValid) };
                                    if (setChild?.type === 'option') {
                                        let _selected = setChild?.items?.filter((i: any) => i?.selected);
                                        let _items = [];
                                        _selected?.forEach((item: any) => {
                                            let __obj = { value: item?.value };
                                            if (item?.hasSpecification) {
                                                __obj = {
                                                    ...__obj,
                                                    [`${item?.specification?.id}`]: item?.specification?.value,
                                                };
                                            }
                                            _items?.push(__obj);
                                        });
                                        structuredSetChild = {
                                            ...structuredSetChild,
                                            [setChild?.id]: _items,
                                        };
                                    }
                                    else {
                                        if (typeof (value) === 'object' && !!value) {
                                            var structuredGrandchild = {};
                                            value.forEach((grandchild: any) => {
                                                structuredGrandchild = {
                                                    ...structuredGrandchild,
                                                    [grandchild?.id]: grandchild?.value,
                                                };
                                            });
                                            value = setChild?.type === 'date'
                                                ? isDateIncomplete()
                                                    ? null
                                                    : structuredGrandchild
                                                : structuredGrandchild;
                                        }
                                        if (setChild?.hasSpecification) value = `${value} • ${form?.find((f: any) => f?.id === parent?.id)?.data?.[index]?.find((f: any) => f?.id === `for-${subChild?.id}`)?.value}`;
                                        if (!setChild?.specification) {
                                            structuredSetChild = {
                                                ...structuredSetChild,
                                                [setChild?.id]: value,
                                            };
                                        }
                                    }
                                }
                            });
                            structuredSubChild = {
                                ...structuredSubChild,
                                [subChild?.id]: structuredSetChild,
                            };
                        }
                        else {
                            var value = subChild?.value;
                            var isDateIncomplete = () => { return value?.some((v: any) => !v?.isValid) };
                            if (subChild?.type === 'option') {
                                let _selected = subChild?.items?.filter((i: any) => i?.selected);
                                let _items = [];
                                _selected?.forEach((item: any) => {
                                    let __obj = { value: item?.value };
                                    if (item?.hasSpecification) {
                                        __obj = {
                                            ...__obj,
                                            [`${item?.specification?.id}`]: item?.specification?.value,
                                        };
                                    }
                                    _items?.push(__obj);
                                });
                                structuredChild = {
                                    ...structuredChild,
                                    [subChild?.id]: _items,
                                };
                            }
                            else {
                                if (typeof (value) === 'object' && !!value) {
                                    var structuredGrandchild = {};
                                    value.forEach((grandchild: any) => {
                                        structuredGrandchild = {
                                            ...structuredGrandchild,
                                            [grandchild?.id]: grandchild?.value,
                                        };
                                    });
                                    value = subChild?.type === 'date'
                                        ? isDateIncomplete()
                                            ? null
                                            : structuredGrandchild
                                        : structuredGrandchild;
                                }
                                if (subChild?.hasSpecification) value = `${value} • ${form?.find((f: any) => f?.id === parent?.id)?.data?.[index]?.find((f: any) => f?.id === `for-${subChild?.id}`)?.value}`;
                                if (!subChild?.specification) {
                                    structuredSubChild = {
                                        ...structuredSubChild,
                                        [subChild?.id]: value,
                                    };
                                }
                            }
                        }
                    });
                    structuredChild?.push(structuredSubChild);
                }
                else { // any changes here should also reflect on IF above
                    var value = child?.value;
                    var isDateIncomplete = () => { return value?.some((v: any) => !v?.isValid) };
                    if (child?.type === 'option') {
                        let _selected = child?.items?.filter((i: any) => i?.selected);
                        let _items = [];
                        _selected?.forEach((item: any) => {
                            let __obj = { value: item?.value };
                            if (item?.hasSpecification) {
                                __obj = {
                                    ...__obj,
                                    [`${item?.specification?.id}`]: item?.specification?.value,
                                };
                            }
                            _items?.push(__obj);
                        });
                        structuredChild = {
                            ...structuredChild,
                            [child?.id]: _items,
                        };
                    }
                    else {
                        if (typeof (value) === 'object' && !!value) {
                            var structuredGrandchild = {};
                            value.forEach((grandchild: any) => {
                                structuredGrandchild = {
                                    ...structuredGrandchild,
                                    [grandchild?.id]: grandchild?.value,
                                };
                            });
                            value = child?.type === 'date'
                                ? isDateIncomplete()
                                    ? null
                                    : structuredGrandchild
                                : structuredGrandchild;
                        }
                        if (child?.hasSpecification) value = `${value} • ${form?.find((f: any) => f?.id === parent?.id)?.data?.find((f: any) => f?.id === `for-${child?.id}`)?.value}`;
                        if (!child?.specification) {
                            structuredChild = {
                                ...structuredChild,
                                [child?.id]: value,
                            };
                        }
                    }
                }
            });
            structuredParent = {
                ...structuredParent,
                [parent?.id]: structuredChild,
            };
        }
    });
    return structuredParent;
};
const BULK_PROCESS = {
    label: "Bulk Application",
    value: "bulk-application",
};

const SINGLE_PROCESS = {
    label: "Single Application",
    value: "single-application",
};
const ApplicationNav = ({ route }: any) => {
    LogBox.ignoreAllLogs();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const DRAFT_KEY = 'APPLICATION_DRAFT';
    const [formResetKey, setFormResetKey] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const user = useSelector((state: RootStateOrAny) => state?.user?.session);
    const biometricsLogin = useSelector((state: RootStateOrAny) => state?.user?.biometrics);
    const split = useSelector((state: RootStateOrAny) => state?.theme?.split);
    const bulkApplications = useSelector((state: RootStateOrAny) => state?.theme?.bulkApplications);
    const bulkApplication = useSelector((state: RootStateOrAny) => state?.theme?.bulkApplication);
    const selectedService = useSelector((state: RootStateOrAny) => state?.service?.selectedService);
    const stateApplication = useSelector((state: RootStateOrAny) => state?.application) || {};

    const editApplication = route?.params?.edit;
    const renewApplication = route?.params?.renew;
    const FOR_EDITING = editApplication || renewApplication;

    const onSplit = useCallback(() => {
        dispatch(setSplit(!split));
        setCurrentStep(6);
    }, [dispatch, split]);

    const handleEditBulkApplication = useCallback((id: string) => {
        const applicationToEdit = bulkApplications.find((app: any) => app.id === id);
        if (applicationToEdit && applicationToEdit.application) {
            const {
                form: f,
                applicationCart: ac,
                region: r,
                schedule: s,
                applicationType: at,
                examineeType: et,
                entityType: ent,
                alternateRequirements: ar,
                useDifferentAddress: uda,
                office: o,
            } = applicationToEdit.application;

            setForm(f);
            dispatch(setApplicationCart(ac));
            setRegion(r);
            setSchedule(s);
            setApplicationType(at);
            setExamineeType(et);
            setEntityType(ent);
            setAlternateRequirements(ar);
            setUseDifferentAddress(uda);
            setOffice(o || {});
            setCurrentStep(3);
        }
    }, [bulkApplications, dispatch]);

    const handleRemoveBulkApplication = useCallback((id: string) => {
        Alert.alert(
            "Remove Application",
            "Are you sure you want to remove this application from the bulk list?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => dispatch(deleteBulkApplication(id)) }
            ]
        );
    }, [dispatch]);
    const [enableBiometrics, setEnableBiometrics] = useState(false);
    useEffect(() => {
        if (biometricsLogin) setEnableBiometrics(true);
        else setEnableBiometrics(false);
    }, [biometricsLogin]);


    useEffect(() => {
        return () => {
            setCurrentStep(0)
        }
    }, [])
    const { destroy } = useOneSignal();
    const onLogout = () => {
        if (!enableBiometrics) resetCredentials();
        setTimeout(() => {
            navigation.dispatch((state: RootStateOrAny) => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login', params: { loggedOut: true } }],
                });
            });
        }, 500);
        setTimeout(() => {
            dispatch(logoutUser());
            destroy();
        }, 1000);
    };

    const [bulkApplicationReview, setBulkApplicationReview] = useState(false);
    const [bulkEntryMethod, setBulkEntryMethod] = useState<'manual' | 'excel'>('manual');

    const applicationProcess = stateApplication?.applicationProcess;

    const app = async () => {
        if (bulkApplication.form) {
            const {
                form: f,
                applicationCart: ac,
                currentStep: cs,
                region: r,
                schedule: s,
                applicationType: at,
                examineeType: et,
                entityType: ent,
                alternateRequirements: ar,
                useDifferentAddress: uda,
                office: o,
            } = bulkApplication;

            setForm(f);
            dispatch(setApplicationCart({ ...(ac || {}), id: bulkApplication.id }));
            setRegion(r);
            setSchedule(s);
            setApplicationType(at);
            setExamineeType(et);
            setEntityType(ent);
            setAlternateRequirements(ar);
            setUseDifferentAddress(uda);
            setOffice(o || {});
            if (bulkApplication.action == "review") {
                setCurrentStep(bulkApplication.currentStep ?? 5)
                setBulkApplicationReview(true)
            } else {
                setCurrentStep(bulkApplication.currentStep ?? 2)
                setBulkApplicationReview(false)
            }


        }

    }
    useEffect(() => {
        app()
    }, [bulkApplication])
    const isGuest = useGuest();

    const savedApplication = route?.params?.application;

    const sv = savedApplication?.service;
    const currentAT = sv?.applicationType;
    const allATs = sv?.applicationTypes ?? [];

    const idx =
        savedApplication?.service
            ? allATs.findIndex((t: any) =>
                t?.label === currentAT.label &&
                t?.formCode === currentAT.formCode &&
                t?.serviceCode === currentAT.serviceCode &&
                t?.sequenceCode === currentAT.sequenceCode
            )
            : -1;

    if (idx >= 0 && currentAT) {
        const tplReqs = allATs[idx]?.requirements ?? [];
        const currReqs = currentAT.requirements ?? [];

        const isSameRequirements =
            tplReqs.length === currReqs.length &&
            tplReqs.every((tpl: any, i: number) => tpl?.key === currReqs[i]?.key);
        if (!isSameRequirements) {
            const currentByKey = new Map(currReqs.map((r: any) => [r?.key, r]));
            savedApplication.service.applicationType.requirements = tplReqs.map((tpl: any) => currentByKey.get(tpl?.key) ?? tpl);
        }
    }


    const AT = renewApplication && !!savedApplication?.renew?.applicationType ? savedApplication?.renew?.applicationType : (savedApplication?.service?.applicationType || {});
    const [formGenerated, setFormGenerated] = useState(savedApplication ? true : false);
    const [formApplicationProcess, setFormApplicationProcess] = useState({});




    const {
        list,
        applicationCart,
        saveApplicationSuccess,
        saveApplicationError,
        savingApplication,
        saveBulkApplicationSuccess,
        saveBulkApplicationError,
        savingBulkApplication,
        batchApplications,
        uploadingRequirement,
        uploadRequirementError,

        regions,
        fetchingRegions,
        schedules,
        fetchingSchedules,
        provinces,
        fetchingProvinces,
        cities,
        fetchingCities,
        barangays,
        fetchingBarangays,

        fetchSOASuccess,
        fetchSOAError,
        fetchingSOA,
        soa,
    } = stateApplication;







    const onSaveApplicationSuccess = () => {
        try {
            async function f() {
                const existing = await AsyncStorage.getItem("DRAFT_NAME");
                if (existing) {
                    AsyncStorage.removeItem(existing);
                }
            }
            f()

        } catch (e) {

        }

        let applicant = list?.[0]?.applicant || {};
        let applicantFn = (_a: any) => {
            Object?.keys(_a).forEach((k) => (!_a[k] || k === '_id' || k === 'userId' || k === 'contactNumber' || k === 'email') && delete _a[k]);
            return _a;
        };
        applicant = applicantFn(applicant);
        let newUser = {
            ...user,
            ...applicant,
            applicant: {
                ...user?.applicant,
                ...applicant,
            },
        };
        setCompleted(true);
        // dispatch(setUser(newUser));

    }


    useEffect(() => {
        if (saveApplicationSuccess || saveBulkApplicationSuccess) {
            onSaveApplicationSuccess();

            setShowFeedbackModal(false);
            if (applicationProcess?.value !== 'bulk-application') {
                setShowSuccess(true);
            }
            setFeedbackStatus('success');
            setFeedbackMessage(
                saveBulkApplicationSuccess
                    ? 'Your bulk applications have been submitted successfully.'
                    : 'Your application has been submitted successfully.'
            );
        }
    }, [saveApplicationSuccess, saveBulkApplicationSuccess]);

    useEffect(() => {
        if (saveApplicationError || saveBulkApplicationError) {
            setFeedbackStatus('error');
            setFeedbackMessage(
                (saveApplicationError?.msg || saveBulkApplicationError?.msg) ||
                'An error occurred while submitting your application.'
            );
            setAgree(false);
            setReviewed(false);
            setCompleted(false);
        }
    }, [saveApplicationError, saveBulkApplicationError]);

    /**fore processes */
    // Bolt: Memoized getNTCServices to prevent it from being recreated on every render
    const getNTCServices = useCallback(({
        kind = '', // 'service' or 'type'
        key = '', // module
        name = '', // service
    }) => {
        let _module = NTCServicesList?.find(mod => { return mod?.key === key; });
        if (kind === 'service') {
            let _serviceItems = [];
            _module?.data?.forEach((service: any) => {
                if (service?.serviceCode !== 'service-21') { // ctc
                    _serviceItems?.push({
                        label: service?.name,
                        value: service?.name,
                    });
                }
            });
            return _serviceItems;
        }
        else if (kind === 'type') {
            let _service = _module?.data?.find(ser => ser?.name === name);
            let _typeItems = [];
            _service?.applicationTypes?.forEach(type => {
                _typeItems?.push({
                    label: type?.label,
                    value: type?.label,
                });
            });
            return _typeItems;
        }
    }, []);


    /**step1: none */

    /**step2 */
    const [open, setOpen] = useState(true);
    const [region, setRegion] = useState<any>({});
    const [office, setOffice] = useState<any>({});
    const [offices, setOffices] = useState([
        { label: "Central Office", value: "central-office" },
        { label: "Regional Office", value: "regional-office" },
    ]);
    const [fetchingOffices, setFetchingOffices] = useState(false);
    const fetchRegionalOffices = useCallback(async (regionCode: string) => {
        if (!regionCode) return;

        try {
            setFetchingOffices(true);

            const response = await fetch(
                `${BASE_URL}/v2/regional-configuration/${String(regionCode).trim().toUpperCase()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(user?.sessionToken
                            ? { Authorization: `Bearer ${user.sessionToken}` }
                            : {}),
                    },
                }
            );

            const json = await response.json();

            if (!response.ok || !json?.success) {
                throw new Error(json?.message || 'Failed to load offices.');
            }

            const branches = json?.data?.branches || [];

            const officeItems = branches.map((branch: any) => ({
                label: branch.branchName,
                value: branch.branchCode,
                type: branch.type,
                raw: branch,
            }));

            setOffices(officeItems);

            if (officeItems.length === 1) {
                setOffice(officeItems[0]);
            }
        } catch (error) {
            console.warn('Failed to fetch offices:', error);

            setOffices([
                { label: 'Central Office', value: 'central-office' },
                { label: 'Regional Office', value: 'regional-office' },
            ]);
        } finally {
            setFetchingOffices(false);
        }
    }, [user?.sessionToken]);
    const [applicationProcessTypes, setApplicationProcessTypes] = useState(
        [
            {
                label: "Single Application",
                value: "single-application",
            },
            {
                label: "Bulk Application",
                value: "bulk-application",
            }

        ]
    )

    const [schedule, setSchedule] = useState({});
    useEffect(() => {
        if (!!region?.value) {
            let r = { regionCode: region?.value };

            if (service?.serviceCode === 'service-1') {
                dispatch(fetchSchedules(r));
            }

            dispatch(fetchProvinces(r));

            setOffice({});
            fetchRegionalOffices(region?.value);

            if (FOR_EDITING && !formFilledIn) {
                if (!AT.element) {
                    AT.element = savedApplication?.service?.applicationType?.element;
                }

                handleChangeApplicationType(AT);
            }
        }
    }, [region]);
    useEffect(() => {
        if (
            FOR_EDITING &&
            schedules?.length > 0 &&
            Object?.keys(!!savedApplication?.schedule ? savedApplication?.schedule : {}).length > 0
        ) {
            setSchedule({
                ...savedApplication?.schedule,
                region,
            });
        }
    }, [schedules]);

    /**step3 */
    const [service, setService] = useState(FOR_EDITING ? savedApplication?.service : selectedService);
    const [applicationType, setApplicationType] = useState(cloneDeep(applicationCart?.service?.applicationType || {}));
    const [examineeType, setExamineeType] = useState(cloneDeep(applicationCart?.service?.examineeType || {}));
    const [entityType, setEntityType] = useState(cloneDeep(applicationCart?.service?.entityTypes || service?.entityType?.entityType || {}));
    const [renew, setRenew] = useState({});
    const handleChangeApplicationType = useCallback((value: any, options: { blankApplicant?: boolean } = {}) => {
        //setFormApplicationProcess(applicationProcessType)

        let { serviceCode, formCode, label, modificationDueTos } = value;
        const cartApplicant = options.blankApplicant ? null : applicationCart?.applicant;

        const targetUser = options.blankApplicant ? {
            _id: user?._id,
            sessionToken: user?.sessionToken,
            email: '',
            contactNumber: '',
            firstName: '',
            lastName: '',
            middleName: '',
            suffix: '',
            sex: '',
            nationality: '',
            dateOfBirth: '',
            applicant: {
                address: {},
                education: {},
                contact: {},
            }
        } : (cartApplicant ? {
            ...user,
            ...cartApplicant,
            contactNumber: cartApplicant?.contact?.contactNumber || user?.contactNumber || '',
            email: cartApplicant?.contact?.email || user?.email || '',
            applicant: cartApplicant
        } : user);

        let newForm = cloneDeep(
            NTCServicesConfig({
                formCode,
                user: targetUser,
                applicant: options.blankApplicant ? undefined : (savedApplication?.applicant || cartApplicant),
            })
        ) || [];
        let isModify = label?.toLowerCase()?.match('modification') || label?.toLowerCase()?.match('modify');
        let isRenewal = label?.toLowerCase()?.match('renewal') || label?.toLowerCase()?.match('renew');
        let isNew = label?.toLowerCase()?.match('new') && !isRenewal;
        let isServiceCodeNoOfYearsIsOne = serviceCode == "MPRRP";




        let insert = (
            id: string = '',
            title: string = '',
            alternativeTitle: string = '',
            data: any = [],
            type = '',
        ) => {
            let applicationTypeIndex = newForm?.findIndex((f: any) => f?.id === id);
            if (applicationTypeIndex > -1) newForm[applicationTypeIndex].data?.splice(0, 0, data[0]);
            else {
                let toInsert = {
                    id,
                    title,
                    alternativeTitle,
                    data,
                };
                if (type === 'list') {
                    toInsert = {
                        ...toInsert,
                        type,
                        template: data?.[0] || {},
                    };
                }
                newForm.splice(0, 0, toInsert);
            }
        };
        let cert = formCode === 'ntc1-ctc-certificate' || formCode === 'ntc1-21-certificate';
        let lice = formCode === 'ntc1-ctc-license' || formCode === 'ntc1-21-license';
        let perm = formCode === 'ntc1-ctc-permit' || formCode === 'ntc1-21-permit';
        if (cert || lice || perm) {
            let items = getNTCServices({
                kind: 'service',
                key: cert ? 'certificates' : lice ? 'licenses' : perm ? 'permits' : '',
            });
            insert(
                'details',
                'Details',
                'Details',
                [{
                    type: 'dropdown',
                    items: [],
                    id: 'type',
                    label: 'Type',
                    placeholder: 'Type',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please select a type',
                }]
            );
            insert(
                'details',
                'Details',
                'Details',
                [{
                    type: 'dropdown',
                    items,
                    id: 'service',
                    label: 'Service',
                    placeholder: 'Service',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please select a service',
                    hasDependent: true,
                }]
            );
        }

        if (isRenewal || isModify) {
            let _sname = service?.name?.toLowerCase();
            let _kind = _sname?.match('certificate')
                ? 'Certificate'
                : _sname?.match('license')
                    ? 'License'
                    : _sname?.match('permit')
                        ? 'Permit'
                        : _sname?.match('accreditation')
                            ? 'Accreditation'
                            : 'Document';
            let _key = _kind?.toLowerCase();
            insert(
                _key,
                _kind,
                _kind,
                [{
                    type: 'date',
                    id: 'dateOfExpiry',
                    label: 'Date of Expiry',
                    value: [
                        {
                            id: 'year',
                            value: currentYear,
                            isValid: true,
                        },
                        {
                            id: 'month',
                            value: '',
                            isValid: false,
                        },
                        {
                            id: 'day',
                            value: '',
                            isValid: false,
                        },
                    ],
                    required: true,
                }]
            );
            insert(
                _key,
                _kind,
                _kind,
                [{
                    id: `${_key}Number`,
                    label: `${_kind} No.`,
                    placeholder: `${_kind} No.`,
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: `Please enter ${_key} no.`,
                }]
            );
        }

        if (formCode === 'ntc1-19') {
            // insert(
            //   'applicationDetails',
            //   value?.label,
            //   'Details',
            //   [
            //     [
            //       {
            //         type: 'dropdown',
            //         items: [
            //           {label: 'Wireless Data Network (WDN) Devices - Indoor', value: 'Wireless Data Network (WDN) Devices - Indoor'},
            //           {label: 'Short Range Devices (SRD)', value: 'Short Range Devices (SRD)'},
            //           {
            //             label: 'Radio Frequency Identification (RFID) Devices',
            //             value: 'Radio Frequency Identification (RFID) Devices',
            //             hasSpecification: true,
            //             specification: {
            //               type: 'dropdown',
            //               items: [
            //                 {label: 'Low Power', value: 'Low Power'},
            //                 {label: 'High Power', value: 'High Power'}
            //               ],
            //               id: 'for-typeOfEquipmentDevice',
            //               label: 'Power',
            //               placeholder: 'Power',
            //               value: '',
            //               hasValidation: true,
            //               required: true,
            //               isValid: false,
            //               error: '',
            //               errorResponse: 'Please select power',
            //               specification: true,
            //             }
            //           },
            //           {label: 'Short Range Radio Service (SRRS) Devices', value: 'Short Range Radio Service (SRRS) Devices'},
            //           {label: 'Public Trunked Radio Equipment (Mobile/Portable)', value: 'Public Trunked Radio Equipment (Mobile/Portable)'},
            //         ],
            //         id: 'typeOfEquipmentDevice',
            //         label: 'Type of Equipment/Device',
            //         placeholder: 'Type of Equipment/Device',
            //         value: '',
            //         hasValidation: true,
            //         required: false,
            //         isValid: true,
            //         error: '',
            //         errorResponse: 'Please select type of equipment/device',
            //       },
            //     ]
            //   ],
            //   'list',
            // );
            // if (
            //   label?.toLowerCase()?.match('dealer') &&
            //   !label?.toLowerCase()?.match('non-dealer')
            // ) {
            //   insert(
            //     'credentials',
            //     'Credentials',
            //     'Credentials',
            //     [{
            //       id: 'cpcnPaRslNumber',
            //       label: 'CPCN/PA/RSL No.',
            //       placeholder: 'CPCN/PA/RSL No.',
            //       value: '',
            //       hasValidation: true,
            //       required: true,
            //       isValid: false,
            //       error: '',
            //       errorResponse: 'Please enter CPCN/PA/RSL no.',
            //     }]
            //   );
            // }
            /*else*/ if (label?.toLowerCase()?.match('non-dealer')) {
                insert(
                    'credentials',
                    'Credentials',
                    'Credentials',
                    [{
                        id: 'invoiceNumber',
                        label: 'Invoice No.',
                        placeholder: 'Invoice No.',
                        value: '',
                        hasValidation: true,
                        required: true,
                        isValid: false,
                        error: '',
                        errorResponse: 'Please enter invoice no.',
                    }]
                );
            }
        }

        if (
            formCode === 'ntc1-18' &&
            serviceCode === 'CPE'
        ) {
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    type: 'dropdown',
                    items: [
                        {
                            value: 'Mobile',
                            label: 'Mobile',
                        },
                        {
                            value: 'Non-Mobile',
                            label: 'Non-Mobile',
                        },
                    ],
                    id: 'variation',
                    label: 'Variation',
                    placeholder: 'Variation',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please select variation',
                }]
            );
        }

        if (
            formCode === 'ntc1-18' &&
            applicationCart?.serviceCode === 'service-14' &&
            label?.toLowerCase()?.match('dealer')
        ) {
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    type: 'dropdown',
                    items: [
                        {
                            value: 'Radio Transmitter/Transceiver',
                            label: 'Radio Transmitter/Transceiver',
                        },
                        {
                            value: 'WDN Indoor/SRD/RFID',
                            label: 'WDN Indoor/SRD/RFID',
                        },
                    ],
                    id: 'type',
                    label: 'Type',
                    placeholder: 'Type',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please select type',
                }]
            );
        }

        if (
            formCode === 'ntc1-18' &&
            service?.serviceCode === 'service-15' &&
            label?.toLowerCase()?.match('dealer')
        ) {
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    type: 'dropdown',
                    items: [
                        {
                            value: 'Main',
                            label: 'Main',
                        },
                        {
                            value: 'Branch',
                            label: 'Branch',
                        },
                    ],
                    id: 'variation',
                    label: 'Variation',
                    placeholder: 'Variation',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please select variation',
                }]
            );
        }

        if (formCode === 'ntc1-16') {
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    id: 'placeOfOrigin',
                    label: 'Place of Origin',
                    placeholder: 'Place of Origin',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please select place of origin',
                }]
            );
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    id: 'destination',
                    label: 'Destination',
                    placeholder: 'Destination',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please enter destination',
                }]
            );
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    id: 'purpose',
                    label: 'Purpose',
                    placeholder: 'Purpose',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please enter purpose',
                }]
            );
        }

        if (
            label?.toLowerCase()?.match('call sign') &&
            formCode?.match('ntc1-03')
        ) {
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    id: 'preferredCallSign',
                    label: 'Preferred Call Sign/s',
                    placeholder: 'Preferred Call Sign/s',
                    value: '',
                    hasValidation: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please enter preferred call sign',
                }]
            );
        }

        if (
            label?.toLowerCase()?.match('club')
        ) {
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    id: 'clubTrusteeName',
                    label: 'Name of Club Trustee',
                    placeholder: 'Name of Club Trustee',
                    value: user?.applicantName || '',
                    hasValidation: true,
                    required: true,
                    isValid: !!user?.applicantName,
                    error: '',
                    errorResponse: 'Please enter name of club',
                }]
            );
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    id: 'clubName',
                    label: 'Name of Club',
                    placeholder: 'Name of Club',
                    value: user?.applicant?.companyName || '',
                    hasValidation: true,
                    required: true,
                    isValid: !!user?.applicant?.companyName,
                    error: '',
                    errorResponse: 'Please enter name of club',
                }]
            );
        }

        if (isModify) {
            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [{
                    type: 'dropdown',
                    items: modificationDueTos || [],
                    id: 'modificationDueTo',
                    label: 'Modification due to',
                    placeholder: 'Modification due to',
                    value: '',
                    hasValidation: true,
                    required: true,
                    isValid: false,
                    error: '',
                    errorResponse: 'Please select modification reason',
                }]
            );
        }

        if (
            (
                formCode?.match('ntc1-02') ||
                formCode?.match('ntc1-03') ||
                formCode?.match('ntc1-04') ||
                formCode?.match('ntc1-11') ||
                formCode?.match('ntc1-18') ||
                formCode?.match('ntc1-20') ||
                formCode?.match('ntc1-22')
            ) &&
            !isModify
        ) {
            let _items = [{ label: '1', value: '1' }];
            if (serviceCode?.toLowerCase()?.match('rlm')) {
                _items = [
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' },
                    { label: '5', value: '5' }
                ];
            }
            else if (serviceCode?.toLowerCase()?.match('purchase')) {
                _items = [{ label: '60 days', value: '60 days' }];
            }
            else if (!isServiceCodeNoOfYearsIsOne && (isRenewal || isNew)) {

                _items?.push({ label: '2', value: '2' });
                _items?.push({ label: '3', value: '3' });
            }

            insert(
                'applicationDetails',
                value?.label,
                'Details',
                [
                    {
                        type: 'dropdown',
                        items: _items,
                        id: 'noOfYears',
                        label: 'No. of years',
                        placeholder: 'No. of years',
                        value: '',
                        hasValidation: true,
                        required: true,
                        isValid: false,
                        error: '',
                        errorResponse: 'Please select no. of years',
                        validate: validateNumber,
                    },
                ]
            );
        }

        if (isNew) {
            /**not dynamic, for callSign only */

            let newCallSign = {
                value: 'To be assigned by NTC',
                editable: false,
                required: false,
            };

            let callSignIndex = newForm?.findIndex(s => s?.id === 'callSign');
            if (callSignIndex > -1) {
                let _callSignIndex = newForm[callSignIndex]?.data?.findIndex(s => s?.id === 'callSign');
                if (_callSignIndex > -1) {
                    newForm[callSignIndex].data[_callSignIndex] = {
                        ...newForm?.[callSignIndex]?.data?.[_callSignIndex],
                        ...newCallSign,
                    };
                }
            };

            let particularsIndex = newForm?.findIndex(s => s?.id === 'particulars');
            if (particularsIndex > -1) {
                let equipmentsIndex = newForm?.[particularsIndex]?.template?.findIndex(s => s?.id === 'equipments' || s?.id === 'proposedEquipments');
                if (equipmentsIndex > -1) {
                    let _callSignIndex = newForm?.[particularsIndex]?.template?.[equipmentsIndex]?.template?.findIndex(s => s?.id === 'callSign');
                    if (_callSignIndex > -1) {
                        let oldCallSign = cloneDeep(newForm?.[particularsIndex]?.template?.[equipmentsIndex]?.template?.[_callSignIndex] || {});
                        let newCSObj = { ...oldCallSign, ...newCallSign };
                        if (newForm?.[particularsIndex]?.template?.[equipmentsIndex]?.template?.[_callSignIndex]) newForm[particularsIndex].template[equipmentsIndex].template[_callSignIndex] = newCSObj;
                        if (newForm?.[particularsIndex]?.template?.[equipmentsIndex]?.data?.[0]?.[_callSignIndex]) newForm[particularsIndex].template[equipmentsIndex].data[0][_callSignIndex] = newCSObj;
                        if (newForm?.[particularsIndex]?.data?.[0]?.[equipmentsIndex]?.template?.[_callSignIndex]) newForm[particularsIndex].data[0][equipmentsIndex].template[_callSignIndex] = newCSObj;
                        if (newForm?.[particularsIndex]?.data?.[0]?.[equipmentsIndex]?.data?.[0]?.[_callSignIndex]) newForm[particularsIndex].data[0][equipmentsIndex].data[0][_callSignIndex] = newCSObj;
                    }
                }
            }

        }

        let __add = newForm?.findIndex(f => f?.id === 'address');
        if (__add > -1) setOrigAdd(newForm[__add]);

        /**for service renewal */
        if (isNew || isModify) {
            let renewLabel = label?.replace(`(${isNew ? 'NEW' : 'MODIFICATION'})`, '(RENEWAL)');
            let renewAT = service?.applicationTypes?.find((i: any) => renewLabel.indexOf(i?.label) > -1);
            if (renewAT) setRenew({ ...renew, applicationType: renewAT });
        }
        if (renewApplication) setRenew({ ...renew, renewedFrom: savedApplication?._id });

        if (isGuest) {
            let basicIndex = newForm?.findIndex((i: any) => i?.id === 'basic');
            let insertId = () => {
                insert(
                    'basic',
                    'Basic Info',
                    'Basic Info',
                    [{
                        id: 'userId',
                        value: user?._id,
                        required: true,
                        isValid: true,
                        error: '',
                        hidden: true,
                    }]
                );
            };
            let insertCompanyName = () => {
                insert(
                    'basic',
                    'Basic Info',
                    'Basic Info',
                    [{
                        id: 'companyName',
                        label: 'Applicant',
                        placeholder: 'Applicant',
                        value: '',
                        hasValidation: true,
                        required: true,
                        isValid: false,
                        error: '',
                        errorResponse: 'Please enter applicant',
                    }]
                );
            };
            if (basicIndex > -1) {
                let companyNameIndex = newForm[basicIndex]?.data?.findIndex((i: any) => i?.id === 'companyName');
                let lastNameIndex = newForm[basicIndex]?.data?.findIndex((i: any) => i?.id === 'lastName');
                let idIndex = newForm[basicIndex]?.data?.findIndex((i: any) => i?.id === 'userId');
                if (companyNameIndex < 0 && lastNameIndex < 0) insertCompanyName();
                if (idIndex < 0) insertId();
            }
            else insertCompanyName();
        }
        if (value) {
            setApplicationType(value);
        }

        setForm(newForm);

    }, [user, savedApplication, service, isGuest, renew, applicationCart, getNTCServices]);

    const handleChangeElement = useCallback((value: any) => {
        if (value) {
            setApplicationType((prev: any) => ({
                ...prev,
                element: value,
            }));
        }

    }, []);

    const handleChangeExamineeType = useCallback((value: any) => {
        setExamineeType(value);
        if (value?.key === 're-taker' || value?.label === 'Re-taker') {
            setAlternateRequirements([]);
        }
    }, []);

    const handleChangeEntityType = useCallback((value: any) => {
        setEntityType(value);
    }, []);


    /**step4 */
    const [form, setForm] = useState([]);
    const [formFilledIn, setFormFilledIn] = useState(false);
    const [useDifferentAddress, setUseDifferentAddress] = useState(false);
    const [udaAlert, setUDAAlert] = useState({
        title: 'Use Different Address',
        message: 'Using a different address will not affect the original.',
        active: false,
        alerted: false,
        onConfirm: () => {
            setUDAAlert({
                ...udaAlert,
                active: false,
                alerted: true,
            });
        }
    });
    const [logoutAlert, setLogoutAlert] = useState({
        title: 'Session Expired',
        message: 'It seems like you have been out for quite some time now. You will be redirected to the login page.',
        active: false,
        alerted: false,
        onConfirm: () => {
            setLogoutAlert({
                ...logoutAlert,
                active: false,
                alerted: true,
            });
            setTimeout(() => {
                onLogout();
            }, 300)
        }
    });
    const [origAdd, setOrigAdd] = useState({});
    const [key, setKey] = useState(0);
    const keyRef = useRef(key);
    keyRef.current = key;
    const applicationProcessRef = useRef(applicationProcess);
    applicationProcessRef.current = applicationProcess;
    const bulkApplicationsRef = useRef(bulkApplications);
    bulkApplicationsRef.current = bulkApplications;
    const saveDraft = useMemo(() =>
        debounce(async (draft) => {
            if (applicationProcessRef.current?.value == "single-application") {
                try {
                    var service = `${DRAFT_KEY}_${draft?.examineeType?.key}_${draft?.applicationType?.element}_${draft?.applicationType?.formCode}_${draft?.applicationType?.label}_${draft?.applicationType?.sequenceCode}_${draft?.applicationType?.serviceCode}_${draft?.region?.code}`;
                    const existing = await AsyncStorage.getItem(service);

                    if ((bulkApplicationsRef.current?.length ?? 0) == 0 && true?.length == 0 && draft?.currentStep >= 3 && !FOR_EDITING) {
                        if (keyRef.current == 0 && existing && JSON.parse(existing)?.form?.length > 0) {
                            setKey(1)
                            const {
                                form: f,
                                applicationCart: ac,
                                currentStep: cs,
                                region: r,
                                schedule: s,
                                applicationType: at,
                                examineeType: et,
                                entityType: ent,
                                alternateRequirements: ar,
                                useDifferentAddress: uda,
                                office: o,
                            } = JSON.parse(existing);
                            setForm(f);
                            dispatch(setApplicationCart(ac));
                            setRegion(r);
                            setSchedule(s);
                            setApplicationType(at);
                            setExamineeType(et);
                            setEntityType(ent);
                            setAlternateRequirements(ar);
                            setUseDifferentAddress(uda);
                            setOffice(o || {});
                            await AsyncStorage.setItem(service, existing);
                        }
                        else {
                            await AsyncStorage.setItem(service, JSON.stringify(draft));
                            await AsyncStorage.setItem("DRAFT_NAME", service);
                            await AsyncStorage.setItem("IS_SAVE", "1");
                        }
                    }




                } catch (err) {
                    console.warn('Failed to save draft', err);
                }
            }

        }, 500)
        , [form]);

    const onUseDifferentAddress = useCallback(() => setUseDifferentAddress((prev) => !prev), []);
    const _onAdd = useCallback(({
        parentId, // main parent id from the form
        template,
        setParentId,
        setParentIndex,
    }: any) => {
        setForm((prevForm) => {
            let _form = cloneDeep(prevForm || []);
            let parentIndex = _form?.findIndex((f: any) => f?.id === parentId);
            if (parentIndex > -1) {
                if (setParentId) { // has a set
                    let setIndex = _form[parentIndex]?.data?.[setParentIndex]?.findIndex((f: any) => f?.id === setParentId);
                    if (setIndex > -1) _form[parentIndex]?.data?.[setParentIndex]?.[setIndex]?.data?.push(template);
                }
                else _form[parentIndex]?.data?.push(template);
                return _form;
            }
            return prevForm;
        });
    }, []);
    const _onRemove = useCallback(({
        parentId,
        index,
        setParentId,
        setParentIndex,
    }: any) => {
        setForm((prevForm) => {
            let _form = [...prevForm];
            let parentIndex = _form?.findIndex((f: any) => f?.id === parentId);
            if (parentIndex > -1) {
                if (setParentId) { // has a set
                    let setIndex = _form[parentIndex]?.data?.[setParentIndex]?.findIndex((f: any) => f?.id === setParentId);
                    if (setIndex > -1) {
                        const newData = [..._form[parentIndex].data[setParentIndex]];
                        const subData = [...newData[setIndex].data];
                        subData.splice(index, 1);
                        newData[setIndex] = { ...newData[setIndex], data: subData };
                        _form[parentIndex].data[setParentIndex] = newData;
                    }
                }
                else {
                    const newData = [..._form[parentIndex].data];
                    newData.splice(index, 1);
                    _form[parentIndex] = { ..._form[parentIndex], data: newData };
                }
                return _form;
            }
            return prevForm;
        });
    }, []);


    const validateField = (validate, value) => {
        const validateName = validate?.name;

        if (validateName === "validateNumber") {
            return validateNumber(value);
        } else if (validateName === "validateEmail") {
            return validateEmail(value);
        } else if (validateName === "validatePhone") {
            return validatePhone(value);
        } else if (validateName === "validateZipCode") {
            return validateZipCode(value);
        } else if (validateName === "validateIMEI") {
            return validateIMEI(value);
        } else if (validateName === "validateDate") {
            return validateDate(value);
        } else if (validateName === "validateYear") {
            return validateYear(value);
        } else if (validateName === "validatePassword") {
            return validatePassword(value);
        } else if (validateName === "validateText") {
            return validateText(value);
        } else {
            return validate(value);
        }
    }



    // Bolt: Wrapped onFormUpdate in useCallback with functional state updates to keep the handler stable across renders
    const onFormUpdate = useCallback(({
        parentId, // main parent ex.basic-info
        id, // child id ex.firstName, lastName
        subId, // grandchild id ex.year,month,date (for fields like date with sub-data)
        value, // could be string (textinput), object (type:dropdown, value.value), array (type:date, value.$.id:year,month,date)
        type, // field type ex.dropdown,date
        validate,
        errorResponse,
        index, // for type list only
        hasDependent,
        option, // if field is a specification of an item in options
        subParentId, // for options field; parent
        subIndex, // for options field; parent
        setParentId, // set that has a set
        setIndex, // index of the set (inside the set)
        required,
        keyboardType,
    }: any) => {
        if (value?.requirements) setAlternateRequirements(value?.requirements);

        if (keyboardType === 'decimal-pad') {
            if (typeof value === 'string' || typeof value === 'number') {
                if (value?.match(/\./g)) {
                    let [, decimal] = value.split('.');
                    if (decimal?.length > 4) return; // restrict value to only 2 decimal places
                }
            }

        }
        if (value?.keyboardType === 'decimal-pad') {
            if (value?.value) {
                if (value?.value?.match(/\./g)) {
                    let [, decimal] = value?.value?.split('.');
                    if (decimal?.length > 4) return; // restrict value to only 2 decimal places
                }
            }

        }

        let hasSpecification = value?.hasSpecification && type !== 'option';
        let specificationValidate = value?.validate;
        let specificationKT = value?.keyboardType;

        let specificationRequired = value?.required
        let { specification, specificationLabel, addSection, section } = value || {};
        var valueRequired = value?.required == null ? value?.required : true;

        setForm((prevForm) => {
            let parentIndex = prevForm?.findIndex((p: any) => p?.id === parentId);

            if (parentIndex > -1) {
                let isParentList = prevForm?.[parentIndex]?.type === 'list'; // for sections with multiple (array) values

                let childIndex = isParentList
                    ? prevForm?.[parentIndex]?.data?.[index]?.findIndex((c: any) => c?.id === (subParentId || (setParentId || id)))
                    : prevForm?.[parentIndex]?.data?.findIndex((c: any) => c?.id === (subParentId || id));

                if (childIndex > -1) {
                    let newForm = cloneDeep(prevForm || []);
                    let preservedValue = value?.value;

                    if (
                        typeof (value) === 'object' &&
                        type !== 'time' &&
                        !!value
                    ) {
                        value =
                            id === 'region' ||
                                id === 'province' ||
                                id === 'city' ||
                                id === 'barangay'
                                ? value?.label
                                : value?.value;
                        if (typeof (value) === 'object') value = value?.value;
                    }

                    let isValid = type === 'time'
                        ? true
                        : (!required && !value)
                            ? true
                            : typeof validate === 'function' && !!value
                                ? validateField(validate, value)
                                : validateText(value);
                    let _typeItems = [];
                    let isFieldService = id === 'service' && hasDependent;
                    if (isFieldService) {
                        let _lVal = value?.toLowerCase();
                        let _key = _lVal?.match('certificate')
                            ? 'certificates'
                            : _lVal?.match('license')
                                ? 'licenses'
                                : _lVal?.match('permit')
                                    ? 'permits'
                                    : '';
                        _typeItems = getNTCServices({
                            kind: 'type',
                            key: _key,
                            name: value,
                        });
                    }

                    if (!!subId) { // add set conditions here

                        let grandchildIndex = isParentList
                            ? newForm?.[parentIndex]?.data?.[index]?.[childIndex]?.value?.findIndex((gc: any) => gc?.id === subId)
                            : newForm?.[parentIndex]?.data?.[childIndex]?.value?.findIndex((gc: any) => gc?.id === subId);

                        if (grandchildIndex > -1) {

                            if (type === 'date') {
                                let getFigure = (d: any) => (`0${d}`).slice(subId === 'year' ? -4 : -2);
                                value = getFigure(value);
                            }

                            // any updates here should also reflect below (else)
                            if (isParentList) {
                                let __obj = newForm[parentIndex].data[index][childIndex].value[grandchildIndex];
                                if (type === 'option') {
                                    let _ndx = __obj?.items?.findIndex((i: any) => i?.value === value);
                                    if (_ndx > -1) __obj.items[_ndx].selected = !__obj?.items[_ndx].selected;
                                }
                                if (option && subIndex) {
                                    __obj.items[subIndex][`${id}`] = {
                                        ...__obj.items[subIndex][`${id}`],
                                        value,
                                        isValid,
                                        error: isValid ? '' : errorResponse,
                                    };
                                }
                                newForm[parentIndex].data[index][childIndex].value[grandchildIndex] = {
                                    ...__obj,
                                    value,
                                    isValid,
                                    error: isValid ? '' : errorResponse,
                                };
                                if (isFieldService) {
                                    newForm[parentIndex].data[index][childIndex].value[grandchildIndex + 1] = {
                                        ...newForm[parentIndex].data[index][childIndex].value[grandchildIndex + 1],
                                        items: _typeItems,
                                        value: '',
                                    };
                                }
                            }
                            else {
                                let __obj = newForm[parentIndex].data[childIndex].value[grandchildIndex];
                                if (type === 'option') {
                                    let _ndx = __obj?.items?.findIndex((i: any) => i?.value === value);
                                    if (_ndx > -1) __obj.items[_ndx].selected = !__obj?.items[_ndx].selected;
                                }
                                if (option && subIndex) {
                                    __obj.items[subIndex][`${id}`] = {
                                        ...__obj.items[subIndex][`${id}`],
                                        value,
                                        isValid,
                                        error: isValid ? '' : errorResponse,
                                    };
                                }
                                newForm[parentIndex].data[childIndex].value[grandchildIndex] = {
                                    ...__obj,
                                    value,
                                    isValid,
                                    error: isValid ? '' : errorResponse,
                                }
                                if (isFieldService) {
                                    newForm[parentIndex].data[childIndex].value[grandchildIndex + 1] = {
                                        ...newForm[parentIndex].data[childIndex].value[grandchildIndex + 1],
                                        items: _typeItems,
                                        value: '',
                                    };
                                }
                            }

                        }

                    }
                    else {

                        // else here; any updates here should also reflect above
                        if (isParentList) {
                            let _mother = [...newForm[parentIndex].data[index]];
                            let _child = { ..._mother[childIndex] };
                            if (!!setParentId) { // if set has a set
                                let _setParentIndex = _mother?.findIndex(d => d?.id === setParentId);
                                if (_setParentIndex > -1) {
                                    let _set = setIndex > -1 // if set is multiple
                                        ? _mother?.[_setParentIndex]?.data?.[setIndex]
                                        : _mother?.[_setParentIndex]?.data;
                                    let _childSetIndex = _set?.findIndex(c => c?.id === id);
                                    if (_childSetIndex > -1) { // whatever changes here, should also reflect below (on else (if not !!setParentId))
                                        let _child = _set[_childSetIndex];
                                        if (type === 'option') {
                                            let _ndx = _child?.items?.findIndex((i: any) => i?.value === value);
                                            if (_ndx > -1) _child.items[_ndx].selected = !_child?.items[_ndx].selected;
                                        }
                                        if (option && subIndex) {
                                            _child.items[subIndex][`${id}`] = {
                                                ..._child.items[subIndex][`${id}`],
                                                value,
                                                isValid,
                                                error: isValid ? '' : errorResponse,
                                            };
                                        }
                                        _child = {
                                            ..._child,
                                            value,
                                            isValid,
                                            error: isValid ? '' : errorResponse,
                                            hasSpecification,
                                        };
                                        _set[_childSetIndex] = _child;
                                        if (isFieldService) {
                                            _set[_childSetIndex + 1] = {
                                                ..._set[_childSetIndex + 1],
                                                items: _typeItems,
                                                value: '',
                                            };
                                        }
                                        if (setIndex > -1) _mother[_setParentIndex].data[setIndex] = _set;
                                        else _mother[_setParentIndex].data = _set;
                                    }
                                }
                            }
                            else { // reflect changes here (if not !!setParentId)
                                if (type === 'option') {
                                    let _ndx = _child?.items?.findIndex((i: any) => i?.value === value);
                                    if (_ndx > -1) _child.items[_ndx].selected = !_child?.items[_ndx].selected;
                                }
                                if (option && subIndex) {
                                    _child.items[subIndex][`${id}`] = {
                                        ..._child.items[subIndex][`${id}`],
                                        value,
                                        isValid,
                                        error: isValid ? '' : errorResponse,
                                    };
                                }
                                _child = {
                                    ..._child,
                                    value,
                                    isValid,
                                    error: isValid ? '' : errorResponse,
                                    hasSpecification,
                                };
                                _mother[childIndex] = _child;
                                if (isFieldService) {
                                    _mother[childIndex + 1] = {
                                        ..._mother[childIndex + 1],
                                        items: _typeItems,
                                        value: '',
                                    };
                                }
                            }
                            newForm[parentIndex].data[index] = _mother;
                        }
                        else {
                            let __obj = newForm[parentIndex].data[childIndex];
                            if (type === 'option') {
                                let _ndx = __obj?.items?.findIndex((i: any) => i?.value === value);
                                if (_ndx > -1) __obj.items[_ndx].selected = !__obj?.items[_ndx].selected;
                            }
                            if (option && subIndex) {
                                __obj.items[subIndex][`${id}`] = {
                                    ...__obj.items[subIndex][`${id}`],
                                    value,
                                    isValid,
                                    error: isValid ? '' : errorResponse,
                                };
                            }
                            newForm[parentIndex].data[childIndex] = {
                                ...__obj,
                                value,
                                isValid,
                                error: isValid ? '' : errorResponse,
                                hasSpecification,
                            };
                            if (isFieldService) {
                                newForm[parentIndex].data[childIndex + 1] = {
                                    ...newForm[parentIndex].data[childIndex + 1],
                                    items: _typeItems,
                                    value: '',
                                };
                            }
                        }

                    }

                    /** if has specification */
                    /** example is selecting 'Others' from dropdown and you need to specify something thru a textinput */
                    let forID = `for-${id}`;
                    let forTextInput = (isParentList ? newForm[parentIndex].data[index] : newForm[parentIndex].data).findIndex((f: any) => f?.id === forID) > -1;
                    let forVPN = (isParentList ? newForm[parentIndex].data[index] : newForm[parentIndex].data).findIndex((f: any) => f?.id === 'vehiclePlateNo') > -1;
                    if (hasSpecification) { /** ANY CHANGES HERE SHOULD ALSO REFLECT TO src/utils/formatting; hasSpecification block */

                        let _specify = specification || {
                            id: forID,
                            label: (specificationLabel || 'Please specify'),
                            placeholder: (specificationLabel || 'Please specify'),
                            value: '',
                            hasValidation: true,
                            required: valueRequired,
                            isValid: false,
                            error: '',
                            errorResponse: `Please enter a valid ${(specificationLabel || 'specification')?.toLowerCase()}`,
                            validate: specificationValidate || validateText,
                            keyboardType: specificationKT || 'default',
                            specification: true,
                        };
                        if (isParentList) {
                            if (!forTextInput) { /**no specification field yet */
                                newForm[parentIndex].data[index].splice(childIndex + 1, 0, _specify); /**regular adding of specification field */
                            }
                            else if (forTextInput) {
                                let __newForm = cloneDeep(newForm || []);
                                __newForm[parentIndex].data[index].splice(childIndex + 1, 1, _specify); /**regular replacing of specification field */
                                newForm = cloneDeep(__newForm || []);
                            }
                        }
                        else {
                            if (!forTextInput) { /**no specification field yet */
                                newForm[parentIndex].data.splice(childIndex + 1, 0, _specify); /**regular adding of VPN field */
                            }
                            else if (forTextInput) {
                                let __newForm = cloneDeep(newForm || []);
                                __newForm[parentIndex].data.splice(childIndex + 1, 1, _specify); /**regular replacing of VPN field */
                                newForm = cloneDeep(__newForm || []);
                            }
                        }
                    }
                    else if (
                        !hasSpecification &&
                        forTextInput
                    ) {
                        if (isParentList) newForm[parentIndex].data[index].splice(childIndex + 1, 1);
                        else newForm[parentIndex].data.splice(childIndex + 1, 1);
                    }

                    /** specifically for ML stationclass only */
                    let _specifyML = {
                        id: 'vehiclePlateNo',
                        label: 'Plate No.',
                        placeholder: 'Plate No.',
                        value: '',
                        hasValidation: true,
                        required: true,
                        isValid: false,
                        error: '',
                        errorResponse: 'Please enter plate no.',
                    };
                    let __i = hasSpecification ? 2 : 1;
                    if (id === 'stationClass') {
                        if (isParentList) {
                            if (value === 'ML' && !forVPN) { /**ML is selected and there is no Vehicle Plate No. (VPN) field yet */
                                newForm[parentIndex].data[index].splice(childIndex + __i, 0, _specifyML); /**adding of VPN field  */
                            }
                            else if (value !== 'ML' && forVPN) { /**ML is not selected and there is a VPN field */
                                newForm[parentIndex].data[index].splice(childIndex + __i, 1); /**removing of VPN field */
                            }
                        }
                        else {
                            if (value === 'ML' && !forVPN) { /**ML is selected and there is no Vehicle Plate No. (VPN) field yet */
                                newForm[parentIndex].data.splice(childIndex + __i, 0, _specifyML); /**adding of VPN field  */
                            }
                            else if (value !== 'ML' && forVPN) { /**ML is not selected and there is a VPN field */
                                newForm[parentIndex].data.splice(childIndex + __i, 1); /**removing of VPN field */
                            }
                        }
                    }

                    let sectionId = `section-${id}`;
                    let sectionTextInput = (isParentList ? newForm[parentIndex].data[index] : newForm[parentIndex].data).findIndex((f: any) => f?.id === sectionId) > -1;
                    if (addSection && section) {
                        let _ndx = newForm?.findIndex(f => f?.id === section?.id);
                        let _del = _ndx > -1 ? 1 : 0;
                        section.sectionId = sectionId;
                        newForm?.splice(parentIndex + 1, _del, section);
                    }
                    else if (!addSection && sectionTextInput) {
                        if (isParentList) newForm[parentIndex].data[index].splice(childIndex + 1, 1);
                        else newForm[parentIndex].data.splice(childIndex + 1, 1);
                    }

                    if (id === 'region') {

                        dispatch(fetchProvinces({ regionCode: preservedValue }));
                        onFormUpdate({
                            parentId, // main parent ex.basic-info
                            id: 'province', // child id ex.firstName, lastName
                            subId: '', // grandchild id ex.year,month,date (for fields like date with sub-data)
                            value: '', // could be string (textinput), object (type:dropdown, value.value), array (type:date, value.$.id:year,month,date)
                            type: 'dropdown', // field type ex.dropdown,date
                            validate,
                            errorResponse: 'Please select a province',
                            index: -1,
                        });
                        onFormUpdate({
                            parentId, // main parent ex.basic-info
                            id: 'city', // child id ex.firstName, lastName
                            subId: '', // grandchild id ex.year,month,date (for fields like date with sub-data)
                            value: '', // could be string (textinput), object (type:dropdown, value.value), array (type:date, value.$.id:year,month,date)
                            type: 'dropdown', // field type ex.dropdown,date
                            validate,
                            errorResponse: 'Please select a city',
                            index: -1,
                        });
                    }
                    else if (id === 'province') {
                        dispatch(fetchCities({ provinceCode: preservedValue }));
                        onFormUpdate({
                            parentId, // main parent ex.basic-info
                            id: 'city', // child id ex.firstName, lastName
                            subId: '', // grandchild id ex.year,month,date (for fields like date with sub-data)
                            value: '', // could be string (textinput), object (type:dropdown, value.value), array (type:date, value.$.id:year,month,date)
                            type: 'dropdown', // field type ex.dropdown,date
                            validate,
                            errorResponse: 'Please select a city',
                            index: -1,
                        });
                    }
                    // else if (id === 'city') {
                    //   dispatch(fetchBarangays({cityCode: preservedValue}));
                    //   onFormUpdate({
                    //     parentId, // main parent ex.basic-info
                    //     id: 'barangay', // child id ex.firstName, lastName
                    //     subId: '', // grandchild id ex.year,month,date (for fields like date with sub-data)
                    //     value: '', // could be string (textinput), object (type:dropdown, value.value), array (type:date, value.$.id:year,month,date)
                    //     type: 'dropdown', // field type ex.dropdown,date
                    //     validate,
                    //     errorResponse: 'Please select a barangay',
                    //     index: -1,
                    //   });
                    // }
                    return newForm;
                }
            }
            return prevForm;
        });

    }, [dispatch, getNTCServices]);
    const formValid = useCallback(() => {
        var valid = true;
        form.forEach((parent: any) => {
            let isParentList = parent?.type === 'list';
            if (parent?.data?.length > 0) {
                parent?.data?.forEach((child: any) => {
                    if (isParentList) {
                        iterate(child?.items ?? child?.value ?? child?.data, (subChild) => {
                            if (subChild?.required) {

                                if (child.type === 'time') { }
                                else if (child?.type === 'option') {
                                    let selectedItems = child?.items?.filter((i: any) => i?.selected);
                                    selectedItems?.forEach((item: any) => {
                                        if (item?.hasSpecification) {
                                            if (
                                                item?.specification?.required &&
                                                !(
                                                    !item?.specification?.error &&
                                                    item?.specification?.value
                                                )
                                            ) {
                                                valid = false;
                                                return;
                                            }
                                        }
                                    });
                                    if (valid && selectedItems?.length < child?.minimum) {
                                        valid = false;
                                        return;
                                    }
                                }
                                else if (typeof (subChild?.value) === 'object' && !!subChild?.value) { // should be array but ts returns 'object' idky
                                    subChild?.value?.forEach((grandchild: any) => {
                                        if (!(!grandchild?.error && grandchild?.value)) {
                                            valid = false;
                                            return;
                                        }
                                    });
                                }
                                else if (!(!subChild?.error && subChild?.value)) {
                                    valid = false;
                                    return;
                                }
                            }
                            else if (subChild?.data?.length > 0) {
                                subChild?.data?.forEach((ssubChild: any) => {
                                    if (ssubChild?.length > 0) {
                                        ssubChild?.forEach((sssubChild: any) => {
                                            if (!(!sssubChild?.error && sssubChild?.value) && sssubChild?.required) {
                                                valid = false;
                                                return;
                                            }
                                        });
                                    }
                                    else {
                                        if (!(!ssubChild?.error && ssubChild?.value) && ssubChild?.required) {
                                            valid = false;
                                            return;
                                        }
                                    }
                                });
                            }
                        });

                    }
                    else { // whatever changes here should also be reflected on the IF above
                        if (child?.required) {
                            if (child.type === 'time') { }
                            else if (child?.type === 'option') {
                                let selectedItems = child?.items?.filter((i: any) => i?.selected);
                                selectedItems?.forEach((item: any) => {
                                    if (item?.hasSpecification) {
                                        if (
                                            item?.specification?.required &&
                                            !(
                                                !item?.specification?.error &&
                                                item?.specification?.value
                                            )
                                        ) {
                                            valid = false;
                                            return;
                                        }
                                    }
                                });
                                if (valid && selectedItems?.length < child?.minimum) {
                                    valid = false;
                                    return;
                                }
                            }
                            else if (typeof (child?.value) === 'object' && !!child?.value) { // should be array but ts returns 'object' idky
                                child?.value?.forEach((grandchild: any) => {
                                    if (!(!grandchild?.error && grandchild?.value)) {
                                        valid = false;
                                        return;
                                    }
                                });
                            }
                            else if (!(!child?.error && child?.value)) {
                                valid = false;
                                return;
                            }
                        }
                    }
                });
            }
        });
        return valid;
    }, [form]);
    useEffect(() => {
        let _form = cloneDeep(form || []);
        let _index = _form?.findIndex((p: any) => p?.id === 'address');
        if (_index > -1) {
            if (useDifferentAddress) {
                let _address = _form?.[_index]?.data || [];
                _address?.forEach((a: any) => {
                    a.value = '';
                    a.isValid = false;
                });
                _form[_index].data = _address;
            }
            else _form[_index] = origAdd;
            setForm(_form);
        }

        if (useDifferentAddress && !udaAlert?.alerted) {
            setUDAAlert({
                ...udaAlert,
                active: true,
            });
        }

    }, [useDifferentAddress]);
    useEffect(() => {
        if (FOR_EDITING && form?.length > 0 && !formFilledIn) {
            let generatedForm = generateForm(savedApplication, form) || [];
            setForm(generatedForm);
            if (renewApplication) {
                let docuId = AT?.requirements?.findIndex((i: any) => i.key === 'document');
                let { document, service } = savedApplication;
                if (docuId > -1 && !!document) {
                    let links = {
                        original: document,
                        thumb: document,
                        small: document,
                        medium: document,
                        large: document,
                        xlarge: document,
                    };
                    AT.requirements[docuId] = {
                        ...AT.requirements[docuId],
                        files: [
                            {
                                name: `${service?.name} ${service?.applicationType?.label}.pdf`,
                                mimeType: 'application/pdf',
                                uri: '',
                                index: docuId,
                                uploading: false,
                                uploaded: true,
                                links,
                            }
                        ],
                        links: [links],
                    };
                }
            }
            setAlternateRequirements(AT?.requirements);
            setFormFilledIn(true);
        }
        else {
        }
    }, [form]);

    /**step5 */
    const [alternateRequirements, setAlternateRequirements] = useState([]);
    const requirements = alternateRequirements?.length > 0 ? alternateRequirements : (service?.serviceCode === 'service-1' && examineeType?.requirements?.length > 0 && examineeType?.label != "First Taker" ? examineeType?.requirements :
        ((entityType && typeof entityType === 'object' && Object?.keys(entityType).length === 0 && applicationType?.formCode == "ntc1-09-GOVTPVT-pur-pos") || Object?.keys(entityType)?.length > 0) ? entityType.requirements || applicationType?.requirements : applicationType?.requirements || []);
    const onUploadFile = async (requirement: any) => {

        let createFormData = async (payload: any) => {
            const { key, files } = payload;

            const file = files?.[files?.length - 1];

            const data = new FormData();
            let f: any = {
                name: file?.name ?? file.assets?.[0]?.name,
                type: file?.mimeType ?? file.assets?.[0]?.mimeType,
                uri: file?.uri ?? file.assets?.[0]?.uri,
            }

            if (isMobile) {
                data.append('file', f);
                data.append('key', key);
                return data;
            }

            Platform.select({
                web: await fetch(f?.uri).then(res => {
                    return res?.blob()
                }).then(blob => {

                    var mime = f?.uri?.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
                    var attachmentMime = mime?.[1]?.split('/')?.[1]
                    if (mime && mime.length) {
                        f = new File([blob], f?.name + (
                            attachmentMime.length < 5 ? '.' + attachmentMime : ''));
                    }
                }).catch((err: any) => {
                    err = cloneDeep(err);
                    return {
                        status: err?.status,
                        msg: err?.message,
                    };
                })
            })
            data.append('file', f);
            data.append('key', key);
            data.append('name', file?.name ?? file.assets?.[0]?.name);
            return data;
        };
        let formData = await createFormData(requirement);
        dispatch(uploadRequirement({
            formData,
            requirements,
        }));
    };
    const onUpload = useCallback((file: any) => {

        let index = file?.index;
        if (index > -1) {
            let _requirements = [...requirements];
            let _files = _requirements?.[index]?.files || [];
            _files.push(file);
            _requirements[index].files = _files;
            onUploadFile(_requirements[index]);
        }
    }, [requirements, onUploadFile]);

    const onRemove = useCallback((index: number, _index: number) => {

        if (index >= 0 && _index >= 0) {
            let _requirements = [...requirements];
            let _files = _requirements?.[index]?.files || [];
            _files.splice(_index, 1);
            _requirements[index].files = _files;
            setApplicationType((prev: any) => ({
                ...prev,
                requirements: _requirements,
            }));
        }
    }, [requirements]);

    const incompleteRequirements = useCallback(() => {
        let incomplete = false;
        requirements?.map((r: any) => {
            if (r?.required ||
                (r?.additional &&
                    r?.additional?.[region?.value]?.required === true)) {
                if (!(r?.files?.filter(c => c.links?.small || c.uri || c.assets?.[0]?.uri)?.length > 0)) {
                    incomplete = true;
                    return;
                }
                r?.files?.filter(c => c.links?.small || c.uri || c.assets?.[0]?.uri)?.forEach((f: any) => {
                    if (!(Object?.keys(f?.links || {})?.length > 0 || f?.uri || f?.assets?.[0]?.uri)) {
                        incomplete = true;
                        return;
                    }
                });
                // if(r?.files){
                //     r.files = r?.files?.filter(c => c.links?.small)
                // }
            }
        });
        return incomplete;
    }, [requirements, region?.value]);

    const isUploading = useCallback(() => {
        if (uploadingRequirement) return uploadingRequirement;
        let uploading = false;
        requirements?.map((r: any) => {
            r?.files?.forEach((f: any) => {
                if (f?.uploading) {
                    uploading = true;
                    return;
                }
            });
        });
        return uploading;
    }, [uploadingRequirement, requirements]);
    useEffect(() => {
        if (FOR_EDITING && alternateRequirements?.length > 0) setFormGenerated(true);
    }, [alternateRequirements]);
    useEffect(() => {
        if (uploadRequirementError) {
            setLogoutAlert({
                ...logoutAlert,
                active: true,
            });
        }
    }, [uploadRequirementError]);

    /**step6 */
    const [reviewed, setReviewed] = useState(false);
    const [agree, setAgree] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    /**main */
    const [applicationPayload, setApplicationPayload] = useState({});
    const [completed, setCompleted] = useState(false);

    const [previewRows, setPreviewRows] = useState<any[]>([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const handleConfirmImport = useCallback(() => {
        const validRows = previewRows.filter(r => r.isValid);

        const stripValues = (arr: any[]): any[] => {
            return arr.map((item: any) => {
                if (Array.isArray(item)) return stripValues(item);
                if (typeof item === 'object' && item !== null) {
                    const copy = { ...item };
                    if ('value' in copy) {
                        if (Array.isArray(copy.value)) {
                            copy.value = copy.value.map((v: any) => ({ ...v, value: '', isValid: false, error: '' }));
                        } else {
                            copy.value = '';
                        }
                        copy.isValid = false;
                        copy.error = '';
                    }
                    if (copy.data) copy.data = stripValues(copy.data);
                    if (copy.items) copy.items = stripValues(copy.items);
                    if (copy.specification) copy.specification = stripValues([copy.specification])[0];
                    return copy;
                }
                return item;
            });
        };
        const cleanBaseForm = stripValues(form || []);
        const normalize = (value: any) =>
            String(value || '')
                .trim()
                .toLowerCase();

        const normalizeElement = (value: any) =>
            String(value || '')
                .normalize('NFKC')
                .toLowerCase()
                .replace(/[–—]/g, '-')
                .replace(/\s+/g, ' ')
                .trim();

        const looseElementKey = (value: any) =>
            normalizeElement(value)
                .replace(/[^a-z0-9]/g, '');

        const normalizeText = (value: any) =>
            String(value || '')
                .normalize('NFKC')
                .toLowerCase()
                .replace(/[–—]/g, '-')
                .replace(/\s+/g, ' ')
                .trim();

        const looseKey = (value: any) =>
            normalizeText(value)
                .replace(/[^a-z0-9]/g, '');

        const newApplications = validRows.map(row => {
            const baseApp = cloneDeep(applicationPayload);
            const { parsedObj, rawRow } = row;

            const appTypeLabel =
                parsedObj?.applicationType?.label ||
                parsedObj?.service?.applicationType?.label ||
                '';

            const matchingAppType =
                service?.applicationTypes?.find((t: any) =>
                    looseKey(t?.label) === looseKey(appTypeLabel)
                ) || {};

            const rawElement =
                parsedObj?.service?.applicationType?.element ||
                parsedObj?.applicationType?.element ||
                '';

            const matchingElement =
                matchingAppType?.elements?.find((el: string) =>
                    looseElementKey(el) === looseElementKey(rawElement)
                ) || rawElement;

            const finalizedAppType = {
                ...matchingAppType,
                label: matchingAppType?.label || appTypeLabel || '',
                element: matchingElement || ''
            };

            const exTypeLabel =
                parsedObj?.service?.examineeType?.examineeType ||
                parsedObj?.service?.examineeType?.label ||
                parsedObj?.examineeType ||
                '';

            const matchingExamineeType =
                service?.examineeType?.find((t: any) =>
                    normalize(t?.label) === normalize(exTypeLabel) ||
                    normalize(t?.key) === normalize(exTypeLabel)
                ) || null;
            // 3. Find the full examineeType object from applicationCart based on label

            // 4. Clean parsedObj to strictly match backend structure and prevent overwriting arrays
            const cleanedParsedObj = { ...parsedObj };
            delete cleanedParsedObj.applicationType;

            const cleanedServiceObj = { ...(parsedObj?.service || {}) };
            delete cleanedServiceObj.examineeType; // Don't overwrite the examineeType array config

            const finalService = {
                ...(baseApp?.service || {}),
                ...(applicationCart?.service || {}),
                ...cleanedServiceObj,

                applicationType: { ...finalizedAppType },

                examineeType: {
                    examineeType: matchingExamineeType?.label || exTypeLabel || ''
                },

                basic: {
                    ...(baseApp?.service?.basic || {}),
                    ...(parsedObj?.service?.basic || {}),
                    companyName:
                        parsedObj?.service?.basic?.firstName && parsedObj?.service?.basic?.lastName
                            ? `${parsedObj.service.basic.firstName} ${parsedObj.service.basic.lastName}`
                            : ''
                }
            };

            const finalApplicant = {
                ...(baseApp?.applicant || {}),
                ...(parsedObj?.applicant || {}),
                address: {
                    ...(baseApp?.applicant?.address || {}),
                    ...(parsedObj?.applicant?.address || {}),
                    region: typeof rawRow?.Region === 'string' ? rawRow?.Region : (parsedObj?.region || baseApp?.applicant?.address?.region || ''),
                },
                dateOfBirth: parsedObj?.service?.basic?.dateOfBirth || baseApp?.applicant?.dateOfBirth || null,
                firstName: parsedObj?.service?.basic?.firstName || baseApp?.applicant?.firstName || '',
                lastName: parsedObj?.service?.basic?.lastName || baseApp?.applicant?.lastName || '',
                middleName: parsedObj?.service?.basic?.MiddleName || baseApp?.applicant?.middleName || '',
                suffix: parsedObj?.service?.basic?.Suffix || baseApp?.applicant?.suffix || '',
                sex: parsedObj?.service?.basic?.sex || baseApp?.applicant?.sex || '',
                nationality: parsedObj?.service?.basic?.nationality || baseApp?.applicant?.nationality || '',
            };

            const baseAppType = applicationCart?.service?.applicationType || savedApplication?.service?.applicationType;
            const formCode = finalizedAppType?.formCode || baseAppType?.formCode || service?.formCode;

            const tempUser = {
                ...user,
                ...finalApplicant,
                contactNumber: parsedObj?.applicant?.contact?.contactNumber || baseApp?.applicant?.contact?.contactNumber || user?.contactNumber || '',
                email: parsedObj?.applicant?.contact?.email || baseApp?.applicant?.contact?.email || user?.email || '',
                applicant: finalApplicant
            };

            const generatedTemplate = cloneDeep(NTCServicesConfig({
                formCode,
                user: tempUser,
                applicant: tempUser.applicant
            })) || cleanBaseForm;

            const rowForm = generateForm({ service: finalService }, cloneDeep(generatedTemplate)) || generatedTemplate;

            return {
                id: crypto.randomUUID(),

                ...baseApp,
                ...cleanedParsedObj,

                applicant: finalApplicant,
                service: finalService,
                application: cloneDeep(applicationCart?.application || baseApp?.application || {}),

                applicationCart: {
                    ...(applicationCart || {}),
                    service: finalService,
                    applicant: finalApplicant
                },

                currentStep: 5,
                form: rowForm,
                region: parsedObj?.region || region || null,
                schedule: schedule || null,
                applicationType: finalizedAppType,

                // full selected object for Types / edit state
                examineeType: matchingExamineeType || null,

                entityType: entityType || null,
                alternateRequirements: alternateRequirements || null,
                useDifferentAddress: useDifferentAddress || false,
                office: office || null
            };
        });

        // Filter duplicates against existing bulk applications
        const currentBulk = Array.isArray(bulkApplications) ? bulkApplications : [];
        let skipped = 0;
        let added = 0;

        const finalApplications = [...currentBulk];

        newApplications.forEach(newApp => {
            const isDuplicate = currentBulk.some(existing => {
                const exBasic = existing?.service?.basic || {};
                const newBasic = newApp?.service?.basic || {};
                return exBasic.firstName === newBasic.firstName &&
                    exBasic.lastName === newBasic.lastName &&
                    exBasic.dateOfBirth?.year === newBasic.dateOfBirth?.year &&
                    exBasic.dateOfBirth?.month === newBasic.dateOfBirth?.month &&
                    exBasic.dateOfBirth?.day === newBasic.dateOfBirth?.day &&
                    newApp?.service?.applicationType?.label === existing?.service?.applicationType?.label;
            });

            if (isDuplicate) {
                skipped++;
            } else {
                finalApplications.push(newApp);
                added++;
            }
        });

        dispatch(setBulkApplications(finalApplications));
        setFormApplicationProcess(BULK_PROCESS);
        dispatch(setApplicationProcess(BULK_PROCESS));
        setShowPreviewModal(false);
        setPreviewRows([]);

        const goToBulkApplicationType = () => {
            setFormApplicationProcess(BULK_PROCESS);
            dispatch(setApplicationProcess(BULK_PROCESS));
            dispatch(setSplit(true));
            setCurrentStep(3); // Application Type step
        };

        if (Platform.OS === 'web') {
            goToBulkApplicationType();
        } else {
            Alert.alert(
                "Import Summary",
                `Total Parsed: ${previewRows.length}\nValid: ${validRows.length}\nAdded: ${added}\nSkipped Duplicates: ${skipped}`,
                [
                    {
                        text: "OK",
                        onPress: goToBulkApplicationType,
                    },
                ]
            );
        }
    }, [
        previewRows,
        bulkApplications,
        applicationPayload,
        applicationCart,
        dispatch,
        form,
        service,
        savedApplication,
        region,
        schedule,
        entityType,
        alternateRequirements,
        useDifferentAddress,
        office,
        user,
    ]);


    const getDraftApplication = async (saveApp) => {

        const draft = {
            form,
            applicationCart,
            currentStep,
            region,
            schedule,
            applicationType,
            examineeType,
            entityType,
            alternateRequirements,
            useDifferentAddress,
            office,
        };

        dispatch(addBulkApplication({
            ...applicationPayload,
            ...saveApp,
            application: draft,
        }));

        if (applicationProcess?.value == "bulk-application") {
            dispatch(setApplicationCart({}));
            setApplicationPayload({})
            setForm([]);
            var app = {
                ...applicationType,
                requirements: applicationType.requirements.map(req => ({
                    ...req,
                    files: [],
                })),
            }
            delete app.element
            setApplicationType(app)
            handleChangeApplicationType(app);

        }
        dispatch(setSplit(true));
        setCurrentStep(3)


    }

    const resetBulkApplicationForm = useCallback(() => {
        const cleanApplicationType = cloneDeep(applicationType || {});

        cleanApplicationType.requirements = (cleanApplicationType.requirements || []).map((req: any) => ({
            ...req,
            files: [],
            links: [],
        }));

        const cleanExamineeType = cloneDeep(examineeType || {});
        if (cleanExamineeType.requirements) {
            cleanExamineeType.requirements = cleanExamineeType.requirements.map((req: any) => ({
                ...req,
                files: [],
                links: [],
            }));
        }

        const cleanEntityType = cloneDeep(entityType || {});
        if (cleanEntityType.requirements) {
            cleanEntityType.requirements = cleanEntityType.requirements.map((req: any) => ({
                ...req,
                files: [],
                links: [],
            }));
        }

        dispatch(setApplicationCart({}));
        setApplicationPayload({});
        setAlternateRequirements([]);
        setUseDifferentAddress(false);
        setReviewed(false);
        setAgree(false);
        setCompleted(false);
        setBulkApplicationReview(false);

        setForm([]);
        setFormResetKey(prev => prev + 1);

        setApplicationType(cleanApplicationType);
        setExamineeType(cleanExamineeType);
        setEntityType(cleanEntityType);

        // Generates a fresh blank form for the next bulk application
        handleChangeApplicationType(cleanApplicationType, { blankApplicant: true });

        dispatch(setSplit(true));

        // In your current non-editing step order, Application Form becomes step 4
        setTimeout(() => {
            setCurrentStep(3);
        }, 0);
    }, [
        applicationType,
        examineeType,
        entityType,
        dispatch,
        handleChangeApplicationType,
    ]);
    useEffect(() => {
        if (((soa && Object?.keys(soa)?.length > 0) && fetchSOASuccess) || fetchSOAError) {
            setKey(0);

            if (applicationProcess?.value === 'bulk-application' && Array.isArray(applicationPayload)) {
                // This is the final bulk submission
                const bulkPayload = applicationPayload.map(app => ({
                    ...app,
                    region: typeof app.region === 'object' ? app.region?.value : app.region,
                    office: typeof app.office === 'object' ? app.office?.value : app.office,
                    soa: soa?.statement_Of_Account || [],
                    totalFee: soa?.totalFee || 0,
                }));
                dispatch(saveBulkApplication(bulkPayload));
                return;
            }

            var _saveApplication = {
                ...applicationPayload,
                service: {
                    ...(applicationPayload?.service !== undefined ? applicationPayload.service : {}),
                    ...(applicationCart?.service !== undefined ? {
                        name: applicationCart?.service?.name,
                        _id: applicationCart?.service?._id,
                        serviceCode: applicationCart?.service?.serviceCode
                    } : {}),
                },
                soa: soa?.statement_Of_Account || [],
                totalFee: soa?.totalFee || 0,
                useDifferentAddress,
                renew,
                renewApplication,
                editApplication,
            };
            if (_saveApplication?.region == null && region.value) {
                _saveApplication.region = region.value;
            }

            if (applicationProcess?.value === "bulk-application") {
                // Adding a single item to bulk draft
                var _saveBulkApplication = {
                    ..._saveApplication,
                    form,
                    applicationCart,
                    currentStep: 5,
                    region,
                    schedule,
                    applicationType,
                    examineeType,
                    entityType,
                    alternateRequirements,
                    useDifferentAddress,
                    office,
                }
                if (_saveBulkApplication?.region == null && region.value) {
                    _saveBulkApplication.region = region.value;
                }
                if (_saveBulkApplication?.office == null && office.value) {
                    _saveBulkApplication.office = office.value;
                }
                dispatch(addBulkApplication(_saveBulkApplication));
                dispatch(setSplit(true));

                resetBulkApplicationForm();

                setToastMessage('Application added to bulk list.');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else if (_saveApplication.region || _saveApplication.service || _saveApplication.applicant) {
                dispatch(saveApplication(_saveApplication));
            }
        }
    }, [soa, fetchSOASuccess, fetchSOAError]);
    const onFetchFees = (__app: any) => {
        dispatch(fetchSOA(__app));
    };
    const onExitApplication = useCallback(() => {

        if (completed) navigation.navigate('Home');
        else navigation?.pop();

        if (Platform.OS == 'web') {

            dispatch(setApplicationItem(null));
            dispatch(setButtonText(''));
        }

        setTimeout(() => {
            dispatch(setFetchSOASuccess(false));
            dispatch(setFetchSOAError(false));
            dispatch(setSaveApplicationError(false));
            dispatch(setSaveApplicationSuccess(false));
            dispatch(setApplicationCart({}));
            dispatch(setSelectedService({}));
            dispatch(setApplicationProcess({}));
        }, 1000);
    }, [completed, navigation, dispatch]);

    const onSaveApplication = useCallback((sourceApplication?: any) => {
        const formatPayload = (_sourceApp: any, _currentForm: any, _currentOffice: any, _savedApp: any) => {
            const _application = cloneDeep(_sourceApp);

            delete _application?.service?.about;
            delete _application?.service?.createdAt;
            delete _application?.service?.examineeTypes;
            delete _application?.service?.entityTypes;

            var _requirements = [];
            if (_application?.service?.applicationType?.requirements?.length > 0) {
                _requirements = _application?.service?.applicationType?.requirements?.map((r: any) => {
                    let links = r?.files?.map((f: any) => f?.links);
                    return { ...r, links };
                });
                _application.service.applicationType.requirements = _requirements;
            }

            let structuredData = _currentForm?.length > 0 ? getStructuredData(cloneDeep(_currentForm || [])) : {};

            _application.applicant = {
                ...(user?.applicant && user?.applicant),
                userType: user?.userType,
                ..._savedApp?.applicant,
                ..._application?.applicant,
                ...(user?._id && { userId: user._id })
            };

            if (typeof (_application?.applicant?.dateOfBirth) === 'string') {
                const day = extractDate(_application.applicant.dateOfBirth, 'date');
                const month = extractDate(_application.applicant.dateOfBirth, 'month');
                const year = extractDate(_application.applicant.dateOfBirth, 'year');
                _application.applicant.dateOfBirth = { day, month, year };
            }

            if (_application?.schedule) {
                _application.schedule = {
                    ..._application?.schedule,
                    region: typeof _application?.schedule?.region === 'object' ? _application?.schedule?.region?.value : _application?.schedule?.region,
                    office: typeof _currentOffice === 'object' ? _currentOffice?.value : _currentOffice,
                };
            }
            _application.office = typeof _currentOffice === 'object' ? _currentOffice?.value : _currentOffice;

            _application?.service?.applicationType?.requirements?.forEach(r => {
                if (r?.files) {
                    r.files = r?.files?.filter(c => c.links?.small)
                }
                r?.files?.forEach(f => {
                    delete f?.uri;
                });
            });

            if (FOR_EDITING && _application?.schedule?.region) {
                _application.schedule.region = typeof _application?.schedule?.region === 'object' ? _application?.schedule?.region?.value : _application?.schedule?.region;
            }

            Object?.keys(structuredData).forEach((id: string) => {
                if (id === 'basic') {
                    _application.applicant = {
                        ..._application.applicant,
                        ...structuredData.basic,
                    };
                    _application.service = {
                        ..._application.service,
                        [id]: structuredData[id],
                    };
                }
                else if (
                    id === 'address' ||
                    id === 'contact' ||
                    id === 'education'
                ) {
                    _application.applicant = {
                        ..._application.applicant,
                        [id]: structuredData[id],
                    };
                }
                else {
                    _application.service = {
                        ..._application.service,
                        [id]: structuredData[id],
                    };
                }
            });

            if (_savedApp?._id) _application._id = _savedApp?._id;
            _application.isModified = renewApplication ? compareApplication(_savedApp, cloneDeep(_currentForm)) : false;

            if (applicationProcess?.value === "bulk-application" && !_application.id) {
                _application.id = crypto.randomUUID();
            }

            return _application;
        };

        if (applicationProcess?.value === 'bulk-application' && bulkApplications?.length > 0 && !sourceApplication) {
            // Finalizing bulk submission
            const cleanedBulkApps = bulkApplications.map(app => formatPayload(app, app.form, app.office || office, savedApplication));
            setApplicationPayload(cleanedBulkApps);
            // Calculate total fee for the whole bulk (using first app's structure as template if needed,
            // but backend typically expects one call or handle per items.
            // Requirement says call calculate-total-fee first)
            setTimeout(() => onFetchFees(transformToFeePayload(cleanedBulkApps[0])), 500);
            return;
        }

        /**cleaning of payload */
        const _application = formatPayload(sourceApplication || applicationCart || {}, form, office, savedApplication);

        setTimeout(() => onFetchFees(transformToFeePayload(_application)), 500);
        setApplicationPayload(_application);

    }, [applicationCart, savedApplication, editApplication, renewApplication, AT, user, form, requirements, renew, bulkApplications, applicationProcess, office]);

    const regionArray = new Set(["II", "IV-B", "V", "VI", "VIII", "NCR"]);
    const onPrevious = () => {
        if (currentStep === 1 && (bulkApplications?.length ?? 0) > 0) {
            const count = bulkApplications.length;
            const message = `You have ${count} bulk application${count > 1 ? 's' : ''} saved. Please review or remove ${count > 1 ? 'them' : 'it'} to continue.`;

            if (Platform.OS === 'web') window.alert(message);
            else Alert.alert('Bulk applications found', message);
            return
        }
        setCurrentStep(currentStep - 1);
    }
    const onNext = () => {

        setCurrentStep(currentStep + 1);
    };

    const onBack = () => {
        setBackPressed(true);
        setBackPressed(false);
        return true;
    };

    const setItemsOnForm = (
        parentId: string,
        id: string,
        loading: boolean,
        items: any,
    ) => {
        let _form = cloneDeep(form || []);
        let parentIndex = _form?.findIndex((f: any) => f?.id === parentId);
        if (parentIndex > -1) {
            let childIndex = _form?.[parentIndex]?.data?.findIndex((f: any) => f?.id === id);
            if (childIndex > -1) {
                _form[parentIndex].data[childIndex].loading = loading;
                _form[parentIndex].data[childIndex].items = items;
                setForm(_form);
            }
        }
    };

    const setItemValueOnForm = (
        parentId: string,
        id: string,
        value: string
    ) => {
        let _form = cloneDeep(form || []);
        let parentIndex = _form?.findIndex((f: any) => f?.id === parentId);
        if (parentIndex > -1) {
            let childIndex = _form?.[parentIndex]?.data?.findIndex((f: any) => f?.id === id);
            if (childIndex > -1) {
                _form[parentIndex].data[childIndex].value = value;

                setForm(_form);
            }
        }
    };
    useEffect(() => {
        if (!FOR_EDITING || formFilledIn) setItemsOnForm('address', 'province', fetchingProvinces, provinces);
    }, [provinces, /*applicationType,*/ fetchingProvinces]);
    useEffect(() => {
        if (!FOR_EDITING || formFilledIn) setItemsOnForm('address', 'city', fetchingCities, cities);
    }, [cities, fetchingCities]);


    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        dispatch(fetchRegions());
        if (FOR_EDITING && !formFilledIn) setRegion({ code: savedApplication?.region, ...(regionList?.filter(i => i?.value === savedApplication?.region)?.[0] || {}) });
        if (Platform.OS == "web") {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }
        BackHandler.addEventListener('hardwareBackPress', onBack);
        return () => {
            if (Platform.OS == "web") {
                window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
            }

            const f = async () => {
                const existing = await AsyncStorage.getItem("IS_SAVE");
                if (existing) {
                    AsyncStorage.setItem("IS_SAVE", "0");
                }
            }
            f()
            BackHandler.removeEventListener('hardwareBackPress', onBack);
            onExitApplication()

        };
    }, []);

    const memoizedSteps = useMemo(() => {
        const _steps = [
            {
                title: 'Generating Application',
                content: <GeneratingApplication />,
                onPrevious: onExitApplication,
                onNext,
                buttonLabel: 'Generating...',
                buttonDisabled: !formGenerated,
            },
            {
                title: service?.serviceCode === 'service-1' ? 'Exam Schedule' : 'Region',
                content: <Region
                    userType={user.userType}
                    serviceCode={service?.serviceCode}
                    regions={regions}
                    region={region}
                    onPreSelect={() => dispatch(fetchRegions())}
                    applicationTypes={applicationProcessTypes}
                    applicationType={formApplicationProcess}
                    onChangeApplication={(applicationProcessType: any) => {
                        setFormApplicationProcess(applicationProcessType);
                    }}
                    onChangeRegion={(region: any) => {
                        const nonYetRegions = regionArray.has(region?.value);
                        const message = `EDGE is not yet available in ${region?.label}.`;

                        if (Platform.OS === 'web' && nonYetRegions) {
                            window.alert(message);
                            return;
                        } else if (nonYetRegions) {
                            Alert.alert('Notice', message);
                            return;
                        }

                        setRegion(region);
                        setOffice({});
                        dispatch(setCreatedAt(changeCreatedAt(region.value)));

                        if (service?.serviceCode === 'service-1') {
                            setSchedule({});
                        }
                    }}
                    schedule={schedule}
                    schedules={schedules}
                    fetchingOffices={fetchingOffices}
                    fetchingSchedules={fetchingSchedules}
                    fetchingRegions={fetchingRegions}
                    onChangeSchedule={setSchedule}
                    offices={offices}
                    office={office}
                    onChangeOffice={setOffice}
                />,
                onPrevious: FOR_EDITING ? onExitApplication : onPrevious,
                onNext: () => {

                    const selectedProcess =
                        formApplicationProcess?.value
                            ? formApplicationProcess
                            : applicationProcess?.value
                                ? applicationProcess
                                : bulkApplications?.length > 0
                                    ? BULK_PROCESS
                                    : SINGLE_PROCESS;
                    dispatch(setApplicationProcess(selectedProcess));
                    onNext();
                },
                buttonLabel: 'Next',
                buttonDisabled: service?.serviceCode === 'service-1'
                    ? !(region?.value && schedule?.id)
                    : (user.userType?.toLowerCase() == "company"
                        ? !(region?.value && formApplicationProcess?.value)
                        : !(region?.value && office?.value)),
            },
            ...(formApplicationProcess?.value === SINGLE_PROCESS.value ? [] : [{
                title: 'Filing Data Configuration',
                content: (
                    <FilingDataConfiguration
                        selectedMethod={bulkEntryMethod}
                        onSelectMethod={(method: 'manual' | 'excel') => setBulkEntryMethod(method)}
                        onDownloadTemplate={() => {
                            if (Platform.OS === 'web') {
                                const csvContent = generateCSVTemplate();
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'NTC_Bulk_Template.csv';
                                a.click();
                                URL.revokeObjectURL(url);
                            }
                        }}
                        onUploadExcel={async () => {
                            try {
                                const result = await DocumentPicker.getDocumentAsync({
                                    type: ['text/csv', 'application/vnd.ms-excel', 'text/comma-separated-values'],
                                    copyToCacheDirectory: true,
                                });

                                const isSuccess = (result as any).type === 'success' || (!result.canceled && result.assets && result.assets.length > 0);
                                if (isSuccess) {
                                    const asset = result.assets ? result.assets[0] : (result as any);
                                    let csvText = '';

                                    if (Platform.OS === 'web') {
                                        const file = asset.file;
                                        if (file) {
                                            csvText = await file.text();
                                        } else {
                                            const res = await fetch(asset.uri);
                                            csvText = await res.text();
                                        }
                                    } else {
                                        csvText = await FileSystem.readAsStringAsync(asset.uri);
                                    }

                                    const parsedData = parseCSV(csvText);

                                    if (!parsedData.success) {
                                        if (Platform.OS === 'web') alert(parsedData.error);
                                        else Alert.alert("Error", parsedData.error);
                                        return;
                                    }

                                    const processedRows = await Promise.all(parsedData.data.map(async (row: any, index: number) => {
                                        const validation = await validateCSVRow(row.rawRow);

                                        const parsedObj = {
                                            ...row.parsedObj,
                                            applicant: {
                                                ...(row.parsedObj?.applicant || {}),
                                                address: {
                                                    ...(row.parsedObj?.applicant?.address || {}),
                                                    province: row.rawRow['Province'] || row.parsedObj?.applicant?.address?.province,
                                                    city: row.rawRow['City'] || row.parsedObj?.applicant?.address?.city,
                                                }
                                            },
                                            region: region,
                                            office: office,
                                            service: {
                                                ...(row.parsedObj?.service || {}),
                                                basic: {
                                                    ...(row.parsedObj?.service?.basic || {}),
                                                    sex: row.rawRow['Sex']
                                                }
                                            }
                                        };

                                        return {
                                            index,
                                            rawRow: row.rawRow,
                                            parsedObj,
                                            isValid: validation.isValid,
                                            errors: validation.errors
                                        };
                                    }));

                                    if (processedRows.length > 0) {

                                        setPreviewRows(processedRows);
                                        setShowPreviewModal(true);
                                    } else {
                                        if (Platform.OS === 'web') alert("No rows found to process.");
                                        else Alert.alert("Info", "No rows found to process.");
                                    }
                                }
                            } catch (error) {
                                console.error('Upload Error:', error);
                                if (Platform.OS === 'web') alert("Failed to read the file.");
                                else Alert.alert('Error', 'Failed to read the file.');
                            }
                        }}
                        onLoadSingleFiler={() => {
                            // Load 1 test filer for demo
                        }}
                        onLoadBulkDemo={() => {
                            // Load 50 draft entries for demo
                        }}
                    />
                ),
                onPrevious,
                onNext: () => {
                    const selectedProcess =
                        formApplicationProcess?.value
                            ? formApplicationProcess
                            : applicationProcess?.value
                                ? applicationProcess
                                : bulkApplications?.length > 0
                                    ? BULK_PROCESS
                                    : SINGLE_PROCESS;
                    dispatch(setApplicationProcess(selectedProcess));
                    onNext();
                },
                buttonLabel: 'Next',
                buttonDisabled: bulkEntryMethod === 'excel' && (!bulkApplications || bulkApplications.length === 0),
            }]),
            {
                title: 'Application Type',
                content: (
                    <Types
                        region={region?.value}
                        types={cloneDeep(service?.applicationTypes || [])}
                        examineesType={cloneDeep(service?.examineeType || [])}
                        entityTypes={cloneDeep(service?.entityTypes || [])}
                        entityType={entityType}
                        applicationType={applicationType}
                        examineeType={examineeType}
                        onChangeValue={(val) => handleChangeApplicationType(val, { blankApplicant: true })}
                        onChangeExamineeTypeValue={handleChangeExamineeType}
                        onChangeEntityTypeValue={handleChangeEntityType}
                        onSelect={handleChangeElement}
                    />
                ),
                onPrevious,
                onNext: () => {
                    const selectedProcess =
                        formApplicationProcess?.value
                            ? formApplicationProcess
                            : applicationProcess?.value
                                ? applicationProcess
                                : bulkApplications?.length > 0
                                    ? BULK_PROCESS
                                    : SINGLE_PROCESS;

                    dispatch(setApplicationProcess(selectedProcess));

                    onNext();
                },
                buttonLabel: 'Next',
                buttonDisabled: (applicationType?.formCode == "ntc1-09-GOVTPVT-pur-pos" && entityType && typeof entityType === 'object' && Object.keys(entityType).length === 0) ? entityType && typeof entityType === 'object' && Object?.keys(entityType)?.length === 0 : applicationType?.elements?.length > 0 && service?.serviceCode === 'service-1' ? !(applicationType?.elements?.length > 0 && applicationType?.element && (FOR_EDITING || Object?.keys(examineeType)?.length > 0)) : applicationType?.elements?.length > 0 ? !(applicationType?.elements?.length > 0 && applicationType?.element) : !applicationType?.label,
            },
            {
                title: 'Requirements',
                content: <Requirements region={region?.value} requirements={requirements} onUpload={onUpload} onRemove={onRemove} disabled={isUploading()} />,
                onPrevious,
                onNext: () => {
                    var _applicationType = applicationType ?? applicationCart?.service?.applicationType ?? savedApplication?.service?.applicationType;

                    try {
                        createIssue("Requirements FOR_EDITING", JSON.stringify(applicationType), "external")
                        createIssue("Requirements FOR_EDITING", JSON.stringify(applicationCart?.service?.applicationType), "external")
                        createIssue("Requirements FOR_EDITING", JSON.stringify(savedApplication?.service?.applicationType), "external")
                    } catch (e) {

                    }

                    var _application = {
                        id: crypto.randomUUID(),
                        ...applicationCart,
                        ...(region?.value !== undefined ? { region: region.value } : {}),
                        ...(schedule != null ? { schedule } : {}),

                        service: {
                            ...service,
                            ...(applicationCart?.service ?? {}),
                            ...(examineeType?.label && {
                                examineeType: {
                                    examineeType: examineeType.label,
                                },
                            }),
                            ...(entityType?.label && {
                                entityType: {
                                    entityType: entityType.label,
                                },
                            }),
                            ...((_applicationType) && {
                                applicationType: {
                                    ...(service?.applicationType ?? {}),
                                    ..._applicationType,
                                    requirements,
                                },
                            })

                        },
                    };

                    dispatch(setApplicationCart(_application));
                    if (applicationProcess?.value == "bulk-application") {
                        onSaveApplication(_application);
                    } else {
                        onNext();
                    }
                },
                buttonLabel: applicationProcess?.value == "single-application" ? 'Review' : "Save",
                buttonDisabled: incompleteRequirements() || isUploading(),
            },
            {
                title: bulkApplicationReview ? "Review" : completed ? 'Complete' : 'Review',
                content: completed && !bulkApplicationReview
                    ? <Submitted serviceCode={service?.serviceCode} id={applicationCart} />
                    : <Preview
                        drawer={false}
                        pageOnly
                        forApplication={!!applicationCart?.service?.name}
                        application={applicationCart}
                        form={cloneDeep(form || [])}
                        bulkApplications={bulkApplications}
                        onEditBulk={handleEditBulkApplication}
                        onRemoveBulk={handleRemoveBulkApplication}
                    />,
                onPrevious: () => {
                    if (bulkApplicationReview) {
                        setBulkApplicationReview(false)
                        dispatch(setApplicationCart({}));
                        setForm([]);
                        setApplicationType({})
                        dispatch(setSplit(true));
                        setCurrentStep(3)
                    } else {
                        if (agree) setAgree(false);
                        if (reviewed) setReviewed(false);
                        onPrevious();
                    }

                },
                onNext: () => {
                    if (bulkApplicationReview) {
                        setBulkApplicationReview(false)
                        dispatch(setApplicationCart({}));
                        setForm([]);
                        setApplicationType({})
                        dispatch(setSplit(true));
                        resetBulkApplicationForm();
                        setCurrentStep(3)
                    } else {
                        if (completed) {
                            if (isGuest) return onLogout();
                            onExitApplication();
                        } else if (!reviewed) {
                            handleConfirmSubmission()
                        }
                    }
                },
                buttonLabel: bulkApplicationReview ? "Close" : completed ? 'Close' : 'Submit',
                buttonDisabled: (savingApplication || (completed ? false : false)),
            },
        ];

        if (!FOR_EDITING) {
            _steps?.splice(1, 0, {
                title: 'Information',
                content: <About content={service?.about} />,
                onPrevious: onExitApplication,
                onNext,
                buttonLabel: 'Next',
                buttonDisabled: false,
            });
        }
        if (formGenerated || !FOR_EDITING) _steps.splice(0, 1);

        if (form?.length > 0 && _steps.findIndex(i => i.title === 'Application Form') < 0) {
            const appTypeIndex = _steps.findIndex(i => i.title === 'Application Type');
            const formInsertIndex = appTypeIndex > -1 ? appTypeIndex + 1 : (FOR_EDITING ? 2 : 3);
            _steps.splice(
                formInsertIndex,
                0,
                {
                    title: 'Application Form',
                    content: (
                        <ServicesForm
                            key={`services-form-${formResetKey}`}
                            form={form}
                            onChangeValue={onFormUpdate}
                            onAdd={_onAdd}
                            onRemove={_onRemove}
                            onUseDifferentAddress={onUseDifferentAddress}
                            useDifferentAddress={useDifferentAddress}
                        />
                    ),
                    onPrevious,
                    onNext,
                    buttonLabel: 'Next',
                    buttonDisabled: !formValid(),
                },
            );
        }
        return _steps;
    }, [
        formGenerated,
        FOR_EDITING,
        service,
        regions,
        region,
        schedule,
        schedules,
        fetchingSchedules,
        fetchingRegions,
        entityType,
        applicationType,
        examineeType,
        requirements,
        applicationCart,
        completed,
        form,
        agree,
        reviewed,
        savingApplication,
        onNext,
        onPrevious,
        onExitApplication,
        onLogout,
        onSaveApplication,
        onFormUpdate,
        _onAdd,
        _onRemove,
        onUseDifferentAddress,
        useDifferentAddress,
        formValid,
        incompleteRequirements,
        isUploading,
        handleEditBulkApplication,
        handleRemoveBulkApplication,
        office,
        offices,
        bulkEntryMethod,
        formApplicationProcess,
    ]);

    const handleConfirmSubmission = () => {
        setShowConfirmModal(false);
        setReviewed(true);
    };

    const handleFinalSubmit = () => {
        if (applicationProcess?.value === 'bulk-application' && bulkApplications.length === 0) {
            Alert.alert("Bulk Application", "Please add at least one application to the list before submitting.");
            return;
        }
        setAgree(true);
        setShowFeedbackModal(true);
        setFeedbackStatus('loading');
        setFeedbackMessage('Submitting your application, please wait...');
        onSaveApplication();
    };

    const submitFeedbackApi = async (rating: number, comment: string) => {

        let regionCode = region?.value || region?.code || "VII";
        if (typeof regionCode !== 'string') regionCode = "VII";

        let firstApp = (bulkApplications?.length > 0) ? bulkApplications[0] : applicationCart;
        let basic = firstApp?.service?.basic || firstApp?.application?.service?.basic || firstApp?.application?.basic || {};

        const firstName = basic?.firstName || user?.applicant?.firstName || "";
        const middleName = basic?.middleName || user?.applicant?.middleName || "";
        const lastName = basic?.lastName || user?.applicant?.lastName || "";
        const applicantFullName = `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, " ");

        const fullName = user?.applicant?.companyName || basic?.companyName || applicantFullName || user?.firstName || "";

        const payload = {
            fullName,
            email: user?.applicant?.email || basic?.email || user?.email || "",
            contactNumber: user?.applicant?.contactNumber || basic?.contactNumber || basic?.mobileNumber || basic?.phoneNumber || "",
            officeOrAgency: user?.applicant?.companyName || basic?.companyName || basic?.officeOrAgency || "",
            regionCode: regionCode.toUpperCase(),
            rating,
            comments: comment,
            submittedBy: user?.email || user?.applicant?.email || fullName || "Applicant",
        };

        const authToken = user?.sessionToken || user?.token || user?.accessToken || user?.jwt || user?.authToken;

        return submitFeedback(regionCode.toUpperCase(), payload, authToken);
    };

    return (
        <>
            <ApplicationSteps
                bulkApplicationReview={bulkApplicationReview}
                split={split}
                applicationProcess={applicationProcess?.value}
                onSplit={onSplit}
                steps={memoizedSteps}
                currentStep={currentStep}
                completed={completed}
                onExit={onExitApplication}
                loading={fetchingSOA || savingApplication || savingBulkApplication}
                UDAAlert={udaAlert}
                logoutAlert={logoutAlert}
                bulkApplicationsCount={bulkApplications?.length || 0}
            />

            <ConfirmationModal
                visible={showConfirmModal}
                onConfirm={handleConfirmSubmission}
                onCancel={() => setShowConfirmModal(false)}
            />

            <TermsAndConditions
                agree={agree}
                onClick={() => setAgree(!agree)}
                visible={reviewed && !completed && !showFeedbackModal}
                buttonLabel='Confirm'
                onPress={handleFinalSubmit}
                disabled={!agree || fetchingSOA || savingApplication || savingBulkApplication}
                loading={fetchingSOA || savingApplication || savingBulkApplication}
                onDismiss={() => setReviewed(false)}
            />


            {showSuccess && applicationProcess?.value !== 'bulk-application' ? (
                <FeedbackSuccessModal
                    visible={showSuccess}
                    isBulk={false}
                    onClose={() => {
                        setShowSuccess(false);
                        // Reset all state after submission flow
                        dispatch(setApplicationProcess({}));
                        dispatch(setApplicationCart({}));
                        dispatch(setSelectedService({}));
                        dispatch(setSelectedServiceKey(''));
                        dispatch(setSplit(true));
                        dispatch(setSaveBulkApplicationSuccess(false));
                        dispatch(setSaveBulkApplicationError(false));
                        dispatch(setSaveApplicationSuccess(false));
                        dispatch(setSaveApplicationError(false));
                    }}
                    onSubmitFeedback={async (rating, comment) => {
                        try {

                            if (applicationProcess?.value != "bulk-application") {
                                await submitFeedbackApi(rating, comment);
                            }

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
                        } catch (error: any) {
                            console.log("Feedback submit error:", error);
                            alert(error?.message || "Failed to submit feedback.");
                        }
                    }}
                />
            ) : <></>}

            <FeedbackModal
                visible={showFeedbackModal}
                status={feedbackStatus}
                message={feedbackMessage}
                onClose={() => {
                    setShowFeedbackModal(false);
                    if (feedbackStatus === 'success') {
                        setCompleted(true);
                    }
                }}
            />

            <Toast
                visible={showToast}
                message={toastMessage}
                onClose={() => setShowToast(false)}
            />

            <CSVPreviewModal
                visible={showPreviewModal}
                rows={previewRows}
                onConfirm={handleConfirmImport}
                onCancel={() => setShowPreviewModal(false)}
            />

        </>
    )
};


export default React.memo(ApplicationNav)

import React, { FC, useEffect, useMemo, useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import Moment from 'moment';
import { transformText, NTCPreview } from '@utils/ntc';
import { Bold } from '@styles/font';
import { input, text as textColor } from '@styles/color';
import { AnimatePresence, MotiView } from 'moti';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const safeText = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    if (Array.isArray(value)) return value.map(safeText).filter(Boolean).join(', ');
    if (typeof value === 'object')
        return value.label || value.name || value.value || value.code || value.branchName || value.regionCode || '—';
    return String(value);
};

const isEmptyValue = (v: any) => {
    if (v == null) return true;
    if (typeof v === 'string') {
        const s = v.trim();
        return s === '' || s === '.' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'null';
    }
    return false;
};

const toText = (v: any) => (isEmptyValue(v) ? '—' : String(v));

/* ------------------------------------------------------------------ */
/*  Tiny sub-components                                                */
/* ------------------------------------------------------------------ */

const SectionHeader = React.memo(({ label }: { label: string }) => (
    <View style={s.sectionHeader}>
        <Text style={s.sectionHeaderText}>{label}</Text>
    </View>
));

const Row = React.memo(({ label, value }: { label: string; value: any }) => (
    <View style={s.row}>
        <View style={{ flex: 0.5 }}>
            <Text style={s.rowLabel}>{safeText(label)}</Text>
        </View>
        <View style={{ flex: 0.5 }}>
            <Text style={[s.rowValue, { fontFamily: Bold }]}>{safeText(value)}</Text>
        </View>
    </View>
));

/* ------------------------------------------------------------------ */
/*  File preview row                                                    */
/* ------------------------------------------------------------------ */

function FilePreviewRow({ fileName, uri }: { fileName: string; uri: string }) {
    const [modalVisible, setModalVisible] = useState(false);
    const preview = NTCPreview(fileName);

    return (
        <View style={s.fileRow}>
            <Text style={s.fileName} numberOfLines={1}>{fileName || 'None provided'}</Text>

            {!!fileName && (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image
                        style={s.fileThumb}
                        source={preview === 'image' ? { uri } : preview}
                    />
                </TouchableOpacity>
            )}

            <Modal transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <AnimatePresence>
                    {modalVisible && (
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 200 }}
                            style={s.modalOverlay}
                        >
                            <MotiView
                                from={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.85, opacity: 0 }}
                                transition={{ type: 'timing', duration: 250 }}
                                style={{ alignItems: 'center', width: '90%', maxHeight: '85%' }}
                            >
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={{ alignSelf: 'flex-end', padding: 10 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Close</Text>
                                </TouchableOpacity>

                                {preview === 'image' && (
                                    <Image
                                        resizeMode="contain"
                                        style={{ width: '100%', height: 500, borderRadius: 8 }}
                                        source={{ uri }}
                                    />
                                )}

                                {preview === 'pdf' && (
                                    <View style={{ width: '100%', height: 500, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                                        <iframe
                                            style={{ width: '100%', height: '100%', borderWidth: 0 }}
                                            src={`https://docs.google.com/gview?url=${encodeURIComponent(uri)}&embedded=true`}
                                        />
                                    </View>
                                )}
                            </MotiView>
                        </MotiView>
                    )}
                </AnimatePresence>
            </Modal>
        </View>
    );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

type Props = {
    applicationId?: string;
    applicant: any;
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const ApplicantApplicationRow: FC<Props> = ({ applicationId, applicant }) => {
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    /* ---- Fetch data from link if available (post-submission) ---- */
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                setLoading(true);
                const res = await fetch(applicant.link);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!cancelled) setFetchedData(json);
            } catch (err) {
                console.error('Fetch applicant data failed:', err);
                if (!cancelled) setFetchedData(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (applicant?.link) {
            run();
        }

        return () => { cancelled = true; };
    }, [applicant?.link]);

    /* ---- Resolve the data source ---- */
    // Priority: fetched data from link > direct applicant data
    const data = fetchedData || applicant;

    const service = data?.service ?? {};
    const basic = service?.basic ?? data?.basic ?? {};
    const applicantData = data?.applicant ?? {};
    const address = applicantData?.address ?? {};
    const education = applicantData?.education ?? {};
    const contact = applicantData?.contact ?? {};
    const appType = service?.applicationType ?? {};
    const requirements = appType?.requirements ?? [];
    const region = data?.region;
    const schedule = data?.schedule;

    /* Keys to exclude from miscellaneous service fields */
    const excludedKeys = useMemo(() => new Set([
        'basic', '_id', 'name', 'applicationType', 'serviceCode',
        'about', 'createdAt', 'requirements', 'applicationTypes',
        'applicants', 'examineeType', 'entityTypes', 'examineeTypes',
    ]), []);

    /* Misc service fields */
    const miscKeys = useMemo(() =>
        Object.keys(service).filter(k => !excludedKeys.has(k)),
        [service, excludedKeys]
    );

    /* ---- date formatter ---- */
    const formatDOB = (dob: any) => {
        if (!dob) return '';
        if (typeof dob === 'string') return Moment(dob).format('LL');
        if (typeof dob === 'object') {
            const y = dob?.year ?? dob?.find?.((v: any) => v?.id === 'year')?.value;
            const m = dob?.month ?? dob?.find?.((v: any) => v?.id === 'month')?.value;
            const d = dob?.day ?? dob?.find?.((v: any) => v?.id === 'day')?.value;
            if (y && m !== undefined && d) {
                const month = (`0${Number(m) + 1}`).slice(-2);
                return Moment(`${y}-${month}-${d}`).format('LL');
            }
        }
        return '';
    };

    /* ---- misc value renderer (recursive) ---- */
    const renderMiscValue = (key: string, val: any, depth = 0): React.ReactNode => {
        if (val == null) return null;

        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            const dateRegex = /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;
            const displayVal = dateRegex.test(String(val)) && Date.parse(String(val)) > 0
                ? Moment(String(val)).format('LL')
                : toText(val);
            return <Row key={key} label={`${transformText(key)}:`} value={displayVal} />;
        }

        if (typeof val === 'object' && !Array.isArray(val)) {
            return (
                <View key={key} style={{ paddingVertical: 4 }}>
                    {depth === 0 && <SectionHeader label={transformText(key)?.toUpperCase()} />}
                    {depth > 0 && (
                        <View style={[s.sectionHeader, { backgroundColor: '#F3F4F6' }]}>
                            <Text style={[s.sectionHeaderText, { fontSize: 13 }]}>{transformText(key)}</Text>
                        </View>
                    )}
                    {Object.entries(val).map(([k, v]) => renderMiscValue(k, v, depth + 1))}
                </View>
            );
        }

        return null;
    };

    /* ------------- Has content checks ------------- */
    const hasBasic = !!(basic?.lastName || basic?.firstName || basic?.middleName || basic?.companyName || basic?.suffix || basic?.dateOfBirth || basic?.sex || basic?.nationality);
    const hasAddress = !!(address?.unit || address?.street || address?.barangay || address?.province || address?.city || address?.zipCode);
    const hasEducation = !!(education?.schoolAttended || education?.courseTaken || education?.yearGraduated);
    const hasContact = !!(contact?.contactNumber || contact?.email);
    const hasSchedule = !!(schedule?.dateStart || schedule?.dateEnd || schedule?.venue);

    /* ---- Loading state ---- */
    if (loading) {
        return (
            <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={s.loadingText}>Loading application data...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* ───────── APPLICATION ───────── */}
            <View style={s.section}>
                <SectionHeader label="APPLICATION" />
                <Text style={[s.serviceText, { fontFamily: Bold }]}>
                    {`${service?.name || '—'}\n\n${appType?.label || '—'}${appType?.element ? `\n  • ${appType.element}` : ''}`}
                </Text>
            </View>

            {/* ───────── BASIC INFO ───────── */}
            {hasBasic && (
                <View style={s.section}>
                    <SectionHeader label="BASIC INFO" />
                    {!!basic.companyName && <Row label="Company name:" value={basic.companyName} />}
                    {!!basic.applicantName && <Row label="Representative:" value={basic.applicantName} />}
                    {!!basic.lastName && <Row label="Last name:" value={basic.lastName} />}
                    {!!basic.middleName && <Row label="Middle name:" value={basic.middleName} />}
                    {!!basic.firstName && <Row label="First name:" value={basic.firstName} />}
                    {!!basic.suffix && <Row label="Suffix:" value={basic.suffix} />}
                    {!!basic.dateOfBirth && <Row label="Date of Birth:" value={formatDOB(basic.dateOfBirth)} />}
                    {!!basic.sex && <Row label="Sex:" value={basic.sex} />}
                    {!!basic.nationality && <Row label="Nationality:" value={basic.nationality} />}
                    {!!basic.weight && <Row label="Weight:" value={basic.weight} />}
                    {!!basic.height && <Row label="Height:" value={basic.height} />}
                </View>
            )}

            {/* ───────── ADDRESS ───────── */}
            {hasAddress && (
                <View style={s.section}>
                    <SectionHeader label="ADDRESS" />
                    {!!address.unit && <Row label="Unit/Rm/House/Bldg. No.:" value={address.unit} />}
                    {!!address.street && <Row label="Street:" value={address.street} />}
                    {!!address.barangay && <Row label="Barangay:" value={address.barangay} />}
                    {!!address.province && <Row label="Province:" value={address.province} />}
                    {!!address.city && <Row label="City/Municipality:" value={address.city} />}
                    {!!address.zipCode && <Row label="Zip Code:" value={address.zipCode} />}
                </View>
            )}

            {/* ───────── EDUCATION ───────── */}
            {hasEducation && (
                <View style={s.section}>
                    <SectionHeader label="EDUCATIONAL BACKGROUND" />
                    {!!education.schoolAttended && <Row label="School Attended:" value={education.schoolAttended} />}
                    {!!education.courseTaken && <Row label="Course Taken:" value={education.courseTaken} />}
                    {!!education.yearGraduated && <Row label="Year Graduated:" value={education.yearGraduated} />}
                </View>
            )}

            {/* ───────── CONTACT DETAILS ───────── */}
            {hasContact && (
                <View style={s.section}>
                    <SectionHeader label="CONTACT DETAILS" />
                    {!!contact.contactNumber && <Row label="Contact Number:" value={contact.contactNumber} />}
                    {!!contact.email && <Row label="Email Address:" value={contact.email} />}
                </View>
            )}

            {/* ───────── SERVICE MISCELLANEOUS ───────── */}
            {miscKeys.map(key => {
                const val = service[key];
                if (val == null || (typeof val === 'object' && Object.keys(val).length === 0)) return null;
                return (
                    <View key={key} style={s.section}>
                        {renderMiscValue(key, val, 0)}
                    </View>
                );
            })}

            {/* ───────── REGION ───────── */}
            {!!region && (
                <View style={s.section}>
                    <SectionHeader label="REGION" />
                    <Row label="Region:" value={safeText(region)} />
                </View>
            )}

            {/* ───────── SCHEDULE ───────── */}
            {hasSchedule && (
                <View style={s.section}>
                    <SectionHeader label="SCHEDULE" />
                    {!!schedule.dateStart && <Row label="Date:" value={Moment(schedule.dateStart).format('ddd DD MMMM YYYY')} />}
                    {!!schedule.dateStart && <Row label="Start Time:" value={Moment(schedule.dateStart).format('LT')} />}
                    {!!schedule.dateEnd && <Row label="End Time:" value={Moment(schedule.dateEnd).format('LT')} />}
                    {!!schedule.venue && <Row label="Venue:" value={schedule.venue} />}
                    {!!schedule.seatNumber && <Row label="Seat No.:" value={schedule.seatNumber} />}
                </View>
            )}

            {/* ───────── DOCUMENTS UPLOADED ───────── */}
            {requirements?.length > 0 && (
                <View style={s.section}>
                    <SectionHeader label="DOCUMENTS UPLOADED" />
                    {requirements.map((req: any, idx: number) => {
                        const files = req?.files ?? req?.links ?? [];
                        return (
                            <View key={`req-${idx}`} style={{ marginBottom: 12 }}>
                                <Text style={[{ fontFamily: Bold }, s.reqTitle]}>
                                    {idx + 1}. {req?.title}
                                </Text>
                                {!!req?.description && (
                                    <Text style={s.reqDesc}>{req.description}</Text>
                                )}
                                {Array.isArray(files) && files.length > 0 ? (
                                    files.map((file: any, fIdx: number) => {
                                        const fileName = file?.name ?? file?.assets?.[0]?.name ?? file?.small?.split('/')?.pop() ?? '';
                                        const uri = file?.links?.original ?? file?.original ?? '';
                                        return (
                                            <FilePreviewRow
                                                key={`file-${idx}-${fIdx}`}
                                                fileName={fileName}
                                                uri={uri}
                                            />
                                        );
                                    })
                                ) : (
                                    <Text style={s.noFile}>None provided</Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
};

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFBFD',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 14,
    },
    section: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F4',
    },
    sectionHeader: {
        backgroundColor: input?.background?.default ?? '#F5F5F5',
        padding: 5,
        marginBottom: 5,
    },
    sectionHeaderText: {
        color: textColor?.default ?? '#333',
        fontSize: 14,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: 5,
        marginTop: 3,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowLabel: {
        color: '#555',
        fontSize: 14,
    },
    rowValue: {
        color: '#111',
        fontSize: 14,
    },
    serviceText: {
        marginHorizontal: 5,
        marginTop: 5,
        textAlign: 'justify',
        fontSize: 14,
        color: '#222',
    },
    reqTitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    reqDesc: {
        fontSize: 13,
        color: '#777',
        marginLeft: 15,
        marginBottom: 4,
    },
    noFile: {
        color: '#999',
        fontSize: 13,
        marginLeft: 15,
        marginTop: 2,
    },
    fileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    fileName: {
        flex: 1,
        fontSize: 13,
        color: '#444',
    },
    fileThumb: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default React.memo(ApplicantApplicationRow);

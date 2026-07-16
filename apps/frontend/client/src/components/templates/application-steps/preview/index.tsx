import React, { FC, useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TouchableWithoutFeedback, useWindowDimensions, ActivityIndicator, Dimensions, Pressable
} from 'react-native';
import Moment from 'moment';
import Text from '@atoms/text';
import { Close, Check, Load, PDF, Receipt, Menu } from '@atoms/icon';
import NTCAlert from '@atoms/alert';
import { Bottom } from '@molecules/buttons';
import NavBar from '@organisms/navbar';
import { downloadFile, NTCPreview, transformText } from '@utils/ntc';
import { alpha, palette, primaryColor, text } from '@styles/color';
import styles from './styles';
import moment from 'moment';
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { setServiceLayout } from "@reducers/service/actions";
import { useComponentLayout } from "@hooks/useComponentLayout";
import DocumentDownloadButton from "@molecules/buttons/DocumentDownloadButton";
import { isMobile, isPad, onDownloadDocument } from "@utils/formatting";
import { Edit, FileDown, FileSpreadsheet, Home, LogOut, X, RefreshCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatePresence, MotiView } from "moti";
import Pdf from "@atoms/icon/pdf";
import useGuest from "@hooks/useGuest";
import { ApplicantsTable } from "@organisms/ApplicantsTable";
import { Bold } from "@styles/font";

interface Props {
  navigation?: any;
  route?: any;
  application?: any;
  form?: any;
  pageOnly?: boolean;
  bulkApplications?: any[];
  onEditBulk?: (id: string) => void;
  onRemoveBulk?: (id: string) => void;
  forApplication?: boolean;
  drawer?: boolean;
};

// Extracted Memoized Components for Performance
const Header = React.memo(({ header, secondary }: any) => (
  <View style={[styles.tableHeadView, secondary && styles?.secondaryTableHeadView]}>
    <Text style={[styles.headerText, !secondary && styles.boldText]}>
      {header}
    </Text>
  </View>
));

const Row = React.memo(({ label, value }: any) => (
  <View style={[styles.row, { justifyContent: "space-between" }]}>
    <View style={{ flex: 0.5 }}>
      <Text>{label}</Text>
    </View>
    <View style={{ flex: 0.5 }}>
      <Text style={styles.boldText}>{value}</Text>
    </View>
  </View>
));

const OptionItem = React.memo(({ item, parentLabel }: any) => (
  <View style={item.hasSpecification && styles?.optionView}>
    <Row label={parentLabel} value={item?.value} />
    {
      item.hasSpecification &&
      <Row label={transformText(item?.specification?.id)} value={item?.specification?.value} />
    }
  </View>
));

const OptionsList = React.memo(({ item }: any) => {
  const parentLabel = item?.label;
  const data = item?.items?.filter((i: any) => i?.selected) || [];
  const renderItem = useCallback(({ item: subItem }: any) => <OptionItem item={subItem} parentLabel={parentLabel} />, [parentLabel]);
  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);

  return (
    <FlatList
      updateCellsBatchingPeriod={16}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
});

const GrandchildItem = React.memo(({ item, index, parentId, form }: any) => {
  var value = item?.alternativeValue || item?.value;
  const isOption = item?.type === 'option';
  if (isOption) { return <OptionsList item={item} />; }
  if (item?.type === 'date') {
    let year = value?.find((v: any) => v?.id === 'year')?.value || Moment().get('year');
    let month = (`0${Number(value?.find((v: any) => v?.id === 'month')?.value || 0) + 1}`)?.slice(-2);
    let day = value?.find((v: any) => v?.id === 'day')?.value;
    value = year && month && day ? Moment(`${year}-${month}-${day}`).format('LL') : '';
  }
  if (item?.type === 'unit') {
    let measure = value?.[0]?.value;
    let unit = value?.[1]?.value;
    value = `${measure} ${unit}`;
  }
  else if (item?.type === 'time') value = moment(value).format('LT');
  else if (item?.specification && !isOption) item.hidden = true;
  else if (item?.hasSpecification && !isOption) {
    let arr = index >= 0 ? form?.find((f: any) => f?.id === parentId)?.data?.[index] : form?.find((f: any) => f?.id === parentId)?.data;
    value = `${item?.value} • ${arr?.find((f: any) => f?.id === `for-${item?.id}`)?.value}`;
  }

  if (item?.hidden) return null;
  if (typeof (value) === 'string') return <Row label={item?.label} value={value} />;
  return null;
});

const ChildList = React.memo(({ item, parentId, form }: any) => {
  let isParentList = item?.type === 'list';
  if (item?.type === 'info') return null;

  const renderItem = useCallback(({ item: subItem, index }: any) => {
    if (isParentList) return <SubChildList data={subItem} index={index} parentId={parentId} form={form} />;
    else return <GrandchildItem item={subItem} parentId={parentId} form={form} />;
  }, [isParentList, parentId, form]);

  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);
  const ListHeader = useCallback(() => <Header header={(item?.alternativeTitle || item?.title)?.toUpperCase()} />, [item]);
  const ItemSeparator = useCallback(() => {
    if (isParentList) return (<View style={styles?.subChildSeparator} />)
    else return <View />
  }, [isParentList]);

  return (
    <FlatList
      updateCellsBatchingPeriod={16}
      style={styles.tableContainer}
      data={item?.data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
});

const SubChildList = React.memo(({ data, index, parentId, form }: any) => {
  const renderItem = useCallback(({ item: subItem }: any) => {
    if (subItem?.isSet) return <ChildList item={subItem} parentId={parentId} form={form} />;
    return <GrandchildItem item={subItem} index={index} parentId={parentId} form={form} />;
  }, [parentId, form, index]);

  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);

  return (
    <FlatList
      updateCellsBatchingPeriod={16}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
});

const ParentList = React.memo(({ form }: any) => {
  const renderItem = useCallback(({ item: subItem }: any) => <ChildList item={subItem} parentId={subItem?.id} form={form} />, [form]);
  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);

  return (
    <FlatList
      updateCellsBatchingPeriod={16}
      data={form}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
});

function UploadRow(props: {
  fileName: string;
  preview: any;
  uri: string;
  onRequestClose: () => void;
  serviceLayout: any;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.fileContainer}>
      <Text style={styles.fileText} numberOfLines={1}>
        {props.fileName || "None provided"}
      </Text>

      {!!props.fileName && (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            style={styles.filePreview}
            source={props.preview === "image" ? { uri: props.uri } : props.preview}
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
              transition={{ type: "timing", duration: 200 }}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              {/* Zoom Animation Container */}
              <MotiView
                from={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "timing", duration: 250 }}
                style={{
                  width: props.serviceLayout?.width,
                  maxHeight: props.serviceLayout?.height,
                  alignItems: "center",
                }}
              >
                {/* Close button */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{ alignSelf: "flex-end", padding: 10 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Close</Text>
                </TouchableOpacity>

                {/* IMAGE VIEWER */}
                {props.preview === "image" && (
                  <Image
                    resizeMode="contain"
                    style={{
                      width: props.serviceLayout?.width * 0.9,
                      height: props.serviceLayout?.height * 0.85,
                      borderRadius: 8,
                    }}
                    source={{ uri: props.uri }}
                  />
                )}

                {/* PDF VIEWER */}
                {props.preview === "pdf" && (
                  <View
                    style={{
                      width: props.serviceLayout?.width * 0.95,
                      height: props.serviceLayout?.height * 0.85,
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      style={{
                        width: "100%",
                        height: "100%",
                        borderWidth: 0,
                      }}
                      src={
                        "https://docs.google.com/gview?url=" +
                        encodeURIComponent(props.uri) +
                        "&embedded=true"
                      }
                    />

                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 10,
                        color: "#444",
                        fontSize: 13,
                      }}
                    >
                      If preview does not load, download file instead.
                    </Text>
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

const UploadRowMemo = React.memo(({ item, forApplication, serviceLayout }: any) => {
  const fileName = forApplication ? (item?.name ?? item?.assets?.[0]?.name) : item?.small?.split('/')?.pop();
  const uri = forApplication ? (item?.links?.original ?? item?.original) : (item?.links?.original ?? item?.original);
  const preview = NTCPreview(fileName);
  return (
    <UploadRow
      fileName={fileName}
      preview={preview}
      uri={uri}
      onRequestClose={() => { }}
      serviceLayout={serviceLayout}
    />
  )
});
const BulkItem = React.memo(({ item, onEdit, onRemove }: any) => {
  const { service = {}, id } = item;
  const { name = '', applicationType = {} } = service;

  return (
    <View style={styles.reviewContainer}>
      <View style={{ padding: 15 }}>
        <Text style={[styles.boldText, { fontSize: 16 }]}>{name}</Text>
        <Text style={{ marginTop: 5 }}>
          {applicationType?.label}
          {!!applicationType?.element && ` • ${applicationType?.element}`}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 }}>
          <TouchableOpacity
            onPress={() => onEdit(id)}
            style={{ marginRight: 20 }}
          >
            <Text style={{ color: primaryColor, fontFamily: Bold }}>EDIT</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onRemove(id)}>
            <Text style={{ color: text.error, fontFamily: Bold }}>REMOVE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
const UploadsList = React.memo(({ item, index, forApplication, serviceLayout }: any) => {
  const renderItem = useCallback(({ item: subItem }: any) => <UploadRowMemo item={subItem} forApplication={forApplication} serviceLayout={serviceLayout} />, [forApplication, serviceLayout]);
  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);
  const ItemSeparator = useCallback(() => <View style={styles?.uploadSeparator} />, []);
  const ListEmpty = useCallback(() => (
    <View>
      <Text style={styles?.fileText}>
        None provided
      </Text>
    </View>
  ), []);

  return (
    <View>
      <Text style={[styles.boldText]}>{index + 1}. {item?.title}</Text>
      {
        !!item?.description && <Text style={styles?.descriptionText}>{item?.description}</Text>
      }
      <FlatList updateCellsBatchingPeriod={16}
        style={styles.uploadFlatlist}
        data={forApplication ? item?.files : item?.links ? item?.links : item?.files}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={ListEmpty}
      />
    </View>
  );
});

const DocumentsUploadedList = React.memo(({ requirements, forApplication, serviceLayout }: any) => {
  const renderItem = useCallback(({ item, index }: any) => <UploadsList item={item} index={index} forApplication={forApplication} serviceLayout={serviceLayout} />, [forApplication, serviceLayout]);
  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);
  const ItemSeparator = useCallback(() => <View style={styles?.uploadSeparator} />, []);

  return (
    <View style={styles.tableContainer}>
      <Header header="DOCUMENTS UPLOADED" />
      <FlatList updateCellsBatchingPeriod={16}
        style={styles.uploadFlatlist}
        data={requirements}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
      />
    </View>
  );
});
const isNumericKey = (k: any) => /^\d+$/.test(String(k));

const isEmptyValue = (v: any) => {
  if (v == null) return true;
  if (typeof v === "string") {
    const s = v.trim();
    return s === "" || s === "." || s.toLowerCase() === "n/a" || s.toLowerCase() === "null";
  }
  return false;
};

const toText = (v: any) => (isEmptyValue(v) ? "—" : String(v));

const MiscGrandChildList = React.memo(({ gchildValue, gchildLabel, childItem, index }: any) => {
  const renderItem = React.useCallback(({ item: ggchildKey }: any) => {
    const value = gchildValue?.[ggchildKey];

    // ✅ numeric key => render ONLY Item header + its fields
    if (isNumericKey(ggchildKey)) {
      return (
        <View style={{ marginBottom: 12 }}>
          <Header header={`Item #${Number(ggchildKey) + 1}`} secondary />

          {Object.entries(value ?? {}).map(([k, v]) => (
            <Row key={k} label={`• ${transformText(k)}:`} value={toText(v)} />
          ))}
        </View>
      );
    }

    // ✅ normal key => normal row
    return (
      <Row
        label={`${transformText(ggchildKey)}:`}
        value={toText(value)}
      />
    );
  }, [gchildValue]);

  return (
    <View style={styles.tableContainer}>
      <Header
        header={`${isNaN(Number(gchildLabel)) ? gchildLabel : transformText(childItem)} #${index + 1}`}
        secondary
      />

      <FlatList
        data={Object.keys(gchildValue ?? {})}
        renderItem={renderItem}
        keyExtractor={(k) => String(k)}   // ✅ stable
        scrollEnabled
        style={styles.gggChildContainer}
      />
    </View>
  );
});
const MiscChildList = React.memo(({ childValue, label, childItem }: any) => {
  const renderItem = useCallback(({ item: gchildKey, index }: any) => {
    let gchildLabel = transformText(gchildKey);
    let gchildValue = childValue?.[gchildKey];
    let date = new RegExp(/^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/)
    gchildValue = date?.test(gchildValue) && Date.parse(gchildValue) > 0 ? moment(gchildValue)?.format('LL') : gchildValue;
    if (!!gchildValue && typeof (gchildValue) === 'object') {
      return <MiscGrandChildList gchildValue={gchildValue} gchildLabel={gchildLabel} childItem={childItem} index={index} />;
    }
    return <Row label={`${gchildLabel}:`} value={toText(gchildValue)} />;
  }, [childValue, childItem]);

  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);
  const isNumericKey = (k: any) => /^\d+$/.test(String(k));
  return (
    <View style={styles.tableContainer}>
      {!isNumericKey(label) && (
        <Header header={transformText(label)} secondary />
      )}
      <FlatList updateCellsBatchingPeriod={16}
        data={Object.keys(childValue ?? {})}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={true}
        style={styles?.gggChildContainer}
      />
    </View>
  );
});

const MiscParentList = React.memo(({ values }: any) => {
  const renderItem = useCallback(({ item: childKey }: any) => {
    let childLabel = transformText(childKey);
    let childValue = values?.[childKey];
    let date = new RegExp(/^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/)
    childValue = date?.test(childValue) && Date.parse(childValue) > 0 ? moment(childValue)?.format('LL') : childValue;
    if (!!childValue && typeof (childValue) === 'object') {
      return <MiscChildList childValue={childValue} label={childLabel} childItem={childKey} />;
    }
    return <Row label={`${childLabel}:`} value={childValue} />;
  }, [values]);

  const keyExtractor = useCallback((_item: any, index: number) => `${index}`, []);

  return (
    <FlatList updateCellsBatchingPeriod={16}
      data={Object.keys(values)}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      scrollEnabled={true}
      style={[styles?.reviewContainer, styles?.reviewContainer2]}
    />
  );
});

// --- NEW MODERN UI COMPONENTS ---
const ModernHeader = () => (
  <View style={styles.modernHeaderContainer}>
    <View style={{ flex: 1 }}>
      <View style={styles.modernBadgeRefRow}>
        <View style={styles.modernBadge}>
          <Text style={styles.modernBadgeText}>SINGLE</Text>
        </View>
        <Text style={styles.modernRefId}>REF-ID: APP-2026-001</Text>
      </View>
      <Text style={styles.modernTitle}>Ship Station License DOMESTIC Trade (NEW) (WITHOUT originally-installed equipment)</Text>
      <Text style={styles.modernSubtitle}>
        Registered Officer: <Text style={styles.modernSubtitleBold}>Dezza Collection</Text>
      </Text>
    </View>
    <TouchableOpacity style={{ padding: 8 }}>
      <X size={24} color="#94A3B8" />
    </TouchableOpacity>
  </View>
);

const SandboxBanner = () => (
  <View style={styles.sandboxBanner}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View>
        <View style={styles.sandboxBadge}>
          <Text style={styles.sandboxBadgeText}>Sandbox Simulation Tools</Text>
        </View>
        <Text style={styles.sandboxText}>Simulate status transformations immediately to test responsive layout changes:</Text>
        <View style={styles.sandboxButtonGroup}>
          <TouchableOpacity style={styles.sandboxButton}><Text style={styles.sandboxButtonText}>Move to Eval</Text></TouchableOpacity>
          <TouchableOpacity style={styles.sandboxButton}><Text style={styles.sandboxButtonText}>Move to Payment</Text></TouchableOpacity>
          <TouchableOpacity style={styles.sandboxButton}><Text style={styles.sandboxButtonText}>Issue License</Text></TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity>
        <X size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  </View>
);

const RoadmapStepper = () => (
  <View style={styles.roadmapContainer}>
    <Text style={styles.sectionTitle}>STEP PROCESSING ROADMAP</Text>
    <View style={styles.stepperRow}>
      <View style={styles.stepItem}>
        <View style={styles.stepCircleActive}><Text style={styles.stepTextActive}>01</Text></View>
        <Text style={styles.stepLabel}>Submitted</Text>
      </View>
      <View style={styles.stepItem}>
        <View style={styles.stepCircleActive}><Text style={styles.stepTextActive}>02</Text></View>
        <Text style={styles.stepLabel}>Evaluation</Text>
      </View>
      <View style={styles.stepItem}>
        <View style={styles.stepCircleInactive}><Text style={styles.stepTextInactive}>03</Text></View>
        <Text style={styles.stepLabel}>Payment</Text>
      </View>
      <View style={styles.stepItem}>
        <View style={styles.stepCircleInactive}><Text style={styles.stepTextInactive}>04</Text></View>
        <Text style={styles.stepLabel}>Issued</Text>
      </View>
    </View>
  </View>
);

const ContextualActionBoard = () => (
  <View style={styles.actionBoardContainer}>
    <View style={styles.actionBoardHeader}>
      <Text style={styles.sectionTitle}>CONTEXTUAL ACTION BOARD</Text>
      <View style={styles.actionBoardDot} />
    </View>
    <View style={styles.actionBoardContent}>
      <View style={styles.actionIconContainer}>
        <RefreshCcw color="#F59E0B" size={24} /> 
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>Under Technical Evaluation Stage</Text>
        <Text style={styles.actionDesc}>
          Agency engineer team is inspecting operational antenna heights, coordinate alignments, and signal emission boundaries.
        </Text>
      </View>
    </View>
    <View style={styles.actionFooter}>
      <Text style={styles.responsibleUnitText}>Responsible Unit: Maritime Bureau</Text>
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Approve & Move to Pay</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ModernRegistryParameters = () => (
  <View style={styles.registryTable}>
    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
      <Text style={styles.sectionTitle}>STATION REGISTRY PARAMETERS</Text>
    </View>
    <View style={styles.registryRow}>
      <Text style={styles.registryLabel}>Class Type</Text>
      <Text style={styles.registryValue}>Maritime Vessel License Operations</Text>
    </View>
    <View style={styles.registryRow}>
      <Text style={styles.registryLabel}>Radio Range Width</Text>
      <Text style={styles.registryValue}>VHF 156.0 - 174.0 MHz</Text>
    </View>
    <View style={[styles.registryRow, { borderBottomWidth: 0 }]}>
      <Text style={styles.registryLabel}>Maximum Power</Text>
      <Text style={styles.registryValue}>25 Watts Continuous</Text>
    </View>
  </View>
);

const ModernAttachmentChecklist = () => (
  <View style={styles.registryTable}>
    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
      <Text style={styles.sectionTitle}>SUPPORTING ATTACHMENT CHECKLIST</Text>
    </View>
    <View style={styles.checklistItem}>
      <Text style={styles.checklistName}>Technical_Specs_Manual.pdf</Text>
      <TouchableOpacity><Text style={styles.downloadLink}>Download</Text></TouchableOpacity>
    </View>
    <View style={[styles.checklistItem, { borderBottomWidth: 0 }]}>
      <Text style={styles.checklistName}>Signal_Authority_Letter.pdf</Text>
      <TouchableOpacity><Text style={styles.downloadLink}>Download</Text></TouchableOpacity>
    </View>
  </View>
);
// --- END MODERN UI COMPONENTS ---

const Preview: FC<Props> = ({
  navigation,
  route,
  application,
  form,
  pageOnly,
  bulkApplications,
  onEditBulk,
  onRemoveBulk,
  forApplication,
  drawer = true
}) => {
  const dimensions = useWindowDimensions();
  const applicationItem = useSelector((state: any) => state?.service?.applicationItem);
  const myApplication = application || route?.params?.application || applicationItem;
  const [outputVisible, setOutputVisible] = useState(false);
  const [doc, setDoc] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<any>({});
  const dispatch = useDispatch();
  const [sizeComponent, onLayoutComponent] = useComponentLayout();
  useEffect(() => {
    if (!(sizeComponent?.width && sizeComponent?.height)) return
    dispatch(setServiceLayout(sizeComponent));
  }, [sizeComponent, dispatch]);

  const { serviceLayout } = useSelector((state: RootStateOrAny) => state.service);

  const alert = () => {
    setAlertData({
      title: 'Claim',
      message: "Please proceed to the selected region's physical branch."
    });
    setTimeout(() => {
      setShowAlert(true);
    }, 100);
  };

  const onViewOutput = useCallback((pdf: string) => {
    if (myApplication?.service?.serviceCode === 'service-21') alert();
    else {
      setDoc(pdf);
      setTimeout(() => setOutputVisible(true), 500);
    }
  }, [myApplication?.service?.serviceCode]);

  const renderAlert = () => {
    return (
      <NTCAlert
        visible={showAlert}
        title={alertData?.title || 'Alert'}
        message={alertData?.message}
        confirmText='OK'
        onConfirm={() => setShowAlert(false)}
      />
    )
  };
  const renderBulkList = () => {
    return (
      <View style={styles.container}>
        <FlatList
          data={bulkApplications}
          renderItem={({ item }) => (
            <BulkItem
              item={item}
              onEdit={onEditBulk}
              onRemove={onRemoveBulk}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={{ padding: 20 }}>
              <Text style={[styles.boldText, { fontSize: 18 }]}>
                Bulk Applications ({bulkApplications?.length || 0})
              </Text>
              <Text style={{ marginTop: 5, color: text.secondary }}>
                Review and manage your drafted applications before submission.
              </Text>
            </View>
          )}
          ListFooterComponent={() => <View style={{ height: 100 }} />}
        />
      </View>
    );
  };
  const renderViewOutput = () => {
    return (

      <Modal
        transparent
        animationType="fade"
        visible={outputVisible}
        onRequestClose={() => setOutputVisible(false)}
      >
        {/* Background overlay */}
        <TouchableWithoutFeedback onPressOut={() => setOutputVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Modal content */}
        <View style={[styles.modalContainer, { width: serviceLayout?.width, height: serviceLayout?.height }]}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Document Preview</Text>
            <TouchableOpacity onPress={() => setOutputVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Document viewer */}
          <View style={styles.docContainer}>
            <object
              style={{ width: "100%", height: "100%" }}
              data={`https://docs.google.com/gview?url=${doc}&embedded=true`}
            >
              <Text style={styles.errorText}>
                Could not load document. Please check the source link and try again.
              </Text>
            </object>
          </View>

        </View>
      </Modal>
    )
  };

  const renderStatus = () => {
    let { approvalHistory = {}, paymentHistory = {} } = myApplication || {};
    let aStatus = approvalHistory?.status;
    let pStatus = paymentHistory?.status;
    let status = () => {
      if (aStatus !== 'Approved') return aStatus;
      else {
        if (aStatus !== 'Approved') return;
        else return 'Approved';
      }
    };
    let action = () => {
      if (aStatus !== 'Approved') return aStatus;
      else {
        if (aStatus !== 'Approved') return pStatus;
        else return 'Approved';
      }
    };
    let statusColor = (_status: string = '') => {
      switch (_status || status()) {
        case 'Approved': return text.success;
        case 'Declined': return text.error;
        default: return text.warning;
      }
    };
    let icon = () => {
      switch (status()) {
        case 'Approved': return <Check color={statusColor()} size={15} />;
        case 'Declined': return <Close color={statusColor()} size={15} />;
        default: return <Load color={statusColor()} size={15} />;
      }
    };
    return (
      <View style={styles.tableContainer}>
        <Header header="STATUS" />
        <View style={styles.row}>
          {icon()}
          <Text style={[
            styles.statusText,
            styles.boldText,
            { color: statusColor() },
          ]}>{action()}</Text>
        </View>
        {
          !!approvalHistory?.remarks &&

          (approvalHistory?.status == "Declined" &&
            (approvalHistory?.personnel?.role != "evaluator" ||
              approvalHistory?.personnel?.role != "director" ||
              approvalHistory?.personnel?.role != "legal" ||
              approvalHistory?.personnel?.role != "eod") || (approvalHistory?.personnel?.role == "accountant" && approvalHistory?.action == "Approved")
          ) &&
          <View style={[styles?.remarksContainer, { borderColor: statusColor(aStatus) }]}>
            <Text style={[styles?.remarksTitle, { color: statusColor(aStatus) }]}>{aStatus === 'Declined' ? 'NOD/' : ''}Remarks</Text>
            <Text style={[styles?.remarksContent, { color: statusColor(aStatus) }]}>{approvalHistory?.remarks}</Text>
          </View>
        }
        {
          !!paymentHistory?.remarks &&
          <View style={[styles?.remarksContainer, { borderColor: statusColor(pStatus) }]}>
            <Text style={[styles?.remarksTitle, { color: statusColor(pStatus) }]}>{pStatus === 'Declined' ? 'NOD/' : ''}Remarks</Text>
            <Text style={[styles?.remarksContent, { color: statusColor(pStatus) }]}>{paymentHistory?.remarks}</Text>
          </View>
        }
      </View>
    )
  };
  const renderService = () => {
    let { name = '', applicationType = {} } = myApplication?.service || {};
    return (
      <View style={styles.tableContainer}>
        <Header header="APPLICATION" />
        <Text style={[styles.serviceText, styles.boldText]}>
          {`${name}\n\n${applicationType?.label}${!!applicationType?.element ? `\n  • ${applicationType?.element}` : ''}`}
        </Text>
      </View>
    )
  };

  const renderBasic = () => {
    let { companyName, applicantName, lastName, middleName, firstName, suffix, dateOfBirth, sex, nationality, weight, height } = myApplication?.service?.basic || {};
    let birthday = isNaN(dateOfBirth) ? '' : Moment(dateOfBirth).format('LL');
    if (lastName || middleName || firstName || suffix || birthday || sex || nationality || weight || height || companyName) {
      return (
        <View style={styles.tableContainer}>
          <Header header="BASIC INFO" />
          {!!companyName && <Row label="Company name:" value={companyName} />}
          {!!applicantName && <Row label="Representative:" value={applicantName} />}
          {!!lastName && <Row label="Last name:" value={lastName} />}
          {!!middleName && <Row label="Middle name:" value={middleName} />}
          {!!firstName && <Row label="First name:" value={firstName} />}
          {!!suffix && <Row label="Suffix:" value={suffix} />}
          {!!birthday && <Row label="Date of Birth:" value={birthday} />}
          {!!sex && <Row label="Sex:" value={sex} />}
          {!!nationality && <Row label="Nationality:" value={nationality} />}
          {!!weight && <Row label="Weight:" value={weight} />}
          {!!height && <Row label="Height:" value={height} />}
        </View>
      )
    }
  };

  const renderAddress = () => {
    let { unit, street, barangay, province, city, zipCode } = myApplication?.applicant?.address || {};
    if (unit || street || barangay || province || city || zipCode) {
      return (
        <View style={styles.tableContainer}>
          <Header header="ADDRESS" />
          {!!unit && <Row label="Unit/Rm/House/Bldg. No.:" value={unit} />}
          {!!street && <Row label="Street:" value={street} />}
          {!!barangay && <Row label="Barangay:" value={barangay} />}
          {!!province && <Row label="Province:" value={province} />}
          {!!city && <Row label="City/Municipality:" value={city} />}
          {!!zipCode && <Row label="Zip Code:" value={zipCode} />}
        </View>
      )
    }
  };

  const renderEducation = () => {
    let { schoolAttended, courseTaken, yearGraduated } = myApplication?.applicant?.education || {};
    if (schoolAttended || courseTaken || yearGraduated) {
      return (
        <View style={styles.tableContainer}>
          <Header header="EDUCATIONAL BACKGROUND" />
          {!!schoolAttended && <Row label="School Attended:" value={schoolAttended} />}
          {!!courseTaken && <Row label="Course Taken:" value={courseTaken} />}
          {!!yearGraduated && <Row label="Year Graduated:" value={yearGraduated} />}
        </View>
      )
    }
  };

  const renderContact = () => {
    let { contactNumber, email } = myApplication?.applicant?.contact || {};
    if (contactNumber || email) {
      return (
        <View style={styles.tableContainer}>
          <Header header="CONTACT DETAILS" />
          {!!contactNumber && <Row label="Contact Number:" value={contactNumber} />}
          {!!email && <Row label="Email Address:" value={email} />}
        </View>
      )
    }
  };

  const renderRegion = () => {
    if (myApplication?.region) {
      return (
        <View style={styles.tableContainer}>
          <Header header="REGION" />
          <Row label="Region:" value={myApplication?.region || ''} />
        </View>
      )
    }
  };

  const renderSchedule = () => {
    let { dateStart, dateEnd, venue, seatNumber } = myApplication?.schedule || {};
    if (dateStart || dateEnd || venue) {
      return (
        <View style={styles.tableContainer}>
          <Header header="SCHEDULE" />
          {!!dateStart && <Row label="Date:" value={moment(dateStart).format('ddd DD MMMM YYYY')} />}
          {!!dateStart && <Row label="Start Time:" value={moment(dateStart).format('LT')} />}
          {!!dateEnd && <Row label="End Time:" value={moment(dateEnd).format('LT')} />}
          {!!venue && <Row label="Venue:" value={venue} />}
          {!!seatNumber && <Row label="Seat No.:" value={seatNumber} />}
        </View>
      )
    }
  };

  const renderServiceMiscellaneous = () => {
    let service = myApplication?.service || {};

    const renderItem = useCallback(({ item }: any) => {
      if (
        item !== 'basic' &&
        item !== '_id' &&
        item !== 'name' &&
        item !== 'applicationType' &&
        item !== 'serviceCode' &&
        item !== 'about' &&
        item !== 'createdAt' &&
        item !== 'requirements' &&
        item !== 'applicationTypes'
      ) {
        let parentLabel = transformText(item);
        return (
          <View style={styles.tableContainer}>
            <Header header={parentLabel?.toUpperCase()} />
            <MiscParentList values={service[item]} />
          </View>
        );
      }
      return null;
    }, [service]);


    return (
      <FlatList initialNumToRender={99999999} updateCellsBatchingPeriod={16}
        maxToRenderPerBatch={99999999}
        data={Object.keys(service)}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        scrollEnabled={true}
      />
    )
  };

  const renderNote = () => {
    return (
      <View style={styles?.noteView}>
        <Text style={styles?.noteText}>
          Please note that ALL documents uploaded SHALL be presented to the venue before taking the exam.
        </Text>
      </View>
    )
  };
  const renderDownload = () => {
    return (
      <View style={styles?.tableContainer}>
        <Header header="DOWNLOAD" />
        <View style={{ flex: 1, alignItems: 'flex-start', paddingRight: 16, paddingTop: 8 }}>
          <View><DocumentDownloadButton buttonLabel={"Download Form"} onPress={() => onDownloadDocument(myApplication?.formDocument)} /></View>
          <View> <DocumentDownloadButton buttonLabel={"PDF"} onPress={() => onDownloadDocument(myApplication?.document)} /></View>
        </View>
      </View>
    )
  };

  const renderDataFromForm = () => {
    return <ParentList form={form} />;
  };
  const renderDataFromDB = () => {

    return (
      <>
        {renderBasic()}
        {renderAddress()}
        {renderEducation()}
        {renderContact()}
        {renderServiceMiscellaneous()}
      </>
    )
  };


  type DrawerItem = {
    key: string;
    label: string;
    icon?: (p?: any) => JSX.Element;
    onPress?: () => void;
    active?: boolean;
    downloadUrl?: string;
    filename?: string;
  };

  const items = useMemo<DrawerItem[]>(() => {
    const list: DrawerItem[] = [
      { key: 'home', label: 'Dashboard', icon: (p: any) => <Home {...p} />, onPress: () => navigation.navigate('Home') },
    ];

    const isApproved = myApplication?.approvalHistory?.status === 'Approved';
    const isPaid = myApplication?.paymentHistory?.status === 'Approved';

    if (isApproved && isPaid) {
      list.push({
        key: 'or',
        label: 'Official Receipt',
        icon: (p: any) => <Receipt {...p} />,
        onPress: () => onViewOutput?.(myApplication?.officialReceipt?.pdf), // view
        downloadUrl: myApplication?.officialReceipt?.pdf,                  // download
        filename: `OR-${myApplication?.referenceNo || myApplication?.id || 'receipt'}.pdf`,
      });
    }

    if (isApproved && isPaid) {
      list.push({
        key: 'pdf',
        label: 'Document',
        icon: (p: any) => <Pdf {...p} />,
        onPress: () => onViewOutput?.(myApplication?.document),
        downloadUrl: myApplication?.document,
        filename: `Document-${myApplication?.referenceNo || myApplication?.id || 'output'}.pdf`,
      });
    }

    if (myApplication?.approvalHistory?.status === 'Declined') {
      list.push({
        key: 'editApplication',
        label: 'Edit Application',
        icon: (p: any) => <Edit {...p} />,
        onPress: () => navigation.navigate('ApplicationSteps', { application: myApplication, edit: true }),
      });
    }

    if (isApproved && !isPaid) {
      list.push({
        key: 'orderOfPayment',
        label: 'Order of Payment',
        icon: (p: any) => <FileSpreadsheet {...p} />,
        onPress: () => navigation.navigate('PaymentSOA', { application: myApplication }),
      });
    }

    if (isApproved && isPaid) {
      list.push({
        key: 'soa',
        label: 'Statement of Account',
        icon: (p: any) => <FileSpreadsheet {...p} />,
        onPress: () => onViewOutput?.(myApplication?.soaReportPdf),
        downloadUrl: myApplication?.soaReportPdf,
        filename: `SOA-${myApplication?.referenceNo || myApplication?.id || 'soa'}.pdf`,
      });
    }

    list.push({
      key: 'logout',
      label: 'Log out',
      icon: (p: any) => <LogOut {...p} />,
      onPress: () => {
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'Login', params: { loggedOut: true } }] });
        }, 500);
      },
    });

    return list;
  }, [navigation, myApplication, onViewOutput]);


  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
  const { width: screenW } = Dimensions.get('window');
  const [open, setOpen] = useState(true);
  const drawerW = useMemo(() => Math.min(320, Math.max(280, Math.floor(screenW * 0.75))), [screenW]); // ~280–320
  const isGuest = useGuest();
  function PushDrawerNoOverlay({
    open: drawerOpen,
    width,
    items: drawerItems,
    onClose,
  }: {
    open: boolean;
    width: number;
    items: {
      downloadUrl?: string;
      filename?: string; key: string; label: string; icon?: (p?: any) => JSX.Element; onPress?: () => void; active?: boolean
    }[];
    onClose: () => void;
  }) {
    const insets = useSafeAreaInsets();
    return (
      // Parent animates WIDTH only; content to the right is pushed by flex row.
      <MotiView
        animate={{ width: (dimensions.width >= 768) && drawer && isGuest ? width : 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220, mass: 0.9 }}
        style={{
          height: '100%',
          backgroundColor: palette.primary,
          borderRightWidth: drawerOpen ? 1 : 0,
          borderRightColor: alpha(palette.secondary, 0.18),
          overflow: 'hidden',
        }}
      >
        {/* Inner panel stays full width; it's clipped when parent width < width */}
        <View
          style={{
            width,
            height: '100%',
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 12,
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: palette.secondary, fontWeight: '700', fontSize: 18 }}>My Application</Text>

          </View>
          <View style={{ height: 1, backgroundColor: alpha(palette.secondary, 0.18) }} />

          {/* Items */}
          <View style={{ flex: 1, paddingVertical: 8 }}>
            {drawerItems.map((it) => (
              <Pressable
                key={it.key}
                onPress={() => {
                  it.onPress?.();
                  onClose();
                }}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: it.active ? alpha(palette.secondary, 0.10) : 'transparent',
                    borderLeftWidth: it.active ? 3 : 0,
                    borderLeftColor: palette.info,
                  },
                  pressed && { opacity: 0.9 },
                ]}
              >
                {it.icon ? it.icon({ size: 20, color: it.active ? palette.secondary : alpha(palette.secondary, 0.85) }) : <View style={{ width: 20 }} />}
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    color: it.active ? palette.secondary : alpha(palette.secondary, 0.95),
                    fontWeight: it.active ? '700' : '500',
                    fontSize: 15,
                  }}
                >
                  {it.label}
                </Text>
                {it.downloadUrl ? (
                  <Pressable
                    onPress={() => downloadFile(it.downloadUrl!, it.filename)}
                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Download ${it.label}`}
                  >
                    <FileDown size={18} color={alpha(palette.secondary, 0.95)} />
                  </Pressable>
                ) : null}
              </Pressable>
            ))}
          </View>


        </View>
      </MotiView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.border }}>
      {/* Flex row: left = animated drawer width, right = content (flex: 1) */}
      <View style={{ flex: 1, flexDirection: 'row' }}>

        {isGuest && <PushDrawerNoOverlay open={open} onClose={() => setOpen(false)} width={drawerW} items={items} />}

        <MotiView
          animate={{
            transform: [{ scale: open ? 0.99 : 1 }],
            borderRadius: open ? 16 : 0,
          }}
          transition={{ type: 'spring', damping: 18, stiffness: 220, mass: 0.9 }}
          style={{
            flex: 1,
            backgroundColor: palette.surface,
            overflow: 'hidden',
          }}
        >
          {/* ====== YOUR ORIGINAL CONTENT (unchanged) ====== */}
          <View onLayout={onLayoutComponent} style={[styles.container, { backgroundColor: palette.surface }]}>
            {isNative && !pageOnly ? (
              <NavBar
                title="Preview"
                backgroundColor={palette.primary}
                titleColor={palette.secondary}
                leftIcon={<Menu color={palette.secondary} />}
                onLeft={() => setOpen(true)}
              />
            ) : null}

            <ScrollView
              showsVerticalScrollIndicator
              contentContainerStyle={{
                paddingBottom: myApplication?.approvalHistory?.status ? 120 : 24,
              }}
            >
              <ModernHeader />
              <SandboxBanner />
              <RoadmapStepper />
              <ContextualActionBoard />
              <ModernRegistryParameters />
              <ModernAttachmentChecklist />

              {/* KEEPING OLD CONTENT HIDDEN FOR MOCKUP, OR RENDER IT BELOW IF NEEDED */}
              <View style={styles.reviewContainer}>
                <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 20 }]}>--- ORIGINAL DYNAMIC DATA BELOW ---</Text>
                {!pageOnly && renderStatus()}

                {myApplication?.service?.serviceCode === 'service-1' &&
                  myApplication?.formDocument &&
                  renderDownload()}
                {renderService()}

                {
                  !(myApplication?.service?.applicants?.length > 0 && !forApplication) ?
                    <ApplicantsTable title={""} data={myApplication?.service?.applicants || []} />
                    : <></>
                }




                {renderRegion()}


                {myApplication?.service?.serviceCode === 'service-1' && renderNote()}
              </View>

              <View style={pageOnly ? styles.bottomViewPageOnly : styles.bottomView} />
            </ScrollView>
            {
              myApplication?.approvalHistory?.status === 'Declined' &&
              <Bottom
                label='Edit Application'
                onPress={() => setTimeout(() => navigation.navigate('ApplicationSteps', { application: myApplication, edit: true }), 100)}
                disabled={false}
              />
            }

            {
              myApplication?.approvalHistory?.status === 'Approved' &&
              myApplication?.paymentHistory?.status !== 'Approved' &&
              <Bottom
                label='Order of Payment'
                onPress={() => setTimeout(() => navigation.navigate('PaymentSOA', { application: myApplication }))}
                disabled={false}
              />
            }

            {renderViewOutput()}
            {renderAlert()}
          </View>
          {/* ====== END original content ====== */}
        </MotiView>
      </View>
    </View>
  )
};

export default React.memo(Preview);
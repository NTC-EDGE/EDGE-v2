import React, { FC, useCallback } from 'react';
import { FlatList, Platform, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Text from '@atoms/text';
import { DropdownField } from '@molecules/form-fields';
import styles from './styles';
import moment from 'moment';
import { Calendar, Clock, MapMarker } from '@components/atoms/icon';
import Ellipsis from '@components/atoms/ellipsis';
import { infoColor } from '@styles/color';
import QuestionMarkIcon from "@assets/svg/questionMarkIcon";
import { RNValue as RFValue } from "@utils/formatting";
import { Eye, Info } from "lucide-react-native";

interface Region {
  label?: string;
  value?: string;
};

interface Schedule {
  id?: string;
  _id?: string;
  date?: string;
  venue?: string;
  dateStart?: string;
  dateEnd?: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
}
interface ApplicationType {
  label?: string;
  value?: string;
}

interface Office {
  label?: string;
  value?: string;
}


interface Props {
  userType: string
  serviceCode?: string;
  regions?: Region[];
  region?: Region;
  applicationTypes?: ApplicationType[];
  applicationType?: ApplicationType;
  onPreSelect?: any;
  onChangeRegion?: any;
  schedule?: Schedule;
  schedules?: Schedule[];
  fetchingSchedules?: boolean;
  fetchingRegions?: boolean;
  fetchingOffices?: boolean;
  onChangeSchedule?: any;
  onChangeApplication?: any;
  offices?: Office[];
  office?: Office;
  onChangeOffice?: any;
};

const RowContent = React.memo(() => (
  <>
    <View style={{ justifyContent: "center", alignItems: "center", padding: RFValue(3 * 1.2) }}>
      <QuestionMarkIcon height={RFValue(29 * 1.2)} width={RFValue(29 * 1.2)}></QuestionMarkIcon>
    </View>

    <View style={{ justifyContent: "center", padding: RFValue(3 * 1.2) }}>
      <View style={{ paddingBottom: RFValue(7 * 1.2) }}>
        <View style={{ borderRadius: RFValue(10 * 1.2), backgroundColor: "#B4DAFF", width: RFValue(32 * 1.2), height: RFValue(6 * 1.2), }}></View>
      </View>

      <View style={{ borderRadius: RFValue(10 * 1.2), backgroundColor: "#DEE9FC", width: RFValue(50 * 1.2), height: RFValue(6 * 1.2) }}></View>
    </View>
  </>
));

const EmptyList = React.memo(() => (
  <View style={styles?.emptyListContainer}>
    <View style={{ backgroundColor: "#DAE7FF", width: RFValue(140 * 1.2), height: RFValue(140 * 1.2), borderRadius: 10 }}>
      <View style={[styles.row, { marginLeft: RFValue(-21 * 1.2), marginTop: RFValue(10 * 1.2), }]}>
        <RowContent />
      </View>
      <View style={[styles.row, { marginLeft: RFValue(21 * 1.2), marginTop: RFValue(53 * 1.2), }]}>
        <RowContent />
      </View>
      <View style={[styles.row, { marginLeft: RFValue(-21 * 1.2), marginTop: RFValue(96 * 1.2), }]}>
        <RowContent />
      </View>
    </View>

    <View style={{ paddingTop: 20 }}>
      <Text style={styles?.emptyListText}>No schedules yet</Text>
    </View>
  </View>
));

const ListSeparator = React.memo(() => <View style={styles?.separatorView} />);
const ListFooter = React.memo(() => <View style={styles?.footerView} />);

const Region: FC<Props> = ({
  userType = "Individual",
  serviceCode = '',
  regions = [],
  applicationTypes = [],
  region = {},
  applicationType = { label: "Single Application", value: "single-application", },
  onPreSelect = () => { },
  onChangeRegion = () => { },
  schedule = {},
                             fetchingOffices = false,
  schedules = [],
  fetchingSchedules,
  fetchingRegions,
  onChangeSchedule = () => { },
  onChangeApplication = () => { },
  offices = [],
  office = {},
  onChangeOffice = () => { },
}) => {
  const { width, height } = useWindowDimensions();
  const hasSchedule = serviceCode === 'service-1';
  const hasCompany = userType === 'Company';
  const keyExtractor = useCallback((item: Schedule, index: number) => item?.id || item?._id || `${index}`, []);

  const renderSchedules = useCallback(({ item }: { item: Schedule }) => (
    <TouchableOpacity onPress={() => onChangeSchedule(item)} activeOpacity={0.9}>
      <View style={[
        styles.scheduleContainer,
        schedule?.id === item?.id && styles.selectedScheduleContainer,
      ]}>

        {/* Date */}
        <View style={styles.scheduleRow}>
          <View style={styles.iconWrapper}>
            <Calendar color="#0ea5e9" size={18} />
          </View>
          <Text style={styles.scheduleText}>
            DATE: {moment(item?.dateStart).format('ddd, DD MMMM YYYY')}
          </Text>
        </View>

        <View style={styles.scheduleInnerSeparator} />

        {/* Time */}
        <View style={styles.scheduleRow}>
          <View style={styles.iconWrapper}>
            <Clock color="#f59e0b" size={18} />
          </View>
          <Text style={styles.scheduleText}>
            TIME: {moment(item?.dateStart).format('h:mm A')} - {moment(item?.dateEnd).format('h:mm A')}
          </Text>
        </View>

        <View style={styles.scheduleInnerSeparator} />

        {/* Venue */}
        <View style={styles.scheduleRow}>
          <View style={styles.iconWrapper}>
            <MapMarker color="#10b981" size={18} />
          </View>

          <Text style={styles.scheduleText}>VENUE: {item?.venue}</Text>
        </View>

        {item?.applicationStartDate && (
          <>
            <View style={styles.scheduleInnerSeparator} />
            <View style={styles.scheduleRow}>
              <View style={styles.iconWrapper}>
                <Eye color="#6366f1" size={18} />
              </View>
              <Text style={styles.scheduleText}>
                APPLICATION PERIOD: {moment(item?.applicationStartDate).format('MMM D, YYYY h:mm A')} - {moment(item?.applicationEndDate).format('MMM D, YYYY h:mm A')}
              </Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  ), [onChangeSchedule, schedule?.id]);

  return (
    <View style={styles?.mainContainer}>
      <View style={[styles?.subContainer, styles?.dropdownContainer, !hasSchedule && styles?.subContainerFull]}>
        <Text style={styles?.labelText}>Select from which region you intend to apply:</Text>
        <DropdownField
          items={regions}
          placeholder='Region'
          value={region?.label || region?.value}
          onPreSelect={onPreSelect}
          onChangeValue={onChangeRegion}
          loading={fetchingRegions}
        />

        {
          hasCompany &&
          <>
            <Text style={styles?.labelText}>Select how you would  like to process your application:</Text>
            <DropdownField
              required={true}
              items={applicationTypes}
              placeholder='Application Types'
              value={applicationType?.label || applicationType?.value}
              onChangeValue={onChangeApplication}
            />
          </>

        }
        <Text style={styles?.labelText}>Select Office:</Text>
        <DropdownField
            required={true}
            items={offices}
            placeholder="Offices"
            value={office?.label || office?.value}
            onChangeValue={onChangeOffice}
            loading={fetchingOffices}
        />
        {
          applicationType?.value === 'bulk-application' &&
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#EBF2FF',
            borderLeftWidth: 4,
            borderLeftColor: '#2863D6',
            borderRadius: 6,
            padding: 14,
            marginTop: 16,
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Info color="#2863D6" size={20} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'System', fontWeight: '700', fontSize: 13, color: '#1a3a7a', marginBottom: 3 }}>
                Bulk Filing Workflow Mode Engaged
              </Text>
              <Text style={{ fontSize: 12, color: '#3b5998', lineHeight: 18 }}>
                After setting up the regional and office pathways, click <Text style={{ fontWeight: '700' }}>Next</Text> to choose your document upload workspace method.
              </Text>
            </View>
          </View>
        }
        {
          hasSchedule &&
          region?.value &&
          <View style={[styles?.subContainer, styles?.schedulesContainer]}>

            <Text style={{ marginBottom: 15 }}>Scheduled Dates</Text>
            {
              fetchingSchedules
                ? <View style={styles?.ellipsisContainer}>
                  <Ellipsis color={infoColor} size={10} />
                </View>
                : <View >
                  <FlatList
                    showsVerticalScrollIndicator={true}
                    style={styles?.flatlist}
                    data={schedules}
                    renderItem={renderSchedules}
                    keyExtractor={(item, index) => `${index}`}
                    numColumns={
                      Platform.select({
                        native: 1,
                        web: 1
                      })
                    }
                    ListEmptyComponent={() => {
                      return (
                        <View style={styles?.emptyListContainer}><View style={{ backgroundColor: "#DAE7FF", width: RFValue(140 * 1.2), height: RFValue(140 * 1.2), borderRadius: 10 }}>

                          <View style={[styles.row, { marginLeft: RFValue(-21 * 1.2), marginTop: RFValue(10 * 1.2), }]}>
                            <RowContent />
                          </View>
                          <View style={[styles.row, { marginLeft: RFValue(21 * 1.2), marginTop: RFValue(53 * 1.2), }]}>
                            <RowContent />
                          </View>
                          <View style={[styles.row, { marginLeft: RFValue(-21 * 1.2), marginTop: RFValue(96 * 1.2), }]}>
                            <RowContent />
                          </View>
                        </View>

                          <View style={{ paddingTop: 20 }}>
                            <Text style={styles?.emptyListText}>No schedules yet</Text>
                          </View>

                        </View>
                      )
                    }}
                    ListFooterComponent={() => <View style={styles?.footerView} />}
                    ItemSeparatorComponent={() => <View style={styles?.separatorView} />}
                  />
                </View>
            }
          </View>
        }
      </View>



    </View>
  )
};

export default React.memo(Region);

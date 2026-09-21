import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@edge/ui';
import { Select } from '../../../../shared/components/Select';
import { ValidatedInput } from '../../../../shared/components/ValidatedInput';
import { DatePickerInput } from '../../../../shared/components/DatePickerInput';
import { VASProviderData } from '../types/certificateTypes';
import { certStyles } from './CertificateFormStyles';

interface VASProviderFormProps {
  data: VASProviderData;
  onChange: (fields: Partial<VASProviderData>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

const AVAILABLE_VAS_SERVICES = [
  'Messaging Service',
  'Audio Conferencing',
  'Audio and Video Conferencing',
  'Voice mail service',
  'Electronic mail service',
  'Information service',
  'Content and Program service',
  'Audiotext service',
  'Facsimile service',
  'Hosting service',
  'Electronic Gaming Services, except gambling',
  'Others',
];

const isVasEntityType = (val: string): val is VASProviderData['serviceType'] => {
  return ['Single Proprietorship', 'Corporation', 'Partnership', 'Others'].includes(val);
};

export function VASProviderForm({
  data,
  onChange,
  errors = {},
  touched = {},
}: VASProviderFormProps) {
  const toggleVasService = (service: string) => {
    const current = data.valueAddedServices || [];
    if (current.includes(service)) {
      onChange({ valueAddedServices: current.filter((s) => s !== service) });
    } else {
      onChange({ valueAddedServices: [...current, service] });
    }
  };

  return (
    <View style={certStyles.container}>
      {/* Application Type Section */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>Application Type</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol12}>
            <Text style={certStyles.selectLabel}>Application Type*</Text>
            <Select
              value="RENEWAL"
              onValueChange={() => onChange({ appType: 'RENEWAL' as const })}
              options={[{ label: 'Renewal of Certificate', value: 'RENEWAL' }]}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="Certificate no."
              placeholder="e.g. COR-VAS-2022-0045"
              value={data.certificateNumber}
              onChangeText={(val) => onChange({ certificateNumber: val })}
              error={errors.certificateNumber}
              touched={touched.certificateNumber}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <DatePickerInput
              label="Certificate no. Date of Expiry"
              placeholder="MM/DD/YYYY"
              value={data.expiryDate}
              onChangeText={(val) => onChange({ expiryDate: val })}
              error={errors?.expiryDate}
              touched={touched?.expiryDate}
              required
            />
          </View>
        </View>
      </View>

      {/* Registration Details */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>VAS Registration Particulars</Text>
        <View style={certStyles.formGrid}>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Type of Entity*</Text>
            <Select
              value={data.serviceType || 'Corporation'}
              onValueChange={(val) => {
                if (isVasEntityType(val)) {
                  onChange({ serviceType: val });
                }
              }}
              options={[
                { label: 'Corporation', value: 'Corporation' },
                { label: 'Single Proprietorship', value: 'Single Proprietorship' },
                { label: 'Partnership', value: 'Partnership' },
                { label: 'Others', value: 'Others' },
              ]}
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="CPCN / PA / CA No."
              placeholder="e.g. CPCN No. 2020-0012"
              value={data.serviceNo}
              onChangeText={(val) => onChange({ serviceNo: val })}
              error={errors?.serviceNo}
              touched={touched?.serviceNo}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <DatePickerInput
              label="CPCN / PA / CA No. Date of Expiry"
              placeholder="MM/DD/YYYY"
              value={data.cpcnPaCaDateOfExpiry}
              onChangeText={(val) => onChange({ cpcnPaCaDateOfExpiry: val })}
              error={errors?.cpcnPaCaDateOfExpiry}
              touched={touched?.cpcnPaCaDateOfExpiry}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <ValidatedInput
              label="COR / VAS No."
              placeholder="e.g. COR-VAS-2022-0045"
              value={data.certificateNumber}
              onChangeText={(val) => onChange({ certificateNumber: val })}
              error={errors?.certificateNumber}
              touched={touched?.certificateNumber}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <DatePickerInput
              label="COR / VAS No. Date of Expiry"
              placeholder="MM/DD/YYYY"
              value={data.expiryDate}
              onChangeText={(val) => onChange({ expiryDate: val })}
              error={errors?.expiryDate}
              touched={touched?.expiryDate}
              required
            />
          </View>
          <View style={certStyles.formCol6}>
            <Text style={certStyles.selectLabel}>Known by other Name</Text>
            <Select
              value={data.isKnownByOtherName ? 'Yes' : 'No'}
              onValueChange={(val) => onChange({ isKnownByOtherName: val === 'Yes' })}
              options={[
                { label: 'Yes', value: 'Yes' },
                { label: 'No', value: 'No' },
              ]}
            />
          </View>
          {data.isKnownByOtherName && (
            <View style={certStyles.formCol6}>
              <ValidatedInput
                label="Please specify (Trade Name / Former Name)"
                placeholder="e.g. Acme Cloud Connect"
                value={data.otherTradeName}
                onChangeText={(val) => onChange({ otherTradeName: val })}
                required
              />
            </View>
          )}
        </View>
      </View>

      {/* Scope of Value-Added Services */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>VALUE ADDED SERVICE (Checkbox)</Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          Select all services to be provided under this registration:
        </Text>
        <View style={certStyles.checkboxGrid}>
          {AVAILABLE_VAS_SERVICES.map((vas) => {
            const isSelected = data.valueAddedServices.includes(vas);
            return (
              <TouchableOpacity
                key={vas}
                onPress={() => toggleVasService(vas)}
                style={certStyles.checkboxItem}
              >
                <View style={[certStyles.checkboxBox, isSelected && certStyles.checkboxBoxSelected]}>
                  {isSelected && <Icon name="check" size={12} color="#ffffff" />}
                </View>
                <Text style={certStyles.checkboxLabel}>{vas}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* VAS Registration Official Assignment */}
      <View style={certStyles.formSection}>
        <Text style={certStyles.formSectionHeading}>VAS REGISTRATION : TO BE ASSIGNED BY NTC</Text>
        <ValidatedInput
          label="VAS Registration No."
          value="TO BE ASSIGNED BY NTC"
          editable={false}
          onChangeText={() => {}}
        />
        <Text style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
          * This field is only editable on NTC’s end for assigning official VAS No.
        </Text>
      </View>
    </View>
  );
}

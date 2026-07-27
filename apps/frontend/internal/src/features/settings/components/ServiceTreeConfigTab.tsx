import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import {
  useAdminServices,
  useAdminNotes,
  useAdminRequirements,
  useAdminFees,
  apiClient,
} from '@edge/api';

export interface ServiceVariant {
  id: string;
  name: string;
  code: string;
  isEnabled: boolean;
}

export interface ServiceElement {
  id: string;
  name: string;
  code: string;
  description: string;
  fees: {
    id: string;
    name: string;
    amount: number;
    feeType: string;
  }[];
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  isActive: boolean;
  variants: ServiceVariant[];
}

const DEFAULT_SERVICES: ServiceCatalogItem[] = [
  {
    id: 'srv-1',
    name: 'Radio Station License',
    code: 'RSL-001',
    category: 'Broadcasting & Mobile',
    description: 'Authorization and licensing for commercial, amateur, and private radio stations.',
    isActive: true,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
      { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
      { id: 'v-dup', name: 'Duplicate License', code: 'DUP', isEnabled: false },
    ],
  },
  {
    id: 'srv-2',
    name: 'Permit to Purchase / Import',
    code: 'PPI-002',
    category: 'Equipment Importation',
    description: 'Permit for purchasing, importing, or selling radio communications equipment.',
    isActive: true,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: false },
      { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
    ],
  },
  {
    id: 'srv-3',
    name: 'Dealer Certificate of Registration',
    code: 'DCR-003',
    category: 'Dealers & Suppliers',
    description: 'Registration and certification for radio equipment dealers and service centers.',
    isActive: false,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
    ],
  },
  {
    id: 'srv-4',
    name: 'Value Added Service (VAS) Provider License',
    code: 'VAS-004',
    category: 'Telecommunications',
    description: 'License for offering value-added telecommunications services to the public.',
    isActive: true,
    variants: [
      { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
      { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
      { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
    ],
  },
];

const DEFAULT_ELEMENTS: Record<string, ServiceElement[]> = {
  'srv-1_v-new': [
    {
      id: 'el-1',
      name: 'Transmitter & Antenna Base Unit',
      code: 'ELEM-TX',
      description: 'Physical RF transmitter and tower antenna infrastructure.',
      fees: [
        { id: 'f-1', name: 'Filing Fee', amount: 500.0, feeType: 'Fixed' },
        { id: 'f-2', name: 'Inspection & Engineering Fee', amount: 1500.0, feeType: 'Fixed' },
        { id: 'f-3', name: 'License Rights Fee', amount: 3000.0, feeType: 'Annual' },
      ],
    },
    {
      id: 'el-2',
      name: 'Frequency Channel Spectrum Assignment',
      code: 'ELEM-FREQ',
      description: 'Allocated frequency spectrum channel bandwidth.',
      fees: [
        { id: 'f-4', name: 'Spectrum Allocation Fee', amount: 2500.0, feeType: 'Per MHz' },
        { id: 'f-5', name: 'Supervisory Fee', amount: 800.0, feeType: 'Annual' },
      ],
    },
  ],
  'srv-1_v-renew': [
    {
      id: 'el-3',
      name: 'Renewal Station Audit & License Rights',
      code: 'ELEM-REN',
      description: 'Regular renewal audit and continued license rights.',
      fees: [
        { id: 'f-6', name: 'Renewal Filing Fee', amount: 400.0, feeType: 'Fixed' },
        { id: 'f-7', name: 'Annual License Renewal Fee', amount: 2800.0, feeType: 'Annual' },
      ],
    },
  ],
};

const DEFAULT_NOTES_MAP: Record<string, string[]> = {
  'srv-1_v-new': [
    'Applicants must submit notarized engineering plans signed by a registered PECE.',
    'Proof of land ownership or lease agreement for tower installation site is mandatory.',
  ],
  'srv-1_v-renew': [
    'Submit official receipt of previous year license payment together with filing form.',
  ],
};

const DEFAULT_REQUIREMENTS_MAP: Record<string, { id: string; name: string; isRequired: boolean }[]> = {
  'srv-1_v-new': [
    { id: 'req-1', name: 'SEC / DTI Registration Certificate', isRequired: true },
    { id: 'req-2', name: 'Notarized Application Form (NTC Form 101)', isRequired: true },
    { id: 'req-3', name: 'PECE Signed Engineering Plans & Diagrams', isRequired: true },
    { id: 'req-4', name: 'Environmental Compliance Certificate (ECC)', isRequired: false },
  ],
  'srv-1_v-renew': [
    { id: 'req-5', name: 'Original Copy of Previous License', isRequired: true },
    { id: 'req-6', name: 'Proof of Payment (Official Receipt)', isRequired: true },
  ],
};

export function ServiceTreeConfigTab() {
  // Live Backend SWR API Hooks
  const { services: apiServices, isLoading: isServicesLoading } = useAdminServices();
  const { notes: apiNotes } = useAdminNotes();
  const { requirements: apiRequirements, serviceVariantRequirements: apiSvr } = useAdminRequirements();
  const { fees: apiFees, serviceFees: apiServiceFees } = useAdminFees();

  // Services Catalog State (Level 1)
  const [services, setServices] = useState<ServiceCatalogItem[]>(DEFAULT_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Selected Service + Variant State (Level 2 & 3)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('v-new');

  // Dynamic Data Store States
  const [elementsMap, setElementsMap] = useState<Record<string, ServiceElement[]>>(DEFAULT_ELEMENTS);
  const [notesMap, setNotesMap] = useState<Record<string, string[]>>(DEFAULT_NOTES_MAP);
  const [requirementsMap, setRequirementsMap] = useState<Record<string, { id: string; name: string; isRequired: boolean }[]>>(DEFAULT_REQUIREMENTS_MAP);

  // Populate services state from live API response when available
  useEffect(() => {
    if (apiServices && apiServices.length > 0) {
      const mappedServices: ServiceCatalogItem[] = apiServices.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code || `SRV-${s.id.slice(-4)}`,
        category: s.serviceCategoryType || s.serviceCategoryCode || 'General Service',
        description: s.description || 'System service configured by system administrator.',
        isActive: true,
        variants: [
          { id: 'v-new', name: 'New Application', code: 'NEW', isEnabled: true },
          { id: 'v-renew', name: 'Renewal Application', code: 'RENEW', isEnabled: true },
          { id: 'v-modify', name: 'Modification', code: 'MODIFY', isEnabled: true },
        ],
      }));
      setServices(mappedServices);
    }
  }, [apiServices]);

  // Expanded Element Accordion State (Level 4)
  const [expandedElementId, setExpandedElementId] = useState<string | null>('el-1');

  // Input Modal Forms State
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newReqName, setNewReqName] = useState('');
  const [newReqMandatory, setNewReqMandatory] = useState(true);
  const [isAddingReq, setIsAddingReq] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [isAddingElement, setIsAddingElement] = useState(false);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [addingFeeForElementId, setAddingFeeForElementId] = useState<string | null>(null);

  // Active Service Details
  const activeService = services.find((s) => s.id === selectedServiceId) || null;
  const contextKey = selectedServiceId ? `${selectedServiceId}_${selectedVariantId}` : '';

  // Toggle Activation Switch for Level 1 Service
  const handleToggleServiceActive = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // Toggle Variant Enabled Status
  const handleToggleVariantEnabled = (serviceId: string, variantId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          return {
            ...s,
            variants: s.variants.map((v) =>
              v.id === variantId ? { ...v, isEnabled: !v.isEnabled } : v
            ),
          };
        }
        return s;
      })
    );
  };

  // Add Note Handler
  const handleAddNote = () => {
    if (!newNoteText.trim() || !contextKey) return;
    setNotesMap((prev) => ({
      ...prev,
      [contextKey]: [...(prev[contextKey] || []), newNoteText.trim()],
    }));
    setNewNoteText('');
    setIsAddingNote(false);
  };

  // Delete Note Handler
  const handleDeleteNote = (index: number) => {
    if (!contextKey) return;
    setNotesMap((prev) => ({
      ...prev,
      [contextKey]: (prev[contextKey] || []).filter((_, i) => i !== index),
    }));
  };

  // Add Requirement Handler
  const handleAddRequirement = () => {
    if (!newReqName.trim() || !contextKey) return;
    const newItem = {
      id: `req-${Date.now()}`,
      name: newReqName.trim(),
      isRequired: newReqMandatory,
    };
    setRequirementsMap((prev) => ({
      ...prev,
      [contextKey]: [...(prev[contextKey] || []), newItem],
    }));
    setNewReqName('');
    setIsAddingReq(false);
  };

  // Delete Requirement Handler
  const handleDeleteRequirement = (reqId: string) => {
    if (!contextKey) return;
    setRequirementsMap((prev) => ({
      ...prev,
      [contextKey]: (prev[contextKey] || []).filter((r) => r.id !== reqId),
    }));
  };

  // Add Element Handler
  const handleAddElement = () => {
    if (!newElementName.trim() || !contextKey) return;
    const newEl: ServiceElement = {
      id: `el-${Date.now()}`,
      name: newElementName.trim(),
      code: `ELEM-${Date.now().toString().slice(-4)}`,
      description: 'Configured element under selected service variant.',
      fees: [],
    };
    setElementsMap((prev) => ({
      ...prev,
      [contextKey]: [...(prev[contextKey] || []), newEl],
    }));
    setNewElementName('');
    setIsAddingElement(false);
  };

  // Add Fee Item Handler
  const handleAddFeeItem = (elementId: string) => {
    if (!newFeeName.trim() || !newFeeAmount || !contextKey) return;
    const amountNum = parseFloat(newFeeAmount) || 0;
    const newFee = {
      id: `fee-${Date.now()}`,
      name: newFeeName.trim(),
      amount: amountNum,
      feeType: 'Standard Fee',
    };

    setElementsMap((prev) => ({
      ...prev,
      [contextKey]: (prev[contextKey] || []).map((el) =>
        el.id === elementId ? { ...el, fees: [...el.fees, newFee] } : el
      ),
    }));
    setNewFeeName('');
    setNewFeeAmount('');
    setAddingFeeForElementId(null);
  };

  // ==========================================
  // LEVEL 1: SERVICES ACTIVATION CATALOG GRID
  // ==========================================
  if (!selectedServiceId || !activeService) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services Activation Catalog</Text>
          <Text style={styles.sectionSubtitle}>
            Configure and activate system services for your regional office. Click an activated service to configure its variants, guidance notes, requirements, and fee elements.
          </Text>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <View
              key={service.id}
              style={[
                styles.serviceCard,
                service.isActive ? styles.serviceCardActive : styles.serviceCardInactive,
              ]}
            >
              <View style={styles.serviceCardHeader}>
                <View style={styles.serviceIconBox}>
                  <Lucide
                    name="layers"
                    size={20}
                    color={service.isActive ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                </View>

                <View style={styles.activationBox}>
                  <View
                    style={[
                      styles.badge,
                      service.isActive ? styles.badgeActive : styles.badgeInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeDot,
                        service.isActive ? styles.badgeDotActive : styles.badgeDotInactive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        service.isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                      ]}
                    >
                      {service.isActive ? 'Activated' : 'Inactive'}
                    </Text>
                  </View>

                  <Switch
                    value={service.isActive}
                    onValueChange={() => handleToggleServiceActive(service.id)}
                    trackColor={{ false: COLORS.neutral[200], true: '#93C5FD' }}
                    thumbColor={service.isActive ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                </View>
              </View>

              <View style={styles.serviceCardBody}>
                <Text style={styles.serviceCategoryText}>{service.category}</Text>
                <Text style={styles.serviceTitle}>{service.name}</Text>
                <Text style={styles.serviceCode}>Code: {service.code}</Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
              </View>

              <View style={styles.serviceCardFooter}>
                <Pressable
                  disabled={!service.isActive}
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.configureBtn,
                    service.isActive ? styles.configureBtnActive : styles.configureBtnDisabled,
                    pressed && service.isActive && styles.configureBtnPressed,
                  ]}
                  onPress={() => setSelectedServiceId(service.id)}
                >
                  <Lucide
                    name="settings"
                    size={14}
                    color={service.isActive ? COLORS.brand[700] : COLORS.neutral[400]}
                  />
                  <Text
                    style={[
                      styles.configureBtnText,
                      service.isActive ? styles.configureBtnTextActive : styles.configureBtnTextDisabled,
                    ]}
                  >
                    Configure Variants & Prerequisites
                  </Text>
                  <Lucide
                    name="chevron-right"
                    size={14}
                    color={service.isActive ? COLORS.brand[700] : COLORS.neutral[400]}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ====================================================
  // LEVEL 2, 3 & 4: SERVICE DETAILS & TREE CONFIGURATION
  // ====================================================
  const activeVariant = activeService.variants.find((v) => v.id === selectedVariantId) || activeService.variants[0];
  const activeNotes = notesMap[contextKey] || [];
  const activeRequirements = requirementsMap[contextKey] || [];
  const activeElements = elementsMap[contextKey] || [];

  return (
    <View style={styles.container}>
      {/* Top Navigation Breadcrumb */}
      <View style={styles.breadcrumbBar}>
        <Pressable style={styles.backBtn} onPress={() => setSelectedServiceId(null)}>
          <Lucide name="arrow-left" size={16} color={COLORS.brand[700]} />
          <Text style={styles.backBtnText}>Back to Services Catalog</Text>
        </Pressable>
        <Text style={styles.breadcrumbDivider}>/</Text>
        <Text style={styles.breadcrumbCurrent}>{activeService.name}</Text>
      </View>

      {/* Service Header Banner */}
      <View style={styles.serviceBanner}>
        <View style={styles.serviceBannerMain}>
          <View style={styles.bannerIconBox}>
            <Lucide name="layers" size={24} color={COLORS.neutral.white} />
          </View>
          <View style={styles.bannerTitleBox}>
            <Text style={styles.bannerCategory}>{activeService.category}</Text>
            <Text style={styles.bannerTitle}>{activeService.name}</Text>
            <Text style={styles.bannerSubtext}>Code: {activeService.code} · Regional Status: Activated</Text>
          </View>
        </View>
      </View>

      {/* LEVEL 2: VARIANT SELECTION & CONFIGURATION BAR */}
      <View style={styles.variantsCard}>
        <View style={styles.variantsHeader}>
          <View>
            <Text style={styles.variantsTitle}>Service Variants Configuration</Text>
            <Text style={styles.variantsSubtitle}>
              Enable transaction variants for this service and select a variant to configure its notes, requirements, and fee elements.
            </Text>
          </View>
        </View>

        <View style={styles.variantList}>
          {activeService.variants.map((variant) => {
            const isSelected = selectedVariantId === variant.id;
            return (
              <View
                key={variant.id}
                style={[
                  styles.variantPill,
                  isSelected ? styles.variantPillSelected : styles.variantPillUnselected,
                ]}
              >
                <Pressable
                  style={styles.variantSelectClick}
                  onPress={() => setSelectedVariantId(variant.id)}
                >
                  <Lucide
                    name={isSelected ? 'check-circle' : 'circle'}
                    size={16}
                    color={isSelected ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                  <Text
                    style={[
                      styles.variantPillText,
                      isSelected ? styles.variantPillTextSelected : styles.variantPillTextUnselected,
                    ]}
                  >
                    {variant.name}
                  </Text>
                </Pressable>

                <View style={styles.variantToggleBox}>
                  <Text style={styles.variantToggleLabel}>
                    {variant.isEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                  <Switch
                    value={variant.isEnabled}
                    onValueChange={() => handleToggleVariantEnabled(activeService.id, variant.id)}
                    trackColor={{ false: COLORS.neutral[200], true: '#93C5FD' }}
                    thumbColor={variant.isEnabled ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* LEVEL 3 & 4: TREE DETAILS FOR SELECTED VARIANT */}
      <View style={styles.detailsGrid}>
        {/* SECTION 1: GUIDANCE NOTES FOR SERVICE + VARIANT */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Lucide name="file-text" size={18} color={COLORS.brand[600]} />
              <Text style={styles.cardTitle}>Guidance Notes</Text>
              <Text style={styles.badgeContextText}>
                ({activeService.name} · {activeVariant.name})
              </Text>
            </View>
            <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingNote(true)}>
              <Lucide name="plus" size={14} color={COLORS.brand[700]} />
              <Text style={styles.addSmallBtnText}>Add Note</Text>
            </Pressable>
          </View>

          {isAddingNote && (
            <View style={styles.addBoxContainer}>
              <TextInput
                style={styles.addInput}
                placeholder="Enter guidance note instructions for applicants..."
                value={newNoteText}
                onChangeText={setNewNoteText}
                multiline
              />
              <View style={styles.addBoxActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setIsAddingNote(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveSmallBtn} onPress={handleAddNote}>
                  <Text style={styles.saveSmallBtnText}>Save Guidance Note</Text>
                </Pressable>
              </View>
            </View>
          )}

          {activeNotes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No guidance notes configured for this variant.</Text>
            </View>
          ) : (
            <View style={styles.notesList}>
              {activeNotes.map((noteText, idx) => (
                <View key={idx} style={styles.noteCard}>
                  <View style={styles.noteNumberBox}>
                    <Text style={styles.noteNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.noteContentText}>{noteText}</Text>
                  <Pressable style={styles.deleteIconBtn} onPress={() => handleDeleteNote(idx)}>
                    <Lucide name="trash-2" size={14} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* SECTION 2: APPLICATION REQUIREMENTS (1-TO-MANY) */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Lucide name="check-square" size={18} color={COLORS.brand[600]} />
              <Text style={styles.cardTitle}>Application Requirements (1-to-Many)</Text>
            </View>
            <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingReq(true)}>
              <Lucide name="plus" size={14} color={COLORS.brand[700]} />
              <Text style={styles.addSmallBtnText}>Attach Requirement</Text>
            </Pressable>
          </View>

          {isAddingReq && (
            <View style={styles.addBoxContainer}>
              <TextInput
                style={styles.addInput}
                placeholder="Enter document name (e.g. SEC Registration, Valid ID)..."
                value={newReqName}
                onChangeText={setNewReqName}
              />
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabelText}>Mandatory Requirement:</Text>
                <Switch
                  value={newReqMandatory}
                  onValueChange={setNewReqMandatory}
                  trackColor={{ false: COLORS.neutral[200], true: '#93C5FD' }}
                  thumbColor={newReqMandatory ? COLORS.brand[600] : COLORS.neutral[400]}
                />
              </View>
              <View style={styles.addBoxActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setIsAddingReq(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveSmallBtn} onPress={handleAddRequirement}>
                  <Text style={styles.saveSmallBtnText}>Attach Requirement</Text>
                </Pressable>
              </View>
            </View>
          )}

          {activeRequirements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No document requirements attached for this variant.</Text>
            </View>
          ) : (
            <View style={styles.reqsList}>
              {activeRequirements.map((req) => (
                <View key={req.id} style={styles.reqCard}>
                  <View style={styles.reqInfo}>
                    <Lucide name="file" size={16} color={COLORS.brand[600]} />
                    <Text style={styles.reqName}>{req.name}</Text>
                  </View>

                  <View style={styles.reqActions}>
                    <View
                      style={[
                        styles.reqBadge,
                        req.isRequired ? styles.reqBadgeMandatory : styles.reqBadgeOptional,
                      ]}
                    >
                      <Text
                        style={[
                          styles.reqBadgeText,
                          req.isRequired ? styles.reqBadgeTextMandatory : styles.reqBadgeTextOptional,
                        ]}
                      >
                        {req.isRequired ? 'Mandatory' : 'Optional'}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.deleteIconBtn}
                      onPress={() => handleDeleteRequirement(req.id)}
                    >
                      <Lucide name="trash-2" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* SECTION 3 & LEVEL 4: SERVICE ELEMENTS & FEES (1-TO-MANY) */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Lucide name="box" size={18} color={COLORS.brand[600]} />
              <Text style={styles.cardTitle}>Service Elements & Fee Structure</Text>
            </View>
            <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingElement(true)}>
              <Lucide name="plus" size={14} color={COLORS.brand[700]} />
              <Text style={styles.addSmallBtnText}>Add Element</Text>
            </Pressable>
          </View>

          {isAddingElement && (
            <View style={styles.addBoxContainer}>
              <TextInput
                style={styles.addInput}
                placeholder="Enter element name (e.g. Transmitter Unit, Frequency Assignment)..."
                value={newElementName}
                onChangeText={setNewElementName}
              />
              <View style={styles.addBoxActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setIsAddingElement(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveSmallBtn} onPress={handleAddElement}>
                  <Text style={styles.saveSmallBtnText}>Save Service Element</Text>
                </Pressable>
              </View>
            </View>
          )}

          {activeElements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No elements configured under this service variant.</Text>
            </View>
          ) : (
            <View style={styles.elementsList}>
              {activeElements.map((element) => {
                const isExpanded = expandedElementId === element.id;
                const totalElementFees = element.fees.reduce((acc, f) => acc + f.amount, 0);

                return (
                  <View key={element.id} style={styles.elementCard}>
                    <Pressable
                      style={styles.elementHeaderRow}
                      onPress={() => setExpandedElementId(isExpanded ? null : element.id)}
                    >
                      <View style={styles.elementTitleBox}>
                        <Lucide
                          name={isExpanded ? 'chevron-down' : 'chevron-right'}
                          size={16}
                          color={COLORS.neutral[500]}
                        />
                        <Text style={styles.elementName}>{element.name}</Text>
                        <Text style={styles.elementCodeBadge}>{element.code}</Text>
                      </View>

                      <View style={styles.elementFeeStats}>
                        <Text style={styles.elementFeeCount}>
                          {element.fees.length} Fee Items
                        </Text>
                        <Text style={styles.elementFeeTotal}>
                          Total: ₱{totalElementFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </Pressable>

                    {/* LEVEL 4: EXPANDED ELEMENT FEES & PAYMENTS (1-TO-MANY) */}
                    {isExpanded && (
                      <View style={styles.elementFeesContainer}>
                        <View style={styles.elementFeesHeader}>
                          <Text style={styles.elementFeesTitle}>
                            Fees & Payments for "{element.name}"
                          </Text>
                          <Pressable
                            style={styles.addSmallBtn}
                            onPress={() => setAddingFeeForElementId(element.id)}
                          >
                            <Lucide name="plus" size={12} color={COLORS.brand[700]} />
                            <Text style={styles.addSmallBtnText}>Add Fee Item</Text>
                          </Pressable>
                        </View>

                        {addingFeeForElementId === element.id && (
                          <View style={styles.addBoxContainer}>
                            <TextInput
                              style={styles.addInput}
                              placeholder="Fee Item Name (e.g. Filing Fee, Inspection Fee)..."
                              value={newFeeName}
                              onChangeText={setNewFeeName}
                            />
                            <TextInput
                              style={styles.addInput}
                              placeholder="Amount (e.g. 500.00)..."
                              keyboardType="numeric"
                              value={newFeeAmount}
                              onChangeText={setNewFeeAmount}
                            />
                            <View style={styles.addBoxActions}>
                              <Pressable
                                style={styles.cancelBtn}
                                onPress={() => setAddingFeeForElementId(null)}
                              >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                              </Pressable>
                              <Pressable
                                style={styles.saveSmallBtn}
                                onPress={() => handleAddFeeItem(element.id)}
                              >
                                <Text style={styles.saveSmallBtnText}>Attach Fee Item</Text>
                              </Pressable>
                            </View>
                          </View>
                        )}

                        {element.fees.length === 0 ? (
                          <Text style={styles.emptyFeesText}>No fee rules attached to this element.</Text>
                        ) : (
                          <View style={styles.feeItemsTable}>
                            {element.fees.map((fee) => (
                              <View key={fee.id} style={styles.feeItemRow}>
                                <View style={styles.feeItemNameBox}>
                                  <Lucide name="dollar-sign" size={14} color="#10B981" />
                                  <Text style={styles.feeItemName}>{fee.name}</Text>
                                </View>
                                <Text style={styles.feeItemAmount}>
                                  ₱{fee.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[20],
  },
  sectionHeader: {
    gap: 4,
    marginBottom: SPACING[8],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.neutral[500],
    lineHeight: 18,
  },
  // LEVEL 1: SERVICES CATALOG GRID
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  serviceCard: {
    width: '48%',
    minWidth: 320,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[20],
    gap: SPACING[12],
    ...SHADOWS.card,
  },
  serviceCardActive: {
    borderColor: '#93C5FD',
  },
  serviceCardInactive: {
    borderColor: COLORS.neutral[200],
    opacity: 0.85,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.button,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.circle,
    gap: 6,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeInactive: {
    backgroundColor: COLORS.neutral[100],
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeDotActive: {
    backgroundColor: '#16A34A',
  },
  badgeDotInactive: {
    backgroundColor: COLORS.neutral[400],
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#15803D',
  },
  badgeTextInactive: {
    color: COLORS.neutral[600],
  },
  serviceCardBody: {
    gap: 4,
  },
  serviceCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand[700],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  serviceCode: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.neutral[500],
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 18,
    marginTop: 4,
  },
  serviceCardFooter: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    paddingTop: SPACING[12],
  },
  configureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  configureBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  configureBtnDisabled: {
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
  },
  configureBtnPressed: {
    backgroundColor: '#DBEAFE',
  },
  configureBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  configureBtnTextActive: {
    color: COLORS.brand[700],
  },
  configureBtnTextDisabled: {
    color: COLORS.neutral[400],
  },

  // BREADCRUMB & BANNER
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand[700],
  },
  breadcrumbDivider: {
    color: COLORS.neutral[400],
  },
  breadcrumbCurrent: {
    fontSize: 13,
    color: COLORS.neutral[600],
    fontWeight: '500',
  },
  serviceBanner: {
    backgroundColor: '#0B1953',
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  serviceBannerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.button,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitleBox: {
    gap: 2,
  },
  bannerCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.neutral.white,
  },
  bannerSubtext: {
    fontSize: 12,
    color: '#CBD5E1',
  },

  // LEVEL 2: VARIANTS SELECTION CARD
  variantsCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
    ...SHADOWS.card,
  },
  variantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  variantsSubtitle: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    gap: SPACING[12],
  },
  variantPillSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  variantPillUnselected: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
  },
  variantSelectClick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variantPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  variantPillTextSelected: {
    color: COLORS.brand[800],
  },
  variantPillTextUnselected: {
    color: COLORS.neutral[700],
  },
  variantToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.neutral[200],
    paddingLeft: SPACING[12],
  },
  variantToggleLabel: {
    fontSize: 11,
    color: COLORS.neutral[500],
  },

  // LEVEL 3 & 4: DETAILS GRID & SECTION CARDS
  detailsGrid: {
    gap: SPACING[20],
  },
  sectionCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    paddingBottom: SPACING[12],
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  badgeContextText: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand[700],
  },
  emptyState: {
    paddingVertical: SPACING[16],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.neutral[400],
  },

  // FORM INPUT CONTAINER
  addBoxContainer: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.button,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    gap: 10,
  },
  addInput: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.neutral[900],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabelText: {
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  addBoxActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[8],
  },
  cancelBtn: {
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    color: COLORS.neutral[600],
  },
  saveSmallBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.button,
  },
  saveSmallBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },

  // GUIDANCE NOTES LIST
  notesList: {
    gap: 10,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.button,
    padding: SPACING[12],
    gap: SPACING[12],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  noteNumberBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteNumber: {
    color: COLORS.neutral.white,
    fontSize: 11,
    fontWeight: '700',
  },
  noteContentText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.neutral[800],
    lineHeight: 18,
  },
  deleteIconBtn: {
    padding: 4,
  },

  // REQUIREMENTS LIST
  reqsList: {
    gap: 10,
  },
  reqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.button,
    padding: SPACING[12],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  reqInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reqName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  reqActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  reqBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
  },
  reqBadgeMandatory: {
    backgroundColor: '#FEE2E2',
  },
  reqBadgeOptional: {
    backgroundColor: '#E0F2FE',
  },
  reqBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reqBadgeTextMandatory: {
    color: '#991B1B',
  },
  reqBadgeTextOptional: {
    color: '#075985',
  },

  // ELEMENTS & LEVEL 4 FEES LIST
  elementsList: {
    gap: SPACING[12],
  },
  elementCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
  },
  elementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  elementTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  elementName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  elementCodeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand[700],
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  elementFeeStats: {
    alignItems: 'flex-end',
  },
  elementFeeCount: {
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  elementFeeTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  elementFeesContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    padding: 14,
    gap: SPACING[12],
  },
  elementFeesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  elementFeesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.neutral[800],
  },
  emptyFeesText: {
    fontSize: 12,
    color: COLORS.neutral[400],
    fontStyle: 'italic',
  },
  feeItemsTable: {
    gap: 8,
  },
  feeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
  },
  feeItemNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feeItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.neutral[800],
  },
  feeItemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
});

// Premium 3-Level Service & Prerequisites Configuration Studio
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, SkeletonLoader, useTheme } from '@edge/ui';
import { DeleteAdminItemModal } from './DeleteAdminItemModal';
import {
  useAdminServices,
  useAdminNotes,
  useAdminRequirements,
  useAdminFees,
} from '@edge/api';
import { useFeeMasterCatalog } from '../hooks/useFeeMasterCatalog';
import { FeeMasterSelect } from './FeeMasterSelect';

export interface ServiceVariant {
  id: string;
  name: string;
  code: string;
  isEnabled: boolean;
}

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
  feeType: string;
}

export interface ServiceElement {
  id: string;
  name: string;
  code: string;
  description: string;
  fees: FeeItem[];
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
    category: 'Broadcasting & Mobile Services',
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
      name: 'Fixed Base Station',
      code: 'EL-FBS',
      description: 'Primary transmitter and receiver facility at designated coordinates.',
      fees: [
        { id: 'fee-1', name: 'Filing Fee', amount: 500, feeType: 'One-time' },
        { id: 'fee-2', name: 'Annual Inspection Fee', amount: 2500, feeType: 'Annual' },
        { id: 'fee-3', name: 'Spectrum Rights Fee', amount: 4200, feeType: 'Annual' },
      ],
    },
    {
      id: 'el-2',
      name: 'Mobile / Portable Units',
      code: 'EL-MOB',
      description: 'Handheld radios and vehicle-mounted transceivers.',
      fees: [
        { id: 'fee-4', name: 'Unit Permit Fee', amount: 300, feeType: 'Per Unit' },
      ],
    },
  ],
};

const DEFAULT_NOTES_MAP: Record<string, string[]> = {
  'srv-1_v-new': [
    'Applications must be signed by a duly registered PECE engineer.',
    'Proof of posting on public notice board is required 15 days prior to submission.',
  ],
};

const DEFAULT_REQUIREMENTS_MAP: Record<string, { id: string; name: string; isRequired: boolean }[]> = {
  'srv-1_v-new': [
    { id: 'req-1', name: 'Securities and Exchange Commission (SEC) Registration', isRequired: true },
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
  const { colors, isDark } = useTheme();
  // Live Backend SWR API Hooks
  const { services: apiServices, isLoading: isServicesLoading } = useAdminServices();
  const { notes: apiNotes } = useAdminNotes();
  const { requirements: apiRequirements } = useAdminRequirements();
  const { fees: apiFees } = useAdminFees();
  const { feeEntities, selectedFeeId, setSelectedFeeId, selectedFeeEntity } = useFeeMasterCatalog();

  // Level 1: Services Catalog State
  const [services, setServices] = useState<ServiceCatalogItem[]>(DEFAULT_SERVICES);

  // Active Drilling Navigation State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('v-new');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [variantWorkspaceTab, setVariantWorkspaceTab] = useState<'notes' | 'requirements' | 'elements'>('requirements');

  // Level 1 Service Search & Category Filter State
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const SERVICE_CATEGORIES = [
    'All',
    'Licenses',
    'Permits',
    'Certificates',
    'Exams',
    'Accreditations',
    'Requests & Complaints',
  ];

  // Dynamic Data Store States
  const [elementsMap, setElementsMap] = useState<Record<string, ServiceElement[]>>(DEFAULT_ELEMENTS);
  const [notesMap, setNotesMap] = useState<Record<string, string[]>>(DEFAULT_NOTES_MAP);
  const [requirementsMap, setRequirementsMap] = useState<Record<string, { id: string; name: string; isRequired: boolean }[]>>(DEFAULT_REQUIREMENTS_MAP);

  // Modal Dialog Form States
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantCode, setNewVariantCode] = useState('');

  // Editing States
  const [editingVariant, setEditingVariant] = useState<{ id: string; name: string; code: string } | null>(null);
  const [editingNote, setEditingNote] = useState<{ index: number; text: string } | null>(null);
  const [editingReq, setEditingReq] = useState<{ id: string; name: string; isRequired: boolean } | null>(null);

  // General Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ visible: false, title: '', description: '', onConfirm: () => {} });

  const [isAddingElement, setIsAddingElement] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [newElementDesc, setNewElementDesc] = useState('');

  const [isAddingFee, setIsAddingFee] = useState(false);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');

  const [isAddingReq, setIsAddingReq] = useState(false);
  const [newReqName, setNewReqName] = useState('');
  const [newReqMandatory, setNewReqMandatory] = useState(true);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Sync API Services
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

  // Filtered Services for Level 1 Catalog
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (selectedCategoryFilter !== 'All') {
        const catLower = s.category.toLowerCase();
        const filterLower = selectedCategoryFilter.toLowerCase();
        if (!catLower.includes(filterLower)) {
          return false;
        }
      }
      if (serviceSearchQuery.trim().length > 0) {
        const q = serviceSearchQuery.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCode = s.code.toLowerCase().includes(q);
        const matchesCategory = s.category.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesCategory;
      }
      return true;
    });
  }, [services, serviceSearchQuery, selectedCategoryFilter]);

  // Auto-select first service if none selected
  useEffect(() => {
    if (!selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0].id);
      if (services[0].variants.length > 0) {
        setSelectedVariantId(services[0].variants[0].id);
      }
    }
  }, [services, selectedServiceId]);

  // Derived Active Contexts
  const activeService = services.find((s) => s.id === selectedServiceId) || null;
  const activeVariant = activeService?.variants.find((v) => v.id === selectedVariantId) || activeService?.variants[0] || null;
  const variantContextKey = selectedServiceId && activeVariant ? `${selectedServiceId}_${activeVariant.id}` : '';
  const currentElements = variantContextKey ? elementsMap[variantContextKey] || [] : [];
  const activeElement = currentElements.find((e) => e.id === selectedElementId) || null;

  // Handlers
  const handleAddVariant = (serviceId: string) => {
    if (!newVariantName.trim()) return;
    const newVariant: ServiceVariant = {
      id: `var-${Date.now()}`,
      name: newVariantName.trim(),
      code: newVariantCode.trim().toUpperCase() || `VAR-${Date.now().toString().slice(-4)}`,
      isEnabled: true,
    };

    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, variants: [...s.variants, newVariant] } : s
      )
    );
    setSelectedVariantId(newVariant.id);
    setNewVariantName('');
    setNewVariantCode('');
    setIsAddingVariant(false);
  };

  const handleEditVariantSave = (serviceId: string) => {
    if (!editingVariant || !editingVariant.name.trim()) return;
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              variants: s.variants.map((v) =>
                v.id === editingVariant.id
                  ? { ...v, name: editingVariant.name.trim(), code: editingVariant.code.trim().toUpperCase() }
                  : v
              ),
            }
          : s
      )
    );
    setEditingVariant(null);
  };

  const handleDeleteVariantWithConfirm = (serviceId: string, variant: ServiceVariant) => {
    setConfirmDialog({
      visible: true,
      title: `Delete Variant (${variant.name})`,
      description: `Are you sure you want to delete variant "${variant.name}" (${variant.code})? All associated guidance notes and requirements will be removed.`,
      onConfirm: () => {
        handleDeleteVariant(serviceId, variant.id);
        setConfirmDialog((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const handleDeleteVariant = (serviceId: string, variantId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const updatedVariants = s.variants.filter((v) => v.id !== variantId);
          if (selectedVariantId === variantId && updatedVariants.length > 0) {
            setSelectedVariantId(updatedVariants[0].id);
          }
          return { ...s, variants: updatedVariants };
        }
        return s;
      })
    );
  };

  const handleToggleVariantEnabledWithConfirm = (serviceId: string, variant: ServiceVariant) => {
    setConfirmDialog({
      visible: true,
      title: `${variant.isEnabled ? 'Disable' : 'Enable'} Variant (${variant.name})`,
      description: `Are you sure you want to ${variant.isEnabled ? 'disable' : 'enable'} the "${variant.name}" (${variant.code}) variant for this service?`,
      onConfirm: () => {
        handleToggleVariantEnabled(serviceId, variant.id);
        setConfirmDialog((prev) => ({ ...prev, visible: false }));
      },
    });
  };

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

  const handleEditNoteSave = () => {
    if (!editingNote || !editingNote.text.trim() || !variantContextKey) return;
    setNotesMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).map((note, i) =>
        i === editingNote.index ? editingNote.text.trim() : note
      ),
    }));
    setEditingNote(null);
  };

  const handleEditRequirementSave = () => {
    if (!editingReq || !editingReq.name.trim() || !variantContextKey) return;
    setRequirementsMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).map((req) =>
        req.id === editingReq.id
          ? { ...req, name: editingReq.name.trim(), isRequired: editingReq.isRequired }
          : req
      ),
    }));
    setEditingReq(null);
  };

  const handleToggleServiceActive = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleAddNote = () => {
    if (!newNoteText.trim() || !variantContextKey) return;
    setNotesMap((prev) => ({
      ...prev,
      [variantContextKey]: [...(prev[variantContextKey] || []), newNoteText.trim()],
    }));
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (idx: number) => {
    if (!variantContextKey) return;
    setNotesMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddRequirement = () => {
    if (!newReqName.trim() || !variantContextKey) return;
    const newItem = {
      id: `req-${Date.now()}`,
      name: newReqName.trim(),
      isRequired: newReqMandatory,
    };
    setRequirementsMap((prev) => ({
      ...prev,
      [variantContextKey]: [...(prev[variantContextKey] || []), newItem],
    }));
    setNewReqName('');
    setIsAddingReq(false);
  };

  const handleDeleteRequirement = (reqId: string) => {
    if (!variantContextKey) return;
    setRequirementsMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).filter((r) => r.id !== reqId),
    }));
  };

  const handleAddElement = () => {
    if (!newElementName.trim() || !variantContextKey) return;
    const newEl: ServiceElement = {
      id: `el-${Date.now()}`,
      name: newElementName.trim(),
      code: `ELEM-${Date.now().toString().slice(-4)}`,
      description: newElementDesc.trim() || 'Configured element under selected service variant.',
      fees: [],
    };
    setElementsMap((prev) => ({
      ...prev,
      [variantContextKey]: [...(prev[variantContextKey] || []), newEl],
    }));
    setNewElementName('');
    setNewElementDesc('');
    setIsAddingElement(false);
  };

  const handleAddFeeItem = () => {
    if (!newFeeName.trim() || !newFeeAmount || !variantContextKey || !selectedElementId) return;
    const amountNum = parseFloat(newFeeAmount) || 0;
    const newFee: FeeItem = {
      id: `fee-${Date.now()}`,
      name: newFeeName.trim(),
      amount: amountNum,
      feeType: 'Standard Fee',
    };

    setElementsMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).map((el) =>
        el.id === selectedElementId ? { ...el, fees: [...el.fees, newFee] } : el
      ),
    }));
    setNewFeeName('');
    setNewFeeAmount('');
    setIsAddingFee(false);
  };

  const handleDeleteFeeItem = (feeId: string) => {
    if (!variantContextKey || !selectedElementId) return;
    setElementsMap((prev) => ({
      ...prev,
      [variantContextKey]: (prev[variantContextKey] || []).map((el) =>
        el.id === selectedElementId
          ? { ...el, fees: el.fees.filter((f) => f.id !== feeId) }
          : el
      ),
    }));
  };

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Robust Web DOM Node Accessor
  const getDomNode = (ref: React.RefObject<any>) => {
    if (!ref.current) return null;
    if (typeof ref.current.getScrollableNode === 'function') return ref.current.getScrollableNode();
    return ref.current;
  };

  // Mouse Drag-to-Scroll Web Ref & Handlers for Variant Chips
  const variantScrollRef = useRef<ScrollView>(null);
  const isDraggingVariant = useRef(false);
  const variantStartX = useRef(0);
  const variantScrollLeft = useRef(0);

  const handleVariantMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingVariant.current = true;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    variantStartX.current = pageX;
    const scrollNode = getDomNode(variantScrollRef);
    if (scrollNode) variantScrollLeft.current = scrollNode.scrollLeft;
  };

  const handleVariantMouseLeaveOrUp = () => {
    isDraggingVariant.current = false;
  };

  const handleVariantMouseMove = (e: any) => {
    if (!isDraggingVariant.current || Platform.OS !== 'web') return;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    const distance = (pageX - variantStartX.current) * 1.5;
    const scrollNode = getDomNode(variantScrollRef);
    if (scrollNode) scrollNode.scrollLeft = variantScrollLeft.current - distance;
  };

  // Mouse Drag-to-Scroll Web Ref & Handlers for Sub-Navigation Tabs
  const subTabScrollRef = useRef<ScrollView>(null);
  const isDraggingSubTab = useRef(false);
  const subTabStartX = useRef(0);
  const subTabScrollLeft = useRef(0);

  const handleSubTabMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingSubTab.current = true;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    subTabStartX.current = pageX;
    const scrollNode = getDomNode(subTabScrollRef);
    if (scrollNode) subTabScrollLeft.current = scrollNode.scrollLeft;
  };

  const handleSubTabMouseLeaveOrUp = () => {
    isDraggingSubTab.current = false;
  };

  const handleSubTabMouseMove = (e: any) => {
    if (!isDraggingSubTab.current || Platform.OS !== 'web') return;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    const distance = (pageX - subTabStartX.current) * 1.5;
    const scrollNode = getDomNode(subTabScrollRef);
    if (scrollNode) scrollNode.scrollLeft = subTabScrollLeft.current - distance;
  };

  // Mouse Drag-to-Scroll Web Ref & Handlers for Category Filter Pills
  const catScrollRef = useRef<ScrollView>(null);
  const isDraggingCat = useRef(false);
  const catStartX = useRef(0);
  const catScrollLeft = useRef(0);

  const handleCatMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingCat.current = true;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    catStartX.current = pageX;
    const scrollNode = getDomNode(catScrollRef);
    if (scrollNode) catScrollLeft.current = scrollNode.scrollLeft;
  };

  const handleCatMouseLeaveOrUp = () => {
    isDraggingCat.current = false;
  };

  const handleCatMouseMove = (e: any) => {
    if (!isDraggingCat.current || Platform.OS !== 'web') return;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    const distance = (pageX - catStartX.current) * 1.5;
    const scrollNode = getDomNode(catScrollRef);
    if (scrollNode) scrollNode.scrollLeft = catScrollLeft.current - distance;
  };

  const scrollCatBy = (offset: number) => {
    const scrollNode = getDomNode(catScrollRef);
    if (scrollNode) {
      if (typeof scrollNode.scrollBy === 'function') {
        scrollNode.scrollBy({ left: offset, behavior: 'smooth' });
      } else {
        scrollNode.scrollLeft += offset;
      }
    }
  };

  // Render Right Workspace Content Helper
  const renderWorkspaceContent = () => {
    const totalFees = activeElement ? activeElement.fees.reduce((acc, f) => acc + f.amount, 0) : 0;
    const variantContextKey = activeService && activeVariant ? `${activeService.id}:${activeVariant.id}` : null;
    const activeNotes = variantContextKey ? notesMap[variantContextKey] || [] : [];
    const activeRequirements = variantContextKey ? requirementsMap[variantContextKey] || [] : [];

    if (selectedElementId && activeElement && activeService && activeVariant) {
      return (
        <View style={{ gap: SPACING[16] }}>
          {/* Breadcrumb Navigation Header */}
              <View style={styles.breadcrumbBar}>
                <Pressable
                  style={[styles.backBtn, Platform.select({ web: { cursor: 'pointer' } }) as any]}
                  onPress={() => setSelectedElementId(null)}
                >
                  <Lucide name="arrow-left" size={16} color={isDark ? colors.brand[500] : colors.brand.primary} />
                  <Text style={[styles.backBtnText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                    Back to Variant Studio ({activeVariant.name})
                  </Text>
                </Pressable>
                <Text style={styles.breadcrumbDivider}>/</Text>
                <Text style={[styles.breadcrumbCurrent, { color: colors.text }]}>Element: {activeElement.name}</Text>
              </View>

        {/* Element Header Banner */}
        <View style={styles.elementBanner}>
          <View style={styles.elementBannerMain}>
            <View style={styles.elementIconBox}>
              <Lucide name="box" size={24} color={COLORS.neutral.white} />
            </View>

            <View style={styles.elementBannerContent}>
              <Text style={styles.elementBannerTag}>Level 3: Element Fees & Payments Configuration</Text>
              <Text style={styles.elementBannerTitle}>{activeElement.name}</Text>
              <Text style={styles.elementBannerSub}>
                Service: {activeService.name} · Variant: {activeVariant.name} · Code: {activeElement.code}
              </Text>
            </View>

            <View style={styles.totalFeeCard}>
              <Text style={styles.totalFeeLabel}>Total Element Fee</Text>
              <Text style={styles.totalFeeAmount}>
                ₱{totalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Fees & Payments Table Section */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Lucide name="dollar-sign" size={18} color={COLORS.brand[600]} />
              <Text style={styles.cardTitle}>Fees & Payments Items (1-to-Many)</Text>
            </View>
            <Pressable style={styles.addSmallBtn} onPress={() => setIsAddingFee(true)}>
              <Lucide name="plus" size={14} color={COLORS.brand[700]} />
              <Text style={styles.addSmallBtnText}>Add Fee Item</Text>
            </Pressable>
          </View>

          {activeElement.fees.length === 0 ? (
            <View style={styles.emptyState}>
              <Lucide name="dollar-sign" size={24} color={COLORS.neutral[300]} />
              <Text style={styles.emptyText}>No fee breakdown items configured for this element yet.</Text>
            </View>
          ) : (
            <View style={styles.feeItemsTable}>
              {activeElement.fees.map((fee, idx) => (
                <View key={fee.id} style={styles.feeTableRow}>
                  <View style={styles.feeRowInfo}>
                    <View style={styles.feeIndexBadge}>
                      <Text style={styles.feeIndexText}>{idx + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.feeNameText}>{fee.name}</Text>
                      <Text style={styles.feeTypeText}>{fee.feeType}</Text>
                    </View>
                  </View>

                  <View style={styles.feeRowActions}>
                    <Text style={styles.feeAmountText}>
                      ₱{fee.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                    <Pressable
                      style={styles.deleteIconBtn}
                      onPress={() => handleDeleteFeeItem(fee.id)}
                    >
                      <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* MODAL DIALOG: ATTACH FEE ITEM */}
        <Modal
          visible={isAddingFee}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setIsAddingFee(false);
            setSelectedFeeId('');
            setNewFeeName('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Attach Fee Item</Text>
                <Pressable onPress={() => {
                  setIsAddingFee(false);
                  setSelectedFeeId('');
                  setNewFeeName('');
                }}>
                  <Lucide name="x" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
              <Text style={[styles.modalSubtext, { color: colors.textMuted }]}>
                Select a fee entity from backend Fee master catalog to attach under "{activeElement?.name || 'Element'}".
              </Text>

              <View style={styles.modalForm}>
                <FeeMasterSelect
                  feeEntities={feeEntities}
                  selectedFeeId={selectedFeeId}
                  onSelectFee={(selected) => {
                    if (selected) {
                      setSelectedFeeId(selected.id);
                      setNewFeeName(selected.name);
                      if (selected.defaultAmount && !newFeeAmount) {
                        setNewFeeAmount(selected.defaultAmount.toString());
                      }
                    } else {
                      setSelectedFeeId('');
                      setNewFeeName('');
                    }
                  }}
                  colors={colors}
                  isDark={isDark}
                />

                <Text style={[styles.modalLabel, { color: colors.text }]}>Amount (₱) *</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="e.g. 1500.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={newFeeAmount}
                  onChangeText={setNewFeeAmount}
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setIsAddingFee(false);
                    setSelectedFeeId('');
                    setNewFeeName('');
                  }}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalSubmitBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand.primary }]}
                  onPress={handleAddFeeItem}
                >
                  <Text style={styles.modalSubmitBtnText}>Attach Fee Item</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (activeService) {
    return (
      <View style={{ gap: SPACING[16] }}>
        {/* Service Details Banner */}
        <View style={[styles.serviceBanner, { backgroundColor: isDark ? colors.neutral[900] : colors.brand.light, borderColor: isDark ? colors.neutral[800] : colors.border }]}>
          <View style={styles.serviceBannerMain}>
            <View style={[styles.bannerIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg }]}>
              <Lucide name="layers" size={22} color={isDark ? colors.brand[500] : colors.brand.primary} />
            </View>
            <View style={styles.bannerTitleBox}>
              <Text style={[styles.bannerCategory, { color: colors.textMuted }]}>Level 2: Service & Variant Configurations</Text>
              <Text style={[styles.bannerTitle, { color: colors.text }]} numberOfLines={2}>
                {activeService.name}
              </Text>
              <Text style={[styles.bannerSubtext, { color: colors.textMuted }]}>Code: {activeService.code} · Regional Activation: Active</Text>
            </View>
          </View>
        </View>

        {/* VARIANTS SELECTOR TABS STRIP */}
        <View style={[styles.variantsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.cardHeaderNoBorder}>
            <View style={styles.variantsHeader}>
              <Text style={[styles.variantsTitle, { color: colors.text }]}>Service Variants Studio</Text>
              <Text style={[styles.variantsSubtitle, { color: colors.textMuted }]}>
                Select or configure transaction variants for {activeService.name}.
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.addSmallBtn,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                  borderColor: isDark ? '#60A5FA' : colors.brand[200],
                },
                pressed && { opacity: 0.7 },
                Platform.select({ web: { cursor: 'pointer' } }) as any,
              ]}
              onPress={() => setIsAddingVariant(true)}
            >
              <Lucide name="plus" size={14} color={isDark ? '#60A5FA' : colors.brand.primary} />
              <Text style={[styles.addSmallBtnText, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>
                Create Variant
              </Text>
            </Pressable>
          </View>

          {activeService.variants.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No variants created for this service yet. Click "Create Variant" above to add one.
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={variantScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.variantScrollWrapper, Platform.select({ web: { cursor: 'grab' } }) as any]}
              contentContainerStyle={styles.variantList}
              {...Platform.select({
                web: {
                  onMouseDown: handleVariantMouseDown,
                  onMouseLeave: handleVariantMouseLeaveOrUp,
                  onMouseUp: handleVariantMouseLeaveOrUp,
                  onMouseMove: handleVariantMouseMove,
                },
                default: {},
              })}
            >
              {activeService.variants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                return (
                  <View
                    key={variant.id}
                    style={[
                      styles.variantPill,
                      { borderColor: colors.border, backgroundColor: colors.cardBg },
                      isSelected && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                        borderColor: isDark ? '#60A5FA' : colors.brand.primary,
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.variantSelectClick}
                      onPress={() => setSelectedVariantId(variant.id)}
                    >
                      <Lucide
                        name={isSelected ? 'check-circle' : 'circle'}
                        size={16}
                        color={isSelected ? (isDark ? '#60A5FA' : colors.brand.primary) : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.variantPillText,
                          { color: isSelected ? (isDark ? '#60A5FA' : colors.brand.primary) : colors.text },
                          isSelected && { fontWeight: TYPOGRAPHY.weights.bold },
                        ]}
                      >
                        {variant.name}
                      </Text>
                    </Pressable>

                    <View style={[styles.variantToggleBox, { borderLeftColor: colors.border }]}>
                      <Text style={[styles.variantToggleLabel, { color: colors.textMuted }]}>
                        {variant.isEnabled ? 'Active' : 'Off'}
                      </Text>
                      <Switch
                        value={variant.isEnabled}
                        onValueChange={() => handleToggleVariantEnabledWithConfirm(activeService.id, variant)}
                        trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[300], true: isDark ? colors.brand[600] : colors.brand.primary }}
                        thumbColor={isDark ? colors.neutral[100] : COLORS.neutral.white}
                      />
                      <Pressable
                        style={({ pressed }) => [
                          styles.iconActionBtn,
                          pressed && { opacity: 0.7 },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => setEditingVariant({ id: variant.id, name: variant.name, code: variant.code })}
                      >
                        <Lucide name="edit-2" size={13} color={colors.textMuted} />
                      </Pressable>

                      {activeService.variants.length > 1 && (
                        <Pressable
                          style={({ pressed }) => [
                            styles.deleteIconBtn,
                            pressed && { opacity: 0.7 },
                            Platform.select({ web: { cursor: 'pointer' } }),
                          ]}
                          onPress={() => handleDeleteVariantWithConfirm(activeService.id, variant)}
                        >
                          <Lucide name="trash-2" size={13} color={COLORS.semantic.error} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* SUB-NAVIGATION TABS FOR SELECTED VARIANT WORKSPACE */}
        <ScrollView
          ref={subTabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.workspaceTabScrollWrapper, Platform.select({ web: { cursor: 'grab' } }) as any]}
          contentContainerStyle={[styles.workspaceTabBar, { borderBottomColor: colors.border }]}
          {...Platform.select({
            web: {
              onMouseDown: handleSubTabMouseDown,
              onMouseLeave: handleSubTabMouseLeaveOrUp,
              onMouseUp: handleSubTabMouseLeaveOrUp,
              onMouseMove: handleSubTabMouseMove,
            },
            default: {},
          })}
        >
          <Pressable
            style={[
              styles.workspaceTabItem,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
              variantWorkspaceTab === 'requirements' && {
                backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                borderColor: isDark ? '#60A5FA' : colors.brand.primary,
              },
            ]}
            onPress={() => setVariantWorkspaceTab('requirements')}
          >
            <Lucide
              name="check-square"
              size={16}
              color={variantWorkspaceTab === 'requirements' ? (isDark ? '#60A5FA' : colors.brand.primary) : (isDark ? colors.neutral[300] : colors.textMuted)}
            />
            <Text
              style={[
                styles.workspaceTabText,
                { color: variantWorkspaceTab === 'requirements' ? (isDark ? '#60A5FA' : colors.brand.primary) : (isDark ? colors.neutral[300] : colors.textMuted) },
                variantWorkspaceTab === 'requirements' && styles.workspaceTabTextActive,
              ]}
            >
              Application Requirements ({activeRequirements.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.workspaceTabItem,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
              variantWorkspaceTab === 'notes' && {
                backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                borderColor: isDark ? '#60A5FA' : colors.brand.primary,
              },
            ]}
            onPress={() => setVariantWorkspaceTab('notes')}
          >
            <Lucide
              name="file-text"
              size={16}
              color={variantWorkspaceTab === 'notes' ? (isDark ? '#60A5FA' : colors.brand.primary) : (isDark ? colors.neutral[300] : colors.textMuted)}
            />
            <Text
              style={[
                styles.workspaceTabText,
                { color: variantWorkspaceTab === 'notes' ? (isDark ? '#60A5FA' : colors.brand.primary) : (isDark ? colors.neutral[300] : colors.textMuted) },
                variantWorkspaceTab === 'notes' && styles.workspaceTabTextActive,
              ]}
            >
              Guidance Notes ({activeNotes.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.workspaceTabItem,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
              variantWorkspaceTab === 'elements' && {
                backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                borderColor: isDark ? '#60A5FA' : colors.brand.primary,
              },
            ]}
            onPress={() => setVariantWorkspaceTab('elements')}
          >
            <Lucide
              name="box"
              size={16}
              color={variantWorkspaceTab === 'elements' ? (isDark ? '#60A5FA' : colors.brand.primary) : (isDark ? colors.neutral[300] : colors.textMuted)}
            />
            <Text
              style={[
                styles.workspaceTabText,
                { color: variantWorkspaceTab === 'elements' ? (isDark ? '#60A5FA' : colors.brand.primary) : (isDark ? colors.neutral[300] : colors.textMuted) },
                variantWorkspaceTab === 'elements' && styles.workspaceTabTextActive,
              ]}
            >
              Service Elements & Fees ({currentElements.length})
            </Text>
          </Pressable>
        </ScrollView>

        {/* WORKSPACE TAB 1: APPLICATION REQUIREMENTS (1-TO-MANY) */}
        {variantWorkspaceTab === 'requirements' && (
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Lucide name="check-square" size={18} color={isDark ? '#60A5FA' : colors.brand.primary} />
                <View style={[styles.variantContextBadge, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : colors.brand.light }]}>
                  <Text style={[styles.variantContextBadgeText, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>
                    {activeVariant?.name || 'Selected Variant'}
                  </Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Application Requirements ({activeRequirements.length})
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.addSmallBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                    borderColor: isDark ? '#60A5FA' : colors.brand[200],
                  },
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }) as any,
                ]}
                onPress={() => setIsAddingReq(true)}
              >
                <Lucide name="plus" size={14} color={isDark ? '#60A5FA' : colors.brand.primary} />
                <Text style={[styles.addSmallBtnText, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>Attach Requirement</Text>
              </Pressable>
            </View>

            {activeRequirements.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No document requirements attached for this variant.</Text>
              </View>
            ) : (
              <View style={styles.reqsList}>
                {activeRequirements.map((req) => (
                  <View key={req.id} style={[styles.reqCard, { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.reqInfo}>
                      <Lucide name="file" size={16} color={isDark ? '#60A5FA' : colors.brand.primary} />
                      <Text style={[styles.reqName, { color: colors.text }]}>{req.name}</Text>
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
                        style={({ pressed }) => [
                          styles.iconActionBtn,
                          pressed && { opacity: 0.7 },
                          Platform.select({ web: { cursor: 'pointer' } }) as any,
                        ]}
                        onPress={() => setEditingReq({ id: req.id, name: req.name, isRequired: req.isRequired })}
                      >
                        <Lucide name="edit-2" size={13} color={colors.textMuted} />
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [
                          styles.deleteIconBtn,
                          pressed && { opacity: 0.7 },
                          Platform.select({ web: { cursor: 'pointer' } }) as any,
                        ]}
                        onPress={() =>
                          setConfirmDialog({
                            visible: true,
                            title: `Delete Requirement`,
                            description: `Are you sure you want to delete requirement "${req.name}"?`,
                            onConfirm: () => {
                              handleDeleteRequirement(req.id);
                              setConfirmDialog((prev) => ({ ...prev, visible: false }));
                            },
                          })
                        }
                      >
                        <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* WORKSPACE TAB 2: GUIDANCE NOTES */}
        {variantWorkspaceTab === 'notes' && (
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Lucide name="file-text" size={18} color={isDark ? '#60A5FA' : colors.brand.primary} />
                <View style={[styles.variantContextBadge, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : colors.brand.light }]}>
                  <Text style={[styles.variantContextBadgeText, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>
                    {activeVariant?.name || 'Selected Variant'}
                  </Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Guidance Notes ({activeNotes.length})
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.addSmallBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                    borderColor: isDark ? '#60A5FA' : colors.brand[200],
                  },
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }) as any,
                ]}
                onPress={() => setIsAddingNote(true)}
              >
                <Lucide name="plus" size={14} color={isDark ? '#60A5FA' : colors.brand.primary} />
                <Text style={[styles.addSmallBtnText, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>Add Note</Text>
              </Pressable>
            </View>

            {activeNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No guidance notes configured for this variant.</Text>
              </View>
            ) : (
              <View style={styles.notesList}>
                {activeNotes.map((noteText, idx) => (
                  <View key={idx} style={[styles.noteCard, { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border }]}>
                    <View style={styles.noteNumberBox}>
                      <Text style={styles.noteNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.noteContentText, { color: colors.text }]}>{noteText}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.iconActionBtn,
                        pressed && { opacity: 0.7 },
                        Platform.select({ web: { cursor: 'pointer' } }) as any,
                      ]}
                      onPress={() => setEditingNote({ index: idx, text: noteText })}
                    >
                      <Lucide name="edit-2" size={13} color={colors.textMuted} />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.deleteIconBtn,
                        pressed && { opacity: 0.7 },
                        Platform.select({ web: { cursor: 'pointer' } }) as any,
                      ]}
                      onPress={() =>
                        setConfirmDialog({
                          visible: true,
                          title: `Delete Guidance Note`,
                          description: `Are you sure you want to delete note #${idx + 1}?`,
                          onConfirm: () => {
                            handleDeleteNote(idx);
                            setConfirmDialog((prev) => ({ ...prev, visible: false }));
                          },
                        })
                      }
                    >
                      <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* WORKSPACE TAB 3: SERVICE ELEMENTS LIST */}
        {variantWorkspaceTab === 'elements' && (
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Lucide name="box" size={18} color={isDark ? '#60A5FA' : colors.brand.primary} />
                <View style={[styles.variantContextBadge, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : colors.brand.light }]}>
                  <Text style={[styles.variantContextBadgeText, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>
                    {activeVariant?.name || 'Selected Variant'}
                  </Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Service Elements & Fees ({currentElements.length})
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.addSmallBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                    borderColor: isDark ? '#60A5FA' : colors.brand[200],
                  },
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }) as any,
                ]}
                onPress={() => setIsAddingElement(true)}
              >
                <Lucide name="plus" size={14} color={isDark ? '#60A5FA' : colors.brand.primary} />
                <Text style={[styles.addSmallBtnText, { color: isDark ? '#60A5FA' : colors.brand.primary }]}>Add Element</Text>
              </Pressable>
            </View>


            {currentElements.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No elements configured under this service variant.</Text>
              </View>
            ) : (
              <View style={styles.elementsList}>
                {currentElements.map((element) => {
                  const elementTotalFees = element.fees.reduce((acc, f) => acc + f.amount, 0);
                  return (
                    <View key={element.id} style={[styles.elementCardItem, { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border }]}>
                      <View style={styles.elementMainInfo}>
                        <View style={[styles.elementIconSmallBox, { backgroundColor: isDark ? colors.neutral[700] : colors.brand.light }]}>
                          <Lucide name="box" size={18} color={isDark ? colors.brand[400] : colors.brand.primary} />
                        </View>
                        <View style={styles.elementTextGroup}>
                          <View style={styles.elementTitleRow}>
                            <Text style={[styles.elementNameText, { color: colors.text }]}>{element.name}</Text>
                            <Text style={[styles.elementCodeBadge, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100], color: colors.textMuted }]}>{element.code}</Text>
                          </View>
                          <Text style={[styles.elementDescText, { color: colors.textMuted }]}>{element.description}</Text>
                        </View>
                      </View>

                      <View style={styles.elementRightControl}>
                        <View style={styles.elementStatColumn}>
                          <Text style={[styles.elementFeeCountText, { color: colors.textMuted }]}>{element.fees.length} Fee Items</Text>
                          <Text style={[styles.elementTotalFeeText, { color: isDark ? colors.brand[400] : colors.brand.primary }]}>
                            ₱{elementTotalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>

                        <Pressable
                          style={[
                            styles.drillFeeBtn,
                            {
                              backgroundColor: isDark ? colors.neutral[700] : colors.brand.light,
                              borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                            },
                            Platform.select({ web: { cursor: 'pointer' } }) as any,
                          ]}
                          onPress={() => setSelectedElementId(element.id)}
                        >
                          <Text style={[styles.drillFeeBtnText, { color: isDark ? colors.brand[400] : colors.brand.primary }]}>Configure Fees & Payments</Text>
                          <Lucide name="chevron-right" size={14} color={isDark ? colors.brand[400] : colors.brand.primary} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* MODAL DIALOG: CREATE VARIANT */}
        <Modal
          visible={isAddingVariant}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingVariant(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Service Variant</Text>
                <Pressable onPress={() => setIsAddingVariant(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Define a new transaction variant under {activeService.name}.
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Variant Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. New Commercial Application, Permit Renewal..."
                  value={newVariantName}
                  onChangeText={setNewVariantName}
                />

                <Text style={styles.modalLabel}>Variant Code</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. NEW, RENEW, MOD..."
                  value={newVariantCode}
                  onChangeText={setNewVariantCode}
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingVariant(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.modalSubmitBtn}
                  onPress={() => handleAddVariant(activeService.id)}
                >
                  <Text style={styles.modalSubmitBtnText}>Create Variant</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DIALOG: CREATE ELEMENT */}
        <Modal
          visible={isAddingElement}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingElement(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Service Element</Text>
                <Pressable onPress={() => setIsAddingElement(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Add a new component element under "{activeVariant?.name}".
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Element Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Transmitter Unit, Spectrum Channel..."
                  value={newElementName}
                  onChangeText={setNewElementName}
                />

                <Text style={styles.modalLabel}>Description</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Element details..."
                  value={newElementDesc}
                  onChangeText={setNewElementDesc}
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingElement(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn} onPress={handleAddElement}>
                  <Text style={styles.modalSubmitBtnText}>Save Service Element</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DIALOG: ATTACH REQUIREMENT */}
        <Modal
          visible={isAddingReq}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingReq(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Attach Application Requirement</Text>
                <Pressable onPress={() => setIsAddingReq(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Attach a document requirement to "{activeVariant?.name}".
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Document Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. SEC Registration, PECE Engineering Diagram..."
                  value={newReqName}
                  onChangeText={setNewReqName}
                />

                <View style={styles.toggleRow}>
                  <Text style={styles.modalLabel}>Mandatory Requirement:</Text>
                  <Switch
                    value={newReqMandatory}
                    onValueChange={setNewReqMandatory}
                    trackColor={{ false: COLORS.neutral[200], true: COLORS.brand[500] }}
                    thumbColor={newReqMandatory ? COLORS.brand[600] : COLORS.neutral[400]}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingReq(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn} onPress={handleAddRequirement}>
                  <Text style={styles.modalSubmitBtnText}>Attach Requirement</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DIALOG: ADD GUIDANCE NOTE */}
        <Modal
          visible={isAddingNote}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingNote(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Guidance Note</Text>
                <Pressable onPress={() => setIsAddingNote(false)}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </Pressable>
              </View>
              <Text style={styles.modalSubtext}>
                Add compliance instruction notes for "{activeVariant?.name}".
              </Text>

              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Instructions / Notes *</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80 }]}
                  placeholder="Enter detailed compliance guidance notes..."
                  value={newNoteText}
                  onChangeText={setNewNoteText}
                  multiline
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddingNote(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn} onPress={handleAddNote}>
                  <Text style={styles.modalSubmitBtnText}>Save Guidance Note</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>
        Select a service from the left catalog to configure its variants, requirements, and element fees.
      </Text>
    </View>
  );
};

return (
  <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.dualPaneContainer, isMobile && styles.dualPaneContainerMobile]}>
        {/* LEFT COLUMN: SYSTEM SERVICES CATALOG SIDEBAR */}
        <View style={[styles.serviceSidebar, isMobile && styles.serviceSidebarMobile]}>
          <View style={styles.sidebarHeader}>
            <Text style={[styles.sidebarHeaderTitle, { color: colors.text }]}>Services Catalog</Text>
            <Text style={[styles.sidebarHeaderSub, { color: colors.textMuted }]}>
              Select service to configure variants & fees
            </Text>
          </View>

          {/* Search Bar & Category Filter Pills */}
          <View style={styles.branchFilterBar}>
            <View style={[styles.branchSearchBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Lucide name="search" size={14} color={colors.textMuted} />
              <TextInput
                style={[styles.branchSearchInput, { color: colors.text }]}
                placeholder="Search services..."
                placeholderTextColor={colors.textMuted}
                value={serviceSearchQuery}
                onChangeText={setServiceSearchQuery}
              />
              {serviceSearchQuery.length > 0 && (
                <Pressable onPress={() => setServiceSearchQuery('')} style={Platform.select({ web: { cursor: 'pointer' } })}>
                  <Lucide name="x" size={14} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            <View style={styles.catFilterRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.catScrollArrowBtn,
                  { borderColor: colors.border, backgroundColor: colors.cardBg },
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => scrollCatBy(-120)}
              >
                <Lucide name="chevron-left" size={14} color={colors.textMuted} />
              </Pressable>

              <ScrollView
                ref={catScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[
                  styles.catScrollWrapper,
                  Platform.select({ web: { overflowX: 'auto', overflowY: 'hidden', cursor: 'grab' } }) as any,
                ]}
                contentContainerStyle={styles.topTabsScrollContent}
                {...Platform.select({
                  web: {
                    onMouseDown: handleCatMouseDown,
                    onMouseLeave: handleCatMouseLeaveOrUp,
                    onMouseUp: handleCatMouseLeaveOrUp,
                    onMouseMove: handleCatMouseMove,
                  },
                  default: {},
                })}
              >
                <View
                  style={[
                    styles.catFilterPillContainer,
                    Platform.select({ web: { width: 'max-content', minWidth: 'max-content' } }) as any,
                  ]}
                >
                  {SERVICE_CATEGORIES.map((cat) => {
                    const isActive = selectedCategoryFilter === cat;
                    return (
                      <Pressable
                        key={cat}
                        style={[
                          styles.filterPillBtn,
                          { borderColor: colors.border },
                          isActive && {
                            backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                            borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                          },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => setSelectedCategoryFilter(cat)}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                            isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <Pressable
                style={({ pressed }) => [
                  styles.catScrollArrowBtn,
                  { borderColor: colors.border, backgroundColor: colors.cardBg },
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => scrollCatBy(120)}
              >
                <Lucide name="chevron-right" size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Services Items List */}
          <ScrollView style={styles.serviceListScroll} showsVerticalScrollIndicator={false}>
            {filteredServices.length === 0 ? (
              <View style={[styles.catalogEmptyCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Lucide name="search" size={26} color={colors.textMuted} />
                <Text style={[styles.catalogEmptyTitle, { color: colors.text }]}>No Services Found</Text>
                <Text style={[styles.catalogEmptySub, { color: colors.textMuted }]}>
                  {serviceSearchQuery
                    ? `No services matching "${serviceSearchQuery}"`
                    : `No services under "${selectedCategoryFilter}"`}
                </Text>
                <Pressable
                  style={[styles.catalogResetBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}
                  onPress={() => {
                    setServiceSearchQuery('');
                    setSelectedCategoryFilter('All');
                  }}
                >
                  <Text style={[styles.catalogResetBtnText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                    Reset Search & Filters
                  </Text>
                </Pressable>
              </View>
            ) : (
              filteredServices.map((service) => {
                const isSelected = (selectedServiceId || services[0]?.id) === service.id;
                return (
                  <Pressable
                    key={service.id}
                    style={({ pressed }) => [
                      styles.serviceSidebarCard,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      isSelected && {
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                      },
                      pressed && { opacity: 0.8 },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={() => {
                      setSelectedServiceId(service.id);
                      setSelectedElementId(null);
                      if (service.variants.length > 0) {
                        setSelectedVariantId(service.variants[0].id);
                      }
                    }}
                  >
                    <View style={styles.serviceSidebarHeader}>
                      <View style={styles.serviceIconBoxSmall}>
                        <Lucide
                          name="layers"
                          size={15}
                          color={isSelected ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 1 }}>
                        <Text style={[styles.serviceSidebarCategory, { color: colors.textMuted }]}>{service.category}</Text>
                        <Text
                          style={[
                            styles.serviceSidebarTitle,
                            { color: isSelected ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.text },
                            isSelected && { fontWeight: TYPOGRAPHY.weights.bold },
                          ]}
                          numberOfLines={2}
                        >
                          {service.name}
                        </Text>
                        <Text style={[styles.serviceSidebarCode, { color: colors.textMuted }]}>Code: {service.code}</Text>
                      </View>
                      <Switch
                        value={service.isActive}
                        onValueChange={() => handleToggleServiceActive(service.id)}
                        trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[300], true: isDark ? colors.brand[600] : colors.brand.primary }}
                        thumbColor={isDark ? colors.neutral[100] : COLORS.neutral.white}
                      />
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* RIGHT COLUMN: WORKSPACE PANE */}
        <View style={styles.serviceWorkspacePane}>
          {renderWorkspaceContent()}
        </View>
      </View>

      {/* Confirmation Dialog Modal */}
      <DeleteAdminItemModal
        visible={confirmDialog.visible}
        itemTitle={confirmDialog.title}
        itemType="Confirmation Required"
        onClose={() => setConfirmDialog((prev) => ({ ...prev, visible: false }))}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* EDIT VARIANT MODAL */}
      <Modal
        visible={editingVariant !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingVariant(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Service Variant</Text>
              <Pressable onPress={() => setEditingVariant(null)}>
                <Lucide name="x" size={20} color={COLORS.neutral[500]} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Variant Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. New Application, Renewal..."
                value={editingVariant?.name || ''}
                onChangeText={(text) =>
                  setEditingVariant((prev) => (prev ? { ...prev, name: text } : null))
                }
              />

              <Text style={styles.modalLabel}>Variant Code (Uppercase) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. NEW, RENEW, MODIFY..."
                value={editingVariant?.code || ''}
                onChangeText={(text) =>
                  setEditingVariant((prev) => (prev ? { ...prev, code: text.toUpperCase() } : null))
                }
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setEditingVariant(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalSubmitBtn}
                onPress={() => activeService && handleEditVariantSave(activeService.id)}
              >
                <Text style={styles.modalSubmitBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT REQUIREMENT MODAL */}
      <Modal
        visible={editingReq !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingReq(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Application Requirement</Text>
              <Pressable onPress={() => setEditingReq(null)}>
                <Lucide name="x" size={20} color={COLORS.neutral[500]} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Requirement Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Requirement name..."
                value={editingReq?.name || ''}
                onChangeText={(text) =>
                  setEditingReq((prev) => (prev ? { ...prev, name: text } : null))
                }
              />

              <View style={styles.toggleRow}>
                <Text style={styles.modalLabel}>Mandatory Requirement:</Text>
                <Switch
                  value={editingReq?.isRequired ?? true}
                  onValueChange={(val) =>
                    setEditingReq((prev) => (prev ? { ...prev, isRequired: val } : null))
                  }
                  trackColor={{ false: COLORS.neutral[200], true: COLORS.brand[500] }}
                  thumbColor={editingReq?.isRequired ? COLORS.brand[600] : COLORS.neutral[400]}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setEditingReq(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSubmitBtn} onPress={handleEditRequirementSave}>
                <Text style={styles.modalSubmitBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT GUIDANCE NOTE MODAL */}
      <Modal
        visible={editingNote !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingNote(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Guidance Note</Text>
              <Pressable onPress={() => setEditingNote(null)}>
                <Lucide name="x" size={20} color={COLORS.neutral[500]} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Instructions / Notes *</Text>
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Enter detailed compliance guidance notes..."
                value={editingNote?.text || ''}
                onChangeText={(text) =>
                  setEditingNote((prev) => (prev ? { ...prev, text } : null))
                }
                multiline
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setEditingNote(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSubmitBtn} onPress={handleEditNoteSave}>
                <Text style={styles.modalSubmitBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
    padding: SPACING[16],
  },
  dualPaneContainer: {
    flexDirection: 'row',
    gap: SPACING[16],
    alignItems: 'flex-start',
  },
  dualPaneContainerMobile: {
    flexDirection: 'column',
  },
  serviceSidebar: {
    width: 290,
    gap: SPACING[12],
  },
  serviceSidebarMobile: {
    width: '100%',
  },
  sidebarHeader: {
    gap: 2,
  },
  sidebarHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sidebarHeaderSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  serviceListScroll: {
    maxHeight: 650,
  },
  serviceSidebarCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[10],
    marginBottom: SPACING[8],
  },
  serviceSidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  serviceIconBoxSmall: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceSidebarCategory: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  serviceSidebarTitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  serviceSidebarCode: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  serviceWorkspacePane: {
    flex: 1,
    gap: SPACING[16],
    minWidth: 0,
  },
  loadingContainer: {
    padding: SPACING[40],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[12],
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.neutral[500],
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
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchFilterBar: {
    gap: SPACING[12],
    marginBottom: SPACING[8],
  },
  branchSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  branchSearchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    padding: 0,
  },
  catFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  catScrollArrowBtn: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catScrollWrapper: {
    flex: 1,
    width: '100%',
  },
  topTabsScrollWrapper: {
    width: '100%',
  },
  topTabsScrollContent: {
    flexGrow: 1,
  },
  catFilterPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingRight: SPACING[16],
  },
  branchFilterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingRight: SPACING[24],
    paddingBottom: SPACING[4],
  },
  filterPillBtn: {
    flexShrink: 0,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  catalogEmptyCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[20],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[8],
    marginTop: SPACING[12],
  },
  catalogEmptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  catalogEmptySub: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    textAlign: 'center',
    lineHeight: 15,
  },
  catalogResetBtn: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    marginTop: SPACING[4],
  },
  catalogResetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.primary,
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
    borderColor: COLORS.brand[500],
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
    backgroundColor: COLORS.brand.light,
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
    backgroundColor: COLORS.semantic.successBg,
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
    backgroundColor: COLORS.semantic.success,
  },
  badgeDotInactive: {
    backgroundColor: COLORS.neutral[400],
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: COLORS.semantic.successText,
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
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
  },
  configureBtnDisabled: {
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
  },
  configureBtnPressed: {
    backgroundColor: COLORS.brand.light,
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

  // BREADCRUMBS & BANNERS
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
    backgroundColor: COLORS.brand[900],
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
    flex: 1,
    minWidth: 0,
  },
  bannerCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brand[500],
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 26,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  bannerSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.neutral[300],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },

  // LEVEL 2: VARIANTS CARD
  variantsCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
    ...SHADOWS.card,
  },
  cardHeaderNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantsHeader: {
    gap: 2,
    flex: 1,
    marginRight: SPACING[16],
  },
  variantsTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
    color: COLORS.neutral[900],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  variantsSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: COLORS.neutral[500],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  variantPill: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    gap: SPACING[12],
  },
  variantPillSelected: {
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
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
    fontFamily: TYPOGRAPHY.fonts.primary,
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
    fontWeight: '500',
    color: COLORS.neutral[500],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },

  // WORKSPACE TAB STRIP
  workspaceTabScrollWrapper: {
    width: '100%',
  },
  workspaceTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    borderBottomWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingBottom: SPACING[12],
    marginBottom: SPACING[4],
    minWidth: '100%',
  },
  workspaceTabItem: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  workspaceTabActive: {
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
  },
  workspaceTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  workspaceTabTextActive: {
    fontWeight: '700',
  },

  // SECTION CARDS
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
    flex: 1,
    flexWrap: 'wrap',
  },
  variantScrollWrapper: {
    width: '100%',
  },
  variantContextBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.button,
  },
  variantContextBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.brand.light,
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    borderColor: COLORS.brand[500],
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: SPACING[24],
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.neutral[400],
  },

  // MODAL OVERLAY STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[20],
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[24],
    gap: SPACING[16],
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  modalSubtext: {
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: -8,
  },
  modalForm: {
    gap: SPACING[12],
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  modalInput: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    marginTop: SPACING[8],
  },
  modalCancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[600],
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },

  // LISTS & CARDS
  notesList: {
    gap: 10,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.neutral[50],
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
  reqsList: {
    gap: 10,
  },
  reqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
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
    backgroundColor: COLORS.semantic.errorBg,
  },
  reqBadgeOptional: {
    backgroundColor: COLORS.brand.light,
  },
  reqBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reqBadgeTextMandatory: {
    color: COLORS.semantic.errorText,
  },
  reqBadgeTextOptional: {
    color: COLORS.brand[700],
  },
  elementsList: {
    gap: SPACING[12],
  },
  elementCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  elementMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  elementIconSmallBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementTextGroup: {
    gap: 2,
    flex: 1,
  },
  elementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  elementNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  elementCodeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand[700],
    backgroundColor: COLORS.brand.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  elementDescText: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  elementRightControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  elementStatColumn: {
    alignItems: 'flex-end',
  },
  elementFeeCountText: {
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  elementTotalFeeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.semantic.success,
  },
  drillFeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.brand.light,
    borderColor: COLORS.brand[500],
    borderWidth: 1,
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
  },
  drillFeeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand[700],
  },

  // LEVEL 3: ELEMENT FEES BANNER & TABLE
  elementBanner: {
    backgroundColor: COLORS.neutral[900],
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  elementBannerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  elementIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.button,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementBannerContent: {
    flex: 1,
    marginLeft: SPACING[16],
    gap: 2,
  },
  elementBannerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand[500],
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  elementBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.neutral.white,
  },
  elementBannerSub: {
    fontSize: 12,
    color: COLORS.neutral[400],
  },
  totalFeeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    alignItems: 'flex-end',
  },
  totalFeeLabel: {
    fontSize: 11,
    color: COLORS.neutral[400],
  },
  totalFeeAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.semantic.success,
  },
  feeItemsTable: {
    gap: SPACING[8],
  },
  feeTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: 14,
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  feeRowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  feeIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.semantic.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.semantic.successText,
  },
  feeNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  feeTypeText: {
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  feeRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  feeAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
});
